import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import { loadKnowledge } from "./knowledge";
import { AgentEvent, Topic, DeckType, SlidePlan, PresentationPlan, OutputFormat, TopicItem } from "./types";
import { assembleHtmlPresentation } from "@/lib/pipeline/assemble";
import { slidePlanToHtml, mapToHtmlTheme } from "@/lib/pipeline/slide-to-html";
import { mergeAiAndPrecannedSlides } from "./precanned-slides";
import type { HtmlSlide } from "@/lib/pipeline/types";

const LOG_PREFIX = "[CopilotAgent]";

function log(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

/**
 * Perform a web search using Tavily Search API.
 * Requires TAVILY_API_KEY env var (free tier: 1,000 searches/month).
 * Tavily is purpose-built for LLM agents — returns pre-extracted, structured content.
 */
async function tavilyWebSearch(query: string, count: number = 5): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return "Web search unavailable: TAVILY_API_KEY not configured. Using local knowledge only.";
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.min(count, 20),
      search_depth: "advanced",
      include_answer: true,
    }),
  });

  if (!res.ok) {
    return `Web search failed (HTTP ${res.status}). Using local knowledge only.`;
  }

  const data = await res.json();

  let output = "";
  if (data.answer) {
    output += `**Summary:** ${data.answer}\n\n`;
  }

  const results = data.results ?? [];
  if (results.length === 0 && !data.answer) {
    return `No web results found for "${query}".`;
  }

  output += results
    .map((r: { title: string; url: string; content: string }, i: number) =>
      `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.content}`
    )
    .join("\n\n");

  return output;
}

/**
 * Map topic IDs to knowledge directory names.
 * The knowledge library uses "foundry" on disk but the app uses "microsoft-foundry" as the topic key.
 */
const TOPIC_DIR_MAP: Record<string, string> = {
  "microsoft-foundry": "foundry",
};

function resolveTopicDir(topic: string): string {
  return TOPIC_DIR_MAP[topic] || topic;
}

function buildUserPrompt(
  topic: string,
  deckType: string,
  theme: string,
  slideCount: number,
  prompt: string,
  presentationTopics?: string[],
  presentationTitle?: string,
): string {
  let p = `Create a ${deckType} presentation about "${topic}" with ${slideCount} slides using the "${theme}" theme.`;
  if (presentationTitle) {
    p += ` The presentation title should be "${presentationTitle}".`;
  }
  if (presentationTopics && presentationTopics.length > 0) {
    p += `\n\nThe presentation should cover these specific topics (one slide per topic):\n`;
    presentationTopics.forEach((t, i) => {
      p += `${i + 1}. ${t}\n`;
    });
  }
  if (prompt) {
    p += `\nAdditional instructions: ${prompt}`;
  }
  return p;
}

const slideSchema = z.object({
  layout: z.enum([
    "title",
    "content",
    "split",
    "code",
    "stat",
    "comparison",
    "timeline",
    "quote",
    "bento",
    "chart",
  ]),
  title: z.string(),
  keyPoints: z.array(z.string()),
  speakerNotes: z.string().optional(),
  codeExample: z
    .object({
      language: z.string(),
      code: z.string(),
      caption: z.string().optional(),
    })
    .optional(),
  chartData: z
    .object({
      type: z.enum(["bar", "line", "pie", "donut"]),
      data: z.array(z.object({ label: z.string(), value: z.number() })),
    })
    .optional(),
});

export async function* generatePresentation(
  topic: Topic,
  deckType: DeckType,
  prompt: string,
  options: {
    theme?: string;
    slideCount?: number;
    includeCode?: boolean;
    includeSpeakerNotes?: boolean;
    model?: string;
    outputFormat?: OutputFormat;
    presentationTopics?: string[];
    presentationTitle?: string;
    topicItems?: TopicItem[];
  } = {}
): AsyncGenerator<AgentEvent> {
  const { theme = "dark-luxe", slideCount = 8, includeCode = false, includeSpeakerNotes = false, model: requestedModel, outputFormat = "slides", presentationTopics, presentationTitle, topicItems } = options;

  // Extract only AI topic texts for the prompt
  const aiTopicTexts = topicItems
    ? topicItems.filter((item): item is Extract<TopicItem, { type: "topic" }> => item.type === "topic").map((item) => item.text)
    : presentationTopics;

  const slides: SlidePlan[] = [];
  let slideIndex = 0;

  log("Starting generation:", { topic, deckType, theme, slideCount, includeCode, includeSpeakerNotes });
  yield { type: "status", data: { message: "Starting Copilot SDK agent...", step: 1 } };

  const client = new CopilotClient({
    logLevel: "info",
  });

  try {
    log("Starting CopilotClient...");
    await client.start();
    log("CopilotClient started successfully");

    // Check auth status
    try {
      const authStatus = await client.getAuthStatus();
      log("Auth status:", JSON.stringify(authStatus));
    } catch (e) {
      log("Could not get auth status:", e);
    }

    // List available models
    try {
      const models = await client.listModels();
      log("Available models:", models.map((m) => m.id).join(", "));
    } catch (e) {
      log("Could not list models:", e);
    }

    yield { type: "status", data: { message: "Connected to Copilot CLI, creating session...", step: 1 } };

    const searchKnowledgeTool = defineTool("search_knowledge", {
      description:
        "Search the local knowledge library for information about a topic. Returns curated markdown content.",
      parameters: z.object({
        topic: z.string().describe("The topic to search for (e.g. 'microsoft-foundry', 'copilot-sdk', 'copilot', 'copilot-cli')"),
        section: z.string().optional().describe("Optional specific section within the topic"),
      }),
      handler: async (args) => {
        log("Tool called: search_knowledge", JSON.stringify(args));
        const resolvedTopic = resolveTopicDir(args.topic);
        const content = loadKnowledge(args.topic, args.section);
        if (content.includes("not found")) {
          const fallback = loadKnowledge(resolvedTopic, args.section);
          log("search_knowledge result (fallback):", fallback.substring(0, 200) + "...");
          return fallback;
        }
        log("search_knowledge result:", content.substring(0, 200) + "...");
        return content;
      },
    });

    const generateSlideTool = defineTool("generate_slide", {
      description:
        "Generate a single presentation slide. Call this tool once for each slide you want to create. Use varied layouts for a visually engaging deck.",
      parameters: slideSchema,
      handler: async (args) => {
        log(`Tool called: generate_slide #${slideIndex + 1}`, JSON.stringify({ layout: args.layout, title: args.title, keyPointCount: args.keyPoints.length }));
        const slide: SlidePlan = {
          index: slideIndex,
          layout: args.layout,
          title: args.title,
          keyPoints: args.keyPoints,
          speakerNotes: args.speakerNotes,
          codeExample: args.codeExample,
          chartData: args.chartData,
        };
        slides.push(slide);
        slideIndex++;
        return `Slide ${slideIndex} created: "${args.title}" (${args.layout} layout)`;
      },
    });

    const webSearchTool = defineTool("web_search", {
      description:
        "Search the web for current information about a topic. Use this to find the latest data, statistics, news, and developments. Returns search results with titles, URLs, and descriptions.",
      parameters: z.object({
        query: z.string().describe("The search query to find relevant web information"),
        count: z.number().optional().default(5).describe("Number of results to return (max 20)"),
      }),
      handler: async (args) => {
        log("Tool called: web_search", JSON.stringify(args));
        const results = await tavilyWebSearch(args.query, args.count);
        log("web_search results:", results.substring(0, 300) + "...");
        return results;
      },
    });

    const model = requestedModel || process.env.COPILOT_MODEL || undefined;
    log("Creating session with model:", model || "(default)");

    // Calculate how many AI slides we need (exclude precanned slots)
    const aiSlideCount = topicItems
      ? topicItems.filter((item) => item.type === "topic").length + 2  // +2 for title + closing
      : slideCount;

    const session = await client.createSession({
      model,
      tools: [searchKnowledgeTool, webSearchTool, generateSlideTool],
      systemMessage: {
        mode: "append",
        content: `You are a presentation generator AI. Your job is to create professional, visually rich presentation slides.

WORKFLOW:
1. First, use the search_knowledge tool to load curated content about the requested topic.
2. Then, use the web_search tool to find the latest data, news, and developments about the topic. Search for recent statistics, announcements, and trends.
3. Combine the local knowledge and web search results to create well-informed, up-to-date slides.
4. Call generate_slide exactly ${aiSlideCount} times to create the slides.

RULES:
- Start with a "title" layout slide
- Use varied layouts across the deck (content, split, code, stat, comparison, timeline, quote, bento, chart)
- Each slide should have 3-6 key points
- Key points should be concise but informative (one line each)
${includeCode ? '- Include at least one "code" layout slide with a real code example' : ""}
${includeSpeakerNotes ? "- Include speaker notes for each slide" : ""}
- End with a "content" layout slide for Next Steps
- Make content specific and technically accurate based on the knowledge library and web research
- Prefer real data from web search for statistics and recent developments
- If web search is unavailable, rely on the local knowledge library`,
      },
      availableTools: ["search_knowledge", "web_search", "generate_slide"],
    });

    log("Session created:", session.sessionId);

    yield { type: "status", data: { message: "Searching knowledge library...", step: 2 } };

    // Subscribe to ALL events for visibility
    session.on((event) => {
      const type = event.type;
      if (type === "assistant.message") {
        const content = (event as any).data?.content;
        log(`Event [${type}]:`, content ? content.substring(0, 300) : "(no content)");
      } else if (type === "session.idle") {
        log(`Event [${type}]: session is idle, ${slides.length} slides collected`);
      } else if (type === "session.error") {
        log(`Event [${type}]:`, JSON.stringify((event as any).data));
      } else {
        log(`Event [${type}]`);
      }
    });

    const userPrompt = buildUserPrompt(topic, deckType, theme, aiSlideCount, prompt, aiTopicTexts, presentationTitle);

    log("Sending prompt:", userPrompt);

    const response = await session.sendAndWait(
      { prompt: userPrompt },
      180000 // 3-minute timeout for generation
    );

    log("sendAndWait completed. Response:", response ? "received" : "no response");
    log(`Total slides generated: ${slides.length}`);

    // Merge AI slides with precanned slides if topicItems are provided
    log("topicItems:", topicItems?.length, "types:", topicItems?.map(i => i.type));
    let finalSlides: SlidePlan[];
    if (topicItems && topicItems.length > 0) {
      log("topicItems provided, merging. AI slides:", slides.length, "topicItems:", topicItems.length, "types:", topicItems.map(i => i.type));
      const titleSlide = slides[0];
      const closingSlide = slides[slides.length - 1];
      const contentSlides = slides.slice(1, slides.length - 1);

      log("contentSlides for merge:", contentSlides.length);
      log("contentSlides for merge:", contentSlides.length);
      const merged = mergeAiAndPrecannedSlides(topicItems, contentSlides);
      log("merged count:", merged.length);
      finalSlides = [titleSlide, ...merged, closingSlide].map((s, i) => ({ ...s, index: i }));
      log("finalSlides count:", finalSlides.length, "titles:", finalSlides.map(s => s.title));
    } else {
      finalSlides = slides;
    }

    const plan: PresentationPlan = {
      title: finalSlides[0]?.title || "Untitled Presentation",
      topic,
      deckType,
      theme,
      slides: finalSlides,
    };

    if (outputFormat === "html") {
      // HTML mode: convert slides to HTML fragments, assemble, emit htmlComplete
      const htmlThemeId = mapToHtmlTheme(theme);

      yield { type: "status", data: { message: `Converting ${finalSlides.length} slides to HTML...`, step: 3 } };

      const htmlSlides: HtmlSlide[] = [];
      for (let i = 0; i < finalSlides.length; i++) {
        const htmlSlide = slidePlanToHtml(finalSlides[i], i);
        htmlSlides.push(htmlSlide);
        yield {
          type: "htmlSlide",
          data: {
            slideIndex: i,
            totalSlides: finalSlides.length,
            slide: htmlSlide,
          },
        };
        yield {
          type: "status",
          data: { message: `Converted slide ${i + 1} of ${finalSlides.length} to HTML`, step: 3 },
        };
      }

      yield { type: "status", data: { message: "Assembling HTML presentation...", step: 4 } };

      const assembled = assembleHtmlPresentation({
        title: plan.title,
        slides: htmlSlides,
        themeId: htmlThemeId,
      });

      yield { type: "htmlComplete", data: { plan, htmlContent: assembled.html } };
    } else {
      // Standard slides mode
      yield { type: "status", data: { message: `Generating ${finalSlides.length} slides...`, step: 3 } };

      for (let i = 0; i < finalSlides.length; i++) {
        yield {
          type: "slide",
          data: {
            slideIndex: i,
            totalSlides: finalSlides.length,
            slide: finalSlides[i],
          },
        };
        yield {
          type: "status",
          data: { message: `Generated slide ${i + 1} of ${finalSlides.length}`, step: 3 },
        };
      }

      yield { type: "status", data: { message: "Finalizing presentation...", step: 4 } };
      yield { type: "complete", data: { plan } };
    }

    // Clean up
    log("Cleaning up session and client...");
    await session.destroy();
    await client.stop();
    log("Done.");
  } catch (error) {
    log("ERROR:", error instanceof Error ? error.message : error);
    log("STACK:", error instanceof Error ? error.stack : "");
    // Attempt cleanup
    try {
      await client.stop();
    } catch {
      // ignore cleanup errors
    }
    throw error;
  }
}

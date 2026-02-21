import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import { getDb } from "@/lib/db";

const LOG_PREFIX = "[KnowledgeRefresh]";
function log(...args: unknown[]) {
  console.log(LOG_PREFIX, ...args);
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "src", "data", "knowledge");

const BASE_SECTIONS = ["overview", "features", "architecture", "use-cases"];

/** Some topics have extra sections beyond the base set */
const EXTRA_SECTIONS: Record<string, string[]> = {
  "copilot-sdk": ["code-examples"],
};

function getSectionsForSlug(slug: string): string[] {
  return [...BASE_SECTIONS, ...(EXTRA_SECTIONS[slug] || [])];
}

async function tavilyWebSearch(query: string, count: number = 8): Promise<{ raw: string; resultCount: number; sources: string[] }> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY not configured. Set this environment variable to enable web search.");
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
    throw new Error(`Tavily Search API returned HTTP ${res.status}`);
  }

  const data = await res.json();

  let output = "";
  if (data.answer) {
    output += `**Summary:** ${data.answer}\n\n`;
  }

  const results = data.results ?? [];
  if (results.length === 0 && !data.answer) {
    return { raw: `No web results found for "${query}".`, resultCount: 0, sources: [] };
  }

  const sources: string[] = [];
  output += results
    .map((r: { title: string; url: string; content: string }, i: number) => {
      sources.push(r.title);
      return `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.content}`;
    })
    .join("\n\n");

  return { raw: output, resultCount: results.length, sources };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, stream: useStream } = body as { topic?: string; stream?: boolean };

  if (!topic) {
    return NextResponse.json({ error: "topic (slug) is required" }, { status: 400 });
  }

  // Look up the knowledge source from DB
  const db = getDb();
  const source = db.prepare("SELECT * FROM knowledge_sources WHERE slug = ?").get(topic) as
    | { id: string; name: string; slug: string; description: string | null; status: string }
    | undefined;

  if (!source) {
    return NextResponse.json({ error: `Unknown knowledge source: "${topic}"` }, { status: 404 });
  }

  const knowledgeTopic = source.slug;
  const topicDir = path.join(KNOWLEDGE_DIR, knowledgeTopic);
  const topicName = source.name;
  const sections = getSectionsForSlug(knowledgeTopic);

  if (!fs.existsSync(topicDir)) {
    fs.mkdirSync(topicDir, { recursive: true });
  }

  log(`Starting knowledge refresh for "${topicName}" (${knowledgeTopic})`);

  // If client doesn't want streaming, run the old synchronous path
  if (!useStream) {
    return runSynchronous(knowledgeTopic, topicDir, topicName);
  }

  // SSE streaming path — send progress events as work happens
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: { type: string; data: Record<string, unknown> }) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // search per section + read + synthesize + write
        const totalSteps = sections.length + 3;
        let step = 0;

        // Step 1: Web search for each section
        const searchResults: Record<string, string> = {};
        const searchMeta: { section: string; resultCount: number; sources: string[] }[] = [];

        for (const section of sections) {
          step++;
          const query = `${topicName} ${section.replace("-", " ")} 2025 2026`;
          emit({
            type: "progress",
            data: {
              step,
              totalSteps,
              message: `Searching web for "${topicName} ${section.replace("-", " ")}"...`,
              phase: "search",
              section,
            },
          });

          const result = await tavilyWebSearch(query);
          searchResults[section] = result.raw;
          searchMeta.push({ section, resultCount: result.resultCount, sources: result.sources });

          emit({
            type: "searchResult",
            data: {
              section,
              resultCount: result.resultCount,
              sources: result.sources.slice(0, 5),
            },
          });
        }

        // Step 2: Read existing knowledge
        step++;
        emit({
          type: "progress",
          data: {
            step,
            totalSteps,
            message: "Reading existing knowledge files...",
            phase: "read",
          },
        });

        const existingContent: Record<string, string> = {};
        const existingSizes: Record<string, number> = {};
        for (const section of sections) {
          const filePath = path.join(topicDir, `${section}.md`);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8");
            existingContent[section] = content;
            existingSizes[section] = content.length;
          } else {
            existingSizes[section] = 0;
          }
        }

        emit({
          type: "existingContent",
          data: {
            sections: sections.map((s) => ({
              section: s,
              exists: !!existingContent[s],
              sizeChars: existingSizes[s],
            })),
          },
        });

        // Step 3: Synthesize all sections in parallel with Copilot SDK
        step++;
        emit({
          type: "progress",
          data: {
            step,
            totalSteps,
            message: `Synthesizing ${sections.length} sections in parallel...`,
            phase: "synthesize",
          },
        });

        const client = new CopilotClient({ logLevel: "info" });
        await client.start();

        const updatedSections: Record<string, string> = {};

        const saveSectionTool = defineTool("save_section", {
          description: "Save the updated knowledge section content.",
          parameters: z.object({
            section: z.string().describe("The section name"),
            content: z.string().describe("The updated markdown content for this section"),
          }),
          handler: async (args) => {
            log(`Saving section: ${args.section} (${args.content.length} chars)`);
            updatedSections[args.section] = args.content;

            emit({
              type: "sectionSynthesized",
              data: {
                section: args.section,
                newSizeChars: args.content.length,
                oldSizeChars: existingSizes[args.section] || 0,
                isNew: !existingContent[args.section],
              },
            });

            return `Section "${args.section}" saved successfully.`;
          },
        });

        const systemMessage = {
          mode: "append" as const,
          content: `You are a technical knowledge curator. Your job is to update a single knowledge base document with the latest information from web search results.

You will receive:
1. The existing knowledge content for a section (if any)
2. Fresh web search results

Your task: Merge the existing content with new information from the web search. Keep verified facts, update outdated information, and add new developments.

RULES:
- Output professional markdown documentation
- Keep the same structure and heading levels as the existing content
- Add new facts, statistics, and developments found in web search results
- Remove or update information that is clearly outdated
- Include specific dates, version numbers, and sources where available
- Mark newly added information with context like "As of 2026" where appropriate
- Keep content concise and well-organized
- Do NOT include raw search result formatting — synthesize the information

Call save_section exactly once with the updated content.`,
        };

        await Promise.all(sections.map(async (section) => {
          const session = await client.createSession({
            model: process.env.COPILOT_MODEL || "gpt-4.1-mini",
            tools: [saveSectionTool],
            systemMessage,
            availableTools: ["save_section"],
          });

          let prompt = `Update the "${section}" section for "${topicName}".\n\n`;
          if (existingContent[section]) {
            prompt += `### Existing Content:\n\`\`\`markdown\n${existingContent[section].substring(0, 4000)}\n\`\`\`\n\n`;
          } else {
            prompt += `### Existing Content: (none — create from scratch)\n\n`;
          }
          prompt += `### Web Search Results:\n${searchResults[section]}\n\n`;
          prompt += `Call save_section with section="${section}" and the synthesized markdown content.`;

          log(`Synthesizing section: ${section}`);
          await session.sendAndWait({ prompt }, 90000);
          await session.destroy();
        }));

        await client.stop();

        // Step 4: Write updated sections to disk
        step++;
        emit({
          type: "progress",
          data: {
            step,
            totalSteps,
            message: "Writing updated knowledge files...",
            phase: "write",
          },
        });

        const writeResults: { section: string; sizeChars: number; action: string }[] = [];
        for (const [section, content] of Object.entries(updatedSections)) {
          const filePath = path.join(topicDir, `${section}.md`);
          fs.writeFileSync(filePath, content, "utf-8");
          const action = existingContent[section] ? "updated" : "created";
          writeResults.push({ section, sizeChars: content.length, action });
          log(`Written: ${filePath}`);
        }

        log(`Knowledge refresh complete: ${writeResults.length} sections updated`);

        // Update knowledge source status to 'ready'
        db.prepare("UPDATE knowledge_sources SET status = 'ready' WHERE slug = ?").run(knowledgeTopic);

        emit({
          type: "complete",
          data: {
            topic: knowledgeTopic,
            topicName,
            sectionsUpdated: writeResults.length,
            sections: writeResults,
            searchMeta,
          },
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        log("ERROR:", message);
        // Update knowledge source status to 'error'
        db.prepare("UPDATE knowledge_sources SET status = 'error' WHERE slug = ?").run(knowledgeTopic);
        emit({ type: "error", data: { message } });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/** Original synchronous path — returns JSON when done (backwards compat) */
async function runSynchronous(knowledgeTopic: string, topicDir: string, topicName: string) {
  const sections = getSectionsForSlug(knowledgeTopic);
  try {
    const searchResults: Record<string, string> = {};
    for (const section of sections) {
      const query = `${topicName} ${section.replace("-", " ")} 2025 2026`;
      log(`Searching: "${query}"`);
      const result = await tavilyWebSearch(query);
      searchResults[section] = result.raw;
    }

    const existingContent: Record<string, string> = {};
    for (const section of sections) {
      const filePath = path.join(topicDir, `${section}.md`);
      if (fs.existsSync(filePath)) {
        existingContent[section] = fs.readFileSync(filePath, "utf-8");
      }
    }

    const client = new CopilotClient({ logLevel: "info" });
    await client.start();

    const updatedSections: Record<string, string> = {};

    const saveSectionTool = defineTool("save_section", {
      description: "Save the updated knowledge section content.",
      parameters: z.object({
        section: z.string().describe("The section name"),
        content: z.string().describe("The updated markdown content for this section"),
      }),
      handler: async (args) => {
        log(`Saving section: ${args.section} (${args.content.length} chars)`);
        updatedSections[args.section] = args.content;
        return `Section "${args.section}" saved successfully.`;
      },
    });

    const systemMessage = {
      mode: "append" as const,
      content: `You are a technical knowledge curator. Your job is to update a single knowledge base document with the latest information from web search results.

You will receive:
1. The existing knowledge content for a section (if any)
2. Fresh web search results

Your task: Merge the existing content with new information from the web search. Keep verified facts, update outdated information, and add new developments.

RULES:
- Output professional markdown documentation
- Keep the same structure and heading levels as the existing content
- Add new facts, statistics, and developments found in web search results
- Remove or update information that is clearly outdated
- Include specific dates, version numbers, and sources where available
- Mark newly added information with context like "As of 2026" where appropriate
- Keep content concise and well-organized
- Do NOT include raw search result formatting — synthesize the information

Call save_section exactly once with the updated content.`,
    };

    await Promise.all(sections.map(async (section) => {
      const session = await client.createSession({
        model: process.env.COPILOT_MODEL || "gpt-4.1-mini",
        tools: [saveSectionTool],
        systemMessage,
        availableTools: ["save_section"],
      });

      let prompt = `Update the "${section}" section for "${topicName}".\n\n`;
      if (existingContent[section]) {
        prompt += `### Existing Content:\n\`\`\`markdown\n${existingContent[section].substring(0, 4000)}\n\`\`\`\n\n`;
      } else {
        prompt += `### Existing Content: (none — create from scratch)\n\n`;
      }
      prompt += `### Web Search Results:\n${searchResults[section]}\n\n`;
      prompt += `Call save_section with section="${section}" and the synthesized markdown content.`;

      log(`Synthesizing section: ${section}`);
      await session.sendAndWait({ prompt }, 90000);
      await session.destroy();
    }));

    await client.stop();

    let sectionsUpdated = 0;
    for (const [section, content] of Object.entries(updatedSections)) {
      const filePath = path.join(topicDir, `${section}.md`);
      fs.writeFileSync(filePath, content, "utf-8");
      sectionsUpdated++;
      log(`Written: ${filePath}`);
    }

    log(`Knowledge refresh complete: ${sectionsUpdated} sections updated`);

    return NextResponse.json({
      success: true,
      topic: knowledgeTopic,
      topicName,
      sectionsUpdated,
      sections: Object.keys(updatedSections),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

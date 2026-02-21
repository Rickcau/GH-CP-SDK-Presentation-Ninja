import { PresentationPlan, SlidePlan, Topic, DeckType, AgentEvent, OutputFormat, TopicItem } from "./types";
import { loadKnowledge } from "./knowledge";
import { assembleHtmlPresentation } from "@/lib/pipeline/assemble";
import { slidePlanToHtml, mapToHtmlTheme } from "@/lib/pipeline/slide-to-html";
import { mergeAiAndPrecannedSlides } from "./precanned-slides";
import type { HtmlSlide } from "@/lib/pipeline/types";

/** Get a display title for the topic — tries the knowledge source name from DB, falls back to slug */
function resolveTopicTitle(topic: Topic): string {
  const KNOWN: Record<string, string> = {
    "microsoft-foundry": "Azure AI Foundry",
    copilot: "GitHub Copilot",
    "copilot-cli": "GitHub Copilot CLI",
    "copilot-sdk": "GitHub Copilot SDK",
    foundry: "Azure AI Foundry",
  };
  return KNOWN[topic] || topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateMockSlides(
  topic: Topic,
  deckType: DeckType,
  slideCount: number,
  includeCode: boolean,
  presentationTopics?: string[],
  presentationTitle?: string,
): SlidePlan[] {
  const slides: SlidePlan[] = [];
  const topicTitle = resolveTopicTitle(topic);
  const title = presentationTitle || `${topicTitle} — ${deckType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;

  // Title slide
  slides.push({
    index: 0,
    layout: "title",
    title,
    keyPoints: [`A comprehensive ${deckType.replace(/-/g, " ")} presentation`, `Powered by Presentation Ninja`],
  });

  if (presentationTopics && presentationTopics.length > 0) {
    // Generate one slide per presentation topic
    const layouts = ["content", "split", "comparison", "stat", "timeline", "bento", "content"];
    presentationTopics.slice(0, slideCount - 2).forEach((topicText, i) => {
      const layout = layouts[i % layouts.length];
      slides.push({
        index: i + 1,
        layout,
        title: topicText,
        keyPoints: [
          `Key insight about ${topicText}`,
          `Core concepts and fundamentals`,
          `Real-world applications and benefits`,
          `Best practices and recommendations`,
        ],
      });
    });
  } else {
    // Fallback: generate slides from hardcoded content for known topics
    const topicSlides = getTopicSlides(topic, deckType, includeCode);
    topicSlides.slice(0, slideCount - 2).forEach((slide, i) => {
      slides.push({ ...slide, index: i + 1 });
    });
  }

  // Closing slide
  slides.push({
    index: slides.length,
    layout: "content",
    title: "Next Steps",
    keyPoints: [
      "Review the resources shared in this presentation",
      "Set up a proof of concept with your team",
      "Join the community for support and updates",
      "Reach out for enterprise consultation",
    ],
  });

  return slides;
}

function getTopicSlides(topic: Topic, deckType: DeckType, includeCode: boolean): SlidePlan[] {
  // Return topic-specific slides based on knowledge
  const slides: SlidePlan[] = [];

  if (topic === "copilot-sdk") {
    slides.push(
      { index: 0, layout: "content", title: "What is the Copilot SDK?", keyPoints: ["Multi-platform toolkit for embedding Copilot's agentic workflows into applications", "Same engine behind GitHub Copilot CLI — production-tested agent runtime", "Available in TypeScript, Python, Go, and .NET", "Handles planning, tool invocation, and file editing automatically", "No custom orchestration required — define behavior, SDK manages execution"] },
      { index: 0, layout: "split", title: "Architecture", keyPoints: ["Your Application → SDK Client (JSON-RPC) → Copilot CLI → Model Provider", "SDK manages CLI process lifecycle automatically", "Custom tools extend agent capabilities via defineTool", "Streaming events for real-time UI updates", "Session management with infinite context support"] },
      { index: 0, layout: "comparison", title: "Authentication Options", keyPoints: ["GitHub Credentials: Use signed-in user credentials from Copilot CLI", "OAuth GitHub App: OAuth app tokens for web applications (gho_ / ghu_)", "Environment Variables: COPILOT_GITHUB_TOKEN, GH_TOKEN, GITHUB_TOKEN", "BYOK: Bring Your Own Key for OpenAI, Azure AI Foundry, or Anthropic"] },
      { index: 0, layout: "stat", title: "SDK at a Glance", keyPoints: ["7,200+ — GitHub stars", "4 — Supported languages", "38 — Contributors", "156 — Commits to date"] },
      { index: 0, layout: "content", title: "Custom Tools with defineTool", keyPoints: ["Define tools using Zod schemas (TypeScript) or Pydantic (Python)", "Type-safe parameter validation at runtime", "Agent automatically decides when to invoke each tool", "Tool results feed back into the agent's reasoning loop", "Support for async handlers and streaming results"] },
      { index: 0, layout: "timeline", title: "Getting Started Roadmap", keyPoints: ["Day 1: Install SDK and Copilot CLI, run hello-world agent", "Week 1: Build custom tools, integrate with your application", "Week 2: Add streaming UI, session management, error handling", "Week 3: Production deployment with auth, monitoring, and CI/CD"] },
    );
    if (includeCode) {
      slides.push({
        index: 0,
        layout: "code",
        title: "Quick Start: Your First Agent",
        keyPoints: ["Create a CopilotClient, start a session, and send a prompt"],
        codeExample: {
          language: "typescript",
          code: `import { CopilotClient } from "@github/copilot-sdk";\n\nconst client = new CopilotClient();\nawait client.start();\n\nconst session = await client.createSession({\n  model: "gpt-5",\n  streaming: true,\n});\n\nconst reply = await session.sendAndWait({\n  prompt: "Explain microservices architecture"\n});\n\nconsole.log(reply?.data.content);`,
          caption: "Basic Copilot SDK agent setup in TypeScript",
        },
      });
    }
  } else if (topic === "copilot") {
    slides.push(
      { index: 0, layout: "content", title: "What is GitHub Copilot?", keyPoints: ["AI pair programmer that helps you write code faster", "Code completions, Copilot Chat, workspace agents, PR summaries", "Supported in VS Code, JetBrains, Neovim, Visual Studio", "Individual ($10/mo), Business ($19/mo), Enterprise ($39/mo)", "Used by millions of developers worldwide"] },
      { index: 0, layout: "stat", title: "Developer Impact", keyPoints: ["55% — Faster task completion", "74% — More focused developers", "46% — More code completed", "88% — Developer satisfaction"] },
      { index: 0, layout: "content", title: "Enterprise Features", keyPoints: ["Organization-wide policy management and controls", "Usage analytics and adoption metrics dashboard", "Knowledge bases for custom documentation grounding", "Content exclusions for sensitive repositories", "Audit logs and compliance reporting", "IP indemnity and security assurance"] },
      { index: 0, layout: "comparison", title: "Copilot Plans", keyPoints: ["Individual ($10/mo): IDE completions, chat, CLI access", "Business ($19/mo): Org management, policies, audit logs", "Enterprise ($39/mo): Knowledge bases, fine-grained controls, SAML SSO"] },
      { index: 0, layout: "timeline", title: "Enterprise Rollout Strategy", keyPoints: ["Phase 1: Pilot with 50 champion developers (2 weeks)", "Phase 2: Expand to 500 across key teams (4 weeks)", "Phase 3: Organization-wide rollout with training (2 weeks)", "Phase 4: Measure ROI and optimize usage (ongoing)"] },
      { index: 0, layout: "content", title: "Best Practices", keyPoints: ["Write clear comments to guide Copilot suggestions", "Use Copilot Chat for complex tasks and explanations", "Review all suggestions — AI is a copilot, not autopilot", "Set up knowledge bases for org-specific context", "Track adoption metrics to measure impact"] },
    );
  } else if (topic === "microsoft-foundry") {
    slides.push(
      { index: 0, layout: "content", title: "What is Azure AI Foundry?", keyPoints: ["Unified platform for building, deploying, and managing AI applications", "Model catalog with 1,600+ models (Azure OpenAI, Meta, Mistral, Cohere)", "Built-in prompt flow for AI workflow orchestration", "Responsible AI tools, evaluations, and content safety", "Enterprise-grade security and compliance (SOC 2, ISO 27001)"] },
      { index: 0, layout: "split", title: "Platform Architecture", keyPoints: ["AI Foundry Hub: Central governance, shared compute, connections", "AI Foundry Project: Team workspace for development", "Model Catalog: Browse, evaluate, and deploy models", "Prompt Flow: Visual workflow builder for AI applications"] },
      { index: 0, layout: "bento", title: "Key Capabilities", keyPoints: ["Model Fine-tuning: Customize models with supervised learning and LoRA", "Prompt Flow: Build and test AI workflows visually", "Evaluations: Automated quality and safety testing with custom metrics", "Deployments: Managed endpoints with autoscaling and monitoring"] },
      { index: 0, layout: "content", title: "Integration Points", keyPoints: ["Azure AI Search for RAG (Retrieval-Augmented Generation)", "Azure Blob Storage for data assets and documents", "Azure Key Vault for secrets management", "GitHub Actions for CI/CD of AI workflows", "Azure Monitor for observability and tracing"] },
      { index: 0, layout: "stat", title: "Enterprise Scale", keyPoints: ["1,600+ — Models available", "99.9% — SLA guarantee", "60+ — Azure regions worldwide", "SOC 2 — Compliance certified"] },
    );
  } else if (topic === "copilot-cli") {
    slides.push(
      { index: 0, layout: "content", title: "What is Copilot CLI?", keyPoints: ["AI-powered command line assistant integrated with GitHub CLI", "Natural language to shell command translation", "Explain any command in plain English", "Works with bash, zsh, PowerShell, and fish", "Part of the GitHub Copilot ecosystem"] },
      { index: 0, layout: "split", title: "How It Works", keyPoints: ["User types natural language prompt", "GitHub API processes the request with AI model", "Returns suggested command with explanation", "User can execute, revise, or explain further", "Context-aware: reads current directory and environment"] },
      { index: 0, layout: "comparison", title: "Key Commands", keyPoints: ["gh copilot suggest: Translate natural language to shell commands", "gh copilot explain: Get plain-English explanation of any command"] },
      { index: 0, layout: "content", title: "Use Cases", keyPoints: ["DevOps: Find processes, manage Docker containers, Kubernetes operations", "Git: Complex git commands from natural language descriptions", "System Admin: File management, network diagnostics, service management", "CI/CD: Debug pipeline failures, parse build logs", "Onboarding: Help new developers learn unfamiliar CLI tools"] },
      { index: 0, layout: "stat", title: "Productivity Impact", keyPoints: ["10x — Faster command discovery", "Zero — Manual pages to read", "Any — Shell supported", "Instant — Command explanations"] },
    );
  }

  return slides;
}

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
  const { theme = "dark-luxe", slideCount = 8, includeCode = false, outputFormat = "slides", presentationTopics, presentationTitle, topicItems } = options;

  yield { type: "status", data: { message: "Loading knowledge pack...", step: 1 } };
  await sleep(500);

  const knowledge = loadKnowledge(topic);
  yield { type: "status", data: { message: "Planning presentation structure...", step: 2 } };
  await sleep(800);

  // Extract only AI topic texts for slide generation
  const aiTopicTexts = topicItems
    ? topicItems.filter((item): item is Extract<TopicItem, { type: "topic" }> => item.type === "topic").map((item) => item.text)
    : presentationTopics;

  console.log("[MockAgent] topicItems provided:", !!topicItems, "count:", topicItems?.length);
  console.log("[MockAgent] aiTopicTexts:", aiTopicTexts);
  console.log("[MockAgent] slideCount:", slideCount);

  // When topicItems are provided, generate exactly enough AI slides for AI topics (ignore slideCount cap)
  const effectiveSlideCount = topicItems
    ? (aiTopicTexts?.length || 0) + 2  // +2 for title + closing
    : slideCount;

  const slides = generateMockSlides(topic, deckType, effectiveSlideCount, includeCode, aiTopicTexts, presentationTitle);

  console.log("[MockAgent] generated slides count:", slides.length, "titles:", slides.map(s => s.title));

  // Merge AI slides with precanned slides if topicItems provided
  let finalSlides: SlidePlan[];
  if (topicItems && topicItems.length > 0) {
    // The mock generates title + topic slides + closing. We need to separate
    // the title/closing slides from topic-content slides for merging.
    const titleSlide = slides[0];
    const closingSlide = slides[slides.length - 1];
    const contentSlides = slides.slice(1, slides.length - 1);

    console.log("[MockAgent] contentSlides for merge:", contentSlides.length);

    const merged = mergeAiAndPrecannedSlides(topicItems, contentSlides);
    finalSlides = [titleSlide, ...merged, closingSlide].map((s, i) => ({ ...s, index: i }));

    console.log("[MockAgent] finalSlides count:", finalSlides.length, "titles:", finalSlides.map(s => s.title));
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

    yield { type: "status", data: { message: `Generating ${finalSlides.length} HTML slides...`, step: 3 } };

    const htmlSlides: HtmlSlide[] = [];
    for (let i = 0; i < finalSlides.length; i++) {
      await sleep(300);
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
        data: { message: `Generated slide ${i + 1} of ${finalSlides.length}`, step: 3 },
      };
    }

    await sleep(300);
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
      await sleep(300);
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

    await sleep(300);
    yield { type: "status", data: { message: "Finalizing presentation...", step: 4 } };
    await sleep(400);

    yield { type: "complete", data: { plan } };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

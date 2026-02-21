import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { loadKnowledge } from "@/lib/agent/knowledge";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { knowledgeSource, title } = body as { knowledgeSource?: string; title?: string };

  if (!knowledgeSource || !title?.trim()) {
    return NextResponse.json(
      { error: "knowledgeSource and title are required" },
      { status: 400 }
    );
  }

  // Load knowledge to give the AI context
  const knowledge = loadKnowledge(knowledgeSource);

  // Try real Copilot SDK, fall back to mock suggestions
  try {
    const { CopilotClient, defineTool } = await import("@github/copilot-sdk");
    const { z } = await import("zod");

    const client = new CopilotClient({ logLevel: "info" });
    await client.start();

    let suggestions: { label: string; topics: string[] }[] = [];

    const suggestTool = defineTool("suggest_topic_sets", {
      description: "Submit 3 different sets of presentation topics for the user to choose from.",
      parameters: z.object({
        sets: z.array(
          z.object({
            label: z.string().describe("Short label for this set, e.g. 'Technical Deep Dive'"),
            topics: z.array(z.string()).min(5).max(10).describe("List of slide topic titles"),
          })
        ).length(3),
      }),
      handler: async (args) => {
        suggestions = args.sets;
        return "Topic sets submitted successfully.";
      },
    });

    const session2 = await client.createSession({
      model: process.env.COPILOT_MODEL || "gpt-4.1-mini",
      tools: [suggestTool],
      systemMessage: {
        mode: "append",
        content: `You are a presentation planning expert. Given a presentation title and knowledge source content, generate 3 different sets of slide topics for the presentation.

Each set should take a different angle:
- Set 1: A broad overview (covering wide ground)
- Set 2: A technical deep dive (more detail-oriented)
- Set 3: A practical/hands-on approach (use cases, demos, how-tos)

Each set should have 6-10 topic titles. Topics should be concise (3-8 words each) and flow logically from intro to conclusion.

Call suggest_topic_sets with all 3 sets.`,
      },
      availableTools: ["suggest_topic_sets"],
    });

    const knowledgeSummary = knowledge.substring(0, 3000);
    const prompt = `Generate 3 sets of slide topics for a presentation titled "${title.trim()}" about the knowledge source content below.\n\n### Knowledge Source Content (summary):\n${knowledgeSummary}\n\nCall suggest_topic_sets with your 3 sets.`;

    await session2.sendAndWait({ prompt }, 60000);
    await session2.destroy();
    await client.stop();

    if (suggestions.length === 3) {
      return NextResponse.json({ suggestions });
    }

    // Fallback if tool wasn't called
    throw new Error("AI did not produce topic suggestions");
  } catch (err) {
    console.error("[SuggestTopics] SDK failed, using mock suggestions:", err);

    // Mock fallback — generate reasonable defaults based on title
    const suggestions = generateMockSuggestions(title.trim());
    return NextResponse.json({ suggestions });
  }
}

function generateMockSuggestions(title: string): { label: string; topics: string[] }[] {
  return [
    {
      label: "Broad Overview",
      topics: [
        `Introduction to ${title}`,
        "Key Concepts and Terminology",
        "Core Features and Capabilities",
        "Architecture Overview",
        "Integration Points",
        "Getting Started",
        "Best Practices",
        "Summary and Next Steps",
      ],
    },
    {
      label: "Technical Deep Dive",
      topics: [
        `${title} — Technical Foundation`,
        "System Architecture and Design",
        "Core APIs and Interfaces",
        "Data Flow and Processing Pipeline",
        "Security and Authentication",
        "Performance and Scalability",
        "Advanced Configuration",
        "Troubleshooting and Debugging",
        "Summary and Resources",
      ],
    },
    {
      label: "Practical Guide",
      topics: [
        `Why ${title} Matters`,
        "Setting Up Your Environment",
        "Your First Project — Step by Step",
        "Real-World Use Cases",
        "Live Demo Walkthrough",
        "Common Patterns and Recipes",
        "Team Adoption Strategy",
        "Summary and Action Items",
      ],
    },
  ];
}

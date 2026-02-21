import { generatePresentation as mockGenerate } from "./mock-agent";
import { Topic, DeckType, OutputFormat, AgentEvent, TopicItem } from "./types";

export type { PresentationPlan, SlidePlan, AgentEvent, Topic, DeckType, OutputFormat, TopicItem } from "./types";

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
  const useMock = process.env.USE_MOCK_AGENT === "true";

  if (useMock) {
    yield* mockGenerate(topic, deckType, prompt, options);
    return;
  }

  // Try real Copilot SDK agent, fall back to mock on failure
  try {
    console.log("[Agent] Attempting to use real Copilot SDK agent...");
    const { generatePresentation: copilotGenerate } = await import("./copilot-agent");
    console.log("[Agent] copilot-agent module loaded successfully, starting generation...");
    yield* copilotGenerate(topic, deckType, prompt, options);
    console.log("[Agent] Copilot SDK generation completed successfully.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : "";
    console.error("[Agent] Copilot SDK failed, falling back to mock agent.");
    console.error("[Agent] Error:", message);
    console.error("[Agent] Stack:", stack);
    yield {
      type: "status",
      data: {
        message: `Copilot SDK unavailable (${message}). Falling back to demo mode.`,
        step: 0,
      },
    };
    yield* mockGenerate(topic, deckType, prompt, options);
  }
}

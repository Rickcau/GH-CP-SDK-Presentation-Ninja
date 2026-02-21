export interface PresentationPlan {
  title: string;
  topic: string;
  deckType: string;
  theme: string;
  slides: SlidePlan[];
  presentationTopics?: string[];
}

export interface SlidePlan {
  index: number;
  layout: string;
  title: string;
  keyPoints: string[];
  speakerNotes?: string;
  codeExample?: {
    language: string;
    code: string;
    caption?: string;
  };
  chartData?: {
    type: "bar" | "line" | "pie" | "donut";
    data: { label: string; value: number }[];
  };
  youtubeUrl?: string;
}

export interface AgentEvent {
  type: "status" | "slide" | "complete" | "error" | "htmlSlide" | "htmlComplete";
  data: any;
}

export type Topic = string;
export type DeckType = "overview" | "getting-started" | "architecture" | "enablement" | "workshop" | "custom";
export type OutputFormat = "slides" | "html";

// --- TopicItem discriminated union for drag-to-reorder + precanned slides ---

export interface AiTopic {
  id: string;
  type: "topic";
  text: string;
}

export interface DemoSlideItem {
  id: string;
  type: "demo";
  title?: string;
}

export interface YoutubeSlideItem {
  id: string;
  type: "youtube";
  url: string;
  title?: string;
}

export type TopicItem = AiTopic | DemoSlideItem | YoutubeSlideItem;

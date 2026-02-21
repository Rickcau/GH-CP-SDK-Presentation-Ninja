export interface SlideContent {
  layout: SlideLayout;
  title: string;
  content: string[];
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
}

export type SlideLayout =
  | "title"
  | "content"
  | "split"
  | "chart"
  | "quote"
  | "comparison"
  | "timeline"
  | "bento"
  | "stat"
  | "code"
  | "youtube"
  | "demo";

export interface SlideTheme {
  name: string;
  label: string;
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
  accent: string;
  gradient?: string;
  fontHeading: string;
  fontBody: string;
}

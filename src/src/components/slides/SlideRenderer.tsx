"use client";

import { SlideContent, SlideTheme } from "./types";
import {
  TitleSlide,
  ContentSlide,
  SplitSlide,
  CodeSlide,
  StatSlide,
  ComparisonSlide,
  TimelineSlide,
  QuoteSlide,
  BentoSlide,
  ChartSlide,
  YoutubeSlide,
  DemoSlide,
} from "./layouts";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
  className?: string;
}

const layoutMap: Record<string, React.ComponentType<{ slide: SlideContent; theme: SlideTheme }>> = {
  title: TitleSlide,
  content: ContentSlide,
  split: SplitSlide,
  code: CodeSlide,
  stat: StatSlide,
  comparison: ComparisonSlide,
  timeline: TimelineSlide,
  quote: QuoteSlide,
  bento: BentoSlide,
  chart: ChartSlide,
  youtube: YoutubeSlide,
  demo: DemoSlide,
};

export function SlideRenderer({ slide, theme, className }: Props) {
  const LayoutComponent = layoutMap[slide.layout] || ContentSlide;
  return (
    <div className={`aspect-video overflow-hidden ${className || ""}`}>
      <LayoutComponent slide={slide} theme={theme} />
    </div>
  );
}

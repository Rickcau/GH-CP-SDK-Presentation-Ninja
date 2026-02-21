"use client";

import { SlideContent, SlideTheme } from "./types";
import { SlideRenderer } from "./SlideRenderer";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
  onClick?: () => void;
  isActive?: boolean;
}

export function SlidePreview({ slide, theme, onClick, isActive }: Props) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full rounded-lg overflow-hidden border-2 transition-all hover:ring-2 hover:ring-teal-500/50 ${
        isActive ? "border-teal-500 ring-2 ring-teal-500/30" : "border-white/10"
      }`}
    >
      <div className="transform scale-[0.2] origin-top-left w-[500%] h-[500%]">
        <SlideRenderer slide={slide} theme={theme} />
      </div>
    </button>
  );
}

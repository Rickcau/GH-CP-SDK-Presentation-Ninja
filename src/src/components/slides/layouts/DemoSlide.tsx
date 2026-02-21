"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function DemoSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg}`}>
      {/* Large pulsing background orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/[0.04] blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.02] blur-3xl" />

      {/* Bold accent bars top and bottom */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.accent}`} />
      <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${theme.accent}`} />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-20">
        {/* Live indicator badge */}
        <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full ${theme.surface} border border-white/10 mb-10`}>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className={`text-sm uppercase tracking-[4px] font-semibold ${theme.primary}`}>
            Live Demo
          </span>
        </div>

        {/* Huge bold title */}
        <h1 className={`text-7xl font-black uppercase tracking-[8px] ${theme.text} ${theme.fontHeading} text-center mb-8 leading-none`}>
          {slide.title}
        </h1>

        {/* Subtitle from first content point */}
        {slide.content.length > 0 && (
          <p className={`text-xl ${theme.textMuted} ${theme.fontBody} text-center max-w-lg`}>
            {slide.content[0]}
          </p>
        )}

        {/* Decorative gradient line */}
        <div className={`w-24 h-1 rounded-full ${theme.accent} mt-10`} />
      </div>
    </div>
  );
}

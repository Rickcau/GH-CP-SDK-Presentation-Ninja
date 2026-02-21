"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function TitleSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Decorative orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="absolute -bottom-48 -left-24 w-80 h-80 rounded-full bg-white/[0.02] blur-3xl" />

      {/* Accent line top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent}`} />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-20">
        {/* Small topic label */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.surface} mb-8`}>
          <div className={`w-2 h-2 rounded-full ${theme.accent}`} />
          <span className={`text-xs uppercase tracking-widest ${theme.textMuted}`}>Presentation</span>
        </div>

        <h1 className={`text-6xl ${theme.text} ${theme.fontHeading} text-center mb-6 leading-tight max-w-5xl`}>
          {slide.title}
        </h1>

        {slide.content.length > 0 && (
          <div className="max-w-3xl text-center">
            {slide.content.map((line, i) => (
              <p key={i} className={`text-xl ${theme.textMuted} ${theme.fontBody} mb-1 leading-relaxed`}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Decorative divider */}
        <div className="flex items-center gap-3 mt-10">
          <div className={`w-12 h-0.5 ${theme.accent} rounded-full`} />
          <div className={`w-2 h-2 rounded-full ${theme.accent}`} />
          <div className={`w-12 h-0.5 ${theme.accent} rounded-full`} />
        </div>
      </div>
    </div>
  );
}

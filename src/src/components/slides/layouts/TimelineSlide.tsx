"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function TimelineSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      <div className="relative z-10 w-full h-full flex flex-col p-16">
        <div className="flex items-start gap-5 mb-12">
          <div className={`w-1.5 h-10 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full relative">
            {/* Connector line */}
            <div className={`absolute top-7 left-8 right-8 h-0.5 ${theme.accent} opacity-30`} />

            <div className="flex items-start justify-between">
              {slide.content.map((step, i) => {
                const parts = step.split(/:\s*/);
                const label = parts[0];
                const desc = parts.slice(1).join(": ");
                return (
                  <div key={i} className="flex flex-col items-center text-center relative z-10 flex-1 px-3">
                    {/* Circle with number */}
                    <div className={`w-14 h-14 rounded-full ${theme.accent} flex items-center justify-center mb-5 shadow-lg`}>
                      <span className="text-lg font-bold text-white">{i + 1}</span>
                    </div>
                    <h3 className={`text-sm ${theme.primary} ${theme.fontHeading} mb-2`}>
                      {label}
                    </h3>
                    <p className={`text-xs ${theme.textMuted} ${theme.fontBody} max-w-[180px] leading-relaxed`}>
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

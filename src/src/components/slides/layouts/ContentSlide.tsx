"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function ContentSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-64 h-64">
        <div className={`absolute top-8 right-8 w-32 h-32 rounded-full ${theme.accent} opacity-10 blur-2xl`} />
        <div className={`absolute top-12 right-12 w-16 h-16 rounded-full ${theme.accent} opacity-5`} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-16">
        {/* Header with accent bar */}
        <div className="flex items-start gap-5 mb-10">
          <div className={`w-1.5 h-12 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        {/* Content points with numbered indicators */}
        <div className="flex-1 flex flex-col justify-center pl-4">
          <ul className="space-y-5">
            {slide.content.map((point, i) => (
              <li key={i} className="flex items-start gap-5">
                <div className={`w-8 h-8 rounded-lg ${theme.surface} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`text-sm font-semibold ${theme.primary}`}>{i + 1}</span>
                </div>
                <span className={`text-lg ${theme.text} ${theme.fontBody} leading-relaxed pt-1`}>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom accent line */}
        <div className={`w-20 h-0.5 ${theme.accent} rounded-full mt-6`} />
      </div>
    </div>
  );
}

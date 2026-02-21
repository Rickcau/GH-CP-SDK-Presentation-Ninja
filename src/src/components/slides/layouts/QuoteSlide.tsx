"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function QuoteSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Decorative elements */}
      <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-white/[0.02] blur-3xl" />
      <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-white/[0.02] blur-3xl" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-24">
        {/* Large quote mark */}
        <div className={`text-[10rem] ${theme.primary} leading-none opacity-20 -mb-20 select-none`}>
          &ldquo;
        </div>

        <blockquote className={`text-3xl ${theme.text} ${theme.fontBody} text-center leading-relaxed max-w-3xl mb-8`}>
          {slide.content[0]}
        </blockquote>

        {slide.content[1] && (
          <>
            <div className={`w-16 h-0.5 ${theme.accent} rounded-full mb-4`} />
            <cite className={`text-lg ${theme.primary} not-italic ${theme.fontHeading}`}>
              {slide.content[1]}
            </cite>
          </>
        )}
      </div>
    </div>
  );
}

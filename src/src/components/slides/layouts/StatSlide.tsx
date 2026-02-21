"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function StatSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Large decorative number */}
      <div className={`absolute -right-16 -top-16 text-[20rem] font-black ${theme.primary} opacity-[0.04] leading-none select-none`}>
        #
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-16">
        <h2 className={`text-2xl ${theme.textMuted} ${theme.fontBody} mb-14 tracking-wide uppercase text-center`}>
          {slide.title}
        </h2>
        <div className="grid grid-cols-2 gap-x-20 gap-y-12 max-w-4xl">
          {slide.content.map((stat, i) => {
            const parts = stat.split(/:\s*|—\s*|–\s*/);
            const value = parts[0];
            const label = parts[1] || "";
            return (
              <div key={i} className="text-center group">
                <div className={`text-6xl ${theme.fontHeading} ${theme.primary} mb-2 tabular-nums`}>
                  {value}
                </div>
                <div className={`w-8 h-0.5 ${theme.accent} mx-auto mb-3 rounded-full`} />
                <div className={`text-base ${theme.textMuted} ${theme.fontBody}`}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function ComparisonSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Background accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/[0.02] to-transparent" />

      <div className="relative z-10 w-full h-full flex flex-col p-16">
        <div className="flex items-start gap-5 mb-10">
          <div className={`w-1.5 h-10 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        <div className={`flex-1 grid ${slide.content.length <= 2 ? 'grid-cols-2' : slide.content.length === 3 ? 'grid-cols-3' : 'grid-cols-2 grid-rows-2'} gap-5`}>
          {slide.content.map((item, i) => {
            const parts = item.split(/:\s*/);
            const heading = parts[0];
            const description = parts.slice(1).join(": ");
            return (
              <div
                key={i}
                className={`${theme.surface} rounded-xl p-6 flex flex-col relative overflow-hidden group`}
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${theme.accent} opacity-60`} />
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-7 h-7 rounded-lg ${theme.accent} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{String.fromCharCode(65 + i)}</span>
                  </div>
                  <h3 className={`text-lg ${theme.primary} ${theme.fontHeading}`}>
                    {heading}
                  </h3>
                </div>
                <p className={`text-sm ${theme.text} ${theme.fontBody} leading-relaxed opacity-80`}>
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

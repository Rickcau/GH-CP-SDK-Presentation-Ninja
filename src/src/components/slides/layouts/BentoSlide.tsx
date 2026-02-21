"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

const CARD_ICONS = ["◆", "◇", "▲", "●", "■", "★"];

export function BentoSlide({ slide, theme }: Props) {
  const count = slide.content.length;
  const gridClass =
    count <= 3
      ? "grid-cols-3"
      : count === 4
        ? "grid-cols-2 grid-rows-2"
        : "grid-cols-3 grid-rows-2";

  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      <div className="relative z-10 w-full h-full flex flex-col p-16">
        <div className="flex items-start gap-5 mb-8">
          <div className={`w-1.5 h-10 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        <div className={`flex-1 grid ${gridClass} gap-4`}>
          {slide.content.map((item, i) => {
            const parts = item.split(/:\s*/);
            const heading = parts[0];
            const description = parts.slice(1).join(": ");
            return (
              <div
                key={i}
                className={`${theme.surface} rounded-xl p-5 flex flex-col relative overflow-hidden ${
                  i === 0 && count > 4 ? "col-span-2" : ""
                }`}
              >
                {/* Small accent dot */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm ${theme.primary}`}>{CARD_ICONS[i % CARD_ICONS.length]}</span>
                  <h3 className={`text-base ${theme.primary} ${theme.fontHeading}`}>
                    {heading}
                  </h3>
                </div>
                <p className={`text-sm ${theme.textMuted} ${theme.fontBody} leading-relaxed`}>
                  {description}
                </p>
                {/* Bottom gradient fade */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.accent} opacity-20`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

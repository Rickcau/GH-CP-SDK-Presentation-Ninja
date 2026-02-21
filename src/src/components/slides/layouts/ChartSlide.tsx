"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function ChartSlide({ slide, theme }: Props) {
  const data = slide.chartData?.data || [];
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      <div className="relative z-10 w-full h-full flex flex-col p-16">
        <div className="flex items-start gap-5 mb-10">
          <div className={`w-1.5 h-10 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        <div className="flex-1 flex items-end gap-8 pb-4 px-4">
          {data.map((item, i) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                {/* Value label */}
                <div className={`text-lg font-bold ${theme.primary} mb-3 ${theme.fontHeading}`}>
                  {item.value}
                </div>
                {/* Bar */}
                <div className="w-full relative" style={{ height: "280px" }}>
                  <div
                    className={`absolute bottom-0 left-1 right-1 ${theme.accent} rounded-t-lg transition-all duration-700 shadow-lg`}
                    style={{ height: `${height}%`, minHeight: 8 }}
                  />
                </div>
                {/* Label */}
                <div className={`text-xs ${theme.textMuted} mt-4 text-center leading-tight max-w-[100px] ${theme.fontBody}`}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis line */}
        <div className="px-4">
          <div className="w-full h-px bg-white/10" />
        </div>
      </div>
    </div>
  );
}

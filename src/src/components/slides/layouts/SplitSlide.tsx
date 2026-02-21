"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function SplitSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full flex relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Left side — content */}
      <div className="w-[55%] flex flex-col justify-center p-16 relative z-10">
        <div className={`w-10 h-1 ${theme.accent} rounded-full mb-6`} />
        <h2 className={`text-4xl ${theme.text} ${theme.fontHeading} mb-8 leading-tight`}>
          {slide.title}
        </h2>
        <ul className="space-y-4">
          {slide.content.map((point, i) => (
            <li key={i} className="flex items-start gap-4">
              <div className={`w-6 h-6 rounded-md ${theme.accent} flex items-center justify-center shrink-0 mt-0.5`}>
                <span className="text-xs font-bold text-white">{i + 1}</span>
              </div>
              <span className={`text-base ${theme.text} ${theme.fontBody} leading-relaxed`}>
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side — visual panel */}
      <div className="w-[45%] relative">
        <div className={`absolute inset-0 ${theme.accent} opacity-10`} />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          {/* Decorative architecture diagram mockup */}
          <div className="w-full space-y-4">
            <div className={`${theme.surface} rounded-xl p-4 text-center`}>
              <span className={`text-sm ${theme.primary} font-semibold`}>Your Application</span>
            </div>
            <div className="flex justify-center">
              <div className={`w-0.5 h-6 ${theme.accent}`} />
            </div>
            <div className={`${theme.surface} rounded-xl p-4 text-center`}>
              <span className={`text-sm ${theme.primary} font-semibold`}>SDK / Agent Layer</span>
            </div>
            <div className="flex justify-center">
              <div className={`w-0.5 h-6 ${theme.accent}`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${theme.surface} rounded-lg p-3 text-center`}>
                <span className={`text-xs ${theme.textMuted}`}>Tools</span>
              </div>
              <div className={`${theme.surface} rounded-lg p-3 text-center`}>
                <span className={`text-xs ${theme.textMuted}`}>Models</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

export function CodeSlide({ slide, theme }: Props) {
  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col p-14">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`px-3 py-1 rounded-md ${theme.accent} text-xs font-bold text-white`}>
            CODE
          </div>
          <h2 className={`text-3xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        {slide.content.length > 0 && (
          <p className={`text-base ${theme.textMuted} ${theme.fontBody} mb-5 pl-1`}>
            {slide.content[0]}
          </p>
        )}

        {slide.codeExample && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-[#1a1b26] rounded-xl overflow-hidden flex-1 flex flex-col border border-white/10 shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#13141c] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[11px] text-gray-500 font-mono">{slide.codeExample.language}</span>
                <div className="w-16" />
              </div>
              {/* Code content */}
              <div className="flex-1 overflow-auto">
                <pre className="p-5">
                  <code className="text-[13px] font-mono leading-[1.7] whitespace-pre" style={{
                    color: '#a9b1d6',
                  }}>
                    {slide.codeExample.code}
                  </code>
                </pre>
              </div>
            </div>
            {slide.codeExample.caption && (
              <p className={`text-xs ${theme.textMuted} mt-3 text-center italic`}>
                {slide.codeExample.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

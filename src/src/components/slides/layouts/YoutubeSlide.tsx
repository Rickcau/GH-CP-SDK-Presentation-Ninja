"use client";

import { SlideContent, SlideTheme } from "../types";

interface Props {
  slide: SlideContent;
  theme: SlideTheme;
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YoutubeSlide({ slide, theme }: Props) {
  // The YouTube URL is stored in content[0] or in youtubeUrl (via extra field)
  const url = (slide as any).youtubeUrl || slide.content[0] || "";
  const videoId = extractYoutubeId(url);

  return (
    <div className={`w-full h-full relative overflow-hidden ${theme.bg} ${theme.gradient || ""}`}>
      <div className="absolute top-0 right-0 w-64 h-64">
        <div className={`absolute top-8 right-8 w-32 h-32 rounded-full ${theme.accent} opacity-10 blur-2xl`} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-12">
        <div className="flex items-start gap-5 mb-6">
          <div className={`w-1.5 h-10 rounded-full ${theme.accent} shrink-0 mt-1`} />
          <h2 className={`text-3xl ${theme.text} ${theme.fontHeading} leading-tight`}>
            {slide.title}
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full max-w-[720px] aspect-video rounded-xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={`text-center ${theme.textMuted}`}>
              <p className="text-lg">Invalid YouTube URL</p>
              <p className="text-sm mt-2 opacity-60">{url}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

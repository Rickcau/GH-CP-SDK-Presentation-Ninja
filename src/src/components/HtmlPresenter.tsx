"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface HtmlPresenterProps {
  htmlContent: string;
  title?: string;
  onDownload?: () => void;
}

export function HtmlPresenter({ htmlContent, title, onDownload }: HtmlPresenterProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for deckState messages from the iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "deckState") {
        setCurrentSlide(e.data.currentSlide);
        setTotalSlides(e.data.totalSlides);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Forward keyboard events to iframe
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (["ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "keyEvent", code: e.code },
          "*"
        );
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Navigate slides from toolbar
  const goToSlide = useCallback((slide: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "goToSlide", slide: slide - 1 },
      "*"
    );
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-black rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-sm font-medium text-zinc-300 truncate max-w-[200px]">
              {title}
            </span>
          )}
          {totalSlides > 0 && (
            <span className="text-xs text-zinc-500 tabular-nums">
              {currentSlide} / {totalSlides}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Previous slide */}
          <button
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide <= 1}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          {/* Next slide */}
          <button
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide >= totalSlides}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <div className="w-px h-5 bg-zinc-700 mx-1" />

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            )}
          </button>

          {/* Download button */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Download presentation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          className="absolute inset-0 w-full h-full border-0"
          title={title || "Presentation"}
          sandbox="allow-scripts allow-popups allow-same-origin"
        />
      </div>
    </div>
  );
}

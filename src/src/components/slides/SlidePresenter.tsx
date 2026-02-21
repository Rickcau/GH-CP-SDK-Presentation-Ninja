"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, StickyNote } from "lucide-react";
import { SlideContent, SlideTheme } from "./types";
import { SlideRenderer } from "./SlideRenderer";

interface Props {
  slides: SlideContent[];
  theme: SlideTheme;
  onClose: () => void;
}

export function SlidePresenter({ slides, theme, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const speakerWindowRef = useRef<Window | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Listen for postMessage from speaker notes window
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.source !== "pptx-ninja-speaker") return;

      if (e.data.type === "navigate") {
        const idx = e.data.index;
        if (typeof idx === "number" && idx >= 0 && idx < slides.length) {
          setCurrentIndex(idx);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [slides.length]);

  // Send slide update to speaker notes window whenever slide changes
  useEffect(() => {
    const win = speakerWindowRef.current;
    if (win && !win.closed) {
      win.postMessage(
        {
          source: "pptx-ninja-presenter",
          type: "slideChanged",
          index: currentIndex,
          title: slides[currentIndex]?.title || "",
          speakerNotes: slides[currentIndex]?.speakerNotes || "",
          total: slides.length,
        },
        "*"
      );
    }
  }, [currentIndex, slides]);

  // Auto-hide controls after 3s of no mouse movement
  useEffect(() => {
    const handleMove = () => {
      setShowControls(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener("mousemove", handleMove);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      clearTimeout(hideTimer.current);
    };
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "Escape") {
        speakerWindowRef.current?.close();
        onClose();
      }
    },
    [goNext, goPrev, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openSpeakerNotes = () => {
    if (speakerWindowRef.current && !speakerWindowRef.current.closed) {
      speakerWindowRef.current.focus();
      return;
    }

    const win = window.open(
      "",
      "pptx-ninja-speaker-notes",
      "width=720,height=520,menubar=no,toolbar=no,location=no,status=no"
    );
    if (!win) return;
    speakerWindowRef.current = win;

    writeSpeakerNotesPage(win, slides[currentIndex], currentIndex, slides.length);
  };

  // Clean up speaker window on unmount
  useEffect(() => {
    return () => {
      speakerWindowRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Click on slide area to advance */}
      <div className="absolute inset-0 cursor-pointer" onClick={goNext} />
      <SlideRenderer
        slide={slides[currentIndex]}
        theme={theme}
        className="w-full h-full pointer-events-none"
      />

      {/* Bottom control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-t from-black/80 to-transparent pt-12 pb-4 px-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:cursor-default transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-white/70 text-sm font-medium tabular-nums">
                {currentIndex + 1} / {slides.length}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); openSpeakerNotes(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs transition-all"
                aria-label="Open speaker notes"
              >
                <StickyNote className="w-3.5 h-3.5" />
                Speaker Notes
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={currentIndex >= slides.length - 1}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:cursor-default transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-2">
            Arrow keys or click to navigate &middot; ESC to exit
          </p>
        </div>
      </div>
    </div>
  );
}

function writeSpeakerNotesPage(
  win: Window,
  slide: SlideContent,
  index: number,
  total: number
) {
  const notes = slide.speakerNotes || "(No speaker notes for this slide)";
  const html = '<!DOCTYPE html>\n<html>\n<head>\n  <title>Speaker Notes</title>\n  <style>\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;\n      background: #0f172a;\n      color: #e2e8f0;\n      padding: 24px;\n      min-height: 100vh;\n      display: flex;\n      flex-direction: column;\n    }\n    .header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      margin-bottom: 20px;\n      padding-bottom: 16px;\n      border-bottom: 1px solid #1e293b;\n    }\n    .slide-counter {\n      font-size: 14px;\n      color: #94a3b8;\n      font-variant-numeric: tabular-nums;\n    }\n    .nav-buttons { display: flex; gap: 8px; }\n    .nav-btn {\n      padding: 8px 20px;\n      border: 1px solid #334155;\n      background: #1e293b;\n      color: #e2e8f0;\n      border-radius: 6px;\n      cursor: pointer;\n      font-size: 14px;\n      transition: background 0.15s;\n    }\n    .nav-btn:hover { background: #334155; }\n    .nav-btn:disabled { opacity: 0.3; cursor: default; }\n    .slide-title {\n      font-size: 22px;\n      font-weight: 600;\n      color: #f1f5f9;\n      margin-bottom: 20px;\n    }\n    .notes-label {\n      font-size: 11px;\n      font-weight: 600;\n      text-transform: uppercase;\n      letter-spacing: 0.05em;\n      color: #64748b;\n      margin-bottom: 8px;\n    }\n    .notes-content {\n      font-size: 17px;\n      line-height: 1.75;\n      color: #cbd5e1;\n      flex: 1;\n      white-space: pre-wrap;\n    }\n    .no-notes { color: #475569; font-style: italic; }\n  </style>\n</head>\n<body>\n  <div class="header">\n    <span class="slide-counter" id="counter">Slide ' + (index + 1) + ' of ' + total + '</span>\n    <div class="nav-buttons">\n      <button class="nav-btn" id="prev">&larr; Prev</button>\n      <button class="nav-btn" id="next">Next &rarr;</button>\n    </div>\n  </div>\n  <div class="slide-title" id="title">' + escapeHtml(slide.title) + '</div>\n  <div class="notes-label">Speaker Notes</div>\n  <div class="notes-content" id="notes">' + escapeHtml(notes) + '</div>\n  <script>\n    var currentIndex = ' + index + ';\n    var totalSlides = ' + total + ';\n\n    function updateButtons() {\n      document.getElementById("prev").disabled = (currentIndex <= 0);\n      document.getElementById("next").disabled = (currentIndex >= totalSlides - 1);\n    }\n    updateButtons();\n\n    function navigateTo(idx) {\n      if (idx < 0 || idx >= totalSlides) return;\n      currentIndex = idx;\n      if (window.opener && !window.opener.closed) {\n        window.opener.postMessage({\n          source: "pptx-ninja-speaker",\n          type: "navigate",\n          index: idx\n        }, "*");\n      }\n      updateButtons();\n    }\n\n    document.getElementById("prev").addEventListener("click", function() {\n      navigateTo(currentIndex - 1);\n    });\n    document.getElementById("next").addEventListener("click", function() {\n      navigateTo(currentIndex + 1);\n    });\n\n    document.addEventListener("keydown", function(e) {\n      if (e.key === "ArrowRight" || e.key === " ") {\n        e.preventDefault();\n        navigateTo(currentIndex + 1);\n      } else if (e.key === "ArrowLeft") {\n        e.preventDefault();\n        navigateTo(currentIndex - 1);\n      }\n    });\n\n    window.addEventListener("message", function(e) {\n      if (!e.data || e.data.source !== "pptx-ninja-presenter") return;\n      if (e.data.type === "slideChanged") {\n        currentIndex = e.data.index;\n        totalSlides = e.data.total;\n        document.getElementById("counter").textContent = "Slide " + (currentIndex + 1) + " of " + totalSlides;\n        document.getElementById("title").textContent = e.data.title;\n        var notesEl = document.getElementById("notes");\n        var notesText = e.data.speakerNotes || "(No speaker notes for this slide)";\n        notesEl.textContent = notesText;\n        notesEl.className = e.data.speakerNotes ? "notes-content" : "notes-content no-notes";\n        updateButtons();\n      }\n    });\n  <\/script>\n</body>\n</html>';

  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { SlideRenderer, SlidePresenter, getTheme } from "@/components/slides";
import type { SlideContent, SlideTheme } from "@/components/slides";
import { HtmlPresenter } from "@/components/HtmlPresenter";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Maximize,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface PresentationData {
  id: string;
  title: string;
  topic: string;
  deck_type: string;
  theme: string;
  slide_count: number;
  status: string;
  created_at: string;
  html_content?: string;
  slides: {
    id: string;
    layout: string;
    title: string;
    content: string[];
    speaker_notes?: string;
    code_example?: { language: string; code: string; caption?: string };
    chart_data?: { type: string; data: { label: string; value: number }[] };
  }[];
}

export default function PresentationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presenting, setPresenting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/presentations/${id}`);
        if (!res.ok) throw new Error(res.status === 404 ? "Presentation not found" : "Failed to load");
        const data = await res.json();
        setPresentation(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const slides: SlideContent[] = (presentation?.slides || []).map((s) => ({
    layout: s.layout as any,
    title: s.title,
    content: s.content,
    speakerNotes: s.speaker_notes,
    codeExample: s.code_example as any,
    chartData: s.chart_data as any,
  }));

  const theme: SlideTheme = getTheme(presentation?.theme || "dark-luxe");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (presenting) return; // presenter handles its own keys
      if (e.key === "ArrowRight") setCurrentSlide((p) => Math.min(p + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setCurrentSlide((p) => Math.max(p - 1, 0));
    },
    [presenting, slides.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentationId: id, format: "pptx" }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation?.title || "presentation"}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this presentation? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/presentations/${id}`, { method: "DELETE" });
      router.push("/presentations");
    } catch {
      alert("Delete failed.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">{error || "Not found"}</p>
        </div>
      </div>
    );
  }

  const topicLabels: Record<string, string> = {
    "microsoft-foundry": "Azure AI Foundry",
    "copilot-cli": "Copilot CLI",
    copilot: "GitHub Copilot",
    "copilot-sdk": "Copilot SDK",
  };

  const topicColors: Record<string, string> = {
    "microsoft-foundry": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "copilot-cli": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    copilot: "bg-green-500/10 text-green-400 border-green-500/20",
    "copilot-sdk": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  const isHtml = !!presentation.html_content;

  const handleDownloadHtml = () => {
    if (!presentation.html_content) return;
    const blob = new Blob([presentation.html_content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentation.title || "presentation"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/presentations")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Presentations
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{presentation.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${topicColors[presentation.topic] || "bg-muted text-muted-foreground"}`}>
              {topicLabels[presentation.topic] || presentation.topic}
            </span>
            <span className="text-xs text-muted-foreground">
              {presentation.slide_count} slides
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(presentation.created_at).toLocaleDateString()}
            </span>
            {isHtml && (
              <span className="text-xs px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                HTML
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isHtml && (
            <button
              onClick={() => setPresenting(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Maximize className="w-4 h-4" />
              Present
            </button>
          )}
          {isHtml ? (
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              HTML
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PPTX
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HTML Presentation Viewer */}
      {isHtml && presentation.html_content && (
        <div className="rounded-lg border border-border overflow-hidden shadow-sm" style={{ height: "70vh" }}>
          <HtmlPresenter
            htmlContent={presentation.html_content}
            title={presentation.title}
            onDownload={handleDownloadHtml}
          />
        </div>
      )}

      {/* Slide-based Presentation Viewer */}
      {!isHtml && slides.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slide Thumbnails */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {slides.map((slide, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-full rounded-md border overflow-hidden transition-all ${
                  currentSlide === i
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="aspect-video relative">
                  <div className="absolute inset-0 scale-[0.18] origin-top-left w-[556%] h-[556%]">
                    <SlideRenderer slide={slide} theme={theme} />
                  </div>
                </div>
                <div className="px-2 py-1 text-[10px] text-muted-foreground truncate border-t border-border bg-card">
                  <span className="text-foreground/50 mr-1">{i + 1}.</span>
                  {slide.title}
                </div>
              </button>
            ))}
          </div>

          {/* Main Slide */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="aspect-video">
                <SlideRenderer
                  slide={slides[currentSlide]}
                  theme={theme}
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
                <button
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  disabled={currentSlide === 0}
                  className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Slide {currentSlide + 1} of {slides.length} &middot; {slides[currentSlide]?.title}
                </span>
                <button
                  onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
                  disabled={currentSlide >= slides.length - 1}
                  className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Speaker Notes */}
            {slides[currentSlide]?.speakerNotes && (
              <div className="mt-4 rounded-lg border border-border bg-card p-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">Speaker Notes</h3>
                <p className="text-sm text-foreground/80">{slides[currentSlide].speakerNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Presenter Mode Overlay */}
      {!isHtml && presenting && slides.length > 0 && (
        <SlidePresenter
          slides={slides}
          theme={theme}
          onClose={() => setPresenting(false)}
        />
      )}
    </div>
  );
}

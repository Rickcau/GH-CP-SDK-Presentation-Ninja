"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SlideRenderer, getTheme } from "@/components/slides";
import type { SlideContent, SlideTheme } from "@/components/slides";
import { HtmlPresenter } from "@/components/HtmlPresenter";
import { useGeneration } from "@/lib/generation-context";
import type { TopicItem, AiTopic, DemoSlideItem, YoutubeSlideItem } from "@/lib/agent/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Code2,
  StickyNote,
  Play,
  FileCode,
  Layers,
  Plus,
  X,
  Wand2,
  GripVertical,
  Monitor,
  Youtube,
  AlertTriangle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type OutputFormat = "slides" | "html";

interface KnowledgeSource {
  id: number;
  slug: string;
  name: string;
  status: string;
}

interface TopicSet {
  label: string;
  topics: string[];
}

const SLIDE_THEMES = [
  { value: "dark-luxe", label: "Dark Luxe" },
  { value: "tech-gradient", label: "Tech Gradient" },
  { value: "clean-corporate", label: "Clean Corporate" },
  { value: "bold-statement", label: "Bold Statement" },
  { value: "warm-minimal", label: "Warm Minimal" },
];

const HTML_THEMES = [
  { value: "cyan-violet", label: "Cyan Violet" },
  { value: "emerald-cyan", label: "Emerald Cyan" },
  { value: "amber-rose", label: "Amber Rose" },
  { value: "slate-blue", label: "Slate Blue" },
];

const MODELS = [
  { value: "", label: "Default", description: "Use server default" },
  { value: "gpt-5", label: "GPT-5", description: "Most capable OpenAI model" },
  { value: "gpt-4.1", label: "GPT-4.1", description: "Fast and capable" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini", description: "Lightweight and fast" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano", description: "Ultra-lightweight" },
  { value: "gpt-4o", label: "GPT-4o", description: "Multimodal" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Compact multimodal" },
  { value: "claude-sonnet-4.5", label: "Claude Sonnet 4.5", description: "Anthropic latest" },
  { value: "claude-sonnet-4", label: "Claude Sonnet 4", description: "Anthropic" },
  { value: "o3-mini", label: "o3-mini", description: "Efficient reasoning" },
  { value: "o4-mini", label: "o4-mini", description: "Latest reasoning" },
];

const MAX_TOPICS = 10;

function makeTopicItem(text = ""): AiTopic {
  return { id: uuidv4(), type: "topic", text };
}

interface GeneratedSlide extends SlideContent {
  index: number;
}

// ---------- Sortable Topic Item Component ----------

function SortableTopicItem({
  item,
  index,
  disabled,
  onChange,
  onRemove,
  canRemove,
}: {
  item: TopicItem;
  index: number;
  disabled: boolean;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-center">
      <button
        className="shrink-0 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {item.type === "topic" && (
        <>
          <span className="shrink-0 w-6 h-9 flex items-center justify-center text-xs text-muted-foreground">
            {index + 1}.
          </span>
          <input
            type="text"
            value={item.text}
            onChange={(e) => onChange(item.id, e.target.value)}
            disabled={disabled}
            placeholder={`Topic ${index + 1}`}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </>
      )}

      {item.type === "demo" && (
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-medium text-amber-400">Demo Slide</span>
          <input
            type="text"
            value={item.title || ""}
            onChange={(e) => onChange(item.id, e.target.value)}
            disabled={disabled}
            placeholder="Optional title"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {item.type === "youtube" && (
        <div className="flex-1 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
          <Youtube className="w-4 h-4 text-red-400 shrink-0" />
          <input
            type="text"
            value={item.url}
            onChange={(e) => onChange(item.id, e.target.value)}
            disabled={disabled}
            placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {canRemove && (
        <button
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ---------- Main Page Component ----------

export default function NewPresentationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const generation = useGeneration();

  // Knowledge sources from API
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  // Form state
  const [knowledgeSource, setKnowledgeSource] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [topicItems, setTopicItems] = useState<TopicItem[]>([makeTopicItem()]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("html");
  const [theme, setTheme] = useState("cyan-violet");
  const [slideCount, setSlideCount] = useState(8);
  const [includeCode, setIncludeCode] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(false);
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");

  // AI topic suggestion state
  const [suggestingSets, setSuggestingSets] = useState(false);
  const [topicSets, setTopicSets] = useState<TopicSet[] | null>(null);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [slides, setSlides] = useState<GeneratedSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [htmlSlideCount, setHtmlSlideCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch knowledge sources on mount
  useEffect(() => {
    fetch("/api/knowledge-sources")
      .then((r) => r.json())
      .then((data) => {
        setSources(Array.isArray(data) ? data : []);
        setSourcesLoading(false);
      })
      .catch(() => setSourcesLoading(false));
  }, []);

  const currentThemes = outputFormat === "html" ? HTML_THEMES : SLIDE_THEMES;
  const selectedTheme: SlideTheme = getTheme(theme);

  const validTopics = topicItems.filter(
    (item) =>
      (item.type === "topic" && item.text.trim()) ||
      item.type === "demo" ||
      (item.type === "youtube" && item.url.trim())
  );
  const canGenerate = knowledgeSource && presentationTitle.trim() && validTopics.length > 0 && !generating && !generation.isGenerating;
  const canSuggestTopics = knowledgeSource && presentationTitle.trim() && !suggestingSets && !generating;

  // When switching output format, reset theme to first available
  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
    if (format === "html") {
      setTheme("cyan-violet");
    } else {
      setTheme("dark-luxe");
    }
    setSlides([]);
    setHtmlContent(null);
    setHtmlSlideCount(0);
    setSavedId(null);
  };

  // Topic item management
  const handleItemChange = (id: string, value: string) => {
    setTopicItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.type === "topic") return { ...item, text: value };
        if (item.type === "demo") return { ...item, title: value };
        if (item.type === "youtube") return { ...item, url: value };
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    if (topicItems.length > 1) {
      setTopicItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const addTopic = () => {
    if (topicItems.length < MAX_TOPICS) {
      setTopicItems((prev) => [...prev, makeTopicItem()]);
    }
  };

  const addDemoSlide = () => {
    if (topicItems.length < MAX_TOPICS) {
      const item: DemoSlideItem = { id: uuidv4(), type: "demo" };
      setTopicItems((prev) => [...prev, item]);
    }
  };

  const addYoutubeSlide = () => {
    if (topicItems.length < MAX_TOPICS) {
      const item: YoutubeSlideItem = { id: uuidv4(), type: "youtube", url: "" };
      setTopicItems((prev) => [...prev, item]);
    }
  };

  const applyTopicSet = (topics: string[]) => {
    setTopicItems(topics.map((t) => makeTopicItem(t)));
    setTopicSets(null);
    setSlideCount(topics.length);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTopicItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // AI topic suggestions
  const handleSuggestTopics = useCallback(async () => {
    if (!canSuggestTopics) return;
    setSuggestingSets(true);
    setTopicSets(null);

    try {
      const res = await fetch("/api/agent/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeSource,
          title: presentationTitle.trim(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTopicSets(data.suggestions || []);
    } catch (err: any) {
      console.error("Topic suggestion failed:", err);
    } finally {
      setSuggestingSets(false);
    }
  }, [canSuggestTopics, knowledgeSource, presentationTitle]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    // Extract presentation topics for backwards compatibility
    const presentationTopics = topicItems
      .filter((item): item is AiTopic => item.type === "topic")
      .map((item) => item.text)
      .filter((t) => t.trim());

    setGenerating(true);
    setSlides([]);
    setCurrentSlide(0);
    setSavedId(null);
    setHtmlContent(null);
    setHtmlSlideCount(0);
    setStatusMessage("Starting generation...");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgeSource,
          deckType: "custom",
          presentationTitle: presentationTitle.trim(),
          presentationTopics,
          topicItems: validTopics,
          prompt,
          theme,
          slideCount,
          includeCode,
          includeSpeakerNotes,
          model: model || undefined,
          userId: session?.user?.id,
          outputFormat,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const payload = trimmed.slice(6);
          if (payload === "[DONE]") continue;

          try {
            const event = JSON.parse(payload);

            if (event.type === "generationStarted") {
              // Track generation in context
              generation.startGeneration(event.data.presentationId, presentationTitle.trim());
            } else if (event.type === "status") {
              setStatusMessage(event.data.message);
              generation.updateProgress(event.data.message);
            } else if (event.type === "slide") {
              const slide = event.data.slide;
              const newSlide: GeneratedSlide = {
                layout: slide.layout,
                title: slide.title,
                content: slide.keyPoints || [],
                codeExample: slide.codeExample,
                chartData: slide.chartData,
                speakerNotes: slide.speakerNotes,
                index: event.data.slideIndex,
              };
              setSlides((prev) => [...prev, newSlide]);
              setCurrentSlide(event.data.slideIndex);
            } else if (event.type === "htmlSlide") {
              setHtmlSlideCount((prev) => prev + 1);
            } else if (event.type === "htmlComplete") {
              setHtmlContent(event.data.htmlContent);
              setStatusMessage("HTML presentation complete!");
            } else if (event.type === "complete") {
              setStatusMessage("Presentation complete!");
            } else if (event.type === "saved") {
              setSavedId(event.data.presentationId);
              generation.completeGeneration();
            } else if (event.type === "error") {
              setStatusMessage(`Error: ${event.data.message}`);
              generation.failGeneration();
            }
          } catch {
            // ignore parse errors from partial chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setStatusMessage(`Error: ${err.message}`);
        generation.failGeneration();
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [canGenerate, knowledgeSource, presentationTitle, topicItems, validTopics, prompt, theme, slideCount, includeCode, includeSpeakerNotes, model, session?.user?.id, outputFormat, generation]);

  const handleCancel = () => {
    abortRef.current?.abort();
    setGenerating(false);
    setStatusMessage("Cancelled.");
    generation.failGeneration();
  };

  const handleDownloadHtml = useCallback(() => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [htmlContent]);

  const isHtmlMode = outputFormat === "html";
  const hasResults = isHtmlMode ? !!htmlContent : slides.length > 0;
  const isInProgress = generating || hasResults;

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Presentation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pick a knowledge source, name your deck, add topics — then let the AI build it.
          </p>
        </div>

        {/* Generation in progress warning */}
        {generation.isGenerating && !generating && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Generation in progress</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                &ldquo;{generation.title}&rdquo; is currently being generated. {generation.progress}
              </p>
            </div>
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Output Format Toggle with Tooltips */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">Output Format</legend>
              <div className="flex gap-2">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => handleFormatChange("html")}
                      disabled={generating}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        outputFormat === "html"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      } disabled:opacity-50`}
                    >
                      <FileCode className="w-4 h-4" />
                      HTML Deck
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md max-w-xs"
                      sideOffset={5}
                    >
                      Self-contained HTML file. Portable, works offline, includes animations.
                      <Tooltip.Arrow className="fill-popover" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => handleFormatChange("slides")}
                      disabled={generating}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        outputFormat === "slides"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      } disabled:opacity-50`}
                    >
                      <Layers className="w-4 h-4" />
                      React Slides
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md max-w-xs"
                      sideOffset={5}
                    >
                      More layouts (charts, bento grids), exports to PowerPoint, advanced presenter controls.
                      <Tooltip.Arrow className="fill-popover" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </fieldset>

            {/* Knowledge Source */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">Knowledge Source</legend>
              {sourcesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading sources...
                </div>
              ) : sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No knowledge sources found. Add one from the Dashboard first.
                </p>
              ) : (
                <select
                  value={knowledgeSource}
                  onChange={(e) => { setKnowledgeSource(e.target.value); setTopicSets(null); }}
                  disabled={generating}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="">Select a knowledge source...</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.slug}>
                      {s.name}{s.status === "building" ? " (building...)" : s.status === "error" ? " (error)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </fieldset>

            {/* Presentation Title */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">Presentation Title</legend>
              <input
                type="text"
                value={presentationTitle}
                onChange={(e) => { setPresentationTitle(e.target.value); setTopicSets(null); }}
                disabled={generating}
                placeholder="e.g., Getting Started with GitHub Copilot SDK"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </fieldset>

            {/* Slide Topics — Drag-to-reorder */}
            <fieldset>
              <div className="flex items-center justify-between mb-2">
                <legend className="text-sm font-medium text-foreground">
                  Slide Topics
                  <span className="text-muted-foreground font-normal ml-1">({validTopics.length}/{MAX_TOPICS})</span>
                </legend>
                <button
                  onClick={handleSuggestTopics}
                  disabled={!canSuggestTopics}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-primary/30 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestingSets ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  AI Generate Topics
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={topicItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {topicItems.map((item, i) => (
                      <SortableTopicItem
                        key={item.id}
                        item={item}
                        index={i}
                        disabled={generating}
                        onChange={handleItemChange}
                        onRemove={removeItem}
                        canRemove={topicItems.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex flex-wrap gap-2 mt-3">
                {topicItems.length < MAX_TOPICS && (
                  <>
                    <button
                      onClick={addTopic}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Topic
                    </button>
                    <button
                      onClick={addDemoSlide}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Demo Slide
                    </button>
                    <button
                      onClick={addYoutubeSlide}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      YouTube Slide
                    </button>
                  </>
                )}
              </div>

              {/* AI Topic Suggestion Cards */}
              {topicSets && topicSets.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Pick a set to populate your topics:</p>
                  {topicSets.map((set, i) => (
                    <button
                      key={i}
                      onClick={() => applyTopicSet(set.topics)}
                      className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all"
                    >
                      <div className="text-sm font-medium text-foreground">{set.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {set.topics.join(" -> ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        {set.topics.length} topics
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Theme */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">
                Theme {isHtmlMode && <span className="text-muted-foreground font-normal">(HTML)</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {currentThemes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    disabled={generating}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      theme === t.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    } disabled:opacity-50`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Model */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">AI Model</legend>
              <div className="flex flex-wrap gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setModel(m.value)}
                    disabled={generating}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      model === m.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    } disabled:opacity-50`}
                    title={m.description}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Slide Count */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">
                Slides: {slideCount}
              </legend>
              <input
                type="range"
                min={4}
                max={20}
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                disabled={generating}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>4</span>
                <span>20</span>
              </div>
            </fieldset>

            {/* Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  disabled={generating}
                  className="rounded accent-primary"
                />
                <Code2 className="w-3.5 h-3.5" />
                Code examples
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSpeakerNotes}
                  onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                  disabled={generating}
                  className="rounded accent-primary"
                />
                <StickyNote className="w-3.5 h-3.5" />
                Speaker notes
              </label>
            </div>

            {/* Custom Prompt */}
            <fieldset>
              <legend className="text-sm font-medium text-foreground mb-2">
                Custom Instructions <span className="text-muted-foreground font-normal">(optional)</span>
              </legend>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                placeholder="E.g., focus on enterprise security features, add a pricing comparison..."
                rows={3}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
              />
            </fieldset>

            {/* Generate Button */}
            {!generating ? (
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Generate {isHtmlMode ? "HTML" : ""} Presentation
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-destructive text-destructive font-medium text-sm hover:bg-destructive/10 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-3 space-y-4">
            {isInProgress ? (
              <>
                {/* Status Bar */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                  {generating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  <span className="text-muted-foreground">{statusMessage}</span>
                  {isHtmlMode && htmlSlideCount > 0 && !htmlContent && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {htmlSlideCount} slide{htmlSlideCount !== 1 ? "s" : ""} generated
                    </span>
                  )}
                  {!isHtmlMode && slides.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {slides.length} slide{slides.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* HTML Preview */}
                {isHtmlMode && htmlContent && (
                  <div className="rounded-lg border border-border overflow-hidden shadow-sm" style={{ height: "60vh" }}>
                    <HtmlPresenter
                      htmlContent={htmlContent}
                      title="Preview"
                      onDownload={handleDownloadHtml}
                    />
                  </div>
                )}

                {/* Slide Preview (non-HTML mode) */}
                {!isHtmlMode && slides.length > 0 && (
                  <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                    <div className="aspect-video">
                      <SlideRenderer
                        slide={slides[currentSlide]}
                        theme={selectedTheme}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                      <button
                        onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                        disabled={currentSlide === 0}
                        className="p-1 rounded hover:bg-accent disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {currentSlide + 1} / {slides.length}
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
                )}

                {/* Slide Thumbnails (non-HTML mode) */}
                {!isHtmlMode && slides.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {slides.map((slide, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`shrink-0 w-28 rounded-md border overflow-hidden transition-all ${
                          currentSlide === i
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-video relative">
                          <div className="absolute inset-0 scale-[0.18] origin-top-left w-[556%] h-[556%]">
                            <SlideRenderer slide={slide} theme={selectedTheme} />
                          </div>
                        </div>
                        <div className="px-1.5 py-1 text-[10px] text-muted-foreground truncate border-t border-border">
                          {slide.title}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions when complete */}
                {!generating && hasResults && (
                  <div className="flex gap-3">
                    {savedId && (
                      <button
                        onClick={() => router.push(`/presentations/${savedId}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        View Presentation
                      </button>
                    )}
                    <button
                      onClick={handleGenerate}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="rounded-lg border border-dashed border-border bg-card/50 flex flex-col items-center justify-center aspect-video">
                <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Pick a knowledge source, add topics, then generate.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {isHtmlMode
                    ? "An interactive HTML presentation will appear here."
                    : "Slides will appear here in real-time."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

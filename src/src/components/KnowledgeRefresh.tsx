"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  FileText,
  Sparkles,
  Save,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface KnowledgeSource {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "building" | "ready" | "error";
  created_at: string;
}

const PROTECTED_SLUGS = ["copilot", "copilot-cli", "copilot-sdk", "foundry"];

type RefreshState = "idle" | "refreshing" | "success" | "error";

interface LogEntry {
  time: string;
  icon: "search" | "file" | "ai" | "save" | "check" | "error" | "info";
  message: string;
  detail?: string;
}

interface TopicResult {
  sectionsUpdated: number;
  sections: { section: string; sizeChars: number; action: string }[];
  searchMeta: { section: string; resultCount: number; sources: string[] }[];
}

export function KnowledgeRefresh() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<Record<string, RefreshState>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<Record<string, LogEntry[]>>({});
  const [results, setResults] = useState<Record<string, TopicResult>>({});
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const abortRefs = useRef<Record<string, AbortController>>({});

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge-sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  function addLog(slug: string, entry: Omit<LogEntry, "time">) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => ({
      ...prev,
      [slug]: [...(prev[slug] || []), { ...entry, time }],
    }));
  }

  async function refreshSource(slug: string) {
    setStates((prev) => ({ ...prev, [slug]: "refreshing" }));
    setMessages((prev) => ({ ...prev, [slug]: "Starting..." }));
    setLogs((prev) => ({ ...prev, [slug]: [] }));
    setResults((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    setExpandedTopic(slug);

    const controller = new AbortController();
    abortRefs.current[slug] = controller;

    addLog(slug, { icon: "info", message: "Knowledge refresh started" });

    try {
      const res = await fetch("/api/knowledge/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: slug, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

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

            if (event.type === "progress") {
              setMessages((prev) => ({ ...prev, [slug]: event.data.message }));
              if (event.data.phase === "search") {
                addLog(slug, {
                  icon: "search",
                  message: `Searching: ${event.data.section}`,
                  detail: event.data.message,
                });
              } else if (event.data.phase === "read") {
                addLog(slug, { icon: "file", message: "Reading existing knowledge files" });
              } else if (event.data.phase === "synthesize") {
                addLog(slug, { icon: "ai", message: "AI is synthesizing updated content..." });
              } else if (event.data.phase === "write") {
                addLog(slug, { icon: "save", message: "Writing updated files to disk" });
              }
            } else if (event.type === "searchResult") {
              const src = event.data.sources?.slice(0, 3) || [];
              addLog(slug, {
                icon: "search",
                message: `Found ${event.data.resultCount} results for ${event.data.section}`,
                detail: src.length > 0 ? src.join(" · ") : undefined,
              });
            } else if (event.type === "existingContent") {
              const sections = event.data.sections || [];
              const existing = sections.filter((s: { exists: boolean }) => s.exists).length;
              addLog(slug, {
                icon: "file",
                message: `${existing} of ${sections.length} sections have existing content`,
              });
            } else if (event.type === "sectionSynthesized") {
              const d = event.data;
              const delta = d.newSizeChars - (d.oldSizeChars || 0);
              const sign = delta >= 0 ? "+" : "";
              addLog(slug, {
                icon: "ai",
                message: `${d.isNew ? "Created" : "Updated"}: ${d.section}.md`,
                detail: `${d.newSizeChars.toLocaleString()} chars (${sign}${delta.toLocaleString()})`,
              });
            } else if (event.type === "complete") {
              setStates((prev) => ({ ...prev, [slug]: "success" }));
              setMessages((prev) => ({
                ...prev,
                [slug]: `Updated ${event.data.sectionsUpdated} sections`,
              }));
              setResults((prev) => ({
                ...prev,
                [slug]: {
                  sectionsUpdated: event.data.sectionsUpdated,
                  sections: event.data.sections,
                  searchMeta: event.data.searchMeta,
                },
              }));
              addLog(slug, {
                icon: "check",
                message: `Done — ${event.data.sectionsUpdated} sections written`,
              });

              // Refresh the sources list to get updated status
              fetchSources();

              setTimeout(() => {
                setStates((prev) => {
                  if (prev[slug] === "success") return { ...prev, [slug]: "idle" };
                  return prev;
                });
              }, 30000);
            } else if (event.type === "error") {
              throw new Error(event.data.message);
            }
          } catch (parseErr: unknown) {
            const errMsg = parseErr instanceof Error ? parseErr.message : "";
            if (errMsg && !errMsg.includes("JSON")) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "AbortError") {
        setStates((prev) => ({ ...prev, [slug]: "idle" }));
        setMessages((prev) => ({ ...prev, [slug]: "Cancelled" }));
        addLog(slug, { icon: "error", message: "Refresh cancelled" });
      } else {
        setStates((prev) => ({ ...prev, [slug]: "error" }));
        setMessages((prev) => ({ ...prev, [slug]: error.message }));
        addLog(slug, { icon: "error", message: error.message });
      }
    } finally {
      delete abortRefs.current[slug];
    }
  }

  async function refreshAll() {
    setRefreshingAll(true);
    for (const source of sources) {
      if (states[source.slug] === "refreshing") continue;
      await refreshSource(source.slug);
    }
    setRefreshingAll(false);
  }

  async function handleAddSource() {
    if (!newName.trim()) return;
    setAdding(true);
    setAddError("");

    try {
      const res = await fetch("/api/knowledge-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const created = await res.json() as KnowledgeSource;
      setNewName("");
      setShowAddForm(false);
      await fetchSources();

      // Auto-trigger refresh for the new source
      refreshSource(created.slug);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : String(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteSource(id: string) {
    try {
      const res = await fetch(`/api/knowledge-sources/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSources();
      }
    } catch {
      // ignore
    }
  }

  const anyRefreshing = Object.values(states).some((s) => s === "refreshing");

  const LOG_ICONS: Record<LogEntry["icon"], React.ReactNode> = {
    search: <Search className="w-3 h-3 text-cyan-400" />,
    file: <FileText className="w-3 h-3 text-amber-400" />,
    ai: <Sparkles className="w-3 h-3 text-violet-400" />,
    save: <Save className="w-3 h-3 text-emerald-400" />,
    check: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    error: <AlertCircle className="w-3 h-3 text-red-400" />,
    info: <RefreshCw className="w-3 h-3 text-muted-foreground" />,
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading knowledge sources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-foreground">Knowledge Base</h2>
          <span className="text-xs text-muted-foreground ml-1">({sources.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={anyRefreshing || refreshingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
          <button
            onClick={refreshAll}
            disabled={anyRefreshing || refreshingAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {refreshingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh All
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Manage knowledge sources used for presentation generation. Refresh to update with latest web data.
      </p>

      {/* Add New Source Form */}
      {showAddForm && (
        <div className="mb-4 p-3 rounded-md border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">Add Knowledge Source</span>
            <button onClick={() => { setShowAddForm(false); setAddError(""); }} className="ml-auto p-0.5 rounded hover:bg-accent">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSource()}
              placeholder="e.g. Azure Functions, LangChain..."
              className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={adding}
              autoFocus
            />
            <button
              onClick={handleAddSource}
              disabled={adding || !newName.trim()}
              className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
            </button>
          </div>
          {addError && (
            <p className="text-xs text-red-400 mt-1.5">{addError}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {sources.map((source) => {
          const slug = source.slug;
          const state = states[slug] || (source.status === "building" ? "refreshing" : "idle");
          const message = messages[slug];
          const topicLogs = logs[slug] || [];
          const topicResult = results[slug];
          const isExpanded = expandedTopic === slug;
          const hasLogs = topicLogs.length > 0;
          const isProtected = PROTECTED_SLUGS.includes(slug);

          return (
            <div key={source.id} className="rounded-md bg-muted/30 overflow-hidden">
              {/* Source Row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2 min-w-0">
                  {hasLogs && (
                    <button
                      onClick={() => setExpandedTopic(isExpanded ? null : slug)}
                      className="p-0.5 rounded hover:bg-accent transition-colors shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{source.name}</p>
                      {source.status === "building" && !states[slug] && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          building
                        </span>
                      )}
                      {source.status === "error" && !states[slug] && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          error
                        </span>
                      )}
                    </div>
                    {message && (
                      <p className={`text-xs mt-0.5 truncate ${
                        state === "error" ? "text-red-400" : state === "success" ? "text-emerald-400" : "text-muted-foreground"
                      }`}>
                        {message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  {!isProtected && (
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      disabled={state === "refreshing" || refreshingAll}
                      className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Delete knowledge source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => refreshSource(slug)}
                    disabled={state === "refreshing" || refreshingAll}
                    className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                    title={`Refresh ${source.name} knowledge`}
                  >
                    {state === "refreshing" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : state === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : state === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Activity Log */}
              {isExpanded && hasLogs && (
                <div className="border-t border-border bg-background/50 px-3 py-2 space-y-1 max-h-56 overflow-y-auto">
                  {topicLogs.map((entry, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground/60 tabular-nums shrink-0 mt-0.5">{entry.time}</span>
                      <span className="shrink-0 mt-0.5">{LOG_ICONS[entry.icon]}</span>
                      <span className="text-foreground/80 min-w-0">
                        {entry.message}
                        {entry.detail && (
                          <span className="text-muted-foreground ml-1">— {entry.detail}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {state === "refreshing" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Working...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Results Summary */}
              {isExpanded && topicResult && state === "success" && (
                <div className="border-t border-border bg-emerald-500/5 px-3 py-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {topicResult.sections.map((s) => (
                      <span key={s.section} className="text-emerald-400/80">
                        {s.action === "created" ? "+" : "~"} {s.section}.md
                        <span className="text-muted-foreground ml-1">({(s.sizeChars / 1024).toFixed(1)}KB)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

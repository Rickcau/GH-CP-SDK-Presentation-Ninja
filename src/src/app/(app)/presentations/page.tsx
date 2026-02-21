import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import { Plus, Presentation, Loader2 } from "lucide-react";

export default async function PresentationsPage() {
  const session = await auth();
  const db = getDb();

  const userId = session?.user?.id;
  const presentations = userId
    ? (db
        .prepare("SELECT * FROM presentations WHERE user_id = ? ORDER BY created_at DESC")
        .all(userId) as any[])
    : [];

  // Build topic display map from knowledge sources (dynamic, like dashboard)
  const sourcesRaw = db.prepare("SELECT slug, name FROM knowledge_sources").all() as { slug: string; name: string }[];
  const topicLabels: Record<string, string> = Object.fromEntries(
    sourcesRaw.map((s) => [s.slug, s.name])
  );
  topicLabels["microsoft-foundry"] = topicLabels["foundry"] || "Azure AI Foundry";
  topicLabels["copilot-cli"] = topicLabels["copilot-cli"] || "Copilot CLI";
  topicLabels["copilot"] = topicLabels["copilot"] || "GitHub Copilot";
  topicLabels["copilot-sdk"] = topicLabels["copilot-sdk"] || "Copilot SDK";

  // Deterministic color from slug hash (same as dashboard)
  const COLORS = [
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-green-500/10 text-green-400 border-green-500/20",
    "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ];
  function topicColor(slug: string): string {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  const deckTypeLabels: Record<string, string> = {
    overview: "Overview",
    "getting-started": "Getting Started",
    architecture: "Architecture",
    enablement: "Enablement",
    workshop: "Workshop",
    custom: "Custom",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presentations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {presentations.length} presentation{presentations.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/presentations/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </div>

      {presentations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-16 text-center">
          <Presentation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm mb-4">
            No presentations yet. Create your first one!
          </p>
          <Link
            href="/presentations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Presentation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map((pres: any) => (
            <Link
              key={pres.id}
              href={pres.status === "generating" ? "/presentations/new" : `/presentations/${pres.id}`}
              className={`rounded-lg border p-5 shadow-sm transition-colors group ${
                pres.status === "generating"
                  ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {pres.status === "generating" ? (
                  <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${topicColor(pres.topic)}`}
                  >
                    {topicLabels[pres.topic] || pres.topic}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {deckTypeLabels[pres.deck_type] || pres.deck_type}
                </span>
              </div>
              <h3 className={`font-medium text-sm line-clamp-2 ${
                pres.status === "generating"
                  ? "text-amber-200"
                  : "text-foreground group-hover:text-primary"
              } transition-colors`}>
                {pres.title}
              </h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {pres.status === "generating" ? (
                    <span className="text-amber-400">{topicLabels[pres.topic] || pres.topic}</span>
                  ) : (
                    `${pres.slide_count} slides`
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(pres.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

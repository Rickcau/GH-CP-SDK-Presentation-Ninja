import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import { BarChart3, CheckCircle2, Loader2, Database } from "lucide-react";
import { KnowledgeRefresh } from "@/components/KnowledgeRefresh";

export default async function DashboardPage() {
  const session = await auth();
  const db = getDb();

  const userId = session?.user?.id;
  const presentations = userId
    ? (db.prepare("SELECT * FROM presentations WHERE user_id = ? ORDER BY created_at DESC").all(userId) as any[])
    : [];

  const sourceCount = (db.prepare("SELECT COUNT(*) as count FROM knowledge_sources").get() as { count: number }).count;

  const total = presentations.length;
  const completed = presentations.filter((p: any) => p.status === "completed").length;
  const generating = presentations.filter((p: any) => p.status === "generating").length;

  const tiles = [
    { label: "Total Presentations", value: total, icon: BarChart3, color: "text-blue-400" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-400" },
    { label: "Generating", value: generating, icon: Loader2, color: "text-amber-400" },
    { label: "Knowledge Sources", value: sourceCount, icon: Database, color: "text-violet-400" },
  ];

  // Build topic display map from knowledge sources
  const sourcesRaw = db.prepare("SELECT slug, name FROM knowledge_sources").all() as { slug: string; name: string }[];
  const topicLabels: Record<string, string> = Object.fromEntries(
    sourcesRaw.map((s) => [s.slug, s.name])
  );
  // Also map legacy "microsoft-foundry" → Foundry
  topicLabels["microsoft-foundry"] = topicLabels["foundry"] || "Foundry";

  const COLORS = [
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-green-500/10 text-green-400 border-green-500/20",
    "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ];
  function topicColor(slug: string): string {
    // Deterministic color from slug hash
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, {session?.user?.name || "User"}
          </p>
        </div>
        <Link
          href="/presentations/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          + Create Presentation
        </Link>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <tile.icon className={`w-5 h-5 ${tile.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{tile.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Currently Generating */}
      {presentations.filter((p: any) => p.status === "generating").length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            Currently Generating
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.filter((p: any) => p.status === "generating").map((pres: any) => (
              <div
                key={pres.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    Generating...
                  </span>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                </div>
                <h3 className="font-medium text-sm text-foreground line-clamp-2">
                  {pres.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {topicLabels[pres.topic] || pres.topic} &middot; {new Date(pres.created_at).toLocaleDateString()}
                </p>
                <Link
                  href="/presentations/new"
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View progress &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Store */}
      <div className="mb-8">
        <KnowledgeRefresh />
      </div>

      {/* Recent Presentations */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Presentations</h2>
        {presentations.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
            <p className="text-muted-foreground text-sm">
              No presentations yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.slice(0, 6).map((pres: any) => (
              <Link
                key={pres.id}
                href={`/presentations/${pres.id}`}
                className="rounded-lg border border-border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${topicColor(pres.topic)}`}
                  >
                    {topicLabels[pres.topic] || pres.topic}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pres.slide_count} slides
                  </span>
                </div>
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {pres.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(pres.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Package,
  Shield,
  Key,
  Loader2,
  CreditCard,
  Cpu,
} from "lucide-react";

interface SetupCheck {
  ok: boolean;
  detail: string;
}

interface SetupStatus {
  checks: {
    node: SetupCheck;
    sdk: SetupCheck;
    cli: SetupCheck;
    auth: SetupCheck;
    subscription: SetupCheck;
  };
  ready: boolean;
}

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
  ) : (
    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
  );
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(() => {
    setLoading(true);
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Copilot SDK Setup
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure authentication to enable AI-powered slide generation.
          The SDK and Copilot CLI are already bundled — you just need to provide
          a GitHub token.
        </p>
      </div>

      {/* What's required summary */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">What do I need?</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong className="text-foreground">Node.js 23.4+</strong> — the bundled Copilot CLI requires{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">node:sqlite</code>{" "}
            (stable in Node 23.4+)
          </li>
          <li>
            <strong className="text-foreground">npm dependencies</strong> — already installed when you ran{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">npm install</code>
          </li>
          <li>
            <strong className="text-foreground">GitHub authentication</strong> — set{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN</code>{" "}
            in <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code>
          </li>
          <li>
            <strong className="text-foreground">GitHub Copilot subscription</strong> — Individual, Business, or Enterprise
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          The GitHub CLI (<code>gh</code>) is <strong className="text-foreground">not required</strong>.
          The Copilot CLI is bundled inside the{" "}
          <code>@github/copilot-sdk</code> npm package automatically.
        </p>
      </div>

      {/* Status Checklist */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Prerequisites Status
          </h2>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Re-check Status
          </button>
        </div>

        {status ? (
          <div className="space-y-3">
            {status.ready && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 text-emerald-800 dark:text-emerald-300 rounded-md px-4 py-2.5 text-sm">
                All prerequisites met — the app will use the real Copilot SDK
                for AI-powered generation.
              </div>
            )}
            <div className="grid gap-2">
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <StatusIcon ok={status.checks.node.ok} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Node.js Version
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.checks.node.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <StatusIcon ok={status.checks.sdk.ok} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Copilot SDK
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.checks.sdk.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <StatusIcon ok={status.checks.cli.ok} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Copilot CLI (Bundled)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.checks.cli.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <StatusIcon ok={status.checks.auth.ok} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    GitHub Authentication
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.checks.auth.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <StatusIcon ok={status.checks.subscription.ok} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Copilot Subscription
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {status.checks.subscription.detail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking prerequisites...
          </div>
        ) : (
          <p className="text-sm text-red-400">
            Failed to check setup status. Make sure the app is running properly.
          </p>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Setup Instructions
        </h2>

        {/* Step 1 — Node.js */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              1
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">
                Node.js 23.4+
              </h3>
            </div>
          </div>
          <div className="ml-10 space-y-2">
            <p className="text-sm text-muted-foreground">
              The bundled Copilot CLI uses{" "}
              <code className="bg-muted px-1 py-0.5 rounded">node:sqlite</code>{" "}
              which is only stable in Node.js 23.4 and later. Check your version:
            </p>
            <div className="bg-muted/50 rounded-md p-3 font-mono text-sm text-foreground">
              <p>node --version</p>
            </div>
            <p className="text-xs text-muted-foreground">
              If you see v22 or earlier, download the <strong>Current</strong> release
              from{" "}
              <code className="bg-muted px-1 py-0.5 rounded">nodejs.org</code>.
              The installer upgrades Node in-place — no uninstall or nvm needed.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
              Note: The SDK README claims &quot;Node.js &gt;= 18.0.0&quot; but this is
              incorrect — the bundled <code>@github/copilot</code> CLI requires
              <code> node:sqlite</code> which was added in Node 23.4.
            </p>
          </div>
        </div>

        {/* Step 2 — Dependencies */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              2
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">
                Install Dependencies
              </h3>
            </div>
          </div>
          <div className="ml-10 space-y-2">
            <p className="text-sm text-muted-foreground">
              If you haven&apos;t already, install the npm packages. This pulls in
              the Copilot SDK and its bundled CLI automatically.
            </p>
            <div className="bg-muted/50 rounded-md p-3 font-mono text-sm text-foreground">
              <p>npm install</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This installs <code>@github/copilot-sdk</code> which bundles{" "}
              <code>@github/copilot</code> (the Copilot CLI runtime). No
              separate CLI installation needed.
            </p>
          </div>
        </div>

        {/* Step 3 — Auth */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              3
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">
                Authenticate with GitHub
              </h3>
            </div>
          </div>
          <div className="ml-10 space-y-3">
            <p className="text-sm text-muted-foreground">
              The SDK needs a GitHub token to access AI models. Set{" "}
              <code className="bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN</code> in
              your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file:
            </p>

            <div className="bg-muted/50 rounded-md p-3 font-mono text-sm text-foreground space-y-1">
              <p className="text-muted-foreground"># .env.local</p>
              <p>GITHUB_TOKEN=ghp_your_token_here</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Get a token from{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                github.com/settings/tokens
              </code>{" "}
              (needs Copilot scope). This works everywhere — locally, in Docker, and in Azure.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Already have GitHub CLI installed? You can also use{" "}
              <code className="bg-muted px-1 py-0.5 rounded">gh auth login</code> and
              the SDK will pick up its stored credentials automatically.
            </p>
          </div>
        </div>

        {/* Step 4 — Subscription */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              4
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">
                Copilot Subscription
              </h3>
            </div>
          </div>
          <div className="ml-10 space-y-2">
            <p className="text-sm text-muted-foreground">
              Your GitHub account needs an active Copilot subscription
              (Individual, Business, or Enterprise). The SDK uses this to access
              AI models.
            </p>
          </div>
        </div>

        {/* Step 5 — Restart */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              5
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">
                Restart & Generate
              </h3>
            </div>
          </div>
          <div className="ml-10 space-y-2">
            <p className="text-sm text-muted-foreground">
              Restart the development server, then generate a presentation from
              the Dashboard. The app automatically uses the real SDK when
              authentication is configured.
            </p>
            <div className="bg-muted/50 rounded-md p-3 font-mono text-sm text-foreground">
              <p>npm run dev</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clarification box */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <h3 className="font-medium text-foreground">
          FAQ: Do I need the GitHub CLI?
        </h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>No.</strong> The GitHub CLI (<code>gh</code>) is a separate
            tool and is <strong>not required</strong>. The Copilot SDK bundles
            its own copy of the Copilot CLI runtime (the{" "}
            <code>@github/copilot</code> npm package). When you run{" "}
            <code>npm install</code>, everything the SDK needs is downloaded
            automatically.
          </p>
          <p>
            The only thing you need to provide is <strong>authentication</strong>{" "}
            — set <code>GITHUB_TOKEN</code> in your <code>.env.local</code> file.
            (If you already have the GitHub CLI installed, <code>gh auth login</code>{" "}
            also works.)
          </p>
        </div>
      </div>
    </div>
  );
}

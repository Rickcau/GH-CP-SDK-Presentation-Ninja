"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

export function SetupBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.ready) {
          setVisible(true);
        }
      })
      .catch(() => {
        // If the check fails, show the banner
        setVisible(true);
      });
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="bg-amber-900/60 border border-amber-700/50 text-amber-200 px-4 py-2.5 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          Copilot SDK not configured — using demo mode.{" "}
          <Link
            href="/setup"
            className="underline underline-offset-2 hover:text-amber-100 font-medium"
          >
            Set up now &rarr;
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-amber-800/50 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

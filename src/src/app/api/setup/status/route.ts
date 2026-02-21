import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface SetupCheck {
  ok: boolean;
  detail: string;
}

function checkCommand(command: string): { ok: boolean; output: string } {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      timeout: 10000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return { ok: true, output };
  } catch {
    return { ok: false, output: "" };
  }
}

export async function GET() {
  // Check 0: Node.js version — the bundled Copilot CLI requires node:sqlite (Node 23.4+)
  const nodeVersion = process.versions.node; // e.g. "22.12.0"
  const [major, minor] = nodeVersion.split(".").map(Number);
  const nodeOk = major > 23 || (major === 23 && minor >= 4);
  const nodeCheck: SetupCheck = {
    ok: nodeOk,
    detail: nodeOk
      ? `Node.js v${nodeVersion} — meets the v23.4+ requirement`
      : `Node.js v${nodeVersion} — the bundled Copilot CLI requires v23.4+ (for node:sqlite). Download the Current release from nodejs.org.`,
  };

  // Check 1: @github/copilot-sdk is installed (npm dependency)
  const sdkPath = path.join(
    process.cwd(),
    "node_modules",
    "@github",
    "copilot-sdk"
  );
  const sdkInstalled = fs.existsSync(sdkPath);
  const sdkCheck: SetupCheck = {
    ok: sdkInstalled,
    detail: sdkInstalled
      ? "@github/copilot-sdk is installed"
      : "@github/copilot-sdk not found — run: npm install @github/copilot-sdk",
  };

  // Check 2: @github/copilot (the bundled CLI) is installed (pulled in by the SDK)
  const cliPath = path.join(
    process.cwd(),
    "node_modules",
    "@github",
    "copilot"
  );
  const cliInstalled = fs.existsSync(cliPath);
  const cliCheck: SetupCheck = {
    ok: cliInstalled,
    detail: cliInstalled
      ? "@github/copilot CLI is bundled with the SDK"
      : "@github/copilot not found — run: npm install",
  };

  // Check 3: Authentication — at least one method available
  // The SDK resolves auth in order: GITHUB_TOKEN → GH_TOKEN → gh auth token → OAuth device flow
  const hasEnvToken = !!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
  const ghAuthResult = checkCommand("gh auth status");

  let authDetail: string;
  if (hasEnvToken) {
    authDetail = "Authenticated via environment variable (GITHUB_TOKEN or GH_TOKEN)";
  } else if (ghAuthResult.ok) {
    authDetail = "Authenticated via GitHub CLI (gh auth login)";
  } else {
    authDetail =
      "No authentication found. Set GITHUB_TOKEN in .env.local";
  }
  const authOk = hasEnvToken || ghAuthResult.ok;
  const authCheck: SetupCheck = {
    ok: authOk,
    detail: authDetail,
  };

  // Check 4: Copilot subscription (we can't verify this directly, so just note it)
  const subscriptionCheck: SetupCheck = {
    ok: authOk, // If authenticated, we assume they have a subscription — SDK will error if not
    detail: authOk
      ? "Copilot subscription required — SDK will verify on first use"
      : "Cannot check — authenticate first",
  };

  const checks = {
    node: nodeCheck,
    sdk: sdkCheck,
    cli: cliCheck,
    auth: authCheck,
    subscription: subscriptionCheck,
  };

  const ready = nodeOk && sdkInstalled && cliInstalled && authOk;

  return NextResponse.json({ checks, ready });
}

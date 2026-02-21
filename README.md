# Presentation Ninja

**AI-powered presentation generator built on the GitHub Copilot SDK**

Generate stunning, professional presentations about Microsoft Foundry, GitHub Copilot CLI, GitHub Copilot, and the GitHub Copilot SDK — using the Copilot SDK itself.

> **Goal:** Get anyone from `git clone` to a stunning AI-generated presentation in under 3 minutes. No Azure subscription. No Docker. No vector database. Just `npm install`, one env var, and go.

---

## Problem → Solution

**Problem:** Technical presenters spend hours manually building slide decks about Microsoft AI products. Content goes stale quickly, and maintaining accurate, up-to-date presentations across teams is tedious and error-prone.

**Solution:** Presentation Ninja uses the GitHub Copilot SDK to generate professional, content-rich presentations in seconds. It combines curated knowledge libraries with real-time web search (Tavily) to produce accurate, current slides. Users control the flow with drag-to-reorder topics, precanned demo/YouTube slides, and multiple output formats — all powered by the same agentic engine behind GitHub Copilot CLI.

---

## Prerequisites

You need **three things** to run this app with full AI-powered generation:

| # | Requirement | Version / Details | How to install |
|---|-------------|-------------------|----------------|
| 1 | **Node.js** | **v23.4 or later** (v24 LTS recommended) | See [Installing Node.js](#installing-nodejs) below |
| 2 | **GitHub token** | A personal access token with Copilot access | See [Authentication](#authentication) below |
| 3 | **GitHub Copilot subscription** | Individual, Business, or Enterprise | [github.com/features/copilot](https://github.com/features/copilot) |

### What you do NOT need

| Tool | Why you might think it's needed | Reality |
|------|-------------------------------|---------|
| **GitHub CLI (`gh`)** | Often mentioned in Copilot docs | The SDK bundles its own Copilot CLI runtime via npm. `gh` is **not required**. |
| **`gh-copilot` extension** | The old way to use Copilot in the terminal | The SDK includes `@github/copilot` as an npm dependency. No separate installation needed. |
| **nvm / fnm** | Node version management | Not needed — the Node.js installer upgrades in-place. |

---

## Installing Node.js

The bundled Copilot CLI uses `node:sqlite`, a built-in module that is only stable in **Node.js 23.4+**.

> **⚠️ Node.js 22 and below will NOT work.** The `node:sqlite` module does not exist in Node 22 or earlier. You will get a `Cannot find module 'node:sqlite'` error if you try to run the Copilot SDK agent on those versions.

> **Recommended: Node.js 24 LTS** — This is the best choice for stability and long-term support. Node 23.x (Current) also works but is no longer actively maintained. Any future versions (25+) will also be compatible.

(Note: the SDK README claims "Node.js >= 18" but this is incorrect for the bundled CLI.)

### Windows

**Option A — Download the installer (simplest):**
1. Go to [nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS** (v24.x) Windows installer (`.msi`)
3. Run it — it upgrades your existing Node.js in-place. No uninstall needed.

**Option B — Using winget:**
```bash
winget install OpenJS.NodeJS
```

### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org/en/download
```

### Linux / WSL
```bash
# Using NodeSource (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or download from nodejs.org/en/download
```

### Verify
```bash
node --version
# Should show v23.4.0 or later (v24.x LTS recommended)
```

---

## Authentication

The SDK needs a GitHub token to access Copilot AI models. Set `GITHUB_TOKEN` in your environment:

```bash
# In your .env file (inside the src/ directory):
GITHUB_TOKEN=ghp_your_token_here
```

**How to get a token:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** (classic)
3. Give it a name and select the required scopes
4. Copy the token and paste it into `.env`

This approach works everywhere — locally, in Docker, and in Azure.

> **Alternative:** If you already have the GitHub CLI installed, the SDK will also pick up credentials from `gh auth login`. But `GITHUB_TOKEN` is the recommended approach.

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd GH-CP-SDK-Presentation-Generator/src

# 2. Install npm dependencies
#    This installs the Copilot SDK + its bundled CLI automatically
npm install

# 3. Configure your GitHub token
cp .env.example .env
#    Edit .env and set: GITHUB_TOKEN=ghp_your_token_here

# 4. Start the development server
npm run dev

# 5. Open http://localhost:3000
#    Click "Try Demo Account" to log in
#    Visit /setup to verify your configuration
```

### Mock Mode vs. Live Mode

| Mode | When | What happens |
|------|------|-------------|
| **Mock mode** | `USE_MOCK_AGENT=true` or authentication not configured | Generates presentations from curated knowledge packs. No API calls. Works offline. |
| **Live mode** | `GITHUB_TOKEN` is set and Node.js 23.4+ is installed | Uses the real Copilot SDK agent for AI-powered generation. |

The app **automatically detects** whether the SDK can run. If not, it gracefully falls back to mock mode. Visit the `/setup` page to see exactly what's configured.

---

## How the GitHub Copilot SDK Works

```
Your App (Next.js)
    │
    ▼
@github/copilot-sdk (npm package)
    │ JSON-RPC over stdio
    ▼
@github/copilot (bundled npm dependency — the Copilot CLI runtime)
    │
    ▼
GitHub Copilot API → AI Models
```

**Key points:**
- The SDK spawns the **bundled Copilot CLI** as a local subprocess and communicates via JSON-RPC
- The CLI ships inside the `@github/copilot` npm package — installed automatically with `npm install`
- No separate CLI installation, no `gh extension install`, no manual process management
- Custom tools (like `generate_slide`, `search_knowledge`, `web_search`) are defined in your app code and invoked by the agent
- Authentication via `GITHUB_TOKEN` is the only configuration needed

---

## Running with Docker

```bash
# Build and run with Docker Compose
cd src
docker compose up

# Or build manually
docker build -t presentation-ninja .
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=$GITHUB_TOKEN \
  presentation-ninja
```

Open http://localhost:3000 and log in with the demo account.

---

## Azure Deployment

For detailed Azure deployment instructions, see [deploy/azure/README.md](deploy/azure/README.md).

### Quick Deploy

```bash
az login
./deploy/azure/deploy.sh <resource-group> <app-name> <location>
```

### Post-Deployment

Set `GITHUB_TOKEN` in Azure App Service Configuration:

1. Azure Portal → App Service → Configuration → Application Settings
2. Add: `GITHUB_TOKEN` = your GitHub token
3. Save and restart

---

## Features

- **Topic-scoped AI agent** — Deep knowledge about 4 Copilot & Foundry products
- **12 slide layouts** — Title, Content, Split, Code, Stat, Comparison, Timeline, Quote, Bento, Chart, YouTube, Demo
- **Dual output modes** — HTML Deck (portable, offline) and React Slides (interactive, in-browser)
- **Drag-to-reorder topics** — Full control over presentation flow
- **Precanned slides** — Demo and YouTube slides injected without AI generation
- **AI topic suggestions** — Let the SDK suggest topic sets for your presentation
- **Web search integration** — Tavily search for up-to-date data and statistics
- **5 React themes + 4 HTML themes** — Professional, customizable visual design
- **Pre-seeded demo** — 3 example presentations ready on first login
- **Graceful degradation** — Falls back to mock mode if SDK auth isn't configured
- **Local-first** — Runs fully locally with zero Azure dependency
- **Azure-ready** — One-command deployment with Bicep IaC

## Topics

| Topic | Description |
|-------|-------------|
| Microsoft Foundry | Azure AI Foundry platform — model catalog, prompt flow, fine-tuning |
| GitHub Copilot CLI | AI command-line assistant — natural language to shell commands |
| GitHub Copilot | AI pair programmer — code completions, chat, enterprise features |
| GitHub Copilot SDK | Programmable agent toolkit — defineTool, sessions, streaming |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| UI | Radix UI primitives, Lucide icons, @dnd-kit drag-and-drop |
| AI Agent | GitHub Copilot SDK (`@github/copilot-sdk`) with mock fallback |
| Web Search | Tavily Search API |
| HTML Pipeline | Custom slide-to-HTML renderer with CSS animations |
| Database | SQLite (local) / PostgreSQL (Azure) |
| Auth | NextAuth.js v5 with demo account |
| Deployment | Docker, Azure App Service, Bicep IaC |

## Project Structure

```
/
├── src/                        # Next.js application
│   ├── src/
│   │   ├── app/                # Pages and API routes
│   │   ├── components/         # React components (slides, UI)
│   │   ├── lib/                # Agent, auth, db, pipeline, generation context
│   │   └── data/               # Knowledge library (markdown per topic)
│   ├── .env.example            # Environment template
│   ├── Dockerfile              # Container build
│   └── docker-compose.yml      # Local Docker setup
├── deploy/azure/               # Azure deployment (Bicep, scripts, docs)
├── docs/                       # Architecture, pipeline design, RAI notes
├── .github/workflows/          # CI/CD pipeline
├── AGENTS.md                   # Agent instructions
├── mcp.json                    # MCP server config
└── README.md                   # This file
```

## License

MIT

---

Built for the GitHub Copilot SDK Enterprise Challenge

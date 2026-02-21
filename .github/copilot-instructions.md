# Copilot Instructions — Presentation Ninja

---

## PRE-FLIGHT CHECK (ALWAYS DO THIS FIRST)

**Before making ANY code changes** — including creating files, editing files, running database migrations, or writing task lists that lead to code changes — run `git branch --show-current` to check the current branch. If you are on `main`, you MUST either:

1. Create a new feature branch (`git checkout -b feature/descriptive-name`), OR
2. Ask the user what branch name to use if the task is ambiguous.

**Do not proceed with any implementation work until you are on a non-main branch.** This check must happen at the very start of every task, before any other action.

### Branch Rules

- **NEVER make code changes directly on the `main` branch.** The `main` branch must always remain in a known working state.
- Before starting any feature, bug fix, or refactor, **create a new branch** first:
  ```bash
  git checkout -b feature/descriptive-name
  ```
- If you are currently on `main` and are asked to implement changes, **you must create a branch first** before writing any code. Ask the user for a branch name if the task is ambiguous.
- **NEVER commit or merge to `main` without explicit user confirmation.** After making changes, wait for the user to test and confirm everything works before committing and merging. Do not assume a fix is ready just because TypeScript compiles or the code looks correct.
- Only merge back to `main` after the feature is verified working.
- **ALWAYS use `--no-ff` when merging to `main`** (`git merge --no-ff branch-name`). Never fast-forward merge. This preserves the branch history so every merge is visible as a merge commit in the log.
- This rule exists because a broken `main` branch means there is no safe state to revert to.

---

## What This Project Is

**Presentation Ninja** is an AI-powered presentation generator built on the **GitHub Copilot SDK**. It generates professional, visually rich presentations about four topics:

1. **Microsoft Foundry** (Azure AI Foundry)
2. **GitHub Copilot CLI**
3. **GitHub Copilot**
4. **GitHub Copilot SDK**

The app uses the Copilot SDK to orchestrate an AI agent that researches topics from a curated knowledge library, optionally performs web searches (via Tavily), and produces either structured slide data (React components) or self-contained HTML presentations.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 23.4+ (24 LTS recommended) |
| **Framework** | Next.js (App Router) | 16.1.x |
| **UI** | React, TypeScript, Tailwind CSS v4 | React 19.x |
| **Components** | shadcn/ui patterns, Radix UI, Lucide icons, Geist font | — |
| **AI Agent** | GitHub Copilot SDK (`@github/copilot-sdk`) | 0.1.25+ |
| **Web Search** | Tavily Search API (optional, for knowledge refresh) | REST API |
| **Database** | SQLite via `better-sqlite3` (local) / PostgreSQL (Azure) | — |
| **Auth** | NextAuth.js v5 (credentials provider, demo account) | — |
| **Export** | PptxGenJS (PPTX), Puppeteer (PDF — future) | — |
| **Deployment** | Docker, Azure App Service, Bicep IaC | — |

### Why Node.js 23.4+?

The Copilot SDK bundles its own CLI runtime (`@github/copilot` npm package) which uses the built-in `node:sqlite` module. This module is only stable in Node.js 23.4+. Node 22 and below will fail with `Cannot find module 'node:sqlite'`.

---

## Folder Structure

```
GH-CP-SDK-Presentation-Generator/
├── .github/
│   ├── copilot-instructions.md    # This file — Copilot agent rules
│   ├── instructions/              # Detailed reference docs for Copilot
│   └── workflows/ci-cd.yml       # CI/CD pipeline
├── AGENTS.md                      # Agent persona instructions
├── README.md                      # Project documentation
├── mcp.json                       # MCP server configuration
├── docs/
│   ├── architecture.md            # System architecture
│   ├── pipeline-design.md         # Multi-step pipeline design
│   ├── html-presentation-plan.md  # HTML presentation system plan
│   └── rai-notes.md               # Responsible AI considerations
├── deploy/azure/                  # Azure deployment (Bicep, scripts)
├── images/                        # Screenshots and reference images
├── presentations/                 # Generated output folder
└── src/                           # Next.js application root
    ├── package.json
    ├── Dockerfile
    ├── docker-compose.yml
    ├── tsconfig.json
    ├── next.config.ts
    └── src/
        ├── middleware.ts           # Auth middleware
        ├── app/
        │   ├── layout.tsx          # Root layout
        │   ├── page.tsx            # Landing page
        │   ├── globals.css         # Global styles
        │   ├── (app)/              # Authenticated app routes
        │   │   ├── layout.tsx      # App layout (sidebar)
        │   │   ├── dashboard/      # Dashboard with metrics
        │   │   ├── gallery/        # Presentation gallery
        │   │   ├── presentations/  # Create/view presentations
        │   │   │   ├── new/        # New presentation page
        │   │   │   └── [id]/       # View specific presentation
        │   │   └── setup/          # Configuration checker
        │   ├── api/
        │   │   ├── agent/          # POST /api/agent — SSE presentation generation
        │   │   ├── auth/           # NextAuth routes
        │   │   ├── export/         # PPTX export endpoint
        │   │   ├── knowledge/      # Knowledge refresh endpoint
        │   │   ├── presentations/  # CRUD for presentations
        │   │   ├── setup/          # Setup status check
        │   │   └── templates/      # Template API
        │   └── auth/login/         # Login page
        ├── components/
        │   ├── Providers.tsx       # Client providers (auth, theme)
        │   ├── Sidebar.tsx         # App sidebar navigation
        │   ├── SetupBanner.tsx     # Setup warning banner
        │   ├── KnowledgeRefresh.tsx# Knowledge refresh UI
        │   ├── slides/             # React slide rendering system
        │   │   ├── SlidePresenter.tsx
        │   │   ├── SlideRenderer.tsx
        │   │   ├── SlidePreview.tsx
        │   │   ├── layouts/        # 10 slide layout components
        │   │   └── themes/         # 5 Tailwind theme definitions
        │   └── ui/                 # shadcn/ui components
        ├── data/
        │   ├── knowledge/          # Curated topic knowledge (markdown)
        │   │   ├── copilot/
        │   │   ├── copilot-cli/
        │   │   ├── copilot-sdk/
        │   │   └── foundry/
        │   ├── templates/          # Layout reference snippets (HTML)
        │   └── output/             # Generated presentations
        ├── lib/
        │   ├── auth.ts             # NextAuth configuration
        │   ├── db.ts               # Database setup (SQLite/PostgreSQL)
        │   ├── utils.ts            # Utility functions (cn, etc.)
        │   ├── agent/
        │   │   ├── index.ts        # Agent entry point (real/mock routing)
        │   │   ├── copilot-agent.ts # Real Copilot SDK agent
        │   │   ├── mock-agent.ts   # Mock agent fallback
        │   │   ├── knowledge.ts    # Knowledge loader
        │   │   └── types.ts        # Agent type definitions
        │   ├── export/
        │   │   └── pptx.ts         # PPTX export via PptxGenJS
        │   └── vectorstore/
        │       ├── index.ts
        │       └── local-json.ts
        └── types/
            └── next-auth.d.ts      # NextAuth type extensions
```

---

## How to Run

```bash
# 1. Clone and install
cd src
npm install

# 2. Configure environment
cp .env.example .env.local
# Set GITHUB_TOKEN=ghp_your_token_here
# Optional: TAVILY_API_KEY=tvly-xxx (for web search)
# Optional: COPILOT_MODEL=gpt-4.1 (default model override)

# 3. Start dev server
npm run dev
# Open http://localhost:3000

# 4. Docker alternative
docker compose up
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes (for live mode) | GitHub PAT with Copilot access |
| `NEXTAUTH_SECRET` | Yes (production) | NextAuth session encryption key |
| `NEXTAUTH_URL` | Yes (production) | App base URL |
| `TAVILY_API_KEY` | No | Tavily Search API key for web search / knowledge refresh |
| `COPILOT_MODEL` | No | Default model override (e.g., `gpt-4.1`) |
| `USE_MOCK_AGENT` | No | Set to `true` to force mock mode |
| `DATABASE_URL` | No | PostgreSQL URL (defaults to SQLite) |

### Mock Mode vs Live Mode

- **Mock mode**: `USE_MOCK_AGENT=true` or auth not configured — generates from curated knowledge packs, no API calls
- **Live mode**: `GITHUB_TOKEN` set + Node.js 23.4+ — uses real Copilot SDK agent

---

## Key Architecture Decisions

### 1. GitHub Copilot SDK as Orchestration Layer

The app uses `@github/copilot-sdk` to create AI sessions with custom tools (`defineTool`). The SDK spawns a bundled Copilot CLI as a subprocess and communicates via JSON-RPC. This means:
- No direct OpenAI/Anthropic API calls — all model access goes through GitHub's infrastructure
- Available models: GPT-5, GPT-4.1, GPT-4.1 Mini/Nano, GPT-4o, GPT-4o Mini, Claude Sonnet 4/4.5, o3-mini, o4-mini
- No Gemini models available (GitHub routes through OpenAI + Anthropic only)

### 2. Tavily for Web Search (Not Bing, Not Brave)

See `docs/html-presentation-plan.md` Section 11b for the full decision rationale. Summary:
- **Tavily** returns pre-extracted, LLM-ready content (not just snippets)
- **Azure AI Foundry Web Search** exists but is incompatible with the Copilot SDK (different SDK ecosystem)
- **Bing Search API** returns only snippets, requiring extra page fetching/parsing
- **Brave Search API** was initially implemented but replaced by Tavily for better LLM results

### 3. HTML Presentation System (In Progress)

Replacing React component slides with self-contained HTML presentations:
- LLM generates raw HTML/CSS `<div>` fragments per slide
- Assembly function wraps fragments in an invariant HTML shell (nav, progress bar, transitions)
- Output: Single `.html` file with animations, SVG diagrams, glassmorphism effects
- In-app viewing via `<iframe>` with sandbox
- See `docs/html-presentation-plan.md` for full details

### 4. Multi-Step Pipeline

Presentation generation uses a pipeline (Research → Plan → Generate → Assemble):
- Different models per step (fast for research, reasoning for planning, capable for codegen)
- Each step is a separate Copilot SDK session
- See `docs/pipeline-design.md` for full details

### 5. Knowledge Library

Pre-curated markdown files in `src/data/knowledge/` organized by topic and section:
- `overview.md`, `features.md`, `architecture.md`, `use-cases.md` per topic
- Loaded via `search_knowledge` tool during agent sessions
- Refreshable via web search (Tavily) + LLM synthesis through the dashboard UI

---

## Code Style

- TypeScript strict mode
- `async/await` for all async operations
- Prefer **server components** where possible (default in App Router)
- Client components use the `"use client"` directive at the top of the file
- All API routes go in `src/app/api/`
- Use `zod` for runtime validation of AI tool parameters and API inputs
- Tailwind CSS v4 for styling (no CSS modules)
- Follow existing patterns in the codebase — don't introduce new patterns without discussion

---

## Important Conventions

- **Agent tools**: Defined via `defineTool(name, { description, parameters: z.object(...), handler })` from `@github/copilot-sdk`
- **SSE streaming**: Agent API route yields `AgentEvent` objects as SSE to the frontend
- **Database**: `better-sqlite3` for local development, schema auto-created on first access via `getDb()`
- **Auth**: Demo account `demo@deckforge.local` / `demo1234` — auto-seeded on first run
- **Topic mapping**: App uses `microsoft-foundry` as topic key, knowledge library uses `foundry` directory — see `TOPIC_DIR_MAP` in `copilot-agent.ts`

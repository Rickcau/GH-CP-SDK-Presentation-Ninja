# Architecture — PowerPoint Ninja

## System Overview

PowerPoint Ninja is built as a **Next.js 16 App Router** application that uses the **GitHub Copilot SDK** as its AI orchestration layer. The SDK spawns a bundled Copilot CLI subprocess and communicates via JSON-RPC to access GitHub-hosted AI models (OpenAI + Anthropic).

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│  Browser (React 19 + Tailwind CSS v4)                      │
│  ┌──────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │ Dashboard │ │ New Present. │ │ View/Present <iframe>  │ │
│  └────┬─────┘ └──────┬───────┘ └────────────┬───────────┘ │
│       │              │ SSE                   │             │
├───────┼──────────────┼───────────────────────┼─────────────┤
│  Next.js API Routes  │                       │             │
│  ┌────┴──────────────┴───────────────────────┴──────────┐  │
│  │ /api/agent (SSE)  /api/presentations  /api/export    │  │
│  │ /api/knowledge    /api/setup          /api/templates  │  │
│  └──────────┬────────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────┴──────────────────────────────────────────┐   │
│  │  Pipeline Orchestrator                              │   │
│  │  Research → Plan → Generate HTML → Assemble         │   │
│  │  (Each step = separate Copilot SDK session)         │   │
│  └──────────┬──────────────────────────────────────────┘   │
│             │ JSON-RPC over stdio                           │
│  ┌──────────┴──────────────────────────────────────────┐   │
│  │  @github/copilot-sdk → @github/copilot (CLI)       │   │
│  └──────────┬──────────────────────────────────────────┘   │
│             │                                               │
├─────────────┼───────────────────────────────────────────────┤
│  External   │                                               │
│  ┌──────────┴─────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ GitHub Copilot │  │ Tavily Search│  │ SQLite / PG   │  │
│  │ API (models)   │  │ API          │  │ Database      │  │
│  └────────────────┘  └──────────────┘  └───────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Copilot SDK Agent (`src/lib/agent/`)

The agent is the core AI component. It creates sessions with the Copilot SDK, registers custom tools, and orchestrates content generation.

**Custom tools defined via `defineTool()`:**
- `search_knowledge` — loads curated markdown from `src/data/knowledge/{topic}/`
- `web_search` — performs Tavily web searches for current information
- `generate_slide` — captures structured slide data (current system)
- `submit_slide_html` — captures raw HTML per slide (HTML system, planned)

**Agent routing (`src/lib/agent/index.ts`):**
- If `GITHUB_TOKEN` is set + Node.js 23.4+ → uses real Copilot SDK agent
- If `USE_MOCK_AGENT=true` or SDK unavailable → uses mock agent (curated content)

### 2. Multi-Step Pipeline (`src/lib/pipeline/`, planned)

Presentation generation is being refactored into a 4-step pipeline:

| Step | Purpose | Model | Tools |
|------|---------|-------|-------|
| **Research** | Gather topic knowledge | Fast (gpt-4o-mini) | search_knowledge, web_search |
| **Plan** | Structure slide outline | Reasoning (o3-mini) | None |
| **Generate** | Produce HTML per slide | Capable (gpt-4.1) | submit_slide_html |
| **Assemble** | Wrap in HTML shell | No LLM (pure code) | None |

### 3. Knowledge Library (`src/data/knowledge/`)

Pre-curated markdown files organized by topic:
```
knowledge/
├── copilot/         # GitHub Copilot
├── copilot-cli/     # GitHub Copilot CLI
├── copilot-sdk/     # GitHub Copilot SDK
└── foundry/         # Azure AI Foundry
```
Each topic has: `overview.md`, `features.md`, `architecture.md`, `use-cases.md`

Refreshable via Tavily web search through the dashboard UI.

### 4. HTML Presentation System (planned)

Replacing React component slides with self-contained HTML presentations:
- LLM generates raw HTML/CSS `<div>` fragments per slide
- Assembly function wraps fragments in an invariant shell (nav, progress, transitions)
- Output: Single `.html` file viewable in any browser
- See `docs/html-presentation-plan.md` for full details

### 5. Database (`src/lib/db.ts`)

- **Local**: SQLite via `better-sqlite3` (auto-created `data.db` file)
- **Azure**: PostgreSQL via `DATABASE_URL` env var
- Schema auto-migrated on first access via `getDb()`
- Tables: `users`, `presentations`, `slides`

### 6. Authentication (`src/lib/auth.ts`)

- NextAuth.js v5 with credentials provider
- Demo account auto-seeded: `demo@deckforge.local` / `demo1234`
- JWT sessions, middleware-protected routes

### 7. Export (`src/lib/export/`)

- **PPTX**: PptxGenJS converts structured slide data to editable PowerPoint
- **HTML**: Direct download of self-contained HTML (primary, planned)
- **PDF**: Puppeteer server-side rendering (future)

## Data Flow

```
User clicks "Generate" →
  POST /api/agent (topic, deckType, model, theme, prompt) →
    Pipeline creates Copilot SDK sessions →
      SDK spawns CLI subprocess → GitHub Copilot API →
        Model calls tools (search_knowledge, web_search) →
          Tools return content →
            Model generates slides →
              SSE events stream to frontend →
                Slides rendered in real-time →
                  Saved to database
```

## Available AI Models

Models available through the Copilot SDK (GitHub infrastructure):
- GPT-5, GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano
- GPT-4o, GPT-4o Mini
- Claude Sonnet 4, Claude Sonnet 4.5
- o3-mini, o4-mini

**No Gemini models** — GitHub routes through OpenAI + Anthropic only.

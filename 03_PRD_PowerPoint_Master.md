# Product Requirements Document (PRD)
# GH CP SDK - PowerPoint Ninja

**Version:** 3.1
**Date:** February 19, 2026
**Deadline:** March 7, 2026 (10 PM PST)

---

## 1. Executive Summary

**PowerPoint Ninja** is a **topic-scoped AI presentation generator** built on the GitHub Copilot SDK. It generates stunning, professional presentations specifically about **four core topics**:

1. **Microsoft Foundry** (Azure AI Foundry)
2. **GitHub Copilot CLI**
3. **GitHub Copilot**
4. **GitHub Copilot SDK**

This strategic scoping means the tool is **meta-impressive** for the challenge: it uses the GitHub Copilot SDK to generate presentations *about* the GitHub Copilot SDK (and its ecosystem). The AI agent has deep, pre-loaded knowledge about these topics, enabling it to generate accurate, rich, enterprise-ready content without hallucination.

**Core pipeline:** Users select a topic, describe what they need, and the Copilot SDK agent plans the deck structure, generates expert-level content, and renders **stunning HTML/React-based slides** with modern 2026 design (glassmorphism, cinematic gradients, bold typography, Framer Motion animations). The presentation is previewed live in the browser and exported as `.pptx` (editable) or pixel-perfect `.pdf`.

**Local-first philosophy:** The app runs fully locally with **zero Azure dependency** by default. A built-in **demo account** (`demo@deckforge.local` / `demo1234`) allows anyone to clone the repo and test the full experience in under 2 minutes. All storage is local filesystem, all search is local JSON, and SQLite handles metadata. Azure services (Blob Storage, AI Search, App Service, App Insights) are optional add-ons for enterprise deployment, with scripts and docs provided.

**Why this scope wins the challenge:**
- **Pre-loaded knowledge** — The agent ships with curated, accurate content about each topic (docs, architectures, code examples, use cases). No generic hallucination risk.
- **Meta-impressive demo** — "We used the Copilot SDK to build a tool that generates presentations about the Copilot SDK." Judges will love this.
- **Faster to build** — Focused content domain means fewer edge cases, better quality.
- **Perfect storytelling** — The demo practically writes itself. The tool IS the demo.
- **Instant demo** — Clone, `npm run dev`, log in with demo account, generate a deck. No Azure setup required.
- **Enterprise-ready templates** — Pre-built deck templates for common scenarios (SDK overview, architecture deep dive, getting started guide, enterprise adoption pitch).

**Target:** GitHub Copilot SDK Enterprise Challenge (Q3 FY26)

---

## 2. Problem Statement

Teams adopting Microsoft Foundry and GitHub Copilot products need to create presentations frequently:
- **Internal enablement** — Training teams on GitHub Copilot features and best practices
- **Executive briefings** — Presenting Copilot ROI, adoption metrics, and strategy to leadership
- **Architecture reviews** — Documenting GitHub Copilot SDK integration patterns
- **Customer demos** — Showcasing Copilot capabilities to prospects and partners
- **Conference talks** — Presenting at internal/external events about AI developer tools

Creating these presentations is time-consuming and repetitive. The content is well-defined but the formatting, design, and structure take hours to perfect.

**PowerPoint Ninja** eliminates this burden: describe the deck you need, and get a professionally designed presentation with expert-level content about Copilot and Foundry topics in seconds.

---

## 3. Supported Topics & Pre-loaded Knowledge

### 3.1 Topic Domains

The agent has deep knowledge in exactly four domains. Users select their topic and the agent draws from curated, verified content.

| Topic | What the Agent Knows | Example Decks |
|-------|---------------------|---------------|
| **Microsoft Foundry** | Azure AI Foundry architecture, model catalog, prompt flow, fine-tuning, deployment, responsible AI, integration patterns | "Foundry Overview for Leadership", "Foundry Architecture Deep Dive", "Getting Started with Foundry" |
| **GitHub Copilot CLI** | Installation, commands, shell integration, natural language to shell, explain command, model selection, security | "Copilot CLI Team Enablement", "CLI Productivity Workshop", "Copilot CLI for DevOps" |
| **GitHub Copilot** | IDE integrations, code suggestions, chat, workspace agent, pull request summaries, knowledge bases, enterprise admin, metrics | "Copilot Enterprise Adoption Plan", "Copilot ROI Business Case", "Copilot Best Practices Workshop" |
| **GitHub Copilot SDK** | Architecture (JSON-RPC), defineTool, CopilotClient, sessions, BYOK, auth methods, agent patterns, multi-language support | "Building with the Copilot SDK", "SDK Architecture Deep Dive", "Copilot SDK Enterprise Integration" |

### 3.2 Pre-loaded Content Library

Each topic ships with curated knowledge packs:
- **Official documentation summaries** — Key concepts, features, architecture
- **Architecture diagrams** — Described in structured data for the slide renderer to visualize
- **Code examples** — Real, working code snippets for each SDK/tool
- **Enterprise use cases** — Common adoption patterns, ROI data, success metrics
- **Comparison tables** — Feature matrices, pricing tiers, integration options
- **FAQ content** — Common questions and expert answers

This content is stored as structured markdown/JSON in the repo (`data/knowledge/`) and loaded into the agent's context. No vector store needed for the core knowledge — it's baked in.

### 3.3 Knowledge Update Strategy

- Knowledge packs are versioned markdown files in the repo
- Can be updated via PR (easy for the team to maintain)
- The agent uses RAG over these files, so updates are reflected immediately

---

## 4. User Experience Flow

### 4.1 Authentication & Demo Account

**Demo Account (Built-in, always available):**
- Email: `demo@deckforge.local`
- Password: `demo1234`
- Pre-seeded with 2-3 example presentations in the dashboard so new users immediately see what the tool produces
- Demo account data resets on server restart (no persistence between runs)

**Full Authentication:**
1. User lands on the app — modern dark-mode landing page with hero section
2. Login form with demo credentials pre-filled as placeholder text
3. "Try Demo" button that auto-logs in with the demo account
4. Create a new account with email + password (NextAuth.js) for persistent data
5. Redirected to the Dashboard

### 4.2 Navigation

```
GH CP SDK - PowerPoint Ninja   [Dashboard]  Gallery  Presentations
```

- **Dashboard** (default) — Overview metrics, recent presentations, quick-create
- **Gallery** — Browse pre-built templates and user-uploaded examples
- **Presentations** — List of all generated presentations with status

### 4.3 Dashboard Page

**Metric Tiles (Bento Grid Layout):**

| Tile | Description |
|------|-------------|
| Total Presentations | Count of all generated decks |
| Completed | Successfully generated and downloaded |
| Generating | Currently in progress (with live progress indicator) |
| By Topic | Distribution chart: Foundry / CLI / Copilot / SDK |

**Recent Presentations Section:**
- Card grid showing recent decks with:
  - Thumbnail preview (slide 1 rendered as HTML snapshot)
  - Title, topic badge (Foundry / CLI / Copilot / SDK), date, slide count
  - Status badge (Completed / Generating / Failed)
  - Quick actions: Download, Preview, Re-generate, Delete
- "Create New Presentation" prominent CTA button
- **Demo account:** Pre-seeded with 2-3 example presentations so the dashboard isn't empty on first visit

### 4.4 Create New Presentation Flow

1. User clicks "Create New Presentation"
2. A creation panel opens with:
   - **Topic Selection** — Choose one of four topics:
     - Microsoft Foundry
     - GitHub Copilot CLI
     - GitHub Copilot
     - GitHub Copilot SDK
   - **Deck Type** — Curated options per topic:
     - Executive Overview / Getting Started / Architecture Deep Dive / Team Enablement / Workshop / Custom
   - **Prompt/Description** — Text area for specifics ("Focus on enterprise adoption, include ROI metrics, target audience is C-suite")
   - **Template Selection** — Choose from:
     - **Pre-built templates** (~8 professional themes shipped with the app)
     - **User-uploaded examples** (from the Gallery)
     - **Auto** — let the AI pick the best match
   - **Slide Count** — Suggested range (5-20), or "Let AI decide"
   - **Include Speaker Notes** — Toggle
   - **Include Code Examples** — Toggle (for technical decks)
   - **Additional Context** — Optional file upload (PDF, DOCX) for supplementary content
3. User clicks "Generate"
4. AI agent progress shown in real-time:
   - Selecting topic knowledge pack...
   - Planning deck structure...
   - Generating slide 1 of N...
   - Applying theme...
   - Finalizing...
5. **Live HTML preview** appears — user sees the actual presentation
6. User can:
   - **Present directly** from the browser (full-screen mode)
   - **Download as PDF** (pixel-perfect)
   - **Download as PPTX** (editable in PowerPoint)
   - **Download as HTML** (standalone file)
   - **Iterate** with AI ("Add a slide about authentication options", "Make the architecture slide more detailed")

### 4.5 Gallery Page

**Pre-Built Templates:**
- ~8 professionally designed templates:
  - Dark Luxe, Tech Gradient, Clean Corporate, Bold Statement, Warm Minimal
  - Each with multiple layout variants
- Displayed as cards with slide thumbnails

**User-Uploaded Examples:**
- Upload PPTX files as style references
- Each uploaded deck is analyzed and indexed
- The AI can reference their visual style when generating new decks

### 4.6 Presentation Detail Page

- Full slide-by-slide HTML preview
- Export buttons: PDF | PPTX | HTML
- "Present" button (full-screen mode)
- "Refine with AI" — chat interface to iterate on specific slides
- Metadata: topic, deck type, creation date, prompt used, generation time

---

## 5. Architecture

### 5.1 High-Level Architecture

```
                    +---------------------------+
                    |   React / Next.js 15      |
                    |   (App Router)            |
                    |   shadcn/ui + Tailwind    |
                    |   Aceternity UI           |
                    |   Slide React Components  |  <-- HTML slide renderer
                    +-----------+---------------+
                                |
                         API Routes / Server Actions
                                |
                    +-----------+---------------+
                    |   Next.js Backend         |
                    |   (API Route Handlers)    |
                    +-----------+---------------+
                                |
              +-----------------+-----------------+
              |                 |                  |
   +----------+------+  +------+--------+  +------+--------+
   | GH Copilot SDK  |  | Export Engine  |  | Knowledge     |
   | (TypeScript)    |  |               |  | Library       |
   | Agent + Tools   |  | PPTX: PptxGen |  |               |
   |                 |  | PDF: Puppeteer|  | data/knowledge|
   | Topic-Scoped    |  | HTML: Bundle  |  |   /foundry    |
   | Knowledge       |  |               |  |   /copilot-cli|
   +----------+------+  +------+--------+  |   /copilot    |
              |                 |           |   /copilot-sdk|
              +-----------------+----------+-------+--------+
                                |
                    +-----------+---------------+
                    |   Local Storage (default)  |
                    |   SQLite + filesystem      |
                    |   --- OR (optional) ---    |
                    |   Azure Blob + PostgreSQL  |
                    +---------------------------+
```

### 5.2 Component Breakdown

| Component | Technology | Local Default | Azure Option |
|-----------|------------|---------------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript | localhost:3000 | Azure App Service |
| **UI Components** | shadcn/ui + Aceternity UI + Magic UI | — | — |
| **Styling** | Tailwind CSS v4, Geist font | — | — |
| **Slide Renderer** | React components + Tailwind + Framer Motion | — | — |
| **AI Agent** | GitHub Copilot SDK (TypeScript) | Copilot SDK models | Same |
| **Knowledge Library** | Structured markdown/JSON files | `data/knowledge/` | Same |
| **PPTX Export** | PptxGenJS | — | — |
| **PDF Export** | Puppeteer | — | — |
| **Vector Store** | Pluggable | Local JSON (default) | Azure AI Search |
| **File Storage** | — | Local filesystem | Azure Blob Storage |
| **Auth** | NextAuth.js | SQLite + demo account | Same (or Azure AD) |
| **Database** | — | SQLite | PostgreSQL |
| **Secrets** | — | `.env.local` file | Azure Key Vault |
| **Observability** | — | Console logging | Azure App Insights |
| **CI/CD** | GitHub Actions | — | Deploy to App Service |

### 5.3 Copilot SDK Agent Design

The agent is topic-aware and uses pre-loaded knowledge to generate accurate content. Custom tools defined via `defineTool`:

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";

const TOPICS = ["microsoft-foundry", "copilot-cli", "copilot", "copilot-sdk"] as const;

// Tool: plan_presentation
defineTool("plan_presentation", {
  description: "Plan a presentation structure for a specific Copilot/Foundry topic",
  parameters: z.object({
    topic: z.enum(TOPICS).describe("The core topic domain"),
    deckType: z.enum(["overview", "getting-started", "architecture",
                       "enablement", "workshop", "custom"]),
    prompt: z.string().describe("User's specific requirements"),
    slideCount: z.number().describe("Target number of slides"),
    includeCode: z.boolean().default(false),
    includeSpeakerNotes: z.boolean().default(true),
  }),
  handler: async (args) => {
    // 1. Load knowledge pack for the topic
    // 2. Plan slide structure based on deck type
    // 3. Return: { slides: [{ index, layout, title, keyPoints[], codeExample? }] }
  },
});

// Tool: load_knowledge
defineTool("load_knowledge", {
  description: "Load curated knowledge about a topic for accurate content generation",
  parameters: z.object({
    topic: z.enum(TOPICS),
    section: z.string().optional().describe("Specific section: architecture, features, quickstart, etc."),
  }),
  handler: async ({ topic, section }) => {
    // Reads from data/knowledge/{topic}/ directory
    // Returns structured content the agent can use for slide generation
  },
});

// Tool: generate_slide
defineTool("generate_slide", {
  description: "Generate content for a single slide using topic knowledge",
  parameters: z.object({
    slideIndex: z.number(),
    layout: z.enum(["title", "content", "split", "chart", "quote",
                     "comparison", "timeline", "bento", "stat", "code"]),
    title: z.string(),
    content: z.array(z.string()).describe("Bullet points or content blocks"),
    speakerNotes: z.string().optional(),
    codeExample: z.object({
      language: z.string(),
      code: z.string(),
      caption: z.string().optional(),
    }).optional(),
    chartData: z.object({
      type: z.enum(["bar", "line", "pie", "donut"]),
      data: z.array(z.object({ label: z.string(), value: z.number() })),
    }).optional(),
  }),
  handler: async (args) => {
    // Returns structured JSON for the React SlideRenderer
  },
});

// Tool: search_templates
defineTool("search_templates", {
  description: "Search pre-built and user-uploaded templates for matching layouts",
  parameters: z.object({
    query: z.string(),
    layoutType: z.enum(["title", "content", "split", "chart", "quote",
                         "comparison", "timeline", "bento", "stat", "code"]).optional(),
  }),
  handler: async ({ query, layoutType }) => {
    // Queries the configured vector store
  },
});

// Tool: finalize_presentation
defineTool("finalize_presentation", {
  description: "Assemble all slides and generate export files",
  parameters: z.object({
    presentationId: z.string(),
    title: z.string(),
    theme: z.string(),
    slides: z.array(z.object({ slideId: z.string() })),
  }),
  handler: async (args) => {
    // 1. Render HTML slides via Puppeteer -> PDF
    // 2. Translate structured data -> PPTX via PptxGenJS
    // 3. Package HTML export
    // Returns download URLs
  },
});
```

### 5.4 HTML-First Dual-Output Pipeline

Slides are designed as React components using modern web CSS, then exported.

```
1. Agent loads topic knowledge pack (load_knowledge tool)
        |
2. Agent plans deck structure (plan_presentation tool)
   - Deck type determines structure (overview vs. deep dive vs. workshop)
   - Topic knowledge ensures accurate, rich content
        |
3. Agent generates structured slide data (generate_slide tool, per slide)
   - Returns JSON: { title, content[], layout, codeExample?, chartData? }
   - Content drawn from curated knowledge — NOT hallucinated
        |
4. React Slide Renderer renders each slide as HTML
   - Tailwind CSS: glassmorphism, gradients, bold typography
   - Framer Motion: animations and transitions
   - Code slides: syntax-highlighted code blocks
   - Live preview in browser
        |
5. User reviews + iterates
   - "Add more detail on authentication" / "Include a code example" / "Make it less technical"
        |
6. Export
   - PDF: Puppeteer renders HTML at 1920x1080
   - PPTX: Structured data -> PowerPoint via PptxGenJS
   - HTML: Standalone file with embedded CSS/JS
```

### 5.5 Slide React Component Architecture

```
components/slides/
  ├── SlideRenderer.tsx          # Main renderer - picks layout by type
  ├── SlidePresenter.tsx         # Full-screen presentation mode
  ├── SlidePreview.tsx           # Thumbnail preview component
  ├── layouts/
  │   ├── TitleSlide.tsx         # Full-screen title with gradient/image bg
  │   ├── ContentSlide.tsx       # Title + bullet points
  │   ├── SplitSlide.tsx         # Visual left, text right
  │   ├── ChartSlide.tsx         # Data visualization (Recharts/Tremor)
  │   ├── QuoteSlide.tsx         # Large centered quote
  │   ├── ComparisonSlide.tsx    # Side-by-side comparison
  │   ├── TimelineSlide.tsx      # Horizontal process flow
  │   ├── BentoSlide.tsx         # Bento grid with data points
  │   ├── StatSlide.tsx          # Giant number + context
  │   └── CodeSlide.tsx          # Code block with syntax highlighting
  └── themes/
      ├── dark-luxe.ts
      ├── warm-minimal.ts
      ├── tech-gradient.ts
      ├── clean-corporate.ts
      └── bold-statement.ts
```

### 5.6 Pre-Built Deck Templates (Topic-Specific)

The app ships with curated deck templates per topic:

| Template | Topic | Slides | Audience |
|----------|-------|--------|----------|
| **Foundry Executive Overview** | Microsoft Foundry | 8 | C-suite, leadership |
| **Foundry Architecture Deep Dive** | Microsoft Foundry | 12 | Engineers, architects |
| **Getting Started with Foundry** | Microsoft Foundry | 10 | Developers |
| **Copilot CLI Enablement** | GitHub Copilot CLI | 8 | Dev teams |
| **Copilot CLI Workshop** | GitHub Copilot CLI | 15 | Hands-on training |
| **Copilot Enterprise Adoption** | GitHub Copilot | 10 | Leadership, IT admins |
| **Copilot ROI Business Case** | GitHub Copilot | 8 | Finance, executives |
| **Copilot Best Practices** | GitHub Copilot | 12 | Developers |
| **Building with Copilot SDK** | GitHub Copilot SDK | 10 | Developers |
| **SDK Architecture Deep Dive** | GitHub Copilot SDK | 12 | Architects |
| **SDK Enterprise Integration** | GitHub Copilot SDK | 10 | Enterprise teams |
| **SDK + Foundry Together** | Cross-topic | 10 | Full stack teams |

Each template is available in all 5 themes (Dark Luxe, Tech Gradient, Clean Corporate, Bold Statement, Warm Minimal).

### 5.7 Vector Store Architecture (Pluggable)

Used for indexing user-uploaded PPTX examples (the core knowledge library is file-based, not vector-stored).

```typescript
interface VectorStoreProvider {
  index(slide: SlideMetadata): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<SlideMatch[]>;
  delete(slideId: string): Promise<void>;
}
```

**Option A: Local JSON Store (Default — Zero Setup)**
- Templates stored as JSON files in `data/templates/`
- Basic keyword + TF-IDF search
- No cloud dependency, no API keys needed

**Option B: SQLite + Embeddings**
- SQLite with `sqlite-vec` for vector similarity
- Better search quality, still local

**Option C: Azure AI Search (Enterprise)**
- Full vector search with hybrid retrieval
- Best for enterprise deployment, requires Azure subscription

Config: `VECTOR_STORE_PROVIDER=local | sqlite | azure-ai-search`

---

## 6. Local Development & Azure Deployment

### 6.1 Local-First Philosophy

The app is designed to run **fully locally with zero cloud dependencies** by default. Every feature works out of the box with local storage and the built-in demo account. Azure services are optional upgrades.

| Feature | Local Default | Azure Upgrade |
|---------|--------------|---------------|
| Storage | Local filesystem (`data/output/`) | Azure Blob Storage |
| Database | SQLite (`data/app.db`) | PostgreSQL (Azure) |
| Vector Store | Local JSON (`data/templates/`) | Azure AI Search |
| Auth | NextAuth.js + SQLite + demo account | Azure Entra ID (AD) |
| Secrets | `.env.local` file | Azure Key Vault |
| Observability | Console logging | Azure App Insights |
| Hosting | `localhost:3000` | Azure App Service |

### 6.2 Quick Start (Under 2 Minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd powerpoint-ninja
npm install

# 2. Configure (only Copilot SDK token needed)
cp .env.example .env.local
# Edit .env.local: set COPILOT_GITHUB_TOKEN (or use GH_TOKEN from gh auth)

# 3. Run
npm run dev

# 4. Open http://localhost:3000
#    Login with: demo@deckforge.local / demo1234
#    Generate your first presentation!
```

**Prerequisites (local):**
- Node.js 18+
- GitHub Copilot subscription (for SDK model access)
- Copilot CLI installed (`gh extension install github/gh-copilot`)

**No Azure account needed for local development.**

### 6.3 Demo Account Seeding

On first run (or server restart in dev mode), the app seeds the demo account:

```typescript
// lib/seed.ts
async function seedDemoAccount(db: Database) {
  // 1. Create demo user
  const demoUser = await db.upsertUser({
    email: "demo@deckforge.local",
    name: "Demo User",
    passwordHash: hash("demo1234"),
  });

  // 2. Seed 2-3 example presentations so dashboard isn't empty
  const examples = [
    {
      title: "GitHub Copilot SDK — Getting Started",
      topic: "copilot-sdk",
      deckType: "getting-started",
      theme: "dark-luxe",
      slides: loadPrebuiltSlides("sdk-getting-started"),
    },
    {
      title: "GitHub Copilot — Enterprise Adoption Plan",
      topic: "copilot",
      deckType: "overview",
      theme: "tech-gradient",
      slides: loadPrebuiltSlides("copilot-adoption"),
    },
    {
      title: "Azure AI Foundry — Architecture Deep Dive",
      topic: "microsoft-foundry",
      deckType: "architecture",
      theme: "clean-corporate",
      slides: loadPrebuiltSlides("foundry-architecture"),
    },
  ];

  for (const example of examples) {
    await db.createPresentation({ userId: demoUser.id, ...example });
  }
}
```

### 6.4 Docker (Local, No Azure)

```bash
# One-command local setup
docker compose up

# Or build and run manually
docker build -t powerpoint-ninja .
docker run -p 3000:3000 -e COPILOT_GITHUB_TOKEN=$COPILOT_GITHUB_TOKEN powerpoint-ninja
```

`docker-compose.yml` runs just the app container with local SQLite and filesystem storage.

### 6.5 Azure Deployment

For enterprise deployment, scripts and docs are provided in `deploy/azure/`.

**Repo structure:**

```
deploy/
  └── azure/
      ├── README.md                  # Step-by-step Azure deployment guide
      ├── deploy.sh                  # One-command Azure deployment script
      ├── bicep/
      │   ├── main.bicep             # Azure infrastructure (IaC)
      │   ├── app-service.bicep      # App Service configuration
      │   ├── storage.bicep          # Blob Storage account
      │   ├── keyvault.bicep         # Key Vault for secrets
      │   ├── appinsights.bicep      # Application Insights
      │   └── ai-search.bicep        # Azure AI Search (optional)
      └── scripts/
          ├── provision.sh           # Provision Azure resources
          ├── configure-secrets.sh   # Push secrets to Key Vault
          └── deploy-app.sh          # Deploy app to App Service
```

**`deploy.sh` — One-command Azure deployment:**

```bash
#!/bin/bash
# deploy/azure/deploy.sh
# Usage: ./deploy.sh <resource-group> <app-name> <location>

RESOURCE_GROUP=${1:-"rg-powerpoint-ninja"}
APP_NAME=${2:-"powerpoint-ninja"}
LOCATION=${3:-"eastus2"}

echo "Provisioning Azure resources..."
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file bicep/main.bicep \
  --parameters appName=$APP_NAME location=$LOCATION

echo "Configuring secrets in Key Vault..."
./scripts/configure-secrets.sh $RESOURCE_GROUP $APP_NAME

echo "Deploying application..."
./scripts/deploy-app.sh $RESOURCE_GROUP $APP_NAME

echo "Done! App available at: https://$APP_NAME.azurewebsites.net"
```

**Azure deployment docs (`deploy/azure/README.md`) cover:**
1. Prerequisites (Azure CLI, subscription, resource group)
2. One-command deployment via `deploy.sh`
3. Manual step-by-step deployment
4. Configuring Azure AI Search (optional)
5. Configuring Azure Blob Storage
6. Setting up Azure Key Vault secrets
7. Enabling App Insights telemetry
8. Custom domain and SSL
9. CI/CD via GitHub Actions (auto-deploy on push to main)

### 6.6 Environment Variables

```bash
# .env.example

# === REQUIRED (local) ===
COPILOT_GITHUB_TOKEN=           # GitHub token with Copilot access
                                # Or use GH_TOKEN / GITHUB_TOKEN

# === LOCAL DEFAULTS (no config needed) ===
DATABASE_URL=file:./data/app.db  # SQLite (local)
STORAGE_PATH=./data/output       # Local filesystem
VECTOR_STORE_PROVIDER=local      # Local JSON store
NEXTAUTH_SECRET=local-dev-secret # Auth secret (change in production)
NEXTAUTH_URL=http://localhost:3000

# === OPTIONAL: Azure Upgrades ===
# AZURE_STORAGE_CONNECTION_STRING=   # Enables Azure Blob Storage
# AZURE_SEARCH_ENDPOINT=             # Enables Azure AI Search
# AZURE_SEARCH_KEY=                  #   (requires VECTOR_STORE_PROVIDER=azure-ai-search)
# AZURE_KEYVAULT_URL=                # Enables Key Vault for secrets
# APPLICATIONINSIGHTS_CONNECTION_STRING=  # Enables App Insights
# DATABASE_URL=postgresql://...      # Switch to PostgreSQL
```

---

## 7. Design System

### 7.1 Visual Direction

**Dark-mode-first** with glassmorphic elements. Modern 2026 bleeding-edge patterns. The app itself should look as stunning as the presentations it generates.

### 7.2 Color Palette

| Role | Light Mode | Dark Mode (Primary) |
|------|-----------|-------------------|
| Background | `#FAFAFA` | `#030712` (deep navy-black) |
| Surface/Cards | `#FFFFFF` | `#111827` at 80% + backdrop-blur |
| Primary Accent | `#0D9488` (teal) | `#14B8A6` |
| Secondary Accent | `#7C3AED` (violet) | `#8B5CF6` |
| AI Gradient | teal-to-violet | `#8B5CF6` -> `#06B6D4` |
| Text Primary | `#111827` | `#F9FAFB` |
| Text Secondary | `#6B7280` | `#9CA3AF` |

### 7.3 Typography

| Element | Font | Weight |
|---------|------|--------|
| UI Font | Geist (Variable) | 400-700 |
| Headlines | Geist Bold | 700 |
| Monospace | Geist Mono | 400 |
| Hero text | Plus Jakarta Sans | 800 |

### 7.4 Component Stack

```
shadcn/ui          -- Base components
Aceternity UI      -- Landing page effects (spotlight cards, aurora backgrounds)
Magic UI           -- Animated components (shimmer, particles, text reveal)
Tremor             -- Dashboard charts
Framer Motion      -- Custom animations and page transitions
Lucide React       -- Icons
next-themes        -- Dark/light mode toggle
```

### 7.5 Key Design Patterns

- **Bento grid dashboard** with interactive tiles
- **Glassmorphic cards** (dark translucent bg + backdrop-blur)
- **Animated gradients** for AI "thinking" states
- **Streaming text** for real-time generation progress
- **Agentic step visualization** — show AI pipeline steps visually
- **Topic color coding** — each of the 4 topics gets a subtle accent color
- **Skeleton loaders** with glassmorphic shimmer
- **Collapsible sidebar** navigation
- **Command palette** (Cmd+K)

### 7.6 Generated Slide Themes

| Theme | Description |
|-------|-------------|
| **Dark Luxe** | Near-black bg, frosted glass cards, teal/violet accent |
| **Warm Minimal** | Cream bg, warm brown accents, serif headlines |
| **Tech Gradient** | Purple-to-teal gradient, white text, geometric elements |
| **Clean Corporate** | White bg, single brand color, data-focused |
| **Bold Statement** | Solid color bg, oversized typography |

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| UI | shadcn/ui, Aceternity UI, Magic UI, Tailwind CSS v4, Framer Motion |
| Slide Renderer | Custom React components (HTML-first) |
| Font | Geist (Variable) |
| AI Agent | GitHub Copilot SDK (`@github/copilot-sdk`) |
| Knowledge Library | Structured markdown/JSON in `data/knowledge/` |
| PPTX Export | PptxGenJS |
| PDF Export | Puppeteer |
| Vector Store | Pluggable: Local JSON (default) / SQLite / Azure AI Search |
| File Storage | Local filesystem (default) or Azure Blob Storage |
| Database | SQLite (default) or PostgreSQL |
| Auth | NextAuth.js + demo account |
| CI/CD | GitHub Actions |
| IaC | Azure Bicep (in `deploy/azure/bicep/`) |

---

## 9. Challenge Scoring Strategy

**Total target: 125-135 / 135 pts**

| Category | Points | How We Score |
|----------|--------|-------------|
| Enterprise applicability | 30 | Universal enterprise need (presentations), topic-scoped for Copilot/Foundry ecosystem, pre-built templates, multi-user |
| Azure/Microsoft integration | 25 | Azure AI Search (optional), Blob Storage, App Service, Key Vault, App Insights — all with Bicep IaC and deployment scripts |
| Operational readiness | 15 | Docker, GitHub Actions CI/CD, telemetry, health checks, one-command local & Azure deploy |
| Security & RAI | 15 | Input sanitization, auth, secrets management, RAI notes, content grounded in verified knowledge |
| Storytelling | 15 | **Meta-demo**: Use the tool to generate the submission presentation. "Built with the SDK, presenting about the SDK." Demo account for instant judge experience. |
| **Bonus:** Foundry IQ | 15 | Microsoft Foundry is a core topic — deep integration and knowledge |
| **Bonus:** Customer validation | 10 | Document in `/customer` folder |
| **Bonus:** SDK feedback | 10 | Screenshot in repo |

**Key storytelling advantage:** The 3-minute demo can literally be: "Watch me generate a presentation about the Copilot SDK using the Copilot SDK." The submission deck itself can be generated by the tool. Judges can clone the repo and try the demo account instantly.

---

## 10. Build Plan

### Week 1: Feb 19 - Feb 25 (Core MVP)
- Scaffold Next.js 15 app with dark theme, shadcn/ui, Aceternity UI
- Set up SQLite + NextAuth.js + demo account seeding
- Create knowledge library (`data/knowledge/`) for all 4 topics
- Build Slide React components (SlideRenderer + layouts + 2 themes)
- Build Copilot SDK agent with core tools (plan, generate, load_knowledge)
- Wire end-to-end: topic + prompt -> agent -> structured data -> HTML slides
- Add pre-built deck templates (at least 4, one per topic)
- PDF export via Puppeteer

### Week 2: Feb 26 - Mar 3 (Integrations + Polish)
- PPTX export via PptxGenJS
- Gallery page, presentation list/detail pages
- Template upload + analysis pipeline
- Local JSON vector store for uploaded templates
- Docker + docker-compose for one-command local run
- Remaining themes and deck templates
- Seed example presentations for demo account

### Week 3: Mar 3 - Mar 7 (Deploy, Demo, Docs)
- Azure deployment: Bicep templates, deploy scripts, deployment docs
- GitHub Actions CI/CD pipeline (lint, test, build, deploy to Azure)
- Polish UI, animations, error handling
- Docs: README, architecture diagram, RAI notes, AGENTS.md, mcp.json
- **Use the tool itself to generate the submission presentation** (meta!)
- Record 3-min demo video
- Submit SDK feedback, attempt customer validation
- Submit by Mar 7, 10 PM PST

---

## 11. Repo Structure

```
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API route handlers (agent, export, auth)
│   │   ├── dashboard/          # Dashboard page
│   │   ├── gallery/            # Gallery page
│   │   ├── presentations/      # Presentation list + detail pages
│   │   └── auth/               # Login / register pages
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── slides/             # Slide renderer + layouts + themes
│   │   └── ...                 # Custom app components
│   ├── lib/
│   │   ├── agent/              # Copilot SDK agent + tools
│   │   ├── export/             # PDF + PPTX export engines
│   │   ├── vectorstore/        # Pluggable vector store
│   │   ├── db.ts               # Database (SQLite/PostgreSQL)
│   │   ├── seed.ts             # Demo account + example data seeding
│   │   └── auth.ts             # NextAuth.js config
│   └── data/
│       ├── knowledge/          # Pre-loaded topic knowledge packs
│       │   ├── foundry/
│       │   ├── copilot-cli/
│       │   ├── copilot/
│       │   └── copilot-sdk/
│       ├── templates/          # Pre-built slide templates (JSON)
│       └── output/             # Generated presentations (local storage)
├── deploy/
│   └── azure/
│       ├── README.md           # Azure deployment guide
│       ├── deploy.sh           # One-command Azure deployment
│       ├── bicep/              # Azure Bicep IaC templates
│       └── scripts/            # Provisioning and deployment scripts
├── docs/
│   ├── architecture.md         # Architecture diagram & explanation
│   └── rai-notes.md            # Responsible AI considerations
├── presentations/
│   └── PowerPointMaster.pptx   # Submission deck (generated by the tool!)
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions: lint, test, build, deploy
├── AGENTS.md                   # Custom agent instructions
├── mcp.json                    # MCP server configuration
├── Dockerfile
├── docker-compose.yml
├── .env.example                # Environment variable template
└── README.md                   # Setup, usage, architecture overview
```

---

## 12. Responsible AI (RAI) Considerations

| Area | Mitigation |
|------|-----------|
| Content Accuracy | Pre-loaded, curated knowledge packs reduce hallucination risk |
| Content Safety | AI content screened for harmful material |
| Data Privacy | Per-user storage, no cross-user access; demo account data isolated |
| Bias | Content is technical/factual, minimizing bias surface |
| Transparency | AI-generated indication, metadata preserved |
| IP/Copyright | Content sourced from official public documentation |
| Hallucination | Topic-scoped knowledge grounding dramatically reduces hallucination |

---

## 13. Success Criteria

1. Clone repo, `npm run dev`, login with demo account, generate a deck — **under 2 minutes**
2. Zero Azure dependency for local development and testing
3. Generated content is accurate and expert-level (grounded in curated knowledge)
4. HTML slides look modern and visually impressive
5. PDF export is pixel-perfect; PPTX export is professional and editable
6. Pre-built deck templates cover the 4 topic domains thoroughly
7. Demo account has pre-seeded example presentations for immediate showcase
8. Azure deployment works via one-command script with Bicep IaC
9. The submission presentation itself is generated by the tool

---

## 14. Out of Scope (MVP)

- Topics beyond the 4 core domains (general-purpose presentations)
- Real-time collaborative editing
- Google Slides export
- PowerPoint Add-in integration
- Animation/transition in PPTX export (HTML slides will have animations)
- Mobile-responsive presentation editor
- Multi-language content generation
- AI image generation per slide (DALL-E) — future enhancement

# Demo Deck Content — Presentation Ninja

Use this content to create `PresentationNinja.pptx` (1-2 slides).

---

## Slide 1: Business Value Proposition

**Title:** Presentation Ninja

**Subtitle:** AI-Powered Presentation Generator | Built on the GitHub Copilot SDK

**Problem box:**
> Technical presenters spend hours manually building slide decks about Microsoft AI products. Content goes stale quickly, and maintaining accurate, up-to-date presentations across teams is tedious and error-prone.

**Solution box:**
> Generate professional, content-rich presentations in seconds using the GitHub Copilot SDK. Curated knowledge libraries + real-time web search (Tavily) produce accurate, current slides. Users control flow with drag-to-reorder topics, precanned Demo/YouTube slides, and three output formats — all powered by the same agentic engine behind GitHub Copilot CLI.

**Key features (as badges/chips):**
- 12 Slide Layouts
- 3 Output Formats (HTML, React, PPTX)
- Drag-to-Reorder Topics
- AI Topic Suggestions
- Web Search Grounding (Tavily)
- Works Offline (Mock Mode)

**Goal callout:**
> `git clone` to a stunning AI presentation in under 3 minutes. No Azure subscription. No Docker. Just `npm install`, one env var, and go.

**Footer:** Next.js 16 | React 19 | TypeScript | Tailwind CSS v4 | GitHub Copilot SDK | Tavily | SQLite

**Repo link:** `github.com/<your-username>/GH-CP-SDK-Presentation-Generator`

---

## Slide 2: Architecture Diagram

**Title:** Architecture

**Subtitle:** Pluggable knowledge store | Pluggable web search | Three output pipelines

**Layout — 4 horizontal rows:**

**Row 1:** `React / Next.js 16 Frontend` — App Router, Tailwind CSS v4, 12 Slide Layout Components

**Row 2:** `Next.js API Routes` — SSE Streaming, Server Actions

**Row 3 — Three columns side by side:**

| Copilot SDK Agent | Knowledge Library | Output Pipelines |
|---|---|---|
| `generate_slide` | Local Markdown (default) | HTML Deck (portable, offline) |
| `search_knowledge` | *or* Azure AI Search | React Slides (interactive) |
| `web_search` (Tavily) | Tavily Web Search | PowerPoint PPTX export |
| Mock agent fallback | *or* Bing Web Search API | 9 themes, CSS animations |
| | **PLUGGABLE** | **3 FORMATS** |

**Row 4:** `SQLite (local) / PostgreSQL (Azure)` | `Filesystem / Azure Blob Storage`

**Repo link footer:** `github.com/<your-username>/GH-CP-SDK-Presentation-Generator`

---

## 150-Word Summary

**Where this goes:** Paste into the **submission form** text field (not a file in the repo). The competition requires "A short summary of your project (150 words max)" as part of the submission.

> **Presentation Ninja** is an AI-powered presentation generator built on the GitHub Copilot SDK. It solves a common enterprise pain point: technical presenters spend hours manually building slide decks that go stale quickly. Presentation Ninja generates professional, content-rich presentations in seconds.
>
> The agent uses three custom tools — `generate_slide`, `search_knowledge`, and `web_search` — to combine curated local knowledge libraries with real-time Tavily web search, producing accurate, up-to-date slides grounded in both static documentation and live data.
>
> Users control their presentations with drag-to-reorder topics, AI-suggested topic sets, and precanned Demo/YouTube slides. Output is available in three formats: standalone HTML decks (portable, offline), interactive React slides, and PowerPoint PPTX export.
>
> The architecture is designed for instant setup — `npm install` and one environment variable — with pluggable upgrade paths to Azure AI Search, Bing Web Search, and Azure App Service for enterprise deployment.

*(148 words)*

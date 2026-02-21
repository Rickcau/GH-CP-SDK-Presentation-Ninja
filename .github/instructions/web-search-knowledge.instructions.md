# Web Search & Knowledge System — Reference

## Web Search Provider: Tavily

We use **Tavily Search API** for web search in both the agent and knowledge refresh features.

### Why Tavily (not Bing, not Brave, not Foundry)

| Provider | Status | Why |
|----------|--------|-----|
| **Tavily** | ✅ Selected | Purpose-built for LLM agents; returns full extracted content; `include_answer: true` for an AI summary; simple REST API; 1 env var |
| **Bing Search API** | ❌ Rejected | Returns short snippets; requires Azure subscription + Bing resource; extra page fetching/parsing code needed |
| **Foundry Web Search** | ❌ Incompatible | Only works in Azure AI Foundry Agent Service (`azure-ai-projects` SDK); our app uses GitHub Copilot SDK — different SDK ecosystem |
| **Brave Search API** | ❌ Replaced | Returns snippets like Bing; initially implemented then swapped for Tavily |

Full rationale in `docs/html-presentation-plan.md` Section 11b.

### Configuration

```
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxx
```

Free tier: 1,000 searches/month at [tavily.com](https://tavily.com).

### API Usage

```typescript
const res = await fetch("https://api.tavily.com/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    api_key: process.env.TAVILY_API_KEY,
    query: "search query here",
    max_results: 5,
    search_depth: "advanced",
    include_answer: true,
  }),
});
const data = await res.json();
// data.answer — AI-generated summary
// data.results[] — { title, url, content (full extracted text) }
```

### Where It's Used

1. **Agent web_search tool** (`src/lib/agent/copilot-agent.ts`)
   - `defineTool("web_search", ...)` — available during presentation generation
   - Called by the model to find latest data, statistics, developments

2. **Knowledge refresh endpoint** (`src/app/api/knowledge/refresh/route.ts`)
   - POST `/api/knowledge/refresh` with `{ topic }`
   - Searches Tavily per section, synthesizes via Copilot SDK, writes updated `.md` files

3. **Knowledge refresh UI** (`src/components/KnowledgeRefresh.tsx`)
   - Client component on the dashboard
   - Per-topic refresh buttons + "Refresh All"

## Knowledge Library

### Structure

```
src/data/knowledge/
├── copilot/           # GitHub Copilot
│   ├── overview.md
│   ├── features.md
│   ├── architecture.md
│   └── use-cases.md
├── copilot-cli/       # GitHub Copilot CLI
├── copilot-sdk/       # GitHub Copilot SDK (has code-examples.md too)
└── foundry/           # Azure AI Foundry
```

### Loading Knowledge

```typescript
import { loadKnowledge } from "@/lib/agent/knowledge";

// Load all sections for a topic
const all = loadKnowledge("copilot-sdk");

// Load a specific section
const overview = loadKnowledge("copilot-sdk", "overview");
```

### Topic Key Mapping

| UI/DB Key | Knowledge Directory |
|-----------|-------------------|
| `copilot` | `copilot/` |
| `copilot-cli` | `copilot-cli/` |
| `copilot-sdk` | `copilot-sdk/` |
| `microsoft-foundry` | `foundry/` |

The mapping is in `TOPIC_DIR_MAP` in `copilot-agent.ts`.

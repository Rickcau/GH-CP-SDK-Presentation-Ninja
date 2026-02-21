# HTML Presentation System — Comprehensive Plan

## Executive Summary

Replace the current React-component slide renderer (Tailwind CSS layouts rendered in-app) with a **self-contained HTML presentation generator** inspired by the stunning examples in `assets/full-examples/`. The new system outputs single-file HTML presentations with CSS animations, SVG data visualizations, glassmorphism card designs, and a built-in navigation framework — identical in quality to what the soligence-presents-v4 pipeline produces.

The Copilot SDK remains the orchestration layer, but instead of calling `generate_slide` to produce structured JSON that maps to React components, the pipeline will prompt the LLM to **generate raw HTML/CSS `<div>` fragments per slide**, then assemble them into a final self-contained HTML file.

---

## 1. What We Have Today

### Current Slide System
- **10 React layout components**: TitleSlide, ContentSlide, SplitSlide, CodeSlide, StatSlide, ComparisonSlide, TimelineSlide, QuoteSlide, BentoSlide, ChartSlide
- **5 Tailwind CSS themes**: dark-luxe, tech-gradient, clean-corporate, bold-statement, warm-minimal
- **Structured data model**: `SlideContent` interface with `layout`, `title`, `content[]`, optional `codeExample`, `chartData`
- **In-app presenter**: React `SlidePresenter` component with keyboard nav, speaker notes popup
- **PPTX export**: `pptxgenjs` library converts structured data to PowerPoint

### Current Agent Flow
The Copilot SDK agent creates a session with two tools:
1. `search_knowledge` — loads curated markdown from `src/data/knowledge/`
2. `generate_slide` — captures structured JSON per slide (layout, title, keyPoints, etc.)

The agent calls `generate_slide` N times, each call validated by a Zod schema, and the app renders them as React components.

### Limitations
- Layouts are rigid — limited to the 10 pre-built React components
- No animations, no SVG diagrams, no glassmorphism, no gradient text
- Visual quality is far below the HTML examples in `assets/full-examples/`
- Themes are Tailwind class strings that can't produce the rich visual effects the HTML examples show
- Charts/diagrams are basic (no hype cycles, hub-spoke, Venn, pyramids, annotated diagrams)

---

## 2. What the HTML Examples Demonstrate

Analysis of the three presentations in `assets/full-examples/` reveals:

### Shared Framework (Invariant Shell)
All three presentations share an **identical deck framework**:
- Dark base: `background: #02040a`
- Navigation: Prev/Next buttons (44×44px circles, backdrop-blur), keyboard (arrows, space), touch/swipe
- Progress bar: 3px height, `linear-gradient(90deg, #22d3ee, #a78bfa)`, position fixed top
- Slide counter: fixed bottom-left, tabular-nums
- Transitions: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)` between slides
- Speaker notes: popup window with `postMessage` two-way sync
- Content max-width: 900–1100px centered

### Visual Design System
| Element | Technique |
|---------|-----------|
| **Card style** | `background: rgba(255,255,255,0.03)`, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur(10px)`, `border-radius: 16px` |
| **Gradient text** | `background: linear-gradient(135deg, colorA, colorB)`, `-webkit-background-clip: text`, `-webkit-text-fill-color: transparent` |
| **Floating orbs** | 400–800px radial-gradient circles, `filter: blur(60px)`, low opacity (`0.05–0.15`), positioned at corners |
| **Grid overlay** | `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)` at 40px intervals, masked to fade |
| **Icon boxes** | 32–48px square, rounded, colored `rgba` background + SVG stroke icon |
| **Accent badges** | `border-radius: 50px`, small pill with colored background + text |

### 18 Slide Layout Types Cataloged

| # | Layout | Description | Visual Complexity |
|---|--------|-------------|-------------------|
| 1 | **Title + Agenda Grid** | Centered hero title + 2×2 or 3-col agenda cards | Medium |
| 2 | **2×2 Card Grid** | Header + 4 glassmorphism cards in grid | Medium |
| 3 | **Split Text + Visual** | Left text column + right diagram/illustration | High |
| 4 | **Quote / Hero Statement** | Large centered quote in decorative card | Low |
| 5 | **Hub-and-Spoke Diagram** | Center hub + 4 satellite cards + SVG paths | High |
| 6 | **Before/After Comparison** | Two columns with arrow/divider between | Medium |
| 7 | **Timeline** | Horizontal line with milestone nodes | Medium |
| 8 | **Bar Chart** | Animated vertical bars with grid background | High |
| 9 | **Hype Cycle / Line Chart** | SVG path curve with animated draw + markers | High |
| 10 | **Pyramid Layers** | 3 stacked layers, increasing width | Medium |
| 11 | **Venn Diagram** | Overlapping circles with pulsing intersection | Medium |
| 12 | **Battery/Grid Visualization** | Custom grid with scanning animation | High |
| 13 | **Vertical Flow Diagram** | Stacked cards + SVG arrow connectors | Medium |
| 14 | **Annotated Diagram** | Central illustration + labeled callout cards | High |
| 15 | **4-Column / 3-Column Card Grid** | Equal cards side by side | Medium |
| 16 | **Simulated Screen** | Monitor frame with HUD/OSD overlay | High |
| 17 | **Checklist Card** | Glassmorphism card with check/uncheck rows | Medium |
| 18 | **Closing / CTA Slide** | Hero title + action cards + footer | Medium |

### Animation Catalog
- **Entry**: fadeIn, slideUp, slideInRight, scaleIn, popIn — staggered with 0.1–0.15s delay per item
- **Persistent**: pulse, float, glow, scan, flow (SVG stroke-dashoffset cycling), spin
- **Data viz**: growBar (bar chart), drawLine (SVG path tracing), slideRight (timeline progress)
- **Pattern**: Per-slide scoped keyframes with `-N` suffix (`fadeIn-0`, `fadeIn-1`, etc.) to avoid conflicts

### Color Theme System
5 accent colors used across all presentations:
| Color | Hex | Role |
|-------|-----|------|
| Cyan | `#22d3ee` | Primary accent |
| Violet | `#a78bfa` | Secondary accent |
| Emerald | `#34d399` | Tertiary / success |
| Rose | `#fb7185` | Warning / contrast |
| Amber | `#fbbf24` | Quaternary |

Presentations pick 2–3 from this palette and apply them consistently. The progress bar gradient (`#22d3ee → #a78bfa`) is shared across all.

---

## 3. The Soligence Pipeline (Reference Architecture)

From `Rickcau/soligence-presents-v4`, the working pipeline is:

```
POST /api/generate
    │
    ▼
┌─ Phase 1: Research ────────────────────────────────────────┐
│  Tavily web search per topic (parallel)                    │
│  LLM synthesis → structured JSON (facts, stats, quotes)    │
│  Model: RESEARCH_MODEL (google/gemini-2.5-flash)           │
│  Concurrency: RESEARCH_CONCURRENCY (default 8)             │
└────────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Phase 2: Planning ───────────────────────────────────────┐
│  LLM plans slide outline from research                    │
│  Output: SlidePlan[] with title, contentType, bullets,    │
│          visual suggestion, speakerNotes                  │
│  Model: PLANNING_MODEL (google/gemini-3-pro-preview)      │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Phase 3: Code Generation (parallel, chunked) ────────────┐
│  Per-slide: LLM generates a self-contained <div> with     │
│  inline styles, scoped CSS keyframes, SVG diagrams        │
│  buildCodegenPrompt(plan, slideIndex, totalSlides)        │
│  Model: CODEGEN_MODEL (google/gemini-3-pro-preview)       │
│  Concurrency: CODEGEN_CONCURRENCY (default 4)             │
│  Output: string[] of HTML div fragments                   │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Phase 4: Assembly ───────────────────────────────────────┐
│  assembleHtmlDocument(title, divs[], speakerNotes[])      │
│  Wraps divs in shell: nav, progress bar, transitions,     │
│  keyboard/touch handlers, speaker notes popup             │
│  Output: Single self-contained .html file                 │
└───────────────────────────────────────────────────────────┘
```

**Key insight**: The LLM generates raw HTML/CSS per slide — no React, no build tooling. The "design system" is enforced via the codegen prompt, not via code.

---

## 4. Proposed Architecture

### 4.1 New Output Format: Self-Contained HTML

Instead of structured JSON → React components, the pipeline produces:
- **Per-slide**: A `<div class="slide" data-index="N">` containing inline styles + scoped CSS + SVG + content
- **Assembly**: Wrap all slide divs in the invariant HTML shell (nav, progress bar, transitions, keyboard, speaker notes)
- **Export**: Download as a single `.html` file (works offline, no dependencies)

The in-app viewer uses an `<iframe>` to render the HTML presentation.

### 4.2 Pipeline (Adapted for Copilot SDK)

```
User Request (topic, audience, style, slideCount)
    │
    ▼
┌─ Step 1: Research (Copilot SDK Session) ──────────────────┐
│  Model: fast model (gpt-4o-mini)                          │
│  Tools: search_knowledge, [web_search future]             │
│  Output: structured research summary → context.research   │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Step 2: Plan (Copilot SDK Session) ──────────────────────┐
│  Model: reasoning model (o3-mini)                         │
│  Tools: none (pure reasoning)                             │
│  Input: research + slideCount + style preference          │
│  Output: SlidePlan[] with layout type, title, bullets,    │
│          visual suggestion, color accents                 │
│  Validates: each plan.layout ∈ LAYOUT_CATALOG             │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Step 3: Generate HTML (Copilot SDK Session) ─────────────┐
│  Model: capable model (gpt-4o, gpt-4.1)                   │
│  Tools: submit_slide_html                                 │
│  Input: slide plan + design system prompt + reference     │
│         HTML snippets for the chosen layout               │
│  Output: Raw HTML <div> per slide                         │
│  Generates slides sequentially or in parallel sessions    │
└───────────────────────────────────────────────────────────┘
    │
    ▼
┌─ Step 4: Assemble ────────────────────────────────────────┐
│  No LLM — pure code                                       │
│  assembleHtmlPresentation(title, htmlDivs[], notes[])     │
│  Wraps in shell: nav, progress bar, transitions, etc.     │
│  Output: Complete self-contained HTML string              │
└───────────────────────────────────────────────────────────┘
    │
    ▼
Save to DB + filesystem → Render in <iframe> or download
```

### 4.3 The Design System Prompt

The key to consistent, high-quality output is a **detailed design system prompt** given to the codegen model. This replaces React components as the "template system."

The prompt includes:
1. **Base design rules** — dark background (#02040a), glassmorphism card recipe, gradient text recipe, floating orb recipe, icon box recipe
2. **Color theme** — 2–3 accent colors from the 5-color palette, chosen per presentation
3. **Layout specification** — For the planned layout type, a structural description + reference HTML snippet
4. **Animation rules** — Use scoped keyframes with `-{slideIndex}` suffix, stagger children by 0.1s
5. **Constraints** — All styles inline or in a `<style>` tag within the slide div, no external dependencies, no JavaScript in individual slides

### 4.4 Layout Reference Snippets

For each of the 18 layout types, extract a **sanitized reference snippet** from the HTML examples. These snippets serve as few-shot examples in the codegen prompt.

Store these in `src/data/templates/layouts/`:
```
src/data/templates/
├── layouts/
│   ├── title-agenda.html        # Title slide with agenda grid
│   ├── card-grid-2x2.html       # 2×2 card grid
│   ├── card-grid-3col.html      # 3-column card grid
│   ├── split-text-visual.html   # Text + diagram split
│   ├── quote-hero.html          # Large quote card
│   ├── hub-spoke.html           # Hub-and-spoke diagram
│   ├── comparison.html          # Before/after columns
│   ├── timeline.html            # Horizontal timeline
│   ├── bar-chart.html           # Animated bar chart
│   ├── line-chart.html          # SVG line/hype cycle
│   ├── pyramid.html             # Stacked pyramid layers
│   ├── venn-diagram.html        # Overlapping circles
│   ├── vertical-flow.html       # Stacked cards + connectors
│   ├── annotated-diagram.html   # Central image + callouts
│   ├── checklist.html           # Check/uncheck rows
│   ├── closing-cta.html         # Closing slide with CTAs
│   └── simulated-screen.html    # Monitor/HUD frame
├── shell.html                   # The invariant deck framework
├── design-system.md             # Design rules as prompt text
└── themes/
    ├── cyan-violet.json         # {primary: "#22d3ee", secondary: "#a78bfa", ...}
    ├── emerald-cyan.json        # {primary: "#34d399", secondary: "#22d3ee", ...}
    ├── amber-rose.json          # {primary: "#fbbf24", secondary: "#fb7185", ...}
    └── violet-rose.json         # {primary: "#a78bfa", secondary: "#fb7185", ...}
```

Each layout snippet is ~50–150 lines of representative HTML with **placeholder content** (titles, bullets, data replaced with `{{TITLE}}`, `{{BULLETS}}`, etc.) so the LLM understands the structure it should produce.

### 4.5 Color Theme System

Replace the current 5 Tailwind theme objects with JSON color themes:

```json
{
  "name": "Cyan Violet",
  "primary": "#22d3ee",
  "secondary": "#a78bfa",
  "tertiary": "#34d399",
  "warning": "#fb7185",
  "background": "#02040a",
  "surface": "rgba(255,255,255,0.03)",
  "border": "rgba(255,255,255,0.08)",
  "text": "#ffffff",
  "textMuted": "rgba(255,255,255,0.6)",
  "gradientTitle": "linear-gradient(135deg, #22d3ee, #a78bfa)",
  "progressBar": "linear-gradient(90deg, #22d3ee, #a78bfa)"
}
```

The theme JSON is injected into the codegen prompt and the assembly shell.

---

## 5. New & Modified Components

### 5.1 New Files

| File | Purpose |
|------|---------|
| `src/data/templates/shell.html` | Invariant HTML deck framework (nav, progress, transitions, keyboard, speaker notes) |
| `src/data/templates/design-system.md` | Design rules prompt text for the codegen model |
| `src/data/templates/layouts/*.html` | Reference HTML snippets for each layout type (~18 files) |
| `src/data/templates/themes/*.json` | Color theme definitions (~4 files) |
| `src/lib/pipeline/index.ts` | Pipeline orchestrator — runs steps sequentially, manages context |
| `src/lib/pipeline/steps/research.ts` | Step 1: Research via Copilot SDK session |
| `src/lib/pipeline/steps/plan.ts` | Step 2: Planning via Copilot SDK session |
| `src/lib/pipeline/steps/generate-html.ts` | Step 3: HTML codegen via Copilot SDK session(s) |
| `src/lib/pipeline/steps/assemble.ts` | Step 4: Pure-code assembly (no LLM) |
| `src/lib/pipeline/types.ts` | Pipeline interfaces (PipelineContext, PipelineStep, SlidePlan, etc.) |
| `src/lib/pipeline/prompts.ts` | Prompt builders for each pipeline step |
| `src/components/HtmlPresenter.tsx` | iframe-based HTML presentation viewer |
| `src/app/api/export/html/route.ts` | Download endpoint for generated HTML file |

### 5.2 Modified Files

| File | Change |
|------|--------|
| `src/app/api/agent/route.ts` | Switch from single-session agent to pipeline orchestrator |
| `src/app/(app)/presentations/new/page.tsx` | Replace theme selector with color theme picker, add layout style preference |
| `src/app/(app)/presentations/[id]/page.tsx` | Switch from React `SlidePresenter` to `HtmlPresenter` (iframe) |
| `src/lib/db.ts` | Add `htmlContent` column to presentations table for storing generated HTML |
| `src/lib/agent/types.ts` | Extend `AgentEvent` with pipeline phase events |

### 5.3 Preserved (Keep Working)

| File | Why |
|------|-----|
| `src/components/slides/*` | Keep React slide system for backward compatibility / fallback |
| `src/lib/export/pptx.ts` | Keep PPTX export (generate from structured data if available) |
| `src/lib/agent/mock-agent.ts` | Keep as fallback when SDK is unavailable |
| `src/lib/agent/knowledge.ts` | Keep — research step still uses curated knowledge packs |

---

## 6. Assembly Function

The `assembleHtmlPresentation()` function is pure code (no LLM). It:

1. Reads `src/data/templates/shell.html`
2. Injects the color theme CSS variables
3. Injects all slide `<div>` fragments into the deck container
4. Injects speaker notes JSON for the notes popup
5. Returns a complete, self-contained HTML string

```typescript
function assembleHtmlPresentation(
  title: string,
  slideHtmlDivs: string[],
  theme: ColorTheme,
  speakerNotes?: { title: string; notes: string }[],
): string
```

The shell template includes:
- CSS reset + base styles (dark background, font stack, slide transitions)
- Progress bar with theme gradient
- Navigation buttons (prev/next circles)
- Slide counter
- Keyboard handler (arrows, space, escape)
- Touch/swipe handler
- Speaker notes popup system (`window.open` + `postMessage`)

---

## 7. The Codegen Prompt Strategy

For Step 3 (HTML generation), each slide gets a prompt built from:

```
[System Message]
  Design system rules (from design-system.md)
  Color theme (from selected theme JSON)
  Animation rules (scoped keyframes with slide index suffix)

[User Message]
  Slide plan:
    - Title: "{{title}}"
    - Subtitle: "{{subtitle}}"
    - Layout: "hub-spoke"
    - Key points: ["point 1", "point 2", ...]
    - Visual suggestion: "Central AI hub with 4 capability satellite cards"
    - Slide index: 4 of 12

  Reference layout (from layouts/hub-spoke.html):
    <div class="slide" data-index="{{N}}"> ... </div>

  Generate a single <div class="slide" data-index="4"> element.
  Use the reference as a structural guide but create original content.
  Use the color theme provided. Scope all keyframe names with -4 suffix.
```

This gives the LLM:
- **Structural guidance** via the reference snippet (what elements to create)
- **Content direction** via the slide plan (what to say)
- **Visual consistency** via the design system + color theme (how it should look)
- **Isolation rules** via the animation suffix convention (no style conflicts)

---

## 8. In-App Viewer

Replace direct React rendering with an iframe:

```tsx
function HtmlPresenter({ htmlContent }: { htmlContent: string }) {
  return (
    <iframe
      srcDoc={htmlContent}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-popups"
      title="Presentation"
    />
  );
}
```

The iframe approach:
- Renders the exact same HTML as the exported file
- CSS/JS isolation — presentation styles can't leak into the app
- Speaker notes popup works via `window.open` inside the iframe
- Full keyboard/touch navigation works inside the iframe

---

## 9. Export Paths

| Format | Method |
|--------|--------|
| **HTML** | Direct download of the generated HTML string (primary) |
| **PPTX** | Parse slide divs → extract text content → generate via pptxgenjs (best-effort, loses visual richness) |
| **PDF** | Future: Puppeteer/Playwright server-side rendering of the HTML to PDF |

HTML is the primary and highest-fidelity export. The HTML file works offline, opens in any browser, and looks exactly like the in-app viewer.

---

## 10. Implementation Phases

### Phase 1: Foundation (Templates + Assembly)
1. Extract the invariant shell from the HTML examples → `shell.html`
2. Extract 8–10 sanitized layout reference snippets → `layouts/*.html`
3. Create 3–4 color theme JSON files → `themes/*.json`
4. Write the `assembleHtmlPresentation()` function
5. Create `HtmlPresenter` iframe viewer component
6. Add HTML download endpoint

**Deliverable**: Can manually compose HTML divs and view/download a complete presentation.

### Phase 2: Codegen Step (LLM → HTML)
1. Write `design-system.md` prompt text
2. Write `prompts.ts` with `buildCodegenPrompt(plan, slideIndex, totalSlides, theme, layoutRef)`
3. Create `generate-html.ts` pipeline step — creates a Copilot SDK session, sends one prompt per slide, collects HTML div output
4. Wire assembly to codegen output
5. Test end-to-end: structured slide plan → LLM → HTML divs → assembled presentation

**Deliverable**: Given a hardcoded slide plan, produces a complete HTML presentation via LLM.

### Phase 3: Planning Step
1. Write planning prompt that outputs slide plans with layout types from the catalog
2. Create `plan.ts` pipeline step
3. Connect plan output to codegen input

**Deliverable**: Given research text, produces a slide plan that drives codegen.

### Phase 4: Research Step + Full Pipeline
1. Create `research.ts` pipeline step (reuses existing `search_knowledge` tool)
2. Create `pipeline/index.ts` orchestrator that chains Research → Plan → Codegen → Assembly
3. Wire into the `/api/agent` route
4. Update the UI: replace current theme selector with color theme + style options, show pipeline progress

**Deliverable**: Full end-to-end pipeline from user prompt to HTML presentation.

### Phase 5: Polish & Extend
1. Extract remaining layout reference snippets (all 18)
2. Add more color themes
3. Implement PPTX export from HTML (best-effort text extraction)
4. Add pipeline preset selector (Fast/Balanced/High Quality)
5. Add review/polish step (optional Step 4 from pipeline-design.md)

---

## 11. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **HTML over React components** | The HTML examples demonstrate visual quality that can't be achieved with Tailwind utility classes. LLMs are excellent at generating HTML/CSS. Self-contained output works everywhere. |
| **Design system via prompt, not code** | Instead of constraining the LLM to a fixed component API, we give it a design system document + reference snippets and let it produce creative variations. This unlocks the full range of CSS creativity. |
| **Layout reference snippets** | Few-shot examples in the prompt dramatically improve output quality and consistency. The LLM sees the expected structure and produces similar-quality HTML. |
| **Scoped keyframe naming** | The `-{slideIndex}` suffix convention prevents animation name collisions when all slides are in one document. This is proven across all 3 example presentations. |
| **iframe viewer** | Perfect CSS/JS isolation. The rendered presentation looks exactly like the exported file. No risk of app styles breaking presentation styles or vice versa. |
| **Keep React slide system** | Backward compatibility. Existing presentations keep working. Fallback for when the SDK/LLM is unavailable (mock agent path). |
| **No build tooling for slides** | Following soligence-presents-v4's approach: LLM generates HTML directly, assembly is string concatenation. No Vite, no webpack, no compile step. |

---

## 11b. Web Search Provider Decision

### Chosen: **Tavily Search API**

The agent and knowledge-refresh features require web search to ground presentations with current data. Four options were evaluated:

| Provider | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Tavily** | Purpose-built for LLM agents; returns pre-extracted full-text content (not just snippets); `include_answer: true` provides an LLM-ready summary; `search_depth: "advanced"` for deeper extraction; simple REST API with one env var (`TAVILY_API_KEY`); free tier 1,000 searches/month; no Azure dependency; already proven in the soligence-presents-v4 pipeline | Smaller company; less brand recognition than Bing | **Selected** |
| **Bing Search API** (standalone) | Microsoft product; large index; 1,000 free calls/month | Returns short snippets + URLs only — must fetch & parse each page to get usable content for an LLM; requires Azure subscription to create a "Bing Search" resource; significant extra code for page fetching/parsing; higher latency (search + N page fetches) | Rejected — too much extra work for LLM use case |
| **Azure AI Foundry Web Search tool (preview)** | Microsoft's recommended approach; Bing-powered; managed resource; no separate Bing resource needed (preview); supports `user_location` for geo-relevant results | Only works within Azure AI Foundry Agent Service (`azure-ai-projects` SDK); requires `AZURE_AI_PROJECT_ENDPOINT` + Foundry project setup; **incompatible with GitHub Copilot SDK** which is our orchestration layer; incurs additional costs; data flows outside Azure compliance boundary | Rejected — wrong SDK ecosystem |
| **Brave Search API** | Good free tier (2,000/month); simple REST API | Returns snippets + URLs (like Bing), not full extracted content; less proven for LLM agent use cases; still requires page fetching for rich context | Initially implemented, then replaced by Tavily |

### Key Reasoning

1. **LLM-optimized output**: Tavily returns full extracted page content per result, plus an optional AI-generated answer summary. Bing and Brave return short snippets (1–2 sentences) requiring additional page fetching and HTML parsing to get usable LLM context.

2. **Foundry is the wrong SDK**: Azure AI Foundry's `WebSearchPreviewTool` is a first-party agent tool that only works with Python/C#/JS `azure-ai-projects` SDK and requires a Foundry project endpoint. Our app uses the **GitHub Copilot SDK** (`@github/copilot-sdk`), which has its own session/tool system (`defineTool`). The two are incompatible — you can't use Foundry agent tools inside a Copilot SDK session.

3. **Proven in practice**: The soligence-presents-v4 pipeline (our reference architecture) already uses Tavily successfully for the research phase, confirming it produces high-quality grounding data for slide generation.

4. **Minimal setup**: A single `TAVILY_API_KEY` environment variable. No Azure subscription, no resource provisioning, no multi-step portal configuration.

### Environment Variable

```
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxx
```

Get a free key at [tavily.com](https://tavily.com). Free tier: 1,000 searches/month.

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LLM produces inconsistent HTML quality | Strong design system prompt + layout reference snippets provide guardrails. Assembly validates that each div has correct `data-index`. |
| Slide HTML is too large (token budget) | Most slides are 100–300 lines. Cap at 500 lines per slide. Use concise prompts. |
| CSS conflicts between slides | Scoped keyframe naming (`-N` suffix). All styles are inline or in slide-scoped `<style>` tags. |
| LLM hallucinates SVG diagrams | Include working SVG examples in reference snippets. Simpler layouts (card grids, timelines) are more reliable than complex diagrams (hype cycles, annotated illustrations). Start with medium-complexity layouts. |
| Copilot SDK rate limits / timeouts | Generate slides sequentially with proper timeouts. Support partial results (show completed slides even if later ones fail). |
| HTML injection / XSS in generated content | The HTML is generated by our LLM from controlled input, not from user-supplied HTML. The iframe has `sandbox` attribute limiting capabilities. |

---

## Appendix: Layout Catalog Quick Reference

For the planning step's prompt — valid layout type values:

```
title-agenda      — Opening slide with hero title + agenda grid
card-grid         — 2×2 or 3-col equal glassmorphism cards
split-visual      — Text column + diagram/illustration column
quote-hero        — Large centered quote card
hub-spoke         — Central hub + satellite cards + SVG paths
comparison        — Two-column before/after or vs layout
timeline          — Horizontal progress line with milestones
bar-chart         — Animated vertical bars with labels
line-chart        — SVG curve with markers (hype cycle, trends)
pyramid           — Stacked horizontal layers
venn-diagram      — Overlapping circles with intersection
vertical-flow     — Stacked cards connected by arrows
annotated-diagram — Central visual + labeled callout cards
checklist         — Card with check/uncheck rows
closing-cta       — Closing slide with action cards + footer
content           — General text + bullets (fallback)
```

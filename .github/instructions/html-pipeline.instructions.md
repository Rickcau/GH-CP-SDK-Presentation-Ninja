# HTML Presentation Pipeline — Reference

This document summarizes the HTML presentation system design for quick Copilot reference.
Full details in `docs/html-presentation-plan.md`.

## Pipeline Overview

```
User Request → Research → Plan → Generate HTML → Assemble → Save/View
```

Each step is a **separate Copilot SDK session** with its own model and tools.

## Pipeline Steps

### Step 1: Research
- **Model**: Fast (gpt-4o-mini)
- **Tools**: `search_knowledge`, `web_search`
- **Output**: Structured research summary

### Step 2: Plan
- **Model**: Reasoning (o3-mini)
- **Tools**: None (pure reasoning)
- **Input**: Research + slideCount + deckType
- **Output**: `SlidePlan[]` with layout type, title, bullets, visual suggestion

### Step 3: Generate HTML
- **Model**: Capable (gpt-4.1)
- **Tools**: `submit_slide_html`
- **Input**: Slide plan + design system prompt + layout reference snippet
- **Output**: Raw `<div class="slide" data-index="N">` per slide

### Step 4: Assemble
- **No LLM** — pure TypeScript code
- Reads `src/data/templates/shell.html`
- Injects theme CSS variables, slide divs, speaker notes
- **Output**: Complete self-contained HTML string

## Layout Types (16 valid values)

```
title-agenda, card-grid, split-visual, quote-hero,
hub-spoke, comparison, timeline, bar-chart,
line-chart, pyramid, venn-diagram, vertical-flow,
annotated-diagram, checklist, closing-cta, content
```

## Design System

All slides inherit a shared visual design:
- Dark base: `background: #02040a`
- Glassmorphism cards: `rgba(255,255,255,0.03)` bg + `blur(10px)` + `rgba(255,255,255,0.08)` border
- Gradient text: `linear-gradient(135deg, colorA, colorB)` with `-webkit-background-clip: text`
- Scoped animations: Keyframes suffixed with `-{slideIndex}` to prevent conflicts
- Icon boxes: 32-48px square with colored `rgba` background + SVG stroke icons

## Color Theme System

Themes are JSON objects with named colors:
```json
{
  "primary": "#22d3ee",
  "secondary": "#a78bfa",
  "tertiary": "#34d399",
  "background": "#02040a",
  "surface": "rgba(255,255,255,0.03)",
  "border": "rgba(255,255,255,0.08)"
}
```

5 accent colors: Cyan (#22d3ee), Violet (#a78bfa), Emerald (#34d399), Rose (#fb7185), Amber (#fbbf24)

## File Structure

```
src/data/templates/
├── shell.html            # Invariant deck framework
├── design-system.md      # Design rules as prompt text
├── layouts/              # Reference HTML snippets per layout type
│   ├── title-agenda.html
│   ├── card-grid-2x2.html
│   ├── hub-spoke.html
│   └── ...
└── themes/               # Color theme JSON files
    ├── cyan-violet.json
    └── ...

src/lib/pipeline/
├── index.ts              # Pipeline orchestrator
├── types.ts              # PipelineContext, PipelineStep
├── prompts.ts            # Prompt builders per step
└── steps/
    ├── research.ts
    ├── plan.ts
    ├── generate-html.ts
    └── assemble.ts
```

## Viewer

HTML presentations are rendered in an `<iframe>` with `sandbox="allow-scripts allow-popups"` for CSS/JS isolation.

## Export

- **HTML**: Primary — download the generated `.html` file directly
- **PPTX**: Best-effort text extraction from HTML divs
- **PDF**: Future — Puppeteer/Playwright server-side rendering

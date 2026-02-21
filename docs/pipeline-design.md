# Multi-Step Pipeline Design

## Problem

The current architecture uses a **single Copilot SDK session** with one model to handle the entire presentation generation flow — research, planning, content generation, and review — in one prompt. This limits flexibility:

- No ability to use different models for different steps (e.g., a fast model for research, a reasoning model for planning)
- No way to run multiple agents with specialized roles
- No intermediate checkpoints or ability to retry individual steps
- Difficult to optimize cost vs. quality per step

## Proposed Architecture

Refactor generation into a **pipeline of discrete steps**, each with its own SDK session, model, tools, and prompt.

### Pipeline Steps

| Step | Name | Purpose | Ideal Model Type | Tools |
|------|------|---------|-----------------|-------|
| 1 | **Research** | Gather and summarize knowledge about the topic | Fast/cheap (e.g., `gpt-4o-mini`) | `search_knowledge`, `web_search` |
| 2 | **Plan** | Create presentation outline — pick layouts, structure the narrative flow | Reasoning (e.g., `o3-mini`) | None (pure reasoning from research output) |
| 3 | **Generate** | Produce detailed slide content, code examples, statistics, chart data | Capable (e.g., `gpt-4o`, `gpt-4.1`) | `generate_slide` |
| 4 | **Review** | Check accuracy, improve coherence, polish content, fix inconsistencies | Reasoning (e.g., `o3-mini`) | `update_slide` |

### Core Types

```typescript
interface PipelineStep {
  name: string;
  model?: string;                                    // Model override for this step
  systemMessage: string;                             // Step-specific system prompt
  tools: Tool[];                                     // Tools available to this step
  buildPrompt: (context: PipelineContext) => string;  // Builds the user prompt from accumulated context
}

interface PipelineContext {
  topic: Topic;
  deckType: DeckType;
  userPrompt: string;
  theme: string;
  slideCount: number;
  options: GenerationOptions;

  // Accumulated across steps
  research?: string;       // Output from Research step
  outline?: SlideOutline[];// Output from Plan step
  slides?: SlidePlan[];    // Output from Generate step
  reviewNotes?: string;    // Output from Review step
}

interface PipelineConfig {
  name: string;            // e.g., "fast", "balanced", "high-quality"
  steps: PipelineStep[];
}
```

### Data Flow

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Research                                            │
│   Model: gpt-4o-mini                                        │
│   Tools: search_knowledge, web_search                       │
│   Input: topic, deckType, userPrompt                        │
│   Output: research summary → context.research               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Plan                                                │
│   Model: o3-mini                                            │
│   Tools: none                                               │
│   Input: context.research + slideCount + deckType           │
│   Output: slide outline (layout + titles) → context.outline │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Generate                                            │
│   Model: gpt-4o                                             │
│   Tools: generate_slide                                     │
│   Input: context.outline + context.research                 │
│   Output: full slide content → context.slides               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Review (optional)                                   │
│   Model: o3-mini                                            │
│   Tools: update_slide                                       │
│   Input: context.slides                                     │
│   Output: polished slides → context.slides (updated)        │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Final Presentation
```

### Pipeline Presets

Users select a preset in the UI. Each preset defines which steps to run and which model to use per step.

| Preset | Steps | Model Mapping | Tradeoff |
|--------|-------|---------------|----------|
| **Fast** | Research → Generate | `gpt-4o-mini` for both | Fastest, lowest cost |
| **Balanced** | Research → Plan → Generate | `gpt-4o-mini` → `o3-mini` → `gpt-4o` | Good quality, reasonable speed |
| **High Quality** | Research → Plan → Generate → Review | `gpt-4o-mini` → `o3-mini` → `gpt-4.1` → `o3-mini` | Best quality, slower |
| **Custom** | User-configurable | User picks model per step | Full control |

### UI Changes

- Replace the single "AI Model" selector with a **Pipeline Preset** selector (Fast / Balanced / High Quality / Custom)
- In Custom mode, show an expandable section where users can pick models per step
- Status bar shows which pipeline step is currently executing
- Each step emits progress events so the UI can show: "Step 2/4: Planning slide structure..."

### Implementation Notes

- Each step creates and destroys its own `CopilotClient` + session
- The `PipelineContext` is the shared state object passed between steps
- Steps are executed sequentially — each one awaits the previous
- The generator (`AsyncGenerator<AgentEvent>`) yields status events between steps
- The existing single-session approach can be kept as the "Fast" preset (minimal refactor)
- `COPILOT_MODEL` env var becomes `COPILOT_MODEL_DEFAULT` — used when a step has no explicit model
- Pipeline configs could eventually be stored as JSON templates in `src/data/templates/`

### Future Extensions

- **Parallel steps**: Research step could search knowledge and web simultaneously
- **Conditional steps**: Skip Review if the user chose "Fast" preset
- **Custom pipelines**: Users define their own step sequences via a pipeline editor
- **Step retry**: If a step fails, retry with a different model or adjusted prompt
- **Caching**: Cache Research output so re-generating with a different theme doesn't re-fetch

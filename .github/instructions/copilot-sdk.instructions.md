# Copilot SDK — Quick Reference

Reference for working with `@github/copilot-sdk` in this project.

## Core Concepts

### CopilotClient

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";

const client = new CopilotClient({ logLevel: "info" });
await client.start();       // Spawns the bundled Copilot CLI subprocess
await client.stop();        // Stops the subprocess
```

### Sessions

```typescript
const session = await client.createSession({
  model: "gpt-4.1",           // Optional — defaults to SDK default
  tools: [myTool1, myTool2],  // Tools registered for this session
  systemMessage: {
    mode: "append",            // "append" to add to default system message
    content: "You are a presentation generator..."
  },
  availableTools: ["tool_name_1", "tool_name_2"],
});

// Send a prompt and wait for completion (with timeout)
const response = await session.sendAndWait({ prompt: "..." }, 180000);

// Listen to all events
session.on((event) => { /* handle event */ });

// Cleanup
await session.destroy();
```

### Defining Tools

```typescript
import { z } from "zod";

const myTool = defineTool("tool_name", {
  description: "What this tool does",
  parameters: z.object({
    param1: z.string().describe("Description of param1"),
    param2: z.number().optional().describe("Optional param"),
  }),
  handler: async (args) => {
    // args is typed from the zod schema
    // Return a string — this is what the model sees
    return "Tool result as string";
  },
});
```

### Listing Models

```typescript
const models = await client.listModels();
// Returns ModelInfo[] with id, capabilities, policy, billing
```

### Auth Status

```typescript
const authStatus = await client.getAuthStatus();
```

## Available Models (via GitHub Copilot)

| Model | ID | Type |
|-------|-----|------|
| GPT-5 | `gpt-5` | Most capable |
| GPT-4.1 | `gpt-4.1` | Fast + capable |
| GPT-4.1 Mini | `gpt-4.1-mini` | Lightweight |
| GPT-4.1 Nano | `gpt-4.1-nano` | Ultra-lightweight |
| GPT-4o | `gpt-4o` | Multimodal |
| GPT-4o Mini | `gpt-4o-mini` | Compact multimodal |
| Claude Sonnet 4.5 | `claude-sonnet-4.5` | Anthropic latest |
| Claude Sonnet 4 | `claude-sonnet-4` | Anthropic |
| o3-mini | `o3-mini` | Efficient reasoning |
| o4-mini | `o4-mini` | Latest reasoning |

**No Gemini models** — GitHub routes through OpenAI + Anthropic only.

## Requirements

- **Node.js 23.4+** (24 LTS recommended) — the bundled CLI uses `node:sqlite`
- **GITHUB_TOKEN** env var — PAT with Copilot access
- No need for `gh` CLI or `gh-copilot` extension

## Patterns Used in This Project

### Agent Tool Pattern
```typescript
const searchKnowledgeTool = defineTool("search_knowledge", {
  description: "Search the local knowledge library...",
  parameters: z.object({
    topic: z.string(),
    section: z.string().optional(),
  }),
  handler: async (args) => {
    return loadKnowledge(args.topic, args.section);
  },
});
```

### Session with Model Override
```typescript
const model = requestedModel || process.env.COPILOT_MODEL || undefined;
const session = await client.createSession({ model, tools: [...] });
```

### Pipeline Pattern (Multi-Session)
Each pipeline step creates its own client + session, runs, then cleans up:
```typescript
for (const step of pipelineSteps) {
  const client = new CopilotClient({ logLevel: "info" });
  await client.start();
  const session = await client.createSession({ model: step.model, ... });
  const response = await session.sendAndWait({ prompt: step.buildPrompt(context) });
  // Extract output, update context
  await session.destroy();
  await client.stop();
}
```

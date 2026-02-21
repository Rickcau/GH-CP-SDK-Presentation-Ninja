# GitHub Copilot SDK - Features

## defineTool - Custom Tool Definition

The `defineTool` function is the primary way to create tools that the AI model can invoke. Tools are defined with a name, description, parameter schema, and handler function.

### TypeScript with Zod Schemas
```typescript
import { defineTool } from "@github/copilot-sdk";
import { z } from "zod";

const searchDocsTool = defineTool({
  name: "search_docs",
  description: "Search the documentation for relevant information",
  parameters: z.object({
    query: z.string().describe("The search query"),
    maxResults: z.number().default(5).describe("Maximum number of results"),
    category: z.enum(["api", "guides", "tutorials"]).optional(),
  }),
  handler: async ({ query, maxResults, category }) => {
    const results = await searchIndex(query, { maxResults, category });
    return results.map(r => ({ title: r.title, content: r.snippet }));
  },
});
```

### Python with Pydantic Schemas
```python
from copilot_sdk import define_tool
from pydantic import BaseModel, Field

class SearchParams(BaseModel):
    query: str = Field(description="The search query")
    max_results: int = Field(default=5, description="Maximum number of results")

@define_tool(
    name="search_docs",
    description="Search the documentation for relevant information",
    parameters=SearchParams,
)
async def search_docs(params: SearchParams) -> list[dict]:
    results = await search_index(params.query, max_results=params.max_results)
    return [{"title": r.title, "content": r.snippet} for r in results]
```

### Tool Schema Requirements
- **name**: Unique identifier (lowercase, underscores allowed, no spaces)
- **description**: Clear description of what the tool does (used by the model to decide when to call it)
- **parameters**: Strongly-typed schema defining the tool's input parameters
- **handler**: Async function that executes the tool's logic and returns a result

## CopilotClient Configuration

### Client Options
```typescript
const client = new CopilotClient({
  // Path to the Copilot CLI binary (auto-detected if not specified)
  cliPath: "/usr/local/bin/gh",

  // Authentication token (uses gh auth if not specified)
  token: process.env.GITHUB_TOKEN,

  // BYOK configuration for custom model providers
  provider: {
    type: "azure-openai",
    endpoint: "https://my-resource.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: "2024-10-21",
  },

  // Logging configuration
  logLevel: "info", // "debug" | "info" | "warn" | "error"
});
```

## Session Options

### Creating Sessions with Configuration
```typescript
const session = await client.createSession({
  // Model selection
  model: "gpt-4o",  // "gpt-4o" | "gpt-4o-mini" | "claude-3.5-sonnet" | "o1" | etc.

  // System message (sets the agent's behavior and personality)
  systemMessage: `You are a presentation generator agent. You create
    professional PowerPoint presentations based on user requests.
    Always use the available tools to gather content before generating slides.`,

  // Tools available to the model
  tools: [searchDocsTool, createSlideTool, fetchDataTool],

  // Streaming configuration
  streaming: true,

  // Temperature (0.0 to 2.0, lower = more deterministic)
  temperature: 0.7,

  // Maximum tokens in the response
  maxTokens: 4096,
});
```

## Event-Based Streaming

### Subscribing to Events
```typescript
// Incremental text output
session.on("message_delta", (delta) => {
  // delta.content contains the new text chunk
  // delta.role is always "assistant"
  process.stdout.write(delta.content);
});

// Tool execution lifecycle
session.on("tool.execution_start", (event) => {
  console.log(`Tool started: ${event.toolName}(${JSON.stringify(event.parameters)})`);
});

session.on("tool.execution_complete", (event) => {
  console.log(`Tool completed: ${event.toolName} → ${JSON.stringify(event.result)}`);
});

// Session idle (all processing complete)
session.on("session.idle", () => {
  console.log("Session is idle, ready for next message");
});

// Error handling
session.on("error", (error) => {
  console.error(`Session error: ${error.message}`);
});
```

### Streaming to Frontend (SSE Pattern)
```typescript
// Express/Next.js API route
app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const session = await client.createSession({ streaming: true, tools });

  session.on("message_delta", (delta) => {
    res.write(`data: ${JSON.stringify({ type: "text", content: delta.content })}\n\n`);
  });

  session.on("tool.execution_start", (event) => {
    res.write(`data: ${JSON.stringify({ type: "tool_start", tool: event.toolName })}\n\n`);
  });

  session.on("session.idle", () => {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  });

  await session.send(req.body.message);
});
```

## Permission Control

### onPermissionRequest Callback
The SDK supports a permission system where the model can request user confirmation before executing sensitive tools:

```typescript
const session = await client.createSession({
  tools: [deleteFileTool, deployTool, readFileTool],

  onPermissionRequest: async (request) => {
    // request.toolName: name of the tool requesting permission
    // request.parameters: the parameters the tool would be called with
    // request.description: human-readable description of the action

    if (request.toolName === "delete_file") {
      // Prompt user for confirmation
      const confirmed = await promptUser(
        `The agent wants to delete: ${request.parameters.path}. Allow?`
      );
      return confirmed ? "allow" : "deny";
    }

    // Auto-approve read-only tools
    if (request.toolName === "read_file") {
      return "allow";
    }

    // Default: ask user
    return "ask";
  },
});
```

### Permission Levels
- **"allow"**: Tool execution proceeds without interruption
- **"deny"**: Tool execution is blocked; model receives a denial message
- **"ask"**: Default behavior; tool-specific permission handling

## Tool Filtering

### availableTools and excludedTools
Control which tools the model can use on a per-session or per-message basis:

```typescript
// Only allow specific tools
const session = await client.createSession({
  tools: [searchTool, writeTool, deleteTool, deployTool],
  availableTools: ["search_docs", "write_file"], // Only these two are visible to the model
});

// Exclude specific tools
const session2 = await client.createSession({
  tools: [searchTool, writeTool, deleteTool, deployTool],
  excludedTools: ["delete_file", "deploy"], // These are hidden from the model
});

// Dynamic filtering per message
await session.send("Clean up the project", {
  availableTools: ["delete_file", "search_docs"], // Override for this message only
});
```

## MCP Server Integration

The SDK supports Model Context Protocol (MCP) servers, allowing integration with standardized tool providers:

```typescript
const session = await client.createSession({
  model: "gpt-4o",
  tools: [myLocalTool],

  // MCP server configuration
  mcpServers: [
    {
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/workspace"],
    },
    {
      name: "database",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
    },
    {
      // Remote MCP server via SSE
      name: "remote-tools",
      url: "https://my-mcp-server.example.com/sse",
      headers: { Authorization: "Bearer token" },
    },
  ],
});

// Tools from MCP servers are automatically registered and available to the model
// alongside your custom tools defined via defineTool
```

## BYOK Support (Bring Your Own Key)

### Provider Configuration
```typescript
// Azure OpenAI
const client = new CopilotClient({
  provider: {
    type: "azure-openai",
    endpoint: "https://my-resource.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: "2024-10-21",
    deploymentName: "gpt-4o",
  },
});

// OpenAI Direct
const client = new CopilotClient({
  provider: {
    type: "openai",
    apiKey: process.env.OPENAI_API_KEY,
  },
});

// Anthropic
const client = new CopilotClient({
  provider: {
    type: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
});
```

## Ralph Loop Pattern

The Ralph Loop is a pattern for building autonomous agents that continue executing until a task is complete:

```typescript
const session = await client.createSession({
  model: "gpt-4o",
  systemMessage: "You are an autonomous agent that completes tasks step by step.",
  tools: [analyzeTool, planTool, executeTool, verifyTool],
});

// The Ralph Loop: send a task and let the agent work autonomously
// The agent will call tools repeatedly until it determines the task is complete
const result = await session.sendAndWait(
  "Analyze the codebase, create a test plan, implement the tests, and verify they pass"
);

// sendAndWait only resolves when the model produces a final text response
// (i.e., it has finished its autonomous tool-calling loop)
console.log(result.content); // Final summary from the agent
```

### Ralph Loop Characteristics
- The model autonomously decides which tools to call and in what order
- Multiple rounds of tool calls happen without user intervention
- The model determines when the task is complete
- `sendAndWait` blocks until the full agentic loop finishes
- Streaming events still fire during the loop for real-time visibility

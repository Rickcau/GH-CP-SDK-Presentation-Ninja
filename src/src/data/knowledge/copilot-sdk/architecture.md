# GitHub Copilot SDK - Architecture

## System Architecture

The Copilot SDK follows a layered architecture where your application communicates with the AI model through a chain of components:

```
┌──────────────────────────────────────────┐
│           Your Application               │
│  (Next.js, Express, CLI tool, etc.)      │
├──────────────────────────────────────────┤
│           Copilot SDK Client             │
│  - CopilotClient                         │
│  - Session management                    │
│  - Tool registration                     │
│  - Event handling                        │
├──────────────────────────────────────────┤
│           JSON-RPC (stdio)               │
│  - Bidirectional communication           │
│  - Request/response + notifications      │
├──────────────────────────────────────────┤
│           Copilot CLI Process            │
│  - Authentication                        │
│  - Model routing                         │
│  - Token management                      │
│  - Rate limiting                         │
├──────────────────────────────────────────┤
│           Model Provider                 │
│  - GitHub Copilot API                    │
│  - Azure OpenAI                          │
│  - OpenAI                                │
│  - Anthropic                             │
│  - Custom endpoint                       │
└──────────────────────────────────────────┘
```

## CopilotClient Lifecycle

### Initialization
```typescript
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
```

When a CopilotClient is created:
1. The SDK locates the Copilot CLI binary (installed via `gh extension install github/gh-copilot`)
2. Spawns the CLI as a child process with JSON-RPC mode enabled
3. Establishes bidirectional stdio communication
4. Performs a handshake to verify protocol compatibility
5. Authenticates with GitHub using the available credentials

### Session Creation
```typescript
const session = await client.createSession({
  model: "gpt-4o",
  systemMessage: "You are a helpful coding assistant.",
  tools: [myCustomTool],
});
```

A session represents a single conversation. When created:
1. A unique session ID is generated
2. The system message is set as the initial context
3. Registered tools are made available to the model
4. The session enters an idle state, ready for messages

### Message Processing
```typescript
const response = await session.sendAndWait("Help me write a function to parse CSV files");
```

The `sendAndWait` method:
1. Sends the user message to the model via the CLI
2. The model processes the message and may decide to call tools
3. If tools are called, the SDK executes them locally and returns results
4. The model continues processing (possibly calling more tools)
5. When the model produces a final text response, `sendAndWait` resolves

### Cleanup
```typescript
await session.end();
await client.dispose();
```

Ending a session clears conversation history. Disposing the client terminates the CLI process.

## Tool Execution Flow

The tool execution flow is the core of the agentic architecture:

```
1. User sends message
   │
   ▼
2. Model receives message + tool definitions
   │
   ▼
3. Model decides: respond with text OR call tool(s)
   │
   ├── Text response → Return to user
   │
   └── Tool call(s) → SDK receives tool call request
       │
       ▼
4. SDK invokes local tool handler
   │   - Validates parameters against schema
   │   - Executes handler function
   │   - Captures return value or error
   │
   ▼
5. Tool result sent back to model
   │
   ▼
6. Model processes tool result → Go to step 3
   (may call more tools or produce final response)
```

### Tool Call Details
When the model decides to call a tool:
- The JSON-RPC message includes the tool name and parameters
- The SDK validates parameters against the tool's Zod/Pydantic schema
- The handler function is invoked with the validated parameters
- The handler's return value is serialized and sent back to the model
- Errors in tool execution are caught and reported to the model as error results

### Parallel Tool Calls
The model can request multiple tool calls in a single turn:
- The SDK executes them concurrently (Promise.all in TypeScript)
- All results are collected and sent back together
- This enables efficient workflows (e.g., fetching data from multiple sources simultaneously)

## Streaming Events

The SDK provides real-time streaming events for responsive UIs:

### Event Types

| Event | Description | When Fired |
|-------|-------------|------------|
| `message_delta` | Incremental text from the model | During text generation |
| `tool.execution_start` | A tool is about to be executed | Before tool handler runs |
| `tool.execution_complete` | A tool has finished executing | After tool handler returns |
| `session.idle` | The session has finished processing | After final response |
| `error` | An error occurred | On any error |

### Streaming Architecture
```
Model generates tokens
    │
    ├── Token streamed to CLI via API
    │
    ├── CLI forwards to SDK via JSON-RPC notification
    │
    ├── SDK emits 'message_delta' event
    │
    └── Application renders incremental text
        (e.g., SSE to browser, terminal output)
```

### Event-Based Response Handling
```typescript
const session = await client.createSession({ ... });

session.on("message_delta", (delta) => {
  process.stdout.write(delta.content);  // Stream to terminal
});

session.on("tool.execution_start", (event) => {
  console.log(`Calling tool: ${event.toolName}`);
});

session.on("session.idle", () => {
  console.log("Agent finished processing");
});

await session.send("Analyze the project structure");
```

## Context Management

### Infinite Sessions
The SDK supports long-running sessions that can grow beyond model context limits:

- **Background Compaction**: When the conversation history exceeds the model's context window, the SDK automatically summarizes older messages
- **Compaction Strategy**: A background process creates a summary of older turns while preserving recent context
- **Transparent to Application**: The application code doesn't need to handle context limits; the SDK manages this automatically

### Context Window Management
```
Session History:
  [System Message]          ← Always preserved
  [Older messages...]       ← Compacted into summary when context fills
  [Compaction summary]      ← Replaces older messages
  [Recent messages...]      ← Preserved in full
  [Current message]         ← Latest user input
```

### Memory Efficiency
- Tool call results are included in context but can be large
- The SDK manages serialization to minimize token usage
- Binary data should be avoided in tool results; use summaries or references instead

## Authentication Architecture

### Token Resolution Order
1. **Environment variable**: `GITHUB_TOKEN` if set
2. **GitHub CLI auth**: Token from `gh auth token`
3. **OAuth device flow**: Interactive browser-based login
4. **GitHub App**: JWT-based server authentication

### BYOK (Bring Your Own Key) Flow
```
Application provides API key
    │
    ▼
SDK passes key to CLI
    │
    ▼
CLI routes request directly to provider
(bypasses GitHub Copilot API)
    │
    ▼
Provider processes request
(OpenAI, Azure OpenAI, Anthropic)
```

BYOK mode allows using the SDK's agent runtime, tool execution, and session management with your own model provider keys, independent of a Copilot subscription.

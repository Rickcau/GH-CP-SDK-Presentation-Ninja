# GitHub Copilot SDK - Code Examples

## 1. Basic Agent Setup

A minimal agent that can respond to user messages:

```typescript
import { CopilotClient } from "@github/copilot-sdk";

async function main() {
  // Create a client (automatically finds and starts the Copilot CLI)
  const client = new CopilotClient();

  // Create a session with a system message
  const session = await client.createSession({
    model: "gpt-4o",
    systemMessage: `You are a helpful coding assistant. You help developers
      write clean, well-tested code. Always explain your reasoning.`,
  });

  // Send a message and wait for the complete response
  const response = await session.sendAndWait(
    "Write a TypeScript function that debounces another function with a configurable delay"
  );

  console.log("Agent response:", response.content);

  // Continue the conversation (session maintains history)
  const followUp = await session.sendAndWait(
    "Now write unit tests for that function using Jest"
  );

  console.log("Follow-up response:", followUp.content);

  // Clean up
  await session.end();
  await client.dispose();
}

main().catch(console.error);
```

## 2. Custom Tool with defineTool and Zod

Building a tool that the AI model can call to interact with a file system:

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

// Define a tool for reading files
const readFileTool = defineTool({
  name: "read_file",
  description: "Read the contents of a file at the given path. Use this to examine source code, configuration files, or documentation.",
  parameters: z.object({
    filePath: z.string().describe("The relative or absolute path to the file to read"),
    encoding: z.enum(["utf-8", "ascii", "base64"]).default("utf-8").describe("The file encoding"),
  }),
  handler: async ({ filePath, encoding }) => {
    try {
      const resolvedPath = path.resolve(filePath);
      const content = await fs.readFile(resolvedPath, { encoding: encoding as BufferEncoding });
      const stats = await fs.stat(resolvedPath);
      return {
        content,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        path: resolvedPath,
      };
    } catch (error) {
      return { error: `Failed to read file: ${(error as Error).message}` };
    }
  },
});

// Define a tool for listing directory contents
const listDirectoryTool = defineTool({
  name: "list_directory",
  description: "List the files and directories in a given path. Use this to explore project structure.",
  parameters: z.object({
    dirPath: z.string().default(".").describe("The directory path to list"),
    recursive: z.boolean().default(false).describe("Whether to list recursively"),
    pattern: z.string().optional().describe("Glob pattern to filter results (e.g., '*.ts')"),
  }),
  handler: async ({ dirPath, recursive, pattern }) => {
    const resolvedPath = path.resolve(dirPath);
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

    const results = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      path: path.join(resolvedPath, entry.name),
    }));

    if (pattern) {
      const regex = new RegExp(pattern.replace("*", ".*"));
      return results.filter(r => regex.test(r.name));
    }

    return results;
  },
});

// Define a tool for writing files
const writeFileTool = defineTool({
  name: "write_file",
  description: "Write content to a file. Creates the file if it doesn't exist, overwrites if it does.",
  parameters: z.object({
    filePath: z.string().describe("The path where the file should be written"),
    content: z.string().describe("The content to write to the file"),
    createDirectories: z.boolean().default(true).describe("Create parent directories if they don't exist"),
  }),
  handler: async ({ filePath, content, createDirectories }) => {
    const resolvedPath = path.resolve(filePath);

    if (createDirectories) {
      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    }

    await fs.writeFile(resolvedPath, content, "utf-8");
    const stats = await fs.stat(resolvedPath);

    return {
      success: true,
      path: resolvedPath,
      size: stats.size,
    };
  },
});

// Use the tools in a session
async function main() {
  const client = new CopilotClient();

  const session = await client.createSession({
    model: "gpt-4o",
    systemMessage: "You are a code analysis agent. Use the available tools to explore and understand codebases.",
    tools: [readFileTool, listDirectoryTool, writeFileTool],
  });

  const response = await session.sendAndWait(
    "Explore the current directory, read the package.json, and create a summary of the project's dependencies."
  );

  console.log(response.content);

  await session.end();
  await client.dispose();
}

main().catch(console.error);
```

## 3. Streaming Response Handling

Real-time streaming of agent responses for responsive UIs:

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";

async function streamingExample() {
  const client = new CopilotClient();

  const searchTool = defineTool({
    name: "search_web",
    description: "Search the web for current information",
    parameters: z.object({
      query: z.string().describe("The search query"),
    }),
    handler: async ({ query }) => {
      // Simulated web search
      return { results: [`Result 1 for: ${query}`, `Result 2 for: ${query}`] };
    },
  });

  const session = await client.createSession({
    model: "gpt-4o",
    streaming: true,
    tools: [searchTool],
  });

  // Track the full response for later use
  let fullResponse = "";

  // Subscribe to streaming events
  session.on("message_delta", (delta) => {
    // Each delta contains a chunk of the response text
    process.stdout.write(delta.content);
    fullResponse += delta.content;
  });

  session.on("tool.execution_start", (event) => {
    console.log(`\n[Tool] Starting: ${event.toolName}`);
    console.log(`[Tool] Parameters: ${JSON.stringify(event.parameters)}`);
  });

  session.on("tool.execution_complete", (event) => {
    console.log(`[Tool] Completed: ${event.toolName}`);
    console.log(`[Tool] Result: ${JSON.stringify(event.result).substring(0, 200)}`);
  });

  session.on("session.idle", () => {
    console.log("\n\n[Session] Agent finished processing");
    console.log(`[Session] Full response length: ${fullResponse.length} characters`);
  });

  session.on("error", (error) => {
    console.error(`\n[Error] ${error.message}`);
  });

  // Send message - the events will fire as the response streams in
  await session.send("Search for the latest TypeScript 5.5 features and summarize them");

  // Wait for session to become idle
  await new Promise<void>((resolve) => {
    session.on("session.idle", resolve);
  });

  await session.end();
  await client.dispose();
}

streamingExample().catch(console.error);
```

## 4. Next.js API Route with SSE Streaming to Frontend

A complete example of a Next.js API route that streams agent responses to the browser:

```typescript
// app/api/chat/route.ts (Next.js App Router)
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import { NextRequest } from "next/server";

// Define tools available to the agent
const knowledgeSearchTool = defineTool({
  name: "search_knowledge",
  description: "Search the knowledge base for relevant information about a topic",
  parameters: z.object({
    topic: z.string().describe("The topic to search for"),
    category: z.string().optional().describe("Optional category filter"),
  }),
  handler: async ({ topic, category }) => {
    // In a real app, this would query a vector database or search index
    const results = await fetch(`${process.env.KNOWLEDGE_API}/search?q=${encodeURIComponent(topic)}`);
    return results.json();
  },
});

const generateSlideContent = defineTool({
  name: "generate_slide",
  description: "Generate content for a presentation slide",
  parameters: z.object({
    title: z.string().describe("The slide title"),
    bulletPoints: z.array(z.string()).describe("Key bullet points for the slide"),
    speakerNotes: z.string().optional().describe("Optional speaker notes"),
  }),
  handler: async ({ title, bulletPoints, speakerNotes }) => {
    return { title, bulletPoints, speakerNotes, generated: true };
  },
});

export async function POST(request: NextRequest) {
  const { message, sessionId } = await request.json();

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const client = new CopilotClient();

      const session = await client.createSession({
        model: "gpt-4o",
        streaming: true,
        systemMessage: `You are a presentation generator. When the user asks for a
          presentation, search the knowledge base for relevant content, then generate
          slides with clear titles and bullet points.`,
        tools: [knowledgeSearchTool, generateSlideContent],
      });

      // Stream text deltas to the client
      session.on("message_delta", (delta) => {
        const data = JSON.stringify({ type: "text_delta", content: delta.content });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // Notify client about tool usage
      session.on("tool.execution_start", (event) => {
        const data = JSON.stringify({
          type: "tool_start",
          tool: event.toolName,
          parameters: event.parameters,
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      session.on("tool.execution_complete", (event) => {
        const data = JSON.stringify({
          type: "tool_complete",
          tool: event.toolName,
          result: event.result,
        });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      });

      // Signal completion
      session.on("session.idle", async () => {
        const data = JSON.stringify({ type: "done" });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
        await session.end();
        await client.dispose();
      });

      session.on("error", (error) => {
        const data = JSON.stringify({ type: "error", message: error.message });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        controller.close();
      });

      // Send the user's message
      await session.send(message);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### Frontend Client (React)
```typescript
// components/Chat.tsx
"use client";
import { useState, useCallback } from "react";

export function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [toolActivity, setToolActivity] = useState<string[]>([]);

  const sendMessage = useCallback(async (userMessage: string) => {
    setCurrentResponse("");
    setToolActivity([]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case "text_delta":
              accumulated += data.content;
              setCurrentResponse(accumulated);
              break;
            case "tool_start":
              setToolActivity(prev => [...prev, `Calling ${data.tool}...`]);
              break;
            case "tool_complete":
              setToolActivity(prev => [...prev, `${data.tool} completed`]);
              break;
            case "done":
              setMessages(prev => [...prev, accumulated]);
              setCurrentResponse("");
              break;
          }
        }
      }
    }
  }, []);

  return (
    <div>
      {messages.map((msg, i) => <div key={i}>{msg}</div>)}
      {currentResponse && <div className="streaming">{currentResponse}</div>}
      {toolActivity.map((activity, i) => (
        <div key={i} className="tool-activity">{activity}</div>
      ))}
    </div>
  );
}
```

## 5. Permission Control (onPermissionRequest Callback)

Implementing a permission system for sensitive tool operations:

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";
import * as readline from "readline";

// Helper: prompt user for yes/no confirmation
function askUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

// Define tools with varying risk levels
const readFileTool = defineTool({
  name: "read_file",
  description: "Read a file (safe, read-only operation)",
  parameters: z.object({ path: z.string() }),
  handler: async ({ path }) => {
    const fs = await import("fs/promises");
    return await fs.readFile(path, "utf-8");
  },
});

const writeFileTool = defineTool({
  name: "write_file",
  description: "Write content to a file (modifies filesystem)",
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  handler: async ({ path, content }) => {
    const fs = await import("fs/promises");
    await fs.writeFile(path, content, "utf-8");
    return { success: true, path };
  },
});

const deleteFileTool = defineTool({
  name: "delete_file",
  description: "Delete a file from the filesystem (destructive operation)",
  parameters: z.object({ path: z.string() }),
  handler: async ({ path }) => {
    const fs = await import("fs/promises");
    await fs.unlink(path);
    return { success: true, deleted: path };
  },
});

const executeCommandTool = defineTool({
  name: "execute_command",
  description: "Execute a shell command (potentially dangerous)",
  parameters: z.object({
    command: z.string(),
    cwd: z.string().optional(),
  }),
  handler: async ({ command, cwd }) => {
    const { exec } = await import("child_process");
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  },
});

async function main() {
  const client = new CopilotClient();

  const session = await client.createSession({
    model: "gpt-4o",
    systemMessage: "You are a file management agent. Help users organize and manage their files.",
    tools: [readFileTool, writeFileTool, deleteFileTool, executeCommandTool],

    // Permission callback - called before each tool execution
    onPermissionRequest: async (request) => {
      const { toolName, parameters } = request;

      // Read operations are always allowed
      if (toolName === "read_file") {
        return "allow";
      }

      // Write operations require confirmation
      if (toolName === "write_file") {
        console.log(`\nAgent wants to write to: ${parameters.path}`);
        console.log(`Content preview: ${(parameters.content as string).substring(0, 100)}...`);
        const allowed = await askUser("Allow this write operation?");
        return allowed ? "allow" : "deny";
      }

      // Delete operations require explicit confirmation with file path shown
      if (toolName === "delete_file") {
        console.log(`\n⚠ Agent wants to DELETE: ${parameters.path}`);
        const allowed = await askUser("Allow this DESTRUCTIVE operation?");
        return allowed ? "allow" : "deny";
      }

      // Shell commands are always blocked
      if (toolName === "execute_command") {
        console.log(`\nBlocked shell command: ${parameters.command}`);
        return "deny";
      }

      return "deny";
    },
  });

  const response = await session.sendAndWait(
    "Read all .ts files in the src directory, then create a summary.md file listing all exports"
  );

  console.log("\nAgent result:", response.content);

  await session.end();
  await client.dispose();
}

main().catch(console.error);
```

## 6. MCP Server Configuration

Integrating MCP (Model Context Protocol) servers for standardized tool access:

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { z } from "zod";

async function mcpExample() {
  const client = new CopilotClient();

  // Define a local custom tool alongside MCP server tools
  const summarizeTool = defineTool({
    name: "summarize",
    description: "Create a concise summary of provided text",
    parameters: z.object({
      text: z.string().describe("The text to summarize"),
      maxLength: z.number().default(200).describe("Maximum summary length in characters"),
    }),
    handler: async ({ text, maxLength }) => {
      // Simple extractive summarization (in production, could call another model)
      const sentences = text.split(". ");
      let summary = "";
      for (const sentence of sentences) {
        if ((summary + sentence).length > maxLength) break;
        summary += sentence + ". ";
      }
      return { summary: summary.trim() };
    },
  });

  const session = await client.createSession({
    model: "gpt-4o",
    systemMessage: `You are a research agent with access to the filesystem, a database,
      and web browsing capabilities via MCP servers. Use these tools to gather information
      and answer user questions thoroughly.`,
    tools: [summarizeTool],

    // Configure MCP servers
    mcpServers: [
      {
        // Filesystem access via MCP
        name: "filesystem",
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "/home/user/projects",  // Root directory for filesystem access
        ],
        env: {
          // Environment variables for the MCP server process
          NODE_ENV: "production",
        },
      },
      {
        // PostgreSQL database access via MCP
        name: "postgres",
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-postgres",
          process.env.DATABASE_URL!,
        ],
      },
      {
        // Remote MCP server (e.g., custom enterprise tools)
        name: "enterprise-tools",
        url: "https://mcp.internal.company.com/sse",
        headers: {
          Authorization: `Bearer ${process.env.MCP_TOKEN}`,
        },
      },
      {
        // Brave Search MCP server for web browsing
        name: "web-search",
        command: "npx",
        args: ["-y", "@anthropic-ai/mcp-server-brave-search"],
        env: {
          BRAVE_API_KEY: process.env.BRAVE_API_KEY!,
        },
      },
    ],
  });

  // The agent now has access to:
  // - Local tool: summarize
  // - MCP filesystem: read_file, write_file, list_directory, etc.
  // - MCP postgres: query, list_tables, describe_table, etc.
  // - MCP enterprise-tools: whatever tools the enterprise server exposes
  // - MCP web-search: brave_search, etc.

  const response = await session.sendAndWait(
    `Research the project in /home/user/projects/my-app:
     1. Read the README and package.json
     2. Check the database for recent user activity
     3. Search the web for any related security advisories
     4. Summarize your findings`
  );

  console.log("Research results:", response.content);

  await session.end();
  await client.dispose();
}

mcpExample().catch(console.error);
```

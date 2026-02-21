# GitHub Copilot SDK - Overview

## What is the GitHub Copilot SDK?

The GitHub Copilot SDK is a multi-platform toolkit for embedding Copilot's agentic AI workflows into custom applications. It provides a programmatic interface for building AI agents that leverage GitHub Copilot's model infrastructure, tool execution capabilities, and session management -- all without managing model infrastructure directly.

The SDK is currently in **technical preview** and available as open source at [github.com/github/copilot-sdk](https://github.com/github/copilot-sdk).

## Available Platforms

The SDK is available in four languages:

| Language | Package | Status |
|----------|---------|--------|
| **TypeScript** | `@anthropic-ai/copilot-sdk` / `@github/copilot-sdk` | Technical Preview |
| **Python** | `copilot-sdk` | Technical Preview |
| **Go** | `github.com/github/copilot-sdk-go` | Technical Preview |
| **.NET** | `GitHub.Copilot.SDK` | Technical Preview |

## Core Concepts

### CopilotClient
The central entry point for the SDK. The CopilotClient manages communication with the Copilot CLI backend process via JSON-RPC. It handles:
- Starting and managing the Copilot CLI process
- Establishing JSON-RPC communication channels
- Managing authentication
- Creating and managing sessions

### Sessions
A session represents a single conversation between your application and an AI model. Sessions maintain:
- Conversation history (messages and tool calls)
- Active tools and their configurations
- Model selection and parameters
- Streaming event subscriptions

### Tools
Custom functions that the AI model can invoke during a conversation. Tools give the model the ability to:
- Access external data (databases, APIs, file systems)
- Perform actions (create files, send emails, deploy code)
- Interact with the user (ask for confirmation, present choices)

## Key Features

### Agent Runtime
The SDK provides a complete agent runtime that handles the agentic loop:
1. User sends a message
2. Model processes the message and decides to call tools or respond
3. If tools are called, the SDK executes them and returns results to the model
4. Model continues processing until it produces a final response
5. Response is returned to the application

### Tool Customization
Define custom tools with strongly-typed schemas:
- TypeScript: Zod schemas for parameter validation
- Python: Pydantic models for parameter validation
- Go: Struct tags for parameter validation
- .NET: Data annotations for parameter validation

### Model Flexibility
The SDK supports multiple model providers:
- **GitHub Copilot models**: Default models available through Copilot subscription
- **Azure OpenAI**: Bring your own Azure OpenAI deployment
- **OpenAI**: Direct OpenAI API access
- **Anthropic**: Claude models via API key
- **Custom endpoints**: Any OpenAI-compatible API endpoint

### Multiple Authentication Methods
- **GitHub Token**: Use a GitHub personal access token or Copilot token
- **OAuth Device Flow**: Interactive authentication for CLI applications
- **GitHub App**: Server-to-server authentication for backend services
- **BYOK (Bring Your Own Key)**: Use your own API keys for model providers

## Communication Protocol

The SDK communicates with the Copilot CLI backend via **JSON-RPC 2.0** over stdio:

```
Your Application
    │
    ├── SDK Client (TypeScript/Python/Go/.NET)
    │   ├── JSON-RPC Client
    │   └── Session Manager
    │
    ├── stdio (stdin/stdout)
    │
    └── Copilot CLI Process
        ├── JSON-RPC Server
        ├── Authentication Manager
        ├── Model Router
        └── Tool Executor
```

This architecture means:
- The Copilot CLI must be installed on the machine (`gh extension install github/gh-copilot`)
- The SDK spawns the CLI as a child process
- All communication happens locally over stdio (no direct network calls from the SDK)
- The CLI handles authentication, model selection, and API communication with GitHub

## Repository and Resources

- **GitHub Repository**: [github.com/github/copilot-sdk](https://github.com/github/copilot-sdk)
- **npm Package**: `@github/copilot-sdk`
- **PyPI Package**: `copilot-sdk`
- **Documentation**: Included in the repository README and examples directory
- **License**: MIT License

## Requirements

- **GitHub CLI**: `gh` version 2.62.0 or later
- **Copilot CLI Extension**: `gh extension install github/gh-copilot`
- **GitHub Account**: With an active Copilot subscription (Individual, Business, or Enterprise)
- **Runtime**: Node.js 18+ (TypeScript), Python 3.10+ (Python), Go 1.21+ (Go), .NET 8+ (.NET)

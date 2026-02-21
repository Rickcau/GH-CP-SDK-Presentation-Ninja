# GitHub Copilot - Overview

## What is GitHub Copilot?

GitHub Copilot is an AI-powered coding assistant developed by GitHub in collaboration with OpenAI. Originally launched for general availability in June 2022, Copilot has evolved from a code-completion tool into a **full-spectrum AI development partner** that writes, edits, reviews, summarizes, and ships code across IDEs, pull requests, terminals, and app platforms. As of 2026, it is the most widely adopted AI developer tool in the world.

The launch of the **free tier in late 2024** drove unprecedented adoption—nearly 80% of new developers now use Copilot within their first week on GitHub. The release of the **Copilot coding agent in March 2025** further accelerated momentum, helping create over 1 million pull requests between May and September 2025.

## Core Capabilities

### AI Pair Programmer
Copilot acts as an always-available pair programmer that understands code context:
- **Inline code completions**: Real-time suggestions as you type, from single lines to entire functions
- **Multi-line suggestions**: Complete implementations of functions, classes, and algorithms
- **Comment-to-code**: Write a comment describing what you want, and Copilot generates the implementation
- **Pattern recognition**: Learns from the patterns in your codebase and suggests consistent code

### Copilot Chat
A conversational AI interface integrated directly into the IDE:
- Ask questions about your code in natural language
- Request explanations of complex code sections
- Get help debugging errors and exceptions
- Generate tests for existing functions
- Refactor code following best practices
- Generate documentation and comments

### Copilot Coding Agent
An autonomous agent mode (released March 2025) that can:
- Plan work and break down complex tasks
- Modify entire repositories across multiple files
- Execute multi-step operations autonomously
- Validate changes and run tests
- Available via **Mission Control** interface for task management and progress tracking

### Workspace Agent (@workspace)
A specialized agent that understands your entire codebase:
- Answer questions about the project structure and architecture
- Find relevant code across the entire repository
- Explain how different components interact
- Suggest where to implement new features based on existing patterns

### Pull Request Integration
AI-powered assistance throughout the code review process:
- **Automatic PR summaries**: Generate comprehensive descriptions of changes
- **Code review suggestions**: AI identifies potential bugs, security issues, and improvements
- **Copilot code review** improved developer effectiveness for 72.6% of surveyed users (2025 Octoverse report)

### Knowledge Bases (Enterprise)
Custom documentation repositories that ground Copilot's responses:
- Upload internal documentation, API references, and coding standards
- Copilot uses this knowledge to provide organization-specific guidance
- Reduces hallucination by grounding responses in verified documentation

### App Modernization Agent
A specialized agent for .NET developers (available in Visual Studio 2022 17.14+ and VS 2026):
- Automated assessment of upgrade scope and breaking changes
- AI-generated migration plans with risk mitigations
- Sequential task execution with validation criteria
- Supports upgrading to newer .NET versions and Azure migration

## Supported IDEs

| IDE | Code Completions | Copilot Chat | Workspace Agent | Cloud Agent |
|-----|-----------------|--------------|-----------------|-------------|
| Visual Studio Code | Yes | Yes | Yes | Yes |
| Visual Studio 2026 | Yes | Yes | Yes | Yes (preview) |
| Visual Studio 2022 (17.14+) | Yes | Yes | Yes | Limited |
| JetBrains IDEs | Yes | Yes | Yes | Yes |
| Neovim | Yes | Yes (plugin) | Limited | No |
| Xcode | Yes | Yes | No | No |
| Eclipse | Yes | Yes | No | No |

**Visual Studio 2026** reached general availability in November 2025 with enhanced AI-assisted workflows and the GitHub cloud agent in public preview.

## Language Support

Copilot supports virtually all programming languages, with the strongest performance in:
- **Tier 1** (best quality): Python, JavaScript, TypeScript, Java, C#, Go, Ruby, C++, Rust
- **Tier 2** (strong quality): PHP, Swift, Kotlin, Scala, Shell/Bash, SQL, HTML/CSS
- **Tier 3** (good quality): R, Dart, Lua, Perl, Haskell, Elixir, and 30+ other languages

## Available AI Models (As of 2026)

| Model | Availability |
|-------|-------------|
| GPT-5 | Pro, Pro+, Business, Enterprise |
| GPT-5.1 | Pro+, Enterprise |
| GPT-5 mini | All tiers (included, no premium requests) |
| GPT-4.1 | All tiers (included, no premium requests) |
| Claude Opus 4.5 | Pro+, Enterprise |
| Claude Sonnet 4 | Pro, Business, Enterprise |
| Gemini 3 Pro | Pro+, Enterprise |
| o3 / o4-mini | Pro+ |

**Note**: Claude Sonnet 3.5 deprecated January 31, 2026—users should migrate to Opus 4.5.

## Pricing Plans (As of 2026)

### Copilot Free - $0/month
- 2,000 code completions per month
- 50 premium requests per month
- Access to Claude 3.5 Sonnet and GPT-4.1
- All major IDEs supported

### Copilot Pro - $10/month ($100/year)
- Unlimited code completions
- 300 premium requests per month
- Access to Claude Sonnet 4, Gemini 2.5 Pro, and experimental features
- CLI access via `gh copilot`
- 30-day free trial available

### Copilot Pro+ - $39/month ($390/year)
- Everything in Pro
- 1,500 premium requests per month
- Access to all AI models including OpenAI o3, o4-mini, GPT-5.1, Claude Opus 4.5
- Early access to GitHub Spark and experimental features

### Copilot Business - $19/user/month
- Everything in Pro, plus:
- Organization-wide policy management
- Content exclusion controls
- Audit logging for compliance
- IP indemnity for code suggestions
- SAML SSO integration
- Usage analytics and reporting

### Copilot Enterprise - $39/user/month
- Everything in Business, plus:
- 1,000 premium requests per user
- Knowledge Bases (custom documentation grounding)
- Fine-tuned models on your organization's code
- GitHub.com Chat integration
- Pull request summaries and review suggestions
- Advanced security features
- Requires GitHub Enterprise Cloud

## Competitive Landscape (2026)

GitHub Copilot now competes with several AI coding tools:

| Tool | Developer | Primary Strength |
|------|-----------|------------------|
| **GitHub Copilot** | GitHub (Microsoft) | Universal IDE compatibility + mature ecosystem |
| **Cursor** | Cursor Inc | Deep codebase RAG + visual editing (VS Code fork) |
| **Claude Code** | Anthropic | Autonomous multi-file operations (CLI-first) |
| **Codex** | OpenAI | API-first automation |
| **Cline** | Community | Open-source alternative |

Copilot's key differentiator remains its seamless integration across the GitHub ecosystem and support for virtually any IDE without requiring workflow changes.
# GitHub Copilot CLI - Overview

## What is GitHub Copilot CLI?

GitHub Copilot CLI is an AI-powered terminal agent that brings the full capabilities of GitHub Copilot directly to your command line. As of 2026, it has evolved from a simple command suggestion tool into an autonomous agentic assistant that can understand your codebase, execute multi-step workflows, and integrate deeply with the GitHub ecosystem.

> **Note**: The original `gh copilot` extension (invoked via `gh copilot`) was officially deprecated on October 25, 2025. The new standalone GitHub Copilot CLI is invoked simply as `copilot` and offers significantly enhanced agentic capabilities.

## Installation

As of January 2026, GitHub Copilot CLI can be installed through multiple methods:

```bash
# Windows (WinGet)
winget install GitHub.Copilot

# macOS and Linux (Homebrew)
brew install copilot-cli

# macOS, Linux, and Windows (npm)
npm install -g @github/copilot

# macOS and Linux (install script)
curl -fsSL https://copilot.github.com/install.sh | bash
```

### Prerelease Versions
```bash
# WinGet prerelease
winget install GitHub.Copilot.Prerelease

# Homebrew prerelease
brew install copilot-cli@prerelease

# npm prerelease
npm install -g @github/copilot@prerelease
```

### Requirements
- An active GitHub Copilot subscription (Individual, Business, or Enterprise)
- GitHub authentication via Personal Access Token with "Copilot Requests" permission
- Set token via `GH_TOKEN` or `GITHUB_TOKEN` environment variable
- Supported platforms: macOS, Linux, Windows (via WSL, with experimental native PowerShell support)
- Included by default in GitHub Codespaces and available as a Dev Container Feature

## Core Capabilities

### Agentic Task Execution
The CLI uses an agent-based architecture that understands prompts, plans actions, and executes multi-step tasks:

```bash
copilot
# Starts an interactive session with full context awareness

copilot -p "refactor the authentication module to use JWT tokens"
# One-off prompt execution
```

### Built-in Custom Agents (As of January 2026)
Copilot CLI includes specialized agents for common tasks:

- **Explore**: Fast codebase analysis without cluttering main context
- **Task**: Runs commands like tests and builds with smart output summarization
- **Plan**: Creates implementation plans by analyzing dependencies and structure
- **Code-review**: Reviews changes with high signal-to-noise ratio

### GitHub Integration
Direct access to GitHub resources through the built-in MCP server:
- Create, modify, and manage issues and pull requests via natural language
- Access repositories, branches, and workflows
- Full authentication with existing GitHub credentials

### Model Selection
Multiple AI models available via `/model` command:
- **Claude Sonnet 4.5** (default), Claude Sonnet 4
- **GPT-5**, GPT-5.1, GPT-5.1-Codex, GPT-5 mini
- **GPT-4.1** (included with subscription, no premium requests)
- **Gemini 3 Pro**, Claude Opus 4.5, Raptor mini

## How It Fits in the GitHub Ecosystem

Copilot CLI is one component of the broader GitHub Copilot platform:

- **GitHub Copilot (IDE)**: Code completions and chat in editors
- **GitHub Copilot CLI**: Terminal-native agentic assistant
- **GitHub Copilot Chat**: Conversational AI in github.com and IDEs
- **GitHub Copilot Coding Agent**: Autonomous agent for complex tasks

All components share the same subscription and organizational policies.

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS (Bash, Zsh, Fish) | Fully supported |
| Linux (Bash, Zsh, Fish) | Fully supported |
| Windows (WSL) | Fully supported |
| Windows (PowerShell) | Experimental native support |
| GitHub Codespaces | Included by default |

## Privacy and Premium Requests

- Each prompt submission reduces your monthly premium request quota by one
- GPT-5 mini and GPT-4.1 are included with subscriptions and do not consume premium requests on paid plans
- Organization policies and content exclusions are automatically inherited
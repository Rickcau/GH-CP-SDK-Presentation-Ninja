# GitHub Copilot CLI - Architecture

## System Architecture Overview

As of 2026, GitHub Copilot CLI operates as a standalone terminal-native application with an agentic architecture. It communicates with GitHub's cloud infrastructure for AI inference while maintaining deep integration with local repositories and the GitHub platform.

## Key Architectural Change: Standalone CLI

> **Important**: The `gh copilot` extension was deprecated October 25, 2025. The new standalone `copilot` CLI is a complete rewrite with enhanced agentic capabilities.

| Old (`gh copilot`) | New (`copilot`) |
|-------------------|-----------------|
| GitHub CLI extension | Standalone application |
| Command suggester | Agentic executor |
| Limited context | Full repository awareness |
| Suggest/Explain only | Multi-step task execution |

## Agent-Based Architecture

```
User Prompt
    │
    ▼
┌─────────────────────────┐
│   Copilot CLI Agent     │
├─────────────────────────┤
│ 1. Parse natural language│
│ 2. Plan task breakdown  │
│ 3. Select appropriate   │
│    tools/agents         │
│ 4. Execute with approval│
└────────┬────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│ Local  │ │  GitHub    │
│ Tools  │ │ MCP Server │
├────────┤ ├────────────┤
│• Shell │ │• Repos     │
│• Files │ │• Issues    │
│• Git   │ │• PRs       │
│• grep  │ │• Actions   │
│• glob  │ │• Spaces    │
└────────┘ └────────────┘
```

## Tool Architecture

### Built-in Tools
- **Shell**: Execute terminal commands (with `node-pty` bundled)
- **File operations**: Read, write, modify files
- **Git**: Repository operations
- **grep/glob**: Code search (ripgrep bundled)

### MCP (Model Context Protocol) Integration
```
┌─────────────────────────────────────┐
│         Copilot CLI                 │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌───────────────┐ │
│  │ GitHub MCP  │ │ Custom MCP    │ │
│  │ (default)   │ │ Servers       │ │
│  ├─────────────┤ ├───────────────┤ │
│  │• repos      │ │• Internal APIs│ │
│  │• issues     │ │• Databases    │ │
│  │• PRs        │ │• Custom tools │ │
│  │• discussions│ │               │ │
│  │• spaces     │ │               │ │
│  └─────────────┘ └───────────────┘ │
└─────────────────────────────────────┘
```

Configuration stored in `~/.config/mcp-config.json`.

## Authentication Flow

```
copilot [command]
        │
        ▼
┌──────────────────────────┐
│ Read token from env      │
│ GH_TOKEN or GITHUB_TOKEN │
│ (in order of precedence) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Token must have          │
│ "Copilot Requests"       │
│ permission               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Verify subscription      │
│ & org policies           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Authenticated session    │
│ with premium request     │
│ quota tracking           │
└──────────────────────────┘
```

### CI/CD Authentication
Set `GITHUB_ASKPASS` to point to an executable that returns your token—useful for credential managers and pipelines.

## Model Inference Architecture

### Available Models (As of February 2026)
| Provider | Models |
|----------|--------|
| OpenAI | GPT-5, GPT-5.1, GPT-5.1-Codex, GPT-5 mini, GPT-4.1 |
| Anthropic | Claude Sonnet 4.5 (default), Claude Sonnet 4, Claude Opus 4.5 |
| Google | Gemini 3 Pro |
| Other | Raptor mini |

### Model Selection
- Default: Claude Sonnet 4.5
- Runtime selection via `/model` command
- Environment override: `COPILOT_MODEL`
- Per-session: `--model` flag
- Policy-disabled models prompt for direct enablement

## Context Management Architecture

```
Token Budget
┌────────────────────────────────────┐
│████████████████████░░░░░░░░░░░░░░░│
│        Used (80%)     Available   │
└────────────────────────────────────┘
         │
         ▼ At 95%
┌────────────────────────────────────┐
│   Auto-compaction triggered        │
│   History compressed               │
└────────────────────────────────────┘
```

- `/context`: View detailed token breakdown
- `/compact`: Manual compression
- Warning at <20% remaining capacity

## Platform Architecture

| Component | Technology |
|-----------|------------|
| Runtime | Node.js with bundled `node-pty` |
| Search | Bundled `ripgrep` |
| Streaming | Token-by-token output (configurable) |
| Session | Persistent across invocations |

### Platform Support
- **macOS/Linux**: Native support (Bash, Zsh, Fish)
- **Windows**: WSL (recommended), experimental PowerShell
- **Codespaces**: Included in default image
- **Dev Containers**: Available as Feature

## Security Architecture

### Tool Approval Model
- **Default**: All tool executions require explicit approval
- **Selective**: `--allow-tool 'shell(cmd)'` pre-approves specific commands
- **Full trust**: `--allow-all-tools` (use with caution)

### MCP Toolset Security
```bash
# ✅ GOOD - Specific toolsets
# tools github toolsets[repos, issues]

# ✅ GOOD - Default is reasonable
# tools github toolsets[default]

# ⚠️ AVOID - Too permissive
# tools github toolsets[all]
```

### Network Controls
```bash
--allow-url github.com --allow-url api.github.com
--allow-all-urls  # Use with caution
```
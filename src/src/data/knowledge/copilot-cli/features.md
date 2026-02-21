# GitHub Copilot CLI - Features

## Interactive Mode

Launch an interactive session for iterative development:

```bash
copilot
```

Features full session persistence, context awareness, and access to all slash commands.

## Programmatic Mode

Execute single prompts directly for scripting and automation:

```bash
copilot -p "Show me this week's Git commits and summarize them"

# Pipe output from scripts
./generate-prompt.sh | copilot
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/model` | Switch AI models during session |
| `/explain` | Interpret a command or script |
| `/commit` | Prepare a commit message from staged changes |
| `/pr` | Draft a pull request description |
| `/fix` | Identify issues in code and propose corrections |
| `/review` | Summarize or review local changes |
| `/run` | Generate and execute a command |
| `/share` | Export session as Markdown or GitHub gist |
| `/context` | Visualize token usage with detailed breakdown |
| `/compact` | Manually compress context |
| `/terminal-setup` | Configure multi-line input for terminals |
| `/mcp add` | Add custom MCP servers |

## Context Management (As of January 2026)

- **Auto-compaction**: Automatically compresses history at 95% token limit
- **`/compact`**: Manual context compression
- **`/context`**: Detailed token usage breakdown
- **`--resume`**: Press TAB to cycle through local and remote sessions

## Built-in Custom Agents

Copilot delegates to specialized agents automatically:

| Agent | Purpose |
|-------|---------|
| **Explore** | Fast codebase analysis without polluting main context |
| **Task** | Run tests/builds with smart summarization (brief on success, full on failure) |
| **Plan** | Create implementation plans analyzing dependencies |
| **Code-review** | High signal-to-noise ratio change reviews |

Agents can run in parallel when appropriate.

## Automation and Scripting Flags

| Flag | Description |
|------|-------------|
| `--silent` | Suppress stats/logs for clean output |
| `--share [PATH]` | Export transcript to markdown |
| `--share-gist` | Export session to GitHub gist |
| `--available-tools` | Allowlist specific tools |
| `--excluded-tools` | Denylist specific tools |
| `--additional-mcp-config` | Add MCP config per-session |
| `--allow-all-tools` | Auto-approve all tool usage |
| `--allow-tool 'shell(cmd)'` | Pre-approve specific commands |
| `--stream off` | Disable token-by-token streaming |

## MCP-Powered Extensibility

Model Context Protocol enables custom integrations:

```bash
# Add custom MCP servers
/mcp add

# Configuration stored in ~/.config/mcp-config.json
```

- GitHub MCP server included by default
- Copilot Spaces tools available for project-specific context
- OAuth support for secure third-party integrations (Slack, Jira, etc.)
- Custom UI components can render in Copilot chat

## Terminal Experience Enhancements

- **Token streaming**: Output streams token-by-token (disable with `--stream off`)
- **Better diffs**: Intra-line syntax highlighting with Git pager integration
- **Tab completion**: Autocomplete paths in `/cwd` and `/add-dir`
- **Ctrl+T**: Toggle model reasoning visibility
- **Clean history**: Agent-run commands excluded from Bash/PowerShell history
- **Image support**: Add images via paste, drag-and-drop, or `@`-mention

## Code Search

Copilot CLI bundles `ripgrep` with `grep` and `glob` tools for powerful codebase search:
- Semantic indexing for natural language queries
- Context-aware answers directly in terminal

## Model Management

```bash
# View all available models
/model

# Set default model via environment variable
export COPILOT_MODEL=gpt-5
```

If a model is disabled by policy, CLI prompts to enable it directly—no need to leave terminal.

## Session Management

- Sessions persist within and across invocations
- Build on previous conversations
- Context maintained throughout workflow
- Export sessions for sharing or documentation

## Customization

Settings stored in `~/.copilot/` JSON configuration:
- Default AI models
- Editor integration settings
- Workflow preferences
- Applies globally across all projects
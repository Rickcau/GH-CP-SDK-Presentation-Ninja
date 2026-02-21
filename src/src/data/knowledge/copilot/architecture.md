# GitHub Copilot - Architecture

## How Code Suggestions Work

### Context Gathering Phase
When a developer is typing in the IDE, the Copilot extension continuously gathers context to construct the most relevant prompt:

1. **Current File Context**: The code before and after the cursor position (prefix and suffix)
2. **Open Tabs**: Content from other files currently open in the editor, prioritized by relevance (same language, recently viewed, imported files) — typically 3-4 files maximum
3. **Import Statements**: Analysis of imports to understand which libraries and frameworks are in use
4. **Comments and Docstrings**: Natural language descriptions that indicate developer intent
5. **File Path and Name**: The filename provides hints about the code's purpose (e.g., `test_auth.py` suggests test code for authentication)
6. **Language and Framework Detection**: Automatic detection of the programming language and framework conventions
7. **Copilot Memory** (as of December 2025): Repository-specific memory that learns architectural decisions, patterns, and conventions — suggestions match YOUR patterns automatically

### Request Flow
```
IDE (VS Code, JetBrains, Visual Studio 2026, Xcode, Eclipse)
  │
  ├── Copilot Extension gathers context
  │   ├── Current file (prefix + suffix around cursor)
  │   ├── Related open files (weighted by relevance)
  │   ├── Language, framework, project metadata
  │   ├── Copilot Memory (repository-specific patterns)
  │   └── User settings (temperature, suggestion count)
  │
  ├── Context sent to GitHub API (HTTPS)
  │   ├── Bearer token authentication
  │   ├── Telemetry opt-in/out headers
  │   └── Content exclusion check
  │
  ├── GitHub Copilot Service
  │   ├── Token validation and license check
  │   ├── Content exclusion policy enforcement
  │   ├── Prompt construction and optimization
  │   ├── Model inference (GPT-5.2, GPT-4o, Claude Opus 4.5, Gemini 3 Flash)
  │   ├── Post-processing (deduplication, truncation)
  │   └── Code referencing check (public code match detection)
  │
  └── Streaming response back to IDE
      ├── Ghost text rendering (inline suggestions)
      ├── Multi-suggestion panel (alternative completions)
      └── Acceptance/rejection telemetry
```

### Latency Optimization
- **Speculative completion**: Copilot pre-fetches suggestions before the user pauses typing
- **Caching**: Recent suggestions are cached locally to avoid redundant API calls
- **Streaming**: Suggestions stream token-by-token for faster perceived latency
- **Debouncing**: Requests are debounced to avoid overwhelming the API during rapid typing
- **Prompt truncation**: Context is intelligently truncated to fit model token limits while preserving the most relevant information

## Copilot Chat Architecture

### Conversational Interface
Copilot Chat provides a conversational AI experience within the IDE:

```
User Message
  │
  ├── Intent Classification
  │   ├── Code explanation
  │   ├── Code generation
  │   ├── Bug fixing
  │   ├── Test generation
  │   ├── Refactoring
  │   └── General question
  │
  ├── Context Enrichment
  │   ├── Selected code (if any)
  │   ├── Active file content
  │   ├── Error/diagnostic messages
  │   ├── Terminal output (if @terminal)
  │   ├── Workspace index (if @workspace)
  │   └── Copilot Memory patterns
  │
  ├── Model Inference
  │   ├── GPT-5.2 (GA across all plans as of Jan 2026)
  │   ├── GPT-4o (default for chat)
  │   ├── Claude Opus 4.5 (alternative)
  │   ├── Gemini 3 Flash (alternative)
  │   └── Model selection by user or auto
  │
  └── Response Rendering
      ├── Markdown formatting
      ├── Code blocks with syntax highlighting
      ├── Inline code actions (Insert, Copy, Apply to file)
      └── Follow-up suggestions
```

### Chat Participants (Agents)
Copilot Chat supports specialized agents invoked with the `@` prefix:

- **@workspace**: Indexes the entire repository using embeddings; answers questions about the full codebase, finds relevant files, explains architecture
- **@terminal**: Has context from the integrated terminal; helps debug command-line errors, suggests shell commands
- **@vscode**: Answers questions about VS Code settings, extensions, and configuration
- **@github**: Searches GitHub issues, PRs, and discussions relevant to your question

### Slash Commands
Shortcut commands for common operations:

- `/explain`: Explain the selected code
- `/fix`: Suggest a fix for problems in the selected code
- `/tests`: Generate unit tests for the selected code
- `/doc`: Generate documentation for the selected code

## Copilot Memory Architecture (December 2025)

Repository-specific memory that learns your codebase patterns:

```
Repository Activity
  │
  ├── Pattern Recognition
  │   ├── Class structure conventions
  │   ├── Error handling patterns
  │   ├── API design conventions
  │   └── Test organization
  │
  ├── Memory Storage (per-repository)
  │   ├── Architectural decisions
  │   ├── Code patterns and idioms
  │   └── Team conventions
  │
  └── Context Integration
      ├── Copilot coding agent
      ├── Code review workflows
      └── Suggestion generation
```

**Key characteristics:**
- Repository-specific — does not share across repos
- Works in Copilot coding agent and code review workflows
- Can be disabled anytime in Settings > Copilot > Toggle "Copilot memory"

## Skills Architecture (December 2025)

Reusable instruction sets that codify team patterns:

```
Skills Definition (YAML/Markdown)
  │
  ├── Pattern Instructions
  │   ├── Test structure conventions
  │   ├── Error handling patterns
  │   ├── API design rules
  │   └── Documentation standards
  │
  ├── MCP Server Integration
  │   └── Allowed tools array in YAML definition
  │
  └── Execution Context
      ├── Copilot coding agent
      ├── Copilot CLI
      └── VS Code agent mode
```

Community skills available at `anthropics/skills` and `github/awesome-copilot`.

## AgentHQ Architecture (November 2025)

Platform for creating and deploying AI agents within GitHub:

```
AgentHQ Platform
  │
  ├── Agent Runtime Environment
  │   ├── Isolated execution environments
  │   ├── Repository access scopes
  │   └── Security sandboxing
  │
  ├── Agent Capabilities
  │   ├── Repository data access
  │   ├── Pull request interaction
  │   ├── GitHub Actions integration
  │   └── Workflow triggers
  │
  └── Developer API
      ├── Agent creation
      ├── Permission management
      └── Deployment workflows
```

## Agentic Workflows Architecture

Multi-step, architecture-aware workflows for complex tasks:

```
Agentic Request
  │
  ├── Architecture Analysis
  │   ├── Hazard identification
  │   ├── Modularization opportunities
  │   └── Dependency mapping
  │
  ├── Multi-Step Execution
  │   ├── Module boundary definition
  │   ├── Subsystem implementation
  │   ├── Migration planning
  │   └── Test modernization
  │
  └── Coordination
      ├── Cross-file changes
      ├── Contract documentation
      └── Rollback planning
```

**Best suited for:**
- System design and refactoring
- Multi-file coordination
- Legacy code modernization
- Modular service implementation

**Not ideal for:**
- Fully autonomous production code
- Tasks requiring human judgment on business logic
- Security-critical decisions without review

## Model Availability (As of January 2026)

| Model | Availability | Access |
|-------|--------------|--------|
| GPT-5.2 | GA | All Copilot plans (Business/Enterprise requires admin opt-in) |
| GPT-4o | GA | Default for chat |
| Claude Opus 4.5 | GA | Alternative selection |
| Gemini 3 Flash | GA | Alternative selection |

Available across: github.com, Mobile, VS Code, Visual Studio 2026, JetBrains, Xcode, Eclipse

## Visual Studio 2026 Integration

- GitHub cloud agent in public preview
- Delegate repetitive tasks directly from Visual Studio
- Full agentic workflow support

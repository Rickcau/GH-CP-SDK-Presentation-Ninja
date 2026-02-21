# GitHub Copilot - Features

## Code Completions

### Inline Completions
- **Single-line**: Completes the current line based on context (variable names, method calls, parameter values)
- **Multi-line**: Generates multiple lines of code, including control flow, error handling, and complete function bodies
- **Function-level**: Write a function signature or comment, and Copilot generates the entire implementation
- **Tab to accept**: Press Tab to accept the suggestion, or continue typing to see updated suggestions

### Completion Enhancements (As of 2026)
- **Colorized code completions**: Syntax highlighting in ghost text for better readability (Visual Studio 2026)
- **Partial acceptance**: Accept portions of suggestions incrementally rather than all-or-nothing
- Suggestions appear as ghost text (dimmed) in the editor
- Multiple alternative suggestions available via keyboard shortcut (Alt+] / Alt+[)
- Suggestions update in real time as you type additional characters
- Context-aware: suggestions adapt based on the surrounding code, imports, and project patterns

### Example Scenarios
```python
# Type a function signature, Copilot completes the body:
def calculate_fibonacci(n: int) -> int:
    # Copilot suggests:
    if n <= 1:
        return n
    return calculate_fibonacci(n - 1) + calculate_fibonacci(n - 2)

# Type a comment, Copilot generates the implementation:
# Parse a CSV file and return a list of dictionaries
# Copilot suggests:
def parse_csv(filepath: str) -> list[dict]:
    import csv
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)
```

## Copilot Chat

### Core Chat Capabilities
- **Ask Questions**: "What does this function do?" "How do I connect to a database in this project?"
- **Explain Code**: Select any code block and ask for a detailed explanation
- **Fix Bugs**: Paste an error message or select broken code and ask Copilot to fix it
- **Write Tests**: Select a function and ask Copilot to generate comprehensive unit tests
- **Refactor**: Ask Copilot to improve code quality, extract methods, simplify logic
- **Generate Code**: Describe what you need in natural language and get working code

### Chat Context Controls
- **#file**: Reference a specific file for context: "Explain #file:src/auth/login.ts"
- **#selection**: Reference currently selected code
- **#editor**: Reference the entire active editor content
- **#terminalLastCommand**: Reference the last terminal command and its output
- **#terminalSelection**: Reference selected text in the terminal

### Multi-Model Support in Chat (As of February 2026)
Users can choose their preferred model for chat conversations:
- **GPT-5.2-Codex**: OpenAI's GPT-5 model optimized for agentic coding (GA as of January 2026)
- **Claude Sonnet 4.5**: Anthropic's most advanced model for coding and real-world agents
- **GPT-4o**: Best for complex reasoning, architecture decisions, detailed explanations
- **GPT-4o-mini**: Faster responses for simpler questions, lower token usage
- **Gemini 3 Flash**: Google's latest model, available across VS Code, JetBrains, Xcode, and Eclipse
- Model can be switched mid-conversation

**Note**: Legacy models from Claude, Google, and OpenAI are being phased out—check docs for recommended replacements.

## Workspace Agent (@workspace)

### Full Codebase Understanding
The @workspace agent creates an index of your entire repository to answer questions that span multiple files:

- "Where is the user authentication implemented?"
- "What API endpoints does this project expose?"
- "How does the data flow from the frontend to the database?"
- "What would need to change to add a new entity type?"

### How @workspace Works
1. Repository is indexed using embeddings (runs locally and incrementally)
2. User's question is used to search the index for relevant code snippets
3. Top relevant files and code sections are included in the prompt context
4. Model generates a response grounded in actual codebase content

### Workspace Capabilities
- Find relevant files across the entire project
- Trace function calls and data flow across modules
- Understand project architecture and patterns
- Suggest implementation approaches consistent with existing code style

## Copilot Coding Agent

### Autonomous Code Changes (As of 2026)
The Copilot coding agent is an autonomous AI agent that can make code changes on your behalf:
- **Assign issues to Copilot**: Assign a GitHub issue directly to Copilot and it will work on making the required changes
- **Automatic PR creation**: The agent creates a pull request for you to review when finished
- **Comment-driven iteration**: Leave comments on the PR asking for changes—Copilot picks them up automatically
- **Context-aware**: Incorporates context from related issue/PR discussions and follows repository custom instructions

### Cloud Agent Integration
- **GitHub cloud agent** (public preview): Delegate repetitive tasks directly from Visual Studio 2026
- Offload UI cleanups, refactors, doc updates, and multi-file edits while focusing on core development
- Enable via Settings > "Enable Copilot Coding Agent (Preview)"

### Agent Sessions
- **Agents tab in repository**: View all agent sessions, create tasks, review session logs with inline previews
- **Resume sessions**: Jump to PRs with one click or resume sessions in Copilot CLI without re-context
- Uses one premium request per model request the agent makes

## Agent Mode

### Skills Support (Public Preview)
Agent mode now supports skills to tailor Copilot for your workflows:
- Create custom skills for your projects
- Use community-shared skills from `github/awesome-copilot` or `anthropics/skills` repositories
- Reduce repeated setup and load skill-specific content into context when needed
- Enable via Settings > GitHub Copilot > Chat > Agent (JetBrains IDEs)

### Third-Party Coding Agents (Public Preview)
Use third-party coding agents alongside Copilot coding agent for expanded capabilities.

## Copilot CLI (Public Preview)

### Terminal-Based AI Assistance
A command line interface for using Copilot within the terminal:
- Get answers to questions directly in the terminal
- Ask Copilot to make changes to local files
- Interact with GitHub.com (list open PRs, create issues)

### CLI Enhancements (January 2026)
- **ACP (Anthropic Compute Platform) support** in preview
- **Native installation** via GitHub CLI
- **Improved agent context management and planning**
- Integration with VS Code Agent Sessions view for unified session management
- `/delegate` command to hand off work to the cloud coding agent

## Agentic Memory (Public Preview)

As of January 2026, Copilot automatically captures and learns repository-specific insights:
- Memories carry across features (coding agent, code review, CLI)
- Auto-expire after 28 days
- Stay repo-scoped for security and relevance

## Pull Request Features

### Automatic PR Summaries
When creating or updating a pull request, Copilot can generate:
- **Overview**: A concise summary of what the PR does and why
- **Changes walkthrough**: File-by-file description of modifications
- **Impact assessment**: What parts of the system are affected

### Copilot Code Review
AI-generated code review suggestions to help you write better code, with new review tools in public preview.

## Copilot Spaces

Organize and centralize relevant content—like code, docs, specs, and more—into Spaces that ground Copilot's responses in the right context for a specific task.

## GitHub Spark (Public Preview)

Build and deploy full-stack applications using natural-language prompts that seamlessly integrate with the GitHub platform for advanced development.

## MCP (Model Context Protocol) Integration

### MCP Server Updates (January 2026)
- New Projects tools for expanded capabilities
- OAuth scope filtering
- Additional features to expand Model Context Protocol functionality
- MCP marketplace preview available in VS Code

## IDE Support

### Supported Environments (As of 2026)
- **Visual Studio 2026**: Full Copilot integration with cloud agent, colorized completions, partial acceptance
- **VS Code**: Agent Sessions view, MCP marketplace, nested AGENTS.md support
- **JetBrains IDEs**: Agent mode with skills, refined settings with individual agent toggles
- **Xcode**: Gemini 3 Flash and multi-model support
- **Eclipse**: Expanded model availability
- **OpenCode**: New support added January 2026

### Copilot Actions (Visual Studio)
Access Copilot actions directly from the context menu—generate code comments, explanations, or optimizations with a single click.

## Enterprise Features

### For Administrators
- **Policy management**: Control which features are available to users
- **BYOK enhancements**: Expanded bring-your-own-key support with refined model management and policy controls
- **Copilot metrics with data residency** (preview): Enterprise Cloud accounts can see usage metrics with data residency controls
- **Editor preview features policy**: Control access to preview features like Agent Skills
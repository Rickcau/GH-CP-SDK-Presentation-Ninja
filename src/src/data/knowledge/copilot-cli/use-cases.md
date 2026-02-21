# GitHub Copilot CLI - Use Cases

## 1. Repository-Centric Workflows

### Codebase Exploration
```bash
copilot
> Explain the authentication flow in this codebase
> What dependencies does the payment module have?
> Find all API endpoints and list their HTTP methods
```

### Code Refactoring
```bash
copilot -p "Refactor the user service to use dependency injection"
copilot -p "Convert all callback-based functions in src/utils to async/await"
```

### Multi-file Changes
```bash
copilot
> Add TypeScript types to all functions in the api/ directory
> Update all imports to use the new module paths after restructuring
```

## 2. Issue-Driven Development

### Issue Analysis and Implementation
```bash
copilot
> Read issue #142 and create an implementation plan
> Fix the bug described in issue #87 and prepare a PR
```

### Pull Request Workflows
```bash
# Generate PR description from changes
/pr

# Review changes before committing
/review

# Prepare commit message
/commit
```

### Batch Issue Management
```bash
copilot -p "List all open issues labeled 'bug' in my-org/my-repo and prioritize by age"
copilot -p "Add a comment to stale PRs asking for an update"
```

## 3. DevOps Automation

### Infrastructure as Code
```bash
copilot
> Create a Terraform module for an AWS Lambda function with API Gateway
> Review my Kubernetes deployment for security best practices
> Generate a GitHub Actions workflow for CI/CD with testing and deployment
```

### Container Operations
```bash
copilot -p "Find which container is using the most memory and show its logs"
copilot -p "Create a docker-compose.yml for a Node.js app with Redis and PostgreSQL"
```

### Deployment Workflows
```bash
copilot
> Create a deployment checklist for the v2.3.0 release
> Generate rollback procedure documentation for the database migration
```

## 4. Built-in Agent Use Cases

### Explore Agent (Codebase Analysis)
```bash
copilot
> @explore How does the caching layer work?
> @explore What design patterns are used in the services directory?
```

### Task Agent (Build & Test)
```bash
copilot
> @task Run the test suite and summarize failures
> @task Build the project and fix any compilation errors
```

### Plan Agent (Implementation Planning)
```bash
copilot
> @plan Create a plan to add OAuth2 support to the API
> @plan Analyze what's needed to upgrade from React 18 to 19
```

### Code-Review Agent
```bash
copilot
> @code-review Review my staged changes
> @code-review Check for security issues in the auth module
```

## 5. CI/CD Integration

### Automated Scripts
```bash
# Silent mode for clean pipeline output
copilot -p "Generate release notes from commits since last tag" --silent

# Pre-approve specific tools
copilot -p "Run linting and auto-fix issues" --allow-tool 'shell(npm)'

# Export session for audit trail
copilot -p "Perform security audit" --share audit-$(date +%Y%m%d).md
```

### Pipeline Integration
```bash
# In CI/CD pipeline
export GITHUB_ASKPASS=/path/to/token-provider
copilot -p "Validate all Terraform configurations" --allow-tool 'shell(terraform)'
```

## 6. Git Operations

### Complex Git Commands
```bash
copilot
> Find which commit introduced the regression in the login flow
> Show me all commits that touched both the API and database layers
> Create a branch from the state of main as of last Friday
```

### Repository Maintenance
```bash
copilot -p "Find and clean up merged branches older than 30 days"
copilot -p "Generate a changelog from commits between v1.0 and v2.0"
```

## 7. Documentation and Knowledge

### Code Documentation
```bash
copilot
> Generate JSDoc comments for all exported functions in src/api
> Create a README for this project based on the codebase structure
```

### Learning and Explanation
```bash
# Explain complex commands
/explain tar -czf backup.tar.gz --exclude='.git' --exclude='node_modules' .

# Understand codebase patterns
copilot
> Explain the error handling strategy used in this project
```

## 8. MCP-Powered Integrations

### GitHub Platform Operations
```bash
copilot
> Create an issue for tracking the API performance improvements
> List all my assigned PRs across all repositories
> Check the status of the latest CI run for this branch
```

### Custom MCP Servers
```bash
# Add internal tools
/mcp add internal-api-server

copilot
> Query our internal metrics API for error rates
> Update the feature flag in our config service
```

## 9. Visual Debugging (As of November 2025)

### Image-Based Workflows
```bash
copilot
# Paste or drag-drop screenshot
> Debug this error message I'm seeing
> Implement UI changes based on this mockup
```

## 10. Session Workflows

### Persistent Development Sessions
```bash
copilot
> [Start implementing feature]
> [Continue next day with --resume]
copilot --resume  # TAB to cycle through sessions

# Share session for collaboration
/share feature-implementation.md
/share-gist  # Create shareable GitHub gist
```

### Context Management
```bash
# Monitor token usage
/context

# Compress when needed
/compact

# Add additional directories to context
/add-dir ./related-service
```
## Presentation Ninja - Agent Instructions

You are a presentation generation agent for the Presentation Ninja application.

### Core Topics
You generate presentations about exactly four topics:
1. Microsoft Foundry (Azure AI Foundry)
2. GitHub Copilot CLI
3. GitHub Copilot
4. GitHub Copilot SDK

### Build & Run
```bash
cd src
npm install
npm run dev
```

### Code Style
- TypeScript strict mode
- Use async/await
- Prefer server components where possible
- Client components use "use client" directive
- All API routes in src/app/api/

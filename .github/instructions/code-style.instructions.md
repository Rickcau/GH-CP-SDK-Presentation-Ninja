# Code Style & Conventions — PowerPoint Ninja

## TypeScript

- Strict mode enabled in `tsconfig.json`
- Use `async/await` for all async operations (no raw Promises or callbacks)
- Use `zod` for runtime validation of AI tool parameters and API inputs
- Prefer explicit types over `any` — use `unknown` when the type is genuinely unknown

## Next.js App Router

- **Server components** are the default — use them whenever possible
- **Client components** must have `"use client"` directive at the top of the file
- **API routes** go in `src/app/api/` — use route handlers (`route.ts` with `GET`/`POST` exports)
- **Layouts** in route groups use `(app)/` for authenticated routes and `auth/` for login
- Prefer server actions or API routes over client-side data fetching where feasible

## Styling

- **Tailwind CSS v4** — all styling via utility classes
- No CSS modules, no styled-components, no inline `style` objects (except in generated HTML)
- Use `cn()` from `src/lib/utils.ts` to merge conditional class names
- Follow existing shadcn/ui patterns for components in `src/components/ui/`

## File Organization

- **Components**: `src/components/` — PascalCase filenames (`SlidePresenter.tsx`)
- **Libraries**: `src/lib/` — camelCase filenames (`copilot-agent.ts`)
- **Types**: Colocate with usage; shared types in dedicated `types.ts` files
- **API routes**: One folder per endpoint in `src/app/api/`

## Agent & Tools

- Define tools via `defineTool(name, { description, parameters: z.object(...), handler })` from `@github/copilot-sdk`
- Tool handlers return strings (the model sees the return value as text)
- Use descriptive tool names: `search_knowledge`, `web_search`, `generate_slide`
- Include `.describe()` on every zod parameter for the model

## Database

- `better-sqlite3` for local development — synchronous API
- Schema auto-created on first access via `getDb()` in `src/lib/db.ts`
- All queries are prepared statements (parameterized) — never concatenate user input
- Tables: `users`, `presentations`, `slides`

## Authentication

- NextAuth.js v5 with `credentials` provider
- Demo account auto-seeded: `demo@deckforge.local` / `demo1234`
- Protected routes handled by `src/middleware.ts`
- Use `auth()` in server components, `useSession()` in client components

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes (live mode) | GitHub PAT with Copilot access |
| `NEXTAUTH_SECRET` | Yes (production) | NextAuth session encryption key |
| `NEXTAUTH_URL` | Yes (production) | App base URL |
| `TAVILY_API_KEY` | No | Tavily Search API key for web search |
| `COPILOT_MODEL` | No | Default model override |
| `USE_MOCK_AGENT` | No | Force mock mode |
| `DATABASE_URL` | No | PostgreSQL URL (defaults to SQLite) |

## Topic Mapping

The app uses `microsoft-foundry` as the topic key in the UI and database, but the knowledge library directory is named `foundry`. See `TOPIC_DIR_MAP` in `copilot-agent.ts`:

```typescript
const TOPIC_DIR_MAP: Record<string, string> = {
  "microsoft-foundry": "foundry",
};
```

## SSE Streaming

The `/api/agent` route streams `AgentEvent` objects as Server-Sent Events:
```typescript
type AgentEvent =
  | { type: "status"; data: { message: string; step: number } }
  | { type: "slide"; data: { slideIndex: number; totalSlides: number; slide: SlidePlan } }
  | { type: "complete"; data: { plan: PresentationPlan } }
  | { type: "error"; data: { message: string } };
```

## Error Handling

- API routes: Return `NextResponse.json({ error: message }, { status: code })`
- Agent errors: Yield `{ type: "error", data: { message } }` event
- Client-side: Show error in UI, don't silently swallow failures
- Copilot SDK cleanup: Always `client.stop()` in a `try/finally` block

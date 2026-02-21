import Database from "better-sqlite3";
import path from "path";
import { hashSync } from "bcryptjs";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") || path.join(process.cwd(), "data", "app.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    const fs = require("fs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    initSchema(_db);
    seedDemoAccount(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS knowledge_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'ready' CHECK(status IN ('building', 'ready', 'error')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      deck_type TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'dark-luxe',
      prompt TEXT,
      status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('generating', 'completed', 'failed')),
      slide_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS slides (
      id TEXT PRIMARY KEY,
      presentation_id TEXT NOT NULL,
      slide_index INTEGER NOT NULL,
      layout TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL, -- JSON stringified
      speaker_notes TEXT,
      code_example TEXT, -- JSON stringified or null
      chart_data TEXT, -- JSON stringified or null
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);
    CREATE INDEX IF NOT EXISTS idx_slides_presentation ON slides(presentation_id);
  `);

  // Migration: add html_content column for HTML presentation mode
  try {
    db.exec(`ALTER TABLE presentations ADD COLUMN html_content TEXT`);
  } catch {
    // Column already exists — ignore
  }

  // Migration: remove CHECK constraint on topic column (old schema enforced 4 fixed topics)
  // SQLite doesn't support DROP CONSTRAINT, so we migrate data to a new table
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='presentations'").get() as { sql: string } | undefined;
    if (tableInfo?.sql && tableInfo.sql.includes("CHECK(topic IN")) {
      db.exec(`
        CREATE TABLE presentations_new (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          topic TEXT NOT NULL,
          deck_type TEXT NOT NULL,
          theme TEXT NOT NULL DEFAULT 'dark-luxe',
          prompt TEXT,
          status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('generating', 'completed', 'failed')),
          slide_count INTEGER DEFAULT 0,
          html_content TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        INSERT INTO presentations_new SELECT id, user_id, title, topic, deck_type, theme, prompt, status, slide_count, html_content, created_at, updated_at FROM presentations;
        DROP TABLE presentations;
        ALTER TABLE presentations_new RENAME TO presentations;
        CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);
      `);
    }
  } catch {
    // Migration already done or table doesn't exist yet
  }

  // Seed default knowledge sources
  seedKnowledgeSources(db);
}

function seedKnowledgeSources(db: Database.Database) {
  const { v4: uuidv4 } = require("uuid");
  const defaults = [
    { name: "GitHub Copilot", slug: "copilot", description: "AI pair programmer for developers" },
    { name: "GitHub Copilot CLI", slug: "copilot-cli", description: "AI-powered command line assistant" },
    { name: "GitHub Copilot SDK", slug: "copilot-sdk", description: "Build agents with Copilot's runtime" },
    { name: "Azure AI Foundry", slug: "foundry", description: "Unified AI platform on Azure" },
  ];

  const insert = db.prepare(
    "INSERT OR IGNORE INTO knowledge_sources (id, name, slug, description, status) VALUES (?, ?, ?, ?, 'ready')"
  );

  for (const src of defaults) {
    insert.run(uuidv4(), src.name, src.slug, src.description);
  }
}

function seedDemoAccount(db: Database.Database) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@deckforge.local");
  if (existing) return;

  const { v4: uuidv4 } = require("uuid");
  const demoUserId = uuidv4();

  db.prepare(
    "INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)"
  ).run(demoUserId, "demo@deckforge.local", "Demo User", hashSync("demo1234", 10));

  // Seed example presentations
  const examples = [
    {
      id: uuidv4(),
      title: "GitHub Copilot SDK — Getting Started",
      topic: "copilot-sdk",
      deck_type: "getting-started",
      theme: "dark-luxe",
      prompt: "Create a getting started guide for the GitHub Copilot SDK",
      slide_count: 8,
      slides: [
        { layout: "title", title: "GitHub Copilot SDK", content: ["Getting Started Guide", "Build AI-powered applications with the Copilot SDK"] },
        { layout: "content", title: "What is the Copilot SDK?", content: ["Multi-platform toolkit for embedding Copilot's agentic workflows", "Same engine behind Copilot CLI — production-tested", "Available in TypeScript, Python, Go, and .NET", "Handles planning, tool invocation, and context management"] },
        { layout: "split", title: "Architecture Overview", content: ["Your App → SDK Client → JSON-RPC → Copilot CLI → Model Provider", "The SDK manages the CLI process lifecycle automatically", "Custom tools extend agent capabilities"] },
        { layout: "code", title: "Quick Start", content: ["Install the SDK and create your first agent"], codeExample: { language: "typescript", code: "import { CopilotClient } from '@github/copilot-sdk';\n\nconst client = new CopilotClient();\nawait client.start();\n\nconst session = await client.createSession({\n  model: 'gpt-5',\n  streaming: true,\n});\n\nconst reply = await session.sendAndWait({\n  prompt: 'Hello from the SDK!'\n});" } },
        { layout: "content", title: "Custom Tools with defineTool", content: ["Define tools with Zod schemas for type-safe parameters", "Handler functions execute your custom logic", "Agent automatically decides when to call tools", "Results feed back into the agent's reasoning"] },
        { layout: "comparison", title: "Authentication Options", content: ["GitHub Credentials: Signed-in user credentials", "OAuth GitHub App: App tokens for web applications", "Environment Variables: COPILOT_GITHUB_TOKEN", "BYOK: Bring your own API keys (OpenAI, Azure, Anthropic)"] },
        { layout: "timeline", title: "Integration Roadmap", content: ["Week 1: Set up SDK + basic agent", "Week 2: Add custom tools + streaming", "Week 3: Production deployment + monitoring", "Week 4: Advanced features + optimization"] },
        { layout: "stat", title: "SDK Adoption", content: ["7,200+ GitHub stars", "862 forks", "38 contributors", "4 supported languages"] }
      ]
    },
    {
      id: uuidv4(),
      title: "GitHub Copilot — Enterprise Adoption",
      topic: "copilot",
      deck_type: "overview",
      theme: "tech-gradient",
      prompt: "Create an enterprise adoption overview for GitHub Copilot",
      slide_count: 6,
      slides: [
        { layout: "title", title: "GitHub Copilot", content: ["Enterprise Adoption Plan", "Accelerate developer productivity with AI"] },
        { layout: "stat", title: "The Impact", content: ["55% faster coding", "74% more focused developers", "46% more code completed", "Measurable ROI within weeks"] },
        { layout: "content", title: "Enterprise Features", content: ["Organization-wide policy management", "Usage analytics and adoption metrics", "Knowledge bases for custom context", "Content exclusions for sensitive repos", "Audit logs and compliance reporting"] },
        { layout: "comparison", title: "Copilot Plans", content: ["Individual: $10/mo — IDE completions + chat", "Business: $19/mo — Organization management + policies", "Enterprise: $39/mo — Knowledge bases + audit + admin controls"] },
        { layout: "timeline", title: "Rollout Strategy", content: ["Phase 1: Pilot with 50 developers (2 weeks)", "Phase 2: Expand to 500 developers (4 weeks)", "Phase 3: Organization-wide rollout (2 weeks)", "Phase 4: Measure and optimize (ongoing)"] },
        { layout: "content", title: "Next Steps", content: ["Start a Copilot Business trial", "Identify pilot team champions", "Set up organization policies", "Define success metrics", "Schedule monthly adoption reviews"] }
      ]
    },
    {
      id: uuidv4(),
      title: "Azure AI Foundry — Architecture Deep Dive",
      topic: "microsoft-foundry",
      deck_type: "architecture",
      theme: "clean-corporate",
      prompt: "Create an architecture deep dive for Azure AI Foundry",
      slide_count: 6,
      slides: [
        { layout: "title", title: "Azure AI Foundry", content: ["Architecture Deep Dive", "Build, deploy, and manage AI applications at scale"] },
        { layout: "content", title: "What is Azure AI Foundry?", content: ["Unified platform for AI application development", "Model catalog with 1,600+ models", "Built-in prompt flow for orchestration", "Responsible AI tools and evaluations", "Enterprise-grade security and compliance"] },
        { layout: "split", title: "Platform Architecture", content: ["AI Foundry Hub: Central governance and shared resources", "AI Foundry Project: Team workspace for development", "Model Catalog: Azure OpenAI, Meta, Mistral, and more", "Prompt Flow: Visual orchestration and testing"] },
        { layout: "bento", title: "Key Capabilities", content: ["Model Fine-tuning: Customize models for your domain", "Prompt Flow: Build and test AI workflows visually", "Evaluations: Automated quality and safety testing", "Deployments: Managed endpoints with autoscaling"] },
        { layout: "content", title: "Integration Points", content: ["Azure AI Search for RAG patterns", "Azure Blob Storage for data assets", "Azure Key Vault for secrets management", "GitHub Actions for CI/CD of AI workflows", "Azure Monitor for observability"] },
        { layout: "stat", title: "Enterprise Scale", content: ["1,600+ models available", "99.9% SLA", "60+ Azure regions", "SOC 2 / ISO 27001 compliant"] }
      ]
    }
  ];

  const insertPresentation = db.prepare(
    "INSERT INTO presentations (id, user_id, title, topic, deck_type, theme, prompt, status, slide_count) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)"
  );

  const insertSlide = db.prepare(
    "INSERT INTO slides (id, presentation_id, slide_index, layout, title, content, speaker_notes, code_example, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const seedAll = db.transaction(() => {
    for (const pres of examples) {
      insertPresentation.run(
        pres.id, demoUserId, pres.title, pres.topic, pres.deck_type, pres.theme, pres.prompt, pres.slide_count
      );
      pres.slides.forEach((slide: any, index: number) => {
        insertSlide.run(
          uuidv4(),
          pres.id,
          index,
          slide.layout,
          slide.title,
          JSON.stringify(slide.content),
          slide.speakerNotes || null,
          slide.codeExample ? JSON.stringify(slide.codeExample) : null,
          slide.chartData ? JSON.stringify(slide.chartData) : null
        );
      });
    }
  });

  seedAll();
}

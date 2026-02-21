import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "src", "data", "knowledge");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const sources = db
    .prepare("SELECT * FROM knowledge_sources ORDER BY created_at ASC")
    .all();

  return NextResponse.json(sources);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body as { name?: string };

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required (min 2 chars)" }, { status: 400 });
  }

  const slug = slugify(name.trim());
  if (!slug) {
    return NextResponse.json({ error: "Invalid name — must contain alphanumeric characters" }, { status: 400 });
  }

  const db = getDb();

  // Check for duplicate slug
  const existing = db.prepare("SELECT id FROM knowledge_sources WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: `A knowledge source with slug "${slug}" already exists` }, { status: 409 });
  }

  const id = uuidv4();

  // Create the knowledge directory
  const sourceDir = path.join(KNOWLEDGE_DIR, slug);
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  // Insert with 'building' status — the client will trigger a refresh to populate content
  db.prepare(
    "INSERT INTO knowledge_sources (id, name, slug, description, status) VALUES (?, ?, ?, ?, 'building')"
  ).run(id, name.trim(), slug, null);

  const source = db.prepare("SELECT * FROM knowledge_sources WHERE id = ?").get(id);

  return NextResponse.json(source, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "src", "data", "knowledge");

// Default sources cannot be deleted
const PROTECTED_SLUGS = ["copilot", "copilot-cli", "copilot-sdk", "foundry"];

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const source = db.prepare("SELECT * FROM knowledge_sources WHERE id = ?").get(id) as { id: string; slug: string } | undefined;
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (PROTECTED_SLUGS.includes(source.slug)) {
    return NextResponse.json({ error: "Cannot delete a default knowledge source" }, { status: 403 });
  }

  // Delete knowledge files
  const sourceDir = path.join(KNOWLEDGE_DIR, source.slug);
  if (fs.existsSync(sourceDir)) {
    fs.rmSync(sourceDir, { recursive: true });
  }

  db.prepare("DELETE FROM knowledge_sources WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, description } = body as { status?: string; description?: string };

  const db = getDb();
  const source = db.prepare("SELECT * FROM knowledge_sources WHERE id = ?").get(id);
  if (!source) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (status) {
    db.prepare("UPDATE knowledge_sources SET status = ? WHERE id = ?").run(status, id);
  }
  if (description !== undefined) {
    db.prepare("UPDATE knowledge_sources SET description = ? WHERE id = ?").run(description, id);
  }

  const updated = db.prepare("SELECT * FROM knowledge_sources WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

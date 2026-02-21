import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const row = db
    .prepare("SELECT id, title, topic, status, slide_count, created_at FROM presentations WHERE id = ?")
    .get(id) as { id: string; title: string; topic: string; status: string; slide_count: number; created_at: string } | undefined;

  if (!row) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(row), {
    headers: { "Content-Type": "application/json" },
  });
}

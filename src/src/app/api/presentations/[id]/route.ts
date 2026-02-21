import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  const presentation = db
    .prepare("SELECT * FROM presentations WHERE id = ? AND user_id = ?")
    .get(id, session.user.id) as any;

  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slides = db
    .prepare("SELECT * FROM slides WHERE presentation_id = ? ORDER BY slide_index ASC")
    .all(id) as any[];

  // Parse JSON fields
  const parsedSlides = slides.map((s: any) => ({
    ...s,
    content: JSON.parse(s.content),
    codeExample: s.code_example ? JSON.parse(s.code_example) : undefined,
    chartData: s.chart_data ? JSON.parse(s.chart_data) : undefined,
  }));

  return NextResponse.json({ ...presentation, slides: parsedSlides });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  db.prepare("DELETE FROM slides WHERE presentation_id = ?").run(id);
  db.prepare("DELETE FROM presentations WHERE id = ? AND user_id = ?").run(id, session.user.id);

  return NextResponse.json({ success: true });
}

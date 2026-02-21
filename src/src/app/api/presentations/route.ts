import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const presentations = db
    .prepare(
      "SELECT * FROM presentations WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(session.user.id);

  return NextResponse.json(presentations);
}

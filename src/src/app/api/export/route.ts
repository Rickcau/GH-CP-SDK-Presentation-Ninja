import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generatePptx } from "@/lib/export/pptx";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { presentationId, format } = await req.json();

  const db = getDb();
  const presentation = db
    .prepare("SELECT * FROM presentations WHERE id = ? AND user_id = ?")
    .get(presentationId, session.user.id) as any;

  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slides = db
    .prepare("SELECT * FROM slides WHERE presentation_id = ? ORDER BY slide_index ASC")
    .all(presentationId) as any[];

  const parsedSlides = slides.map((s: any) => ({
    layout: s.layout,
    title: s.title,
    content: JSON.parse(s.content),
    codeExample: s.code_example ? JSON.parse(s.code_example) : undefined,
    chartData: s.chart_data ? JSON.parse(s.chart_data) : undefined,
  }));

  if (format === "pptx") {
    const buffer = await generatePptx({
      title: presentation.title,
      theme: presentation.theme,
      slides: parsedSlides,
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${presentation.title.replace(/[^a-zA-Z0-9 ]/g, "")}.pptx"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format. Use: pptx" }, { status: 400 });
}

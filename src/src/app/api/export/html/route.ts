import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presentationId = request.nextUrl.searchParams.get("presentationId");
    if (!presentationId) {
      return NextResponse.json(
        { error: "Missing required query parameter: presentationId" },
        { status: 400 }
      );
    }

    const db = getDb();
    const presentation = db
      .prepare("SELECT * FROM presentations WHERE id = ? AND user_id = ?")
      .get(presentationId, session.user.id) as
      | { id: string; title: string; data?: string }
      | undefined;

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    if (!presentation.data) {
      return NextResponse.json(
        { error: "No HTML content available for this presentation" },
        { status: 404 }
      );
    }

    let htmlContent: string;
    try {
      const parsed = JSON.parse(presentation.data);
      htmlContent = parsed.htmlContent;
    } catch {
      return NextResponse.json(
        { error: "Invalid presentation data" },
        { status: 500 }
      );
    }

    if (!htmlContent) {
      return NextResponse.json(
        { error: "No HTML content found in presentation data" },
        { status: 404 }
      );
    }

    // Sanitize title for use as filename: keep alphanumeric, spaces, hyphens, underscores
    const sanitizedTitle = presentation.title
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "presentation";

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${sanitizedTitle}.html"`,
      },
    });
  } catch (error) {
    console.error("HTML export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

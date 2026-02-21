import { NextRequest } from "next/server";
import { generatePresentation, Topic, DeckType, OutputFormat } from "@/lib/agent";
import type { TopicItem } from "@/lib/agent/types";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    topic: rawTopic,
    knowledgeSource,
    deckType,
    prompt,
    theme,
    slideCount,
    includeCode,
    includeSpeakerNotes,
    model,
    userId,
    outputFormat,
    presentationTopics,
    presentationTitle,
    topicItems,
  } = body as {
    topic?: Topic;
    knowledgeSource?: string;
    deckType: DeckType;
    prompt: string;
    theme?: string;
    slideCount?: number;
    includeCode?: boolean;
    includeSpeakerNotes?: boolean;
    model?: string;
    userId?: string;
    outputFormat?: OutputFormat;
    presentationTopics?: string[];
    presentationTitle?: string;
    topicItems?: TopicItem[];
  };

  // Accept either "knowledgeSource" (new) or "topic" (legacy)
  const topic = knowledgeSource || rawTopic;

  if (!topic || !deckType) {
    return new Response(JSON.stringify({ error: "topic/knowledgeSource and deckType are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pre-generate presentationId and create DB record with 'generating' status
  const presentationId = uuidv4();
  if (userId) {
    try {
      const db = getDb();
      db.prepare(
        "INSERT INTO presentations (id, user_id, title, topic, deck_type, theme, prompt, status, slide_count) VALUES (?, ?, ?, ?, ?, ?, ?, 'generating', 0)"
      ).run(
        presentationId,
        userId,
        presentationTitle || "Untitled",
        topic,
        deckType,
        theme || "",
        prompt || ""
      );
    } catch (dbError) {
      console.error("Error creating generating record:", dbError);
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the presentationId immediately so the client can track it
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "generationStarted", data: { presentationId } })}\n\n`)
        );

        const generator = generatePresentation(topic, deckType, prompt || "", {
          theme,
          slideCount,
          includeCode,
          includeSpeakerNotes,
          model,
          outputFormat,
          presentationTopics,
          presentationTitle,
          topicItems,
        });

        for await (const event of generator) {
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));

          // Save to database when HTML generation completes
          if (event.type === "htmlComplete" && userId) {
            try {
              const db = getDb();
              const plan = event.data.plan;
              const htmlContent = event.data.htmlContent;

              db.prepare(
                "UPDATE presentations SET title = ?, topic = ?, deck_type = ?, theme = ?, status = 'completed', slide_count = ?, html_content = ? WHERE id = ?"
              ).run(plan.title, plan.topic, plan.deckType, plan.theme, plan.slides.length, htmlContent, presentationId);

              const insertSlide = db.prepare(
                "INSERT INTO slides (id, presentation_id, slide_index, layout, title, content, speaker_notes, code_example, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
              );

              for (const slide of plan.slides) {
                insertSlide.run(
                  uuidv4(),
                  presentationId,
                  slide.index,
                  slide.layout,
                  slide.title,
                  JSON.stringify(slide.keyPoints),
                  slide.speakerNotes || null,
                  slide.codeExample ? JSON.stringify(slide.codeExample) : null,
                  slide.chartData ? JSON.stringify(slide.chartData) : null
                );
              }

              // Send the presentation ID back
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "saved", data: { presentationId } })}\n\n`)
              );
            } catch (dbError) {
              console.error("Error saving HTML presentation:", dbError);
            }
          }

          // Save to database when standard slides generation completes
          if (event.type === "complete" && userId) {
            try {
              const db = getDb();
              const plan = event.data.plan;

              db.prepare(
                "UPDATE presentations SET title = ?, topic = ?, deck_type = ?, theme = ?, status = 'completed', slide_count = ? WHERE id = ?"
              ).run(plan.title, plan.topic, plan.deckType, plan.theme, plan.slides.length, presentationId);

              const insertSlide = db.prepare(
                "INSERT INTO slides (id, presentation_id, slide_index, layout, title, content, speaker_notes, code_example, chart_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
              );

              for (const slide of plan.slides) {
                insertSlide.run(
                  uuidv4(),
                  presentationId,
                  slide.index,
                  slide.layout,
                  slide.title,
                  JSON.stringify(slide.keyPoints),
                  slide.speakerNotes || null,
                  slide.codeExample ? JSON.stringify(slide.codeExample) : null,
                  slide.chartData ? JSON.stringify(slide.chartData) : null
                );
              }

              // Send the presentation ID back
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "saved", data: { presentationId } })}\n\n`)
              );
            } catch (dbError) {
              console.error("Error saving presentation:", dbError);
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        // Mark as failed in DB
        if (userId) {
          try {
            const db = getDb();
            db.prepare("UPDATE presentations SET status = 'failed' WHERE id = ?").run(presentationId);
          } catch {
            // ignore cleanup errors
          }
        }
        const errMsg = JSON.stringify({ type: "error", data: { message: String(error) } });
        controller.enqueue(encoder.encode(`data: ${errMsg}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

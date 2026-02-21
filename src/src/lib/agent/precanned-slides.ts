import type { SlidePlan, TopicItem } from "./types";

/** Build a precanned "Demo" slide at the given index */
export function buildDemoSlide(index: number, title?: string): SlidePlan {
  return {
    index,
    layout: "demo",
    title: title || "LIVE DEMO",
    keyPoints: [
      "Time for a live demonstration",
      "Watch the feature in action",
      "Follow along or take notes",
      "Questions welcome after the demo",
    ],
    speakerNotes: "This is a demo slide — switch to your live demo environment.",
  };
}

/** Build a precanned "YouTube" slide at the given index */
export function buildYoutubeSlide(index: number, url: string, title?: string): SlidePlan {
  return {
    index,
    layout: "youtube",
    title: title || "Video",
    keyPoints: [url],
    speakerNotes: "This slide embeds a YouTube video.",
    youtubeUrl: url,
  };
}

/**
 * Merge AI-generated slides with precanned (demo/youtube) slides
 * based on the ordered TopicItem list.
 *
 * AI slides are consumed in order for each `type: "topic"` item.
 * Demo/YouTube items get precanned slides injected at their position.
 * All slides are re-indexed sequentially.
 */
export function mergeAiAndPrecannedSlides(
  topicItems: TopicItem[],
  aiSlides: SlidePlan[],
): SlidePlan[] {
  const merged: SlidePlan[] = [];
  let aiIndex = 0;

  console.log("[Merge] topicItems count:", topicItems.length, "types:", topicItems.map(i => i.type));
  console.log("[Merge] aiSlides count:", aiSlides.length);

  for (const item of topicItems) {
    switch (item.type) {
      case "topic": {
        if (aiIndex < aiSlides.length) {
          merged.push(aiSlides[aiIndex]);
          console.log(`[Merge] topic "${item.text}" -> AI slide "${aiSlides[aiIndex].title}"`);
          aiIndex++;
        } else {
          console.log(`[Merge] topic "${item.text}" -> NO matching AI slide (aiIndex=${aiIndex}, aiSlides=${aiSlides.length})`);
        }
        break;
      }
      case "demo": {
        const demoSlide = buildDemoSlide(0, item.title);
        merged.push(demoSlide);
        console.log(`[Merge] demo -> injected "${demoSlide.title}"`);
        break;
      }
      case "youtube": {
        const ytSlide = buildYoutubeSlide(0, item.url, item.title);
        merged.push(ytSlide);
        console.log(`[Merge] youtube -> injected "${ytSlide.title}"`);
        break;
      }
      default: {
        console.log(`[Merge] UNKNOWN item type:`, JSON.stringify(item));
        break;
      }
    }
  }

  // Append any remaining AI slides
  while (aiIndex < aiSlides.length) {
    merged.push(aiSlides[aiIndex]);
    console.log(`[Merge] appending remaining AI slide "${aiSlides[aiIndex].title}"`);
    aiIndex++;
  }

  console.log("[Merge] final merged count:", merged.length, "titles:", merged.map(s => s.title));

  // Re-index all slides sequentially
  return merged.map((slide, i) => ({ ...slide, index: i }));
}

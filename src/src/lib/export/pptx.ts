import PptxGenJS from "pptxgenjs";

interface SlideData {
  layout: string;
  title: string;
  content: string[];
  codeExample?: { language: string; code: string; caption?: string };
  chartData?: { type: string; data: { label: string; value: number }[] };
}

interface ExportOptions {
  title: string;
  theme: string;
  slides: SlideData[];
}

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string; muted: string }> = {
  "dark-luxe": { bg: "0A0A0F", text: "FFFFFF", accent: "14B8A6", muted: "9CA3AF" },
  "tech-gradient": { bg: "1E1B4B", text: "FFFFFF", accent: "2DD4BF", muted: "A5B4FC" },
  "clean-corporate": { bg: "FFFFFF", text: "111827", accent: "1D4ED8", muted: "6B7280" },
  "bold-statement": { bg: "000000", text: "FFFFFF", accent: "FACC15", muted: "6B7280" },
  "warm-minimal": { bg: "FAF8F5", text: "1C1917", accent: "92400E", muted: "78716C" },
};

export async function generatePptx(options: ExportOptions): Promise<Buffer> {
  const pptx = new PptxGenJS();
  const colors = THEME_COLORS[options.theme] || THEME_COLORS["dark-luxe"];

  pptx.title = options.title;
  pptx.layout = "LAYOUT_WIDE"; // 16:9

  for (const slideData of options.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.bg };

    switch (slideData.layout) {
      case "title":
        slide.addText(slideData.title, {
          x: 1, y: 2, w: "80%", h: 1.5,
          fontSize: 36, bold: true, color: colors.text,
          align: "center",
        });
        slideData.content.forEach((line, i) => {
          slide.addText(line, {
            x: 1, y: 3.8 + i * 0.5, w: "80%", h: 0.5,
            fontSize: 18, color: colors.muted,
            align: "center",
          });
        });
        break;

      case "code":
        slide.addText(slideData.title, {
          x: 0.8, y: 0.5, w: "90%", h: 0.8,
          fontSize: 28, bold: true, color: colors.text,
        });
        if (slideData.codeExample) {
          slide.addText(slideData.codeExample.code, {
            x: 0.8, y: 1.5, w: "90%", h: 4.5,
            fontSize: 11, fontFace: "Courier New", color: "A6E3A1",
            fill: { color: "1E1E2E" },
            valign: "top",
          });
        }
        break;

      case "stat":
        slide.addText(slideData.title, {
          x: 1, y: 0.5, w: "80%", h: 0.8,
          fontSize: 24, color: colors.muted,
          align: "center",
        });
        slideData.content.forEach((stat, i) => {
          const parts = stat.split(/:\s*|—\s*|–\s*/);
          const col = i % 2;
          const row = Math.floor(i / 2);
          slide.addText(parts[0], {
            x: col * 5 + 1, y: row * 2.2 + 1.8, w: 4, h: 0.8,
            fontSize: 32, bold: true, color: colors.accent,
            align: "center",
          });
          if (parts[1]) {
            slide.addText(parts[1], {
              x: col * 5 + 1, y: row * 2.2 + 2.6, w: 4, h: 0.5,
              fontSize: 14, color: colors.muted,
              align: "center",
            });
          }
        });
        break;

      default: // content, split, comparison, timeline, bento, quote, chart
        slide.addText(slideData.title, {
          x: 0.8, y: 0.5, w: "90%", h: 0.8,
          fontSize: 28, bold: true, color: colors.text,
        });
        slideData.content.forEach((point, i) => {
          slide.addText(point, {
            x: 1.2, y: 1.6 + i * 0.65, w: "85%", h: 0.6,
            fontSize: 16, color: colors.text,
            bullet: { code: "2022" },
          });
        });
        break;
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return output as Buffer;
}

import type { SlidePlan } from "@/lib/agent/types";
import type { HtmlSlide } from "./types";

/** Map the component-based theme names to HTML theme IDs */
export function mapToHtmlTheme(theme: string): string {
  const MAP: Record<string, string> = {
    "dark-luxe": "cyan-violet",
    "tech-gradient": "cyan-violet",
    "clean-corporate": "slate-blue",
    "bold-statement": "amber-rose",
    "warm-minimal": "emerald-cyan",
    // HTML themes can also be used directly
    "cyan-violet": "cyan-violet",
    "emerald-cyan": "emerald-cyan",
    "amber-rose": "amber-rose",
    "slate-blue": "slate-blue",
  };
  return MAP[theme] || "cyan-violet";
}

/** Convert a SlidePlan to an HTML slide fragment */
export function slidePlanToHtml(slide: SlidePlan, index: number): HtmlSlide {
  let html: string;

  // Check for YouTube slides (either by layout or youtubeUrl field)
  if (slide.layout === "youtube" || slide.youtubeUrl) {
    html = buildYoutubeSlideHtml(slide);
  } else {
    switch (slide.layout) {
      case "title":
        html = buildTitleSlideHtml(slide);
        break;
      case "demo":
        html = buildDemoSlideHtml(slide);
        break;
      case "stat":
        html = buildStatSlideHtml(slide);
        break;
      case "code":
        html = buildCodeSlideHtml(slide);
        break;
      case "comparison":
        html = buildComparisonSlideHtml(slide);
        break;
      case "timeline":
        html = buildTimelineSlideHtml(slide);
        break;
      case "quote":
        html = buildQuoteSlideHtml(slide);
        break;
      default:
        html = buildContentSlideHtml(slide);
        break;
    }
  }

  return {
    index,
    title: slide.title,
    html,
    speakerNotes: slide.speakerNotes,
    layout: slide.layout,
  };
}

function buildTitleSlideHtml(slide: SlidePlan): string {
  const subtitle = slide.keyPoints[0] || "";
  const extra = slide.keyPoints[1] || "";
  return `<style>
.title-s{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:80px;text-align:center;position:relative;overflow:hidden}
.title-s .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.title-s .orb1{width:400px;height:400px;top:-100px;right:-100px;background:var(--orb1)}
.title-s .orb2{width:300px;height:300px;bottom:-50px;left:-50px;background:var(--orb2)}
.title-s h1{font-size:3.5rem;font-weight:800;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px;animation:tsFadeUp .8s ease both}
.title-s .sub{font-size:1.3rem;color:var(--text-muted);margin-bottom:12px;animation:tsFadeUp .8s ease .15s both}
.title-s .extra{font-size:0.95rem;color:var(--text-subtle);animation:tsFadeUp .8s ease .3s both}
@keyframes tsFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
</style>
<div class="title-s">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <h1>${esc(slide.title)}</h1>
  <div class="sub">${esc(subtitle)}</div>
  <div class="extra">${esc(extra)}</div>
</div>`;
}

function buildContentSlideHtml(slide: SlidePlan): string {
  const items = slide.keyPoints
    .map((kp, i) => `<div class="cs-item" style="animation-delay:${i * 0.1}s">
      <div class="cs-icon">${pickEmoji(i)}</div>
      <div class="cs-text">${esc(kp)}</div>
    </div>`)
    .join("\n");
  return `<style>
.content-s{padding:80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.content-s .orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none}
.content-s .orb1{width:300px;height:300px;top:-80px;right:-80px;background:var(--orb1)}
.content-s h2{font-size:2.2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:40px}
.cs-item{display:flex;align-items:flex-start;gap:16px;padding:14px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:12px;animation:csFade .5s ease both}
.cs-icon{width:36px;height:36px;border-radius:8px;background:rgba(var(--primary-rgb),0.15);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.cs-text{font-size:1.05rem;line-height:1.6;color:var(--text)}
@keyframes csFade{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
</style>
<div class="content-s">
  <div class="orb orb1"></div>
  <h2>${esc(slide.title)}</h2>
  ${items}
</div>`;
}

function buildStatSlideHtml(slide: SlidePlan): string {
  const stats = slide.keyPoints.map((kp, i) => {
    const parts = kp.split(/\s*[\u2014\u2013\-:]\s*/);
    const value = parts[0] || kp;
    const label = parts[1] || "";
    return `<div class="stat-card" style="animation-delay:${i * 0.12}s">
      <div class="stat-val">${esc(value)}</div>
      <div class="stat-lbl">${esc(label)}</div>
    </div>`;
  });
  return `<style>
.stat-s{padding:80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.stat-s .orb{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none}
.stat-s .orb1{width:350px;height:350px;bottom:-100px;left:-80px;background:var(--orb2)}
.stat-s h2{font-size:2.2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:48px;text-align:center}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:700px;margin:0 auto}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center;animation:stPop .5s ease both}
.stat-val{font-size:2.4rem;font-weight:800;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px}
.stat-lbl{font-size:0.95rem;color:var(--text-muted)}
@keyframes stPop{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
</style>
<div class="stat-s">
  <div class="orb orb1"></div>
  <h2>${esc(slide.title)}</h2>
  <div class="stat-grid">${stats.join("\n")}</div>
</div>`;
}

function buildCodeSlideHtml(slide: SlidePlan): string {
  const code = slide.codeExample?.code || "// No code provided";
  const lang = slide.codeExample?.language || "typescript";
  const caption = slide.codeExample?.caption || "";
  return `<style>
.code-s{padding:80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.code-s h2{font-size:2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px}
.code-s .caption{font-size:0.85rem;color:var(--text-subtle);margin-bottom:16px}
.code-block{background:rgba(0,0,0,0.4);border:1px solid var(--border);border-radius:12px;padding:24px;font-family:'Fira Code',monospace,Consolas,'Courier New';font-size:0.85rem;line-height:1.7;color:#a6e3a1;overflow-x:auto;white-space:pre;flex:1;max-height:60vh}
.code-lang{font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--primary);margin-bottom:8px}
</style>
<div class="code-s">
  <h2>${esc(slide.title)}</h2>
  ${caption ? `<div class="caption">${esc(caption)}</div>` : ""}
  <div class="code-lang">${esc(lang)}</div>
  <pre class="code-block">${esc(code)}</pre>
</div>`;
}

function buildComparisonSlideHtml(slide: SlidePlan): string {
  const mid = Math.ceil(slide.keyPoints.length / 2);
  const leftItems = slide.keyPoints.slice(0, mid);
  const rightItems = slide.keyPoints.slice(mid);
  const renderCol = (items: string[]) => items
    .map((kp, i) => `<div class="cmp-item" style="animation-delay:${i * 0.1}s"><span class="cmp-dot"></span>${esc(kp)}</div>`)
    .join("\n");
  return `<style>
.cmp-s{padding:80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.cmp-s h2{font-size:2.2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:40px;text-align:center}
.cmp-grid{display:grid;grid-template-columns:1fr 1px 1fr;gap:32px;flex:1}
.cmp-col{display:flex;flex-direction:column;gap:12px}
.cmp-div{background:var(--border);align-self:stretch}
.cmp-item{display:flex;align-items:flex-start;gap:10px;font-size:1rem;color:var(--text);padding:10px 0;animation:cmpFade .5s ease both}
.cmp-dot{width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:7px;flex-shrink:0}
@keyframes cmpFade{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
</style>
<div class="cmp-s">
  <h2>${esc(slide.title)}</h2>
  <div class="cmp-grid">
    <div class="cmp-col">${renderCol(leftItems)}</div>
    <div class="cmp-div"></div>
    <div class="cmp-col">${renderCol(rightItems)}</div>
  </div>
</div>`;
}

function buildTimelineSlideHtml(slide: SlidePlan): string {
  const items = slide.keyPoints
    .map((kp, i) => {
      const parts = kp.split(/:\s*/);
      const label = parts[0] || "";
      const desc = parts.slice(1).join(": ") || kp;
      return `<div class="tl-item" style="animation-delay:${i * 0.15}s">
        <div class="tl-node"></div>
        <div class="tl-card">
          <div class="tl-label">${esc(label)}</div>
          <div class="tl-desc">${esc(desc)}</div>
        </div>
      </div>`;
    })
    .join("\n");
  return `<style>
.tl-s{padding:80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.tl-s h2{font-size:2.2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:40px;text-align:center}
.tl-track{position:relative;padding-left:32px;flex:1;display:flex;flex-direction:column;gap:20px}
.tl-track::before{content:'';position:absolute;left:11px;top:0;bottom:0;width:2px;background:var(--border)}
.tl-item{display:flex;align-items:flex-start;gap:20px;animation:tlSlide .5s ease both}
.tl-node{width:24px;height:24px;border-radius:50%;background:var(--primary);flex-shrink:0;position:relative;z-index:1;border:3px solid var(--background)}
.tl-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 20px;flex:1}
.tl-label{font-size:0.8rem;font-weight:600;color:var(--primary);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
.tl-desc{font-size:0.95rem;color:var(--text);line-height:1.5}
@keyframes tlSlide{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
</style>
<div class="tl-s">
  <h2>${esc(slide.title)}</h2>
  <div class="tl-track">${items}</div>
</div>`;
}

function buildQuoteSlideHtml(slide: SlidePlan): string {
  const quote = slide.keyPoints[0] || "";
  const author = slide.keyPoints[1] || "";
  return `<style>
.quote-s{padding:80px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}
.quote-s .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.quote-s .orb1{width:400px;height:400px;top:-120px;left:50%;transform:translateX(-50%);background:var(--orb1)}
.quote-mark{font-size:8rem;line-height:1;color:var(--primary);opacity:0.2;margin-bottom:-20px}
.quote-text{font-size:1.8rem;font-weight:300;font-style:italic;color:var(--text);max-width:700px;line-height:1.6;margin-bottom:24px}
.quote-author{font-size:1rem;color:var(--text-muted)}
</style>
<div class="quote-s">
  <div class="orb orb1"></div>
  <div class="quote-mark">\u201C</div>
  <div class="quote-text">${esc(quote)}</div>
  <div class="quote-author">${esc(author)}</div>
</div>`;
}

function buildDemoSlideHtml(slide: SlidePlan): string {
  return `<style>
.demo-s{padding:0;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,rgba(var(--primary-rgb),0.15),transparent 70%)}
.demo-s .orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:demoPulse 3s ease-in-out infinite alternate}
.demo-s .orb1{width:500px;height:500px;top:-150px;right:-150px;background:var(--orb1);opacity:0.6}
.demo-s .orb2{width:400px;height:400px;bottom:-120px;left:-120px;background:var(--orb2);opacity:0.5}
.demo-s .orb3{width:250px;height:250px;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--primary);opacity:0.08}
.demo-badge{display:inline-flex;align-items:center;gap:10px;padding:10px 28px;border-radius:50px;background:rgba(var(--primary-rgb),0.15);border:1px solid rgba(var(--primary-rgb),0.3);margin-bottom:32px;animation:demoFadeIn .6s ease both}
.demo-badge-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;animation:demoBlink 1.5s ease-in-out infinite}
.demo-badge-text{font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:3px;color:var(--primary)}
.demo-s h1{font-size:4.5rem;font-weight:900;text-transform:uppercase;letter-spacing:6px;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px;animation:demoFadeIn .8s ease .2s both}
.demo-s .demo-sub{font-size:1.2rem;color:var(--text-muted);max-width:500px;line-height:1.6;animation:demoFadeIn .8s ease .4s both}
.demo-line{width:80px;height:4px;border-radius:2px;background:var(--gradient-title);margin:28px auto 0;animation:demoFadeIn .8s ease .6s both}
@keyframes demoPulse{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.15);opacity:0.7}}
@keyframes demoBlink{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes demoFadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
</style>
<div class="demo-s">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
  <div class="demo-badge">
    <div class="demo-badge-dot"></div>
    <div class="demo-badge-text">Live Demo</div>
  </div>
  <h1>${esc(slide.title)}</h1>
  <div class="demo-sub">${esc(slide.keyPoints[0] || "Watch the feature in action")}</div>
  <div class="demo-line"></div>
</div>`;
}

function buildYoutubeSlideHtml(slide: SlidePlan): string {
  const url = slide.youtubeUrl || slide.keyPoints[0] || "";
  const videoId = extractYoutubeId(url);
  if (!videoId) {
    return buildContentSlideHtml({ ...slide, keyPoints: [`Invalid YouTube URL: ${url}`] });
  }
  return `<style>
.yt-s{padding:60px 80px;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.yt-s h2{font-size:2rem;font-weight:700;background:var(--gradient-title);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:24px;text-align:center}
.yt-wrap{flex:1;display:flex;align-items:center;justify-content:center}
.yt-wrap iframe{width:100%;max-width:800px;aspect-ratio:16/9;border:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3)}
</style>
<div class="yt-s">
  <h2>${esc(slide.title)}</h2>
  <div class="yt-wrap">
    <iframe src="https://www.youtube.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>`;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const EMOJIS = ["\uD83D\uDE80", "\uD83D\uDCA1", "\u26A1", "\uD83D\uDD27", "\uD83D\uDCCA", "\uD83C\uDF10", "\uD83D\uDD12", "\uD83C\uDFAF", "\u2728", "\uD83D\uDCBB"];
function pickEmoji(i: number): string {
  return EMOJIS[i % EMOJIS.length];
}

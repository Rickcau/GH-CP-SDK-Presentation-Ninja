# Presentation Design System

> This document defines the visual design system for generating HTML slide content.
> Follow these rules exactly when producing `<div class="slide">` fragments.

---

## 1. Base Environment

- **Background**: `#02040a` (near-black with a blue tint)
- **Font stack**: `system-ui, -apple-system, 'Segoe UI', sans-serif`
- **Text color**: `#ffffff` for headings, `rgba(255,255,255,0.9)` for body, lower alpha for muted text
- **Slide dimensions**: Each slide is `100vw × 100vh`, `overflow: hidden`
- **Content padding**: `60px 80px` on all sides
- **Content max-width**: `900–1100px`, centered horizontally and vertically
- Every slide `<div>` MUST have `position: absolute; top: 0; left: 0; width: 100%; height: 100%;`

---

## 2. CSS Custom Properties

The HTML shell injects these CSS custom properties via `:root`. Always reference colors through `var()` — never hardcode hex values in slide content.

```css
:root {
  --primary:      /* e.g. #22d3ee  — main accent (cyan, violet, etc.)  */
  --secondary:    /* e.g. #a78bfa  — secondary accent                  */
  --tertiary:     /* e.g. #34d399  — tertiary / success                */
  --warning:      /* e.g. #fb7185  — warning / contrast                */
  --quaternary:   /* e.g. #fbbf24  — fourth accent                     */
  --bg:           #02040a;
  --surface:      rgba(255, 255, 255, 0.03);
  --border:       rgba(255, 255, 255, 0.08);
  --text:         #ffffff;
  --text-muted:   rgba(255, 255, 255, 0.6);
  --text-subtle:  rgba(255, 255, 255, 0.4);
}
```

The **theme** determines specific values for `--primary`, `--secondary`, `--tertiary`, `--warning`, and `--quaternary`. Common palette:

| Token         | Cyan-Violet  | Emerald-Cyan | Amber-Rose   |
|---------------|-------------|--------------|--------------|
| `--primary`   | `#22d3ee`   | `#34d399`    | `#fbbf24`    |
| `--secondary` | `#a78bfa`   | `#22d3ee`    | `#fb7185`    |
| `--tertiary`  | `#34d399`   | `#a78bfa`    | `#34d399`    |

---

## 3. Glassmorphism Cards

The signature card style used for content blocks, feature grids, and list items.

```css
.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px–32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

/* Hover state (optional — the shell does not require it) */
.card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}
```

**Variations**:
- **Accent border-left**: Add `border-left: 4px solid var(--primary)` for emphasis.
- **Numbered cards**: Use a colored number badge (`min-width: 32px; height: 32px; border-radius: 8px; background: rgba(primary_rgb, 0.2)`) at top-left of content.
- **Callout bar**: Use `background: linear-gradient(90deg, rgba(color, 0.1), rgba(color, 0.05)); border-left: 4px solid var(--warning);` with `border-radius: 0 12px 12px 0`.

---

## 4. Typography

### Slide Titles (H1)
```css
h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  /* Gradient text — see Section 6 */
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

For hero/title slides, the title can be larger: `clamp(3.5rem, 8vw, 6rem)` with `font-weight: 900`.

### Section Subtitles (H2)
```css
h2 {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--primary);           /* or rgba(255,255,255,0.5) for muted labels */
  margin-bottom: 12px;
}
```

### Body Text
```css
p, .body-text {
  font-size: 0.95rem–1.1rem;
  line-height: 1.5–1.8;
  color: rgba(255, 255, 255, 0.7);
}
```

### Small / Label Text
```css
.label {
  font-size: 0.8rem–0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px–2px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}
```

### Card Headings (H3)
```css
h3 {
  font-size: 1.1rem–1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}
```

---

## 5. Icon Boxes

Small colored squares used in cards, list items, and feature grids to provide a visual anchor.

```css
.icon-box {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 8px;
  background: rgba(primary_rgb, 0.1);    /* Match the card's accent color */
  border: 1px solid rgba(primary_rgb, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

- **Contents**: Use an emoji character (🚀, 💡, ⚡, 🔧, 📊, 🎯, 🔒, 🌐) or an inline SVG icon with `stroke="currentColor"`.
- **Size variants**: 32×32px (compact lists), 40×40px (standard), 48×48px (feature cards), 80×80px circular (hero features — use `border-radius: 50%`).

---

## 6. Gradient Text

Apply to slide titles and hero text for visual impact.

```css
.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Variations**:
- White-to-muted: `linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)` for subtle headings.
- Three-stop: `linear-gradient(135deg, #ffffff 0%, var(--primary) 50%, var(--secondary) 100%)` for hero titles.
- Drop shadow for glow effect: `filter: drop-shadow(0 0 25px rgba(primary_rgb, 0.4))`.

---

## 7. Floating Decorative Orbs

Ambient glow effects placed behind content for depth and atmosphere. Use 1–2 per slide.

```css
.orb {
  position: absolute;
  width: 400px–600px;
  height: 400px–600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(primary_rgb, 0.08–0.15), transparent 70%);
  filter: blur(40px–60px);
  pointer-events: none;
  z-index: 0;
}
```

**Placement patterns**:
- Top-right + bottom-left (diagonal opposition)
- Center with `pulse` animation for focused hero slides
- Offset at `top: -20%; right: -10%` to partially clip off-screen

**Optional animation**:
```css
@keyframes pulse-N {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50%      { opacity: 0.2; transform: scale(1.05); }
}
```

---

## 8. Animation Patterns

All animations use slide-scoped keyframe names with a `-{slideIndex}` suffix to prevent conflicts (e.g., `fadeIn-3`, `slideUp-7`).

### Entry Animations

```css
/* Fade + slide up (primary entry) */
@keyframes fadeIn-N {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Slide in from left */
@keyframes slideInLeft-N {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Slide in from right */
@keyframes slideInRight-N {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Scale in (pop) */
@keyframes scaleIn-N {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

### Persistent Animations

```css
/* Floating hover effect */
@keyframes float-N {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

/* Glow pulse */
@keyframes pulse-N {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 0.7; transform: scale(1.05); }
}
```

### Data Visualization Animations

```css
/* Bar chart growth */
@keyframes growBar-N {
  from { width: 0%; }
  to   { width: var(--bar-target); }
}

/* SVG line draw */
@keyframes drawLine-N {
  from { stroke-dashoffset: 1000; }
  to   { stroke-dashoffset: 0; }
}
```

### Timing

- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` for smooth overshoot, or `ease-out` as a simpler alternative.
- **Duration**: `0.6s` for entries, `3–8s` for persistent/looping animations.
- **Stagger**: Apply `animation-delay` in `0.1s` increments per child element (e.g., child 0: `0.2s`, child 1: `0.3s`, child 2: `0.4s`).
- **Fill mode**: `animation-fill-mode: both` (shorthand: `animation: fadeIn-N 0.6s ease-out 0.2s both`).

---

## 9. Layout Grids

Use CSS Grid or Flexbox. Never use HTML tables for layout.

### Common Grid Patterns

```css
/* 2-column equal */
display: grid;
grid-template-columns: 1fr 1fr;
gap: 24px;

/* 2-column asymmetric (text + visual) */
display: grid;
grid-template-columns: 1fr 1.2fr;
gap: 60px;
align-items: center;

/* 2×2 card grid */
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 24px;

/* 3-column feature cards */
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 24px;

/* 4-column compact grid */
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 24px;
```

### Centering

All slide content should be centered both vertically and horizontally within the slide:

```css
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
```

Wrap inner content in a container with `max-width: 900px–1100px; width: 100%;`.

---

## 10. Bar Charts (CSS-Only)

No JavaScript or chart libraries. Build bar charts entirely with CSS.

```html
<div style="display:flex; flex-direction:column; gap:16px; width:100%;">
  <!-- Each bar row -->
  <div style="display:flex; align-items:center; gap:16px;">
    <span style="width:120px; text-align:right; font-size:0.9rem; color:rgba(255,255,255,0.7);">
      Label
    </span>
    <div style="flex:1; height:32px; background:rgba(255,255,255,0.05); border-radius:8px; overflow:hidden;">
      <div style="
        height:100%;
        width:0%;
        border-radius:8px;
        background:linear-gradient(90deg, var(--primary), var(--secondary));
        animation: growBar-N 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        --bar-target: 85%;
      "></div>
    </div>
    <span style="width:48px; font-size:0.9rem; color:rgba(255,255,255,0.7);">85%</span>
  </div>
  <!-- Repeat for each data point -->
</div>
```

- Use `animation-delay` staggering so bars grow sequentially.
- Each bar's `--bar-target` is set inline to the percentage value.

---

## 11. Timelines

### Vertical Timeline

```css
/* Container */
position: relative;
padding-left: 40px;

/* Vertical line */
.timeline-line {
  position: absolute;
  left: 16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

/* Node dot */
.timeline-node {
  position: absolute;
  left: 10px;   /* centered on line: (16px - 12px/2) */
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  border: 2px solid var(--bg);
  box-shadow: 0 0 10px rgba(primary_rgb, 0.4);
}
```

### Horizontal Timeline

- Use `display: flex; justify-content: space-between;` for evenly-spaced milestone nodes.
- A 2px horizontal line sits behind the nodes (`position: absolute; top: 50%; width: 100%; height: 2px;`).
- Content cards appear above or below the nodes, stagger-animated.

---

## 12. HUD / Grid Overlays (Optional)

For tech-themed slides, overlay a subtle grid behind content:

```css
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.3;
  mask-image: radial-gradient(circle, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, black 40%, transparent 100%);
  pointer-events: none;
}
```

---

## 13. Accent Badges / Pills

Small labels for status, categories, or highlights:

```css
.badge {
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(primary_rgb, 0.1);
  border: 1px solid rgba(primary_rgb, 0.3);
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
```

---

## 14. Rules for LLM Code Generation

These constraints are **mandatory** for every slide fragment you produce:

1. **NEVER use external resources** — no images (`<img src="...">`), no external fonts (`@import`), no external scripts (`<script src="...">`), no iframes. Everything must be self-contained.

2. **All CSS must be inline styles or in a `<style>` tag inside the slide `<div>`** — the shell provides base styles only. Each slide is responsible for its own visual styling.

3. **Use CSS custom properties for all colors** — reference `var(--primary)`, `var(--secondary)`, etc. Never hardcode hex color values for theme colors. You MAY use `rgba(255,255,255,...)` for white/transparency and `#02040a` for the dark background since those are constants.

4. **Use emoji for icons** — e.g., 🚀, 💡, ⚡, 🔧, 📊, 🎯, 🔒, 🌐, ✅, 📈, 🏗️, 🧠. Inline SVG with `stroke="currentColor"` is also acceptable when a specific shape is needed.

5. **No JavaScript in slide fragments** — the shell handles all interactivity (navigation, transitions, speaker notes). Slide divs are purely HTML + CSS.

6. **Each slide's outer element MUST be**: `<div class="slide" data-index="N">` where N is the zero-based slide index. Omit `id` attributes unless needed for internal anchor.

7. **Scope all `@keyframes` names** with a `-{slideIndex}` suffix — e.g., `fadeIn-3`, `growBar-7`. This prevents animation name collisions across slides.

8. **Keep HTML clean and semantic** — use `<h1>`, `<h2>`, `<h3>`, `<p>`, `<div>`, `<span>`, `<strong>`. No `<table>` for layout.

9. **Prefer CSS Grid or Flexbox** for all layout — never use floats or absolute positioning for content layout (absolute positioning is fine for decorative elements and orbs).

10. **Content density guidelines**:
    - Maximum 6–8 bullet points per slide
    - Prefer visual layouts (card grids, split layouts, diagrams) over text walls
    - Leave visual breathing room — don't fill every pixel
    - Use the 900–1100px max-width container to keep content readable

11. **Responsive considerations**: Use `clamp()` for font sizes (e.g., `clamp(2.5rem, 5vw, 3.5rem)`) to handle slight viewport variations gracefully.

12. **Z-index layering**:
    - `z-index: 0` — decorative orbs, grid overlays, background effects
    - `z-index: 1–2` — content containers
    - The shell reserves `z-index: 10000+` for navigation and progress bar

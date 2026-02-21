import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import type { HtmlTheme, HtmlPresentationInput, HtmlPresentationOutput } from './types';

// Resolve paths relative to the data/templates directory
function getTemplatesDir(): string {
  // At runtime in Next.js, process.cwd() is the Next.js project root (src/)
  return join(process.cwd(), 'src', 'data', 'templates');
}

export function loadTheme(themeId: string): HtmlTheme {
  const themePath = join(getTemplatesDir(), 'themes', `${themeId}.json`);
  const raw = readFileSync(themePath, 'utf-8');
  return JSON.parse(raw) as HtmlTheme;
}

export function loadShellTemplate(): string {
  const shellPath = join(getTemplatesDir(), 'shell.html');
  return readFileSync(shellPath, 'utf-8');
}

export function assembleHtmlPresentation(input: HtmlPresentationInput): HtmlPresentationOutput {
  const theme = loadTheme(input.themeId);
  const shell = loadShellTemplate();

  // Wrap each slide's HTML fragment in a <div class="slide">
  const slidesHtml = input.slides
    .map((slide, i) => {
      const activeClass = i === 0 ? ' active' : '';
      return `<div class="slide${activeClass}" id="slide-${i + 1}">\n${slide.html}\n</div>`;
    })
    .join('\n\n');

  // Build speaker notes JSON
  const speakerNotes = input.slides.map(slide => ({
    title: slide.title,
    notes: slide.speakerNotes || ''
  }));

  // Replace all placeholders
  let html = shell;
  html = html.replace('{{TITLE}}', escapeHtml(input.title));
  html = html.replace('{{THEME_CSS}}', theme.css);
  html = html.replace('{{SLIDES}}', slidesHtml);
  html = html.replace('{{SPEAKER_NOTES_JSON}}', JSON.stringify(speakerNotes));
  html = html.replaceAll('{{TOTAL_SLIDES}}', String(input.slides.length));

  return {
    html,
    title: input.title,
    slideCount: input.slides.length,
    themeId: input.themeId
  };
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function listAvailableThemes(): { id: string; name: string; description: string }[] {
  const themesDir = join(getTemplatesDir(), 'themes');
  const files = readdirSync(themesDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const theme = JSON.parse(readFileSync(join(themesDir, f), 'utf-8')) as HtmlTheme;
    return { id: theme.id, name: theme.name, description: theme.description };
  });
}

export interface HtmlSlide {
  index: number;
  title: string;
  html: string;           // Raw HTML fragment (inner content of one slide)
  speakerNotes?: string;
  layout?: string;        // Layout type used (e.g., "card-grid-2x2")
}

export interface HtmlTheme {
  name: string;
  id: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderHover: string;
    text: string;
    textMuted: string;
    textSubtle: string;
  };
  gradients: {
    title: string;
    progressBar: string;
    accent: string;
    orb1: string;
    orb2: string;
  };
  css: string;  // Complete :root { ... } CSS block
}

export interface HtmlPresentationInput {
  title: string;
  slides: HtmlSlide[];
  themeId: string;        // Theme ID (e.g., "cyan-violet")
}

export interface HtmlPresentationOutput {
  html: string;           // Complete assembled HTML document
  title: string;
  slideCount: number;
  themeId: string;
}

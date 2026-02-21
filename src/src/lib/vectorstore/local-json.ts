import fs from "fs";
import path from "path";
import { VectorStoreProvider, SlideMetadata, SlideMatch, SearchOptions } from "./index";

const STORE_PATH = path.join(process.cwd(), "src", "data", "templates", "index.json");

export class LocalJsonStore implements VectorStoreProvider {
  private store: SlideMetadata[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const data = fs.readFileSync(STORE_PATH, "utf-8");
        this.store = JSON.parse(data);
      }
    } catch {
      this.store = [];
    }
  }

  private save() {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(this.store, null, 2));
  }

  async index(slide: SlideMetadata): Promise<void> {
    const existing = this.store.findIndex((s) => s.id === slide.id);
    if (existing >= 0) {
      this.store[existing] = slide;
    } else {
      this.store.push(slide);
    }
    this.save();
  }

  async search(query: string, options?: SearchOptions): Promise<SlideMatch[]> {
    const limit = options?.limit || 10;
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    let results = this.store.map((slide) => {
      const text = [slide.title, ...slide.content, ...(slide.tags || [])].join(" ").toLowerCase();
      let score = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) score += 1;
      }
      // Exact title match bonus
      if (slide.title.toLowerCase().includes(queryLower)) score += 3;
      return { slide, score };
    });

    if (options?.layout) {
      results = results.filter((r) => r.slide.layout === options.layout);
    }

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async delete(slideId: string): Promise<void> {
    this.store = this.store.filter((s) => s.id !== slideId);
    this.save();
  }
}

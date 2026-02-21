export interface SlideMetadata {
  id: string;
  presentationId: string;
  layout: string;
  title: string;
  content: string[];
  tags?: string[];
}

export interface SearchOptions {
  layout?: string;
  limit?: number;
}

export interface SlideMatch {
  slide: SlideMetadata;
  score: number;
}

export interface VectorStoreProvider {
  index(slide: SlideMetadata): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<SlideMatch[]>;
  delete(slideId: string): Promise<void>;
}

export { LocalJsonStore } from "./local-json";

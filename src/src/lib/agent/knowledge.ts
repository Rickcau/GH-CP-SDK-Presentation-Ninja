import fs from "fs";
import path from "path";

const KNOWLEDGE_DIR = path.join(process.cwd(), "src", "data", "knowledge");

export function loadKnowledge(topic: string, section?: string): string {
  const topicDir = path.join(KNOWLEDGE_DIR, topic);

  if (!fs.existsSync(topicDir)) {
    return `Knowledge pack for ${topic} not found.`;
  }

  if (section) {
    const filePath = path.join(topicDir, `${section}.md`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    }
    return `Section ${section} not found for topic ${topic}.`;
  }

  // Load all files in the topic directory
  const files = fs.readdirSync(topicDir).filter((f) => f.endsWith(".md"));
  const content = files
    .map((f) => {
      const text = fs.readFileSync(path.join(topicDir, f), "utf-8");
      return `## ${f.replace(".md", "").replace(/-/g, " ").toUpperCase()}\n\n${text}`;
    })
    .join("\n\n---\n\n");

  return content;
}

export function getAvailableTopics(): { topic: string; sections: string[] }[] {
  if (!fs.existsSync(KNOWLEDGE_DIR)) return [];

  const topics = fs.readdirSync(KNOWLEDGE_DIR).filter((d) => {
    return fs.statSync(path.join(KNOWLEDGE_DIR, d)).isDirectory();
  });

  return topics.map((topic) => {
    const topicDir = path.join(KNOWLEDGE_DIR, topic);
    const sections = fs.readdirSync(topicDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""));
    return { topic, sections };
  });
}

import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const wisdomDirectory = path.join(process.cwd(), "content/wisdom");

export type WisdomArticle = {
  title: string;
  slug: string;
  description: string;
  date: string;
  lastUpdated: string;
  category: string;
  readingTime: string;
  heroImage: string;
  heroImageAlt: string;
  draft: boolean;
  content: string;
};

type WisdomFrontmatter = Omit<WisdomArticle, "content">;

function parseFrontmatter(fileContents: string, fileName: string) {
  const match = fileContents.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    throw new Error(`Missing frontmatter block in ${fileName}`);
  }

  const data = match[1].split("\n").reduce<Record<string, unknown>>((acc, line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return acc;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^"(.*)"$/, "$1");

    acc[key] = unquotedValue === "true" ? true : unquotedValue === "false" ? false : unquotedValue;
    return acc;
  }, {});

  return {
    data,
    content: match[2].trim(),
  };
}

function assertFrontmatter(data: Record<string, unknown>, fileName: string): WisdomFrontmatter {
  const required = [
    "title",
    "slug",
    "description",
    "date",
    "lastUpdated",
    "category",
    "readingTime",
    "heroImage",
    "heroImageAlt",
    "draft",
  ] as const;

  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`Missing "${key}" in ${fileName}`);
    }
  }

  return {
    title: String(data.title),
    slug: String(data.slug),
    description: String(data.description),
    date: String(data.date),
    lastUpdated: String(data.lastUpdated),
    category: String(data.category),
    readingTime: String(data.readingTime),
    heroImage: String(data.heroImage),
    heroImageAlt: String(data.heroImageAlt),
    draft: Boolean(data.draft),
  };
}

export function getAllPosts({ includeDrafts = false } = {}) {
  if (!fs.existsSync(wisdomDirectory)) {
    return [];
  }

  return fs
    .readdirSync(wisdomDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(wisdomDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = parseFrontmatter(fileContents, fileName);
      return {
        ...assertFrontmatter(data, fileName),
        content,
      };
    })
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const posts = getAllPosts();
  const currentPost = posts.find((post) => post.slug === slug);

  if (!currentPost) {
    return posts.filter((post) => post.slug !== slug).slice(0, limit);
  }

  return posts
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const categoryScore =
        Number(b.category === currentPost.category) - Number(a.category === currentPost.category);

      if (categoryScore !== 0) {
        return categoryScore;
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

export function renderMarkdown(content: string) {
  return marked.parse(content, {
    async: false,
    gfm: true,
  }) as string;
}

import matter from "gray-matter";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { POST_TYPES } from "../types/post.js";
import type {
  LocalPostStatus,
  MarkdownPost,
  PostFrontMatter,
  PostMetadataPatch,
  PostType,
} from "../types/post.js";

export class MarkdownPostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarkdownPostError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  value: unknown,
  fieldName: string,
  filePath: string,
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new MarkdownPostError(
      fieldName + " must be a non-empty string in " + filePath + ".",
    );
  }

  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

function parseType(value: unknown, filePath: string): PostType {
  if (typeof value === "string" && (POST_TYPES as readonly string[]).includes(value)) {
    return value as PostType;
  }

  throw new MarkdownPostError(
    "type must be one of " + POST_TYPES.join(", ") + " in " + filePath + ".",
  );
}

function parseStatus(value: unknown, filePath: string): LocalPostStatus {
  if (value === "draft" || value === "publish") {
    return value;
  }

  throw new MarkdownPostError(
    "status must be either draft or publish in " + filePath + ".",
  );
}

function parseLabels(value: unknown, filePath: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((label) => typeof label !== "string")) {
    throw new MarkdownPostError("labels must be a list of strings in " + filePath + ".");
  }

  return value
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

export function parseMarkdownPost(source: string, filePath: string): MarkdownPost {
  const parsed = matter(source);
  if (!isRecord(parsed.data)) {
    throw new MarkdownPostError("Front matter must be an object in " + filePath + ".");
  }

  const rawFrontMatter = parsed.data;
  const frontMatter: PostFrontMatter = {
    title: requiredString(rawFrontMatter.title, "title", filePath),
    slug: requiredString(rawFrontMatter.slug, "slug", filePath),
    type: parseType(rawFrontMatter.type, filePath),
    status: parseStatus(rawFrontMatter.status, filePath),
    labels: parseLabels(rawFrontMatter.labels, filePath),
    blogger_post_id: optionalString(rawFrontMatter.blogger_post_id),
    published_at: optionalString(rawFrontMatter.published_at),
    updated_at: optionalString(rawFrontMatter.updated_at),
  };

  return {
    filePath,
    body: parsed.content,
    frontMatter,
    rawFrontMatter,
  };
}

export async function readMarkdownPost(filePath: string): Promise<MarkdownPost> {
  const absolutePath = resolve(filePath);
  const source = await readFile(absolutePath, "utf8");
  return parseMarkdownPost(source, absolutePath);
}

async function writeAtomically(filePath: string, source: string): Promise<void> {
  const temporaryPath =
    filePath + "." + String(process.pid) + "." + String(Date.now()) + ".tmp";
  await writeFile(temporaryPath, source, "utf8");
  await rename(temporaryPath, filePath);
}

export async function updateMarkdownPostMetadata(
  post: MarkdownPost,
  patch: PostMetadataPatch,
): Promise<MarkdownPost> {
  const nextFrontMatter: Record<string, unknown> = {
    ...post.rawFrontMatter,
  };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      nextFrontMatter[key] = value;
    }
  }
  const source = matter.stringify(post.body, nextFrontMatter);
  await writeAtomically(post.filePath, source);
  return parseMarkdownPost(source, post.filePath);
}

export function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("ko-KR")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length === 0) {
    throw new MarkdownPostError("The title does not contain usable slug characters.");
  }

  return slug;
}

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return [year, month, day].join("-");
}

export interface CreateMarkdownPostOptions {
  postsDir: string;
  type: PostType;
  title: string;
  now?: Date;
}

export async function createMarkdownPost(
  options: CreateMarkdownPostOptions,
): Promise<MarkdownPost> {
  const title = options.title.trim();
  if (title.length === 0) {
    throw new MarkdownPostError("The post title cannot be empty.");
  }

  const now = options.now ?? new Date();
  const slug = slugifyTitle(title);
  const directory = join(options.postsDir, options.type);
  const fileName = [formatLocalDate(now), slug + ".md"].join("-");
  const filePath = join(directory, fileName);
  const source = matter.stringify("## 개요\n\n내용을 작성하세요.\n", {
    title,
    slug,
    type: options.type,
    status: "draft",
    labels: [],
    blogger_post_id: "",
    published_at: "",
    updated_at: now.toISOString(),
  });

  await mkdir(directory, { recursive: true });
  try {
    await writeFile(filePath, source, { encoding: "utf8", flag: "wx" });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      throw new MarkdownPostError("A post already exists at " + filePath + ".");
    }

    throw error;
  }

  return parseMarkdownPost(source, filePath);
}

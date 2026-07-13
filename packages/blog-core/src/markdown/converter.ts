import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marked } from "marked";
import type { MarkdownPost } from "../types/post.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const rendered = await marked.parse(markdown, {
    gfm: true,
    breaks: false,
  });
  return String(rendered);
}

export async function createPreviewHtml(post: MarkdownPost): Promise<string> {
  const body = await markdownToHtml(post.body);
  const title = escapeHtml(post.frontMatter.title);

  return [
    "<!doctype html>",
    '<html lang="ko">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    "  <title>" + title + "</title>",
    "  <style>",
    "    body { max-width: 760px; margin: 48px auto; padding: 0 20px; color: #1f2937; font-family: system-ui, sans-serif; line-height: 1.7; }",
    "    pre { overflow-x: auto; padding: 16px; border-radius: 8px; background: #111827; color: #f9fafb; }",
    "    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }",
    "    :not(pre) > code { padding: 0.15em 0.35em; border-radius: 4px; background: #f3f4f6; }",
    "    img { max-width: 100%; height: auto; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <article>",
    "    <h1>" + title + "</h1>",
    body,
    "  </article>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

export async function writePreviewFile(post: MarkdownPost): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "blog-preview-"));
  const fileName =
    post.frontMatter.slug.replace(/[^\p{L}\p{N}-]+/gu, "-") + ".html";
  const filePath = join(directory, fileName);
  const source = await createPreviewHtml(post);
  await writeFile(filePath, source, "utf8");
  return filePath;
}

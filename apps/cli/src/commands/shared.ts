import {
  createBloggerClient,
  getAuthenticatedClient,
  loadBlogConfig,
  markdownToHtml,
  normalizeRemotePostStatus,
  requireBlogId,
} from "@blog-workspace/blog-core";
import type {
  BlogConfig,
  BloggerClient,
  BloggerPostContent,
  LocalPostStatus,
  MarkdownPost,
  PostMetadataPatch,
} from "@blog-workspace/blog-core";

interface RemotePostMetadata {
  id?: string | null;
  published?: string | null;
  updated?: string | null;
  status?: string | null;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getAuthenticatedBlogger(): Promise<{
  config: BlogConfig;
  client: BloggerClient;
}> {
  const config = loadBlogConfig();
  const auth = await getAuthenticatedClient(config);
  return {
    config,
    client: createBloggerClient(auth),
  };
}

export async function getConfiguredBlogger(): Promise<{
  config: BlogConfig;
  blogId: string;
  client: BloggerClient;
}> {
  const { config, client } = await getAuthenticatedBlogger();
  return {
    config,
    blogId: requireBlogId(config),
    client,
  };
}

export async function toBloggerPostContent(
  post: MarkdownPost,
): Promise<BloggerPostContent> {
  return {
    title: post.frontMatter.title,
    html: await markdownToHtml(post.body),
    labels: post.frontMatter.labels,
  };
}

function isPublishedStatus(status: string | null | undefined): boolean {
  const normalized = normalizeRemotePostStatus(status);
  return normalized === "live" || normalized === "scheduled";
}

export function metadataAfterBloggerSave(
  post: MarkdownPost,
  remotePost: RemotePostMetadata,
  requestedStatus?: LocalPostStatus,
): PostMetadataPatch {
  if (!remotePost.id) {
    throw new Error("Blogger returned a post without an ID.");
  }

  const remoteIsPublished = isPublishedStatus(remotePost.status);
  const nextStatus =
    requestedStatus ?? (remoteIsPublished ? "publish" : "draft");
  const nextUpdatedAt = remotePost.updated ?? new Date().toISOString();
  const shouldRecordPublishedAt =
    nextStatus === "publish" || remoteIsPublished;

  return {
    blogger_post_id: remotePost.id,
    status: nextStatus,
    published_at: shouldRecordPublishedAt
      ? remotePost.published ?? post.frontMatter.published_at ?? nextUpdatedAt
      : post.frontMatter.published_at,
    updated_at: nextUpdatedAt,
  };
}

export function printBlogList(
  blogs: Array<{ id: string; name: string; url: string }>,
): void {
  if (blogs.length === 0) {
    console.log("접근 가능한 Blogger 블로그가 없습니다.");
    return;
  }

  for (const blog of blogs) {
    console.log(blog.name);
    console.log("  ID: " + blog.id);
    console.log("  URL: " + (blog.url || "-"));
  }
}

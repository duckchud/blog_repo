import type { blogger_v3 } from "googleapis/build/src/apis/blogger/v3.js";
import type {
  BloggerPostContent,
  RemotePostStatus,
} from "../types/post.js";
import type { BloggerClient } from "./client.js";

export type BloggerSaveMode = "draft" | "publish";

export interface BloggerSaveInput extends BloggerPostContent {
  bloggerPostId?: string;
}

function postRequestBody(input: BloggerPostContent): blogger_v3.Schema$Post {
  return {
    title: input.title,
    content: input.html,
    labels: input.labels,
  };
}

function requirePostId(
  post: blogger_v3.Schema$Post,
): blogger_v3.Schema$Post {
  if (!post.id) {
    throw new Error("Blogger returned a post without an ID.");
  }

  return post;
}

function isPublishedStatus(status: RemotePostStatus): boolean {
  return status === "live" || status === "scheduled";
}

export function normalizeRemotePostStatus(
  status: string | null | undefined,
): RemotePostStatus {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "draft";
    case "LIVE":
      return "live";
    case "SCHEDULED":
      return "scheduled";
    case "DELETED":
      return "deleted";
    default:
      return "unknown";
  }
}

export function getHttpStatus(error: unknown): number | undefined {
  if (
    typeof error !== "object" ||
    error === null ||
    !("response" in error) ||
    typeof error.response !== "object" ||
    error.response === null ||
    !("status" in error.response) ||
    typeof error.response.status !== "number"
  ) {
    return undefined;
  }

  return error.response.status;
}

export function isBloggerPostNotFound(error: unknown): boolean {
  return getHttpStatus(error) === 404;
}

export async function getBloggerPost(
  client: BloggerClient,
  blogId: string,
  postId: string,
): Promise<blogger_v3.Schema$Post> {
  const response = await client.posts.get({
    blogId,
    postId,
  });
  return requirePostId(response.data);
}

async function updateBloggerPost(
  client: BloggerClient,
  blogId: string,
  postId: string,
  input: BloggerPostContent,
): Promise<blogger_v3.Schema$Post> {
  const response = await client.posts.update({
    blogId,
    postId,
    requestBody: postRequestBody(input),
  });
  return requirePostId(response.data);
}

export async function updateExistingBloggerPost(
  client: BloggerClient,
  blogId: string,
  postId: string,
  input: BloggerPostContent,
): Promise<blogger_v3.Schema$Post> {
  return updateBloggerPost(client, blogId, postId, input);
}

export async function saveBloggerPost(
  client: BloggerClient,
  blogId: string,
  input: BloggerSaveInput,
  mode: BloggerSaveMode,
): Promise<blogger_v3.Schema$Post> {
  if (!input.bloggerPostId) {
    const response = await client.posts.insert({
      blogId,
      isDraft: mode === "draft",
      requestBody: postRequestBody(input),
    });
    return requirePostId(response.data);
  }

  const currentPost = await getBloggerPost(client, blogId, input.bloggerPostId);
  const currentStatus = normalizeRemotePostStatus(currentPost.status);

  if (mode === "draft" && isPublishedStatus(currentStatus)) {
    await client.posts.revert({
      blogId,
      postId: input.bloggerPostId,
    });
  }

  const updatedPost = await updateBloggerPost(
    client,
    blogId,
    input.bloggerPostId,
    input,
  );

  if (mode === "publish" && !isPublishedStatus(currentStatus)) {
    const publishedResponse = await client.posts.publish({
      blogId,
      postId: input.bloggerPostId,
    });
    return requirePostId(publishedResponse.data);
  }

  return updatedPost;
}

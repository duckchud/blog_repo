export const POST_TYPES = ["ai", "paper", "etc"] as const;

export type PostType = (typeof POST_TYPES)[number];

export const LOCAL_POST_STATUSES = ["draft", "publish"] as const;

export type LocalPostStatus = (typeof LOCAL_POST_STATUSES)[number];

export type RemotePostStatus =
  | "draft"
  | "live"
  | "scheduled"
  | "deleted"
  | "unknown";

export interface PostFrontMatter {
  title: string;
  slug: string;
  type: PostType;
  status: LocalPostStatus;
  labels: string[];
  blogger_post_id?: string;
  published_at?: string;
  updated_at?: string;
}

export interface MarkdownPost {
  filePath: string;
  body: string;
  frontMatter: PostFrontMatter;
  rawFrontMatter: Record<string, unknown>;
}

export interface PostMetadataPatch {
  blogger_post_id?: string;
  published_at?: string;
  updated_at?: string;
  status?: LocalPostStatus;
}

export interface BloggerPostContent {
  title: string;
  html: string;
  labels: string[];
}

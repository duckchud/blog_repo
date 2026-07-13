import { config as loadDotenv } from "dotenv";
import { join, resolve } from "node:path";
import type { LocalPostStatus } from "../types/post.js";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface BlogConfig {
  projectRoot: string;
  envPath: string;
  blogId?: string;
  clientSecretPath: string;
  tokenPath: string;
  postsDir: string;
  defaultPostStatus: LocalPostStatus;
}

export interface LoadConfigOptions {
  cwd?: string;
  envPath?: string;
}

function resolveFromProject(projectRoot: string, candidate: string): string {
  return resolve(projectRoot, candidate);
}

function readDefaultPostStatus(value: string | undefined): LocalPostStatus {
  if (value === undefined || value.trim() === "" || value === "draft") {
    return "draft";
  }

  if (value === "publish") {
    return "publish";
  }

  throw new ConfigError("DEFAULT_POST_STATUS must be either draft or publish.");
}

export function loadBlogConfig(options: LoadConfigOptions = {}): BlogConfig {
  const projectRoot = resolve(options.cwd ?? process.cwd());
  const envPath = options.envPath
    ? resolveFromProject(projectRoot, options.envPath)
    : join(projectRoot, ".env");

  loadDotenv({ path: envPath, override: false });

  const clientSecretPath = resolveFromProject(
    projectRoot,
    process.env.GOOGLE_CLIENT_SECRET_PATH ?? "./credentials/client_secret.json",
  );
  const tokenPath = resolveFromProject(
    projectRoot,
    process.env.GOOGLE_TOKEN_PATH ?? "./credentials/token.json",
  );
  const postsDir = resolveFromProject(
    projectRoot,
    process.env.POSTS_DIR ?? "./posts",
  );
  const rawBlogId = process.env.BLOGGER_BLOG_ID?.trim();

  return {
    projectRoot,
    envPath,
    blogId: rawBlogId || undefined,
    clientSecretPath,
    tokenPath,
    postsDir,
    defaultPostStatus: readDefaultPostStatus(process.env.DEFAULT_POST_STATUS),
  };
}

export function requireBlogId(config: BlogConfig): string {
  if (!config.blogId) {
    throw new ConfigError(
      "BLOGGER_BLOG_ID is required. Add it to .env or choose a blog with blog blogs.",
    );
  }

  return config.blogId;
}

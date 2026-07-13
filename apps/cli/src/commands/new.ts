import { Command } from "commander";
import {
  POST_TYPES,
  createMarkdownPost,
  loadBlogConfig,
} from "@blog-workspace/blog-core";
import type { PostType } from "@blog-workspace/blog-core";

function isPostType(value: string): value is PostType {
  return (POST_TYPES as readonly string[]).includes(value);
}

export function registerNewCommand(program: Command): void {
  program
    .command("new <type> <title>")
    .description(
      "새 Markdown 게시글을 생성합니다. type은 " +
        POST_TYPES.join(", ") +
        " 중 하나입니다.",
    )
    .action(async (type: string, title: string) => {
      if (!isPostType(type)) {
        throw new Error("type must be one of " + POST_TYPES.join(", ") + ".");
      }

      const config = loadBlogConfig();
      const post = await createMarkdownPost({
        postsDir: config.postsDir,
        type,
        title,
      });
      console.log("새 글을 생성했습니다: " + post.filePath);
    });
}

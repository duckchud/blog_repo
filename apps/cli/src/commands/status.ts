import { Command } from "commander";
import {
  getBloggerPost,
  isBloggerPostNotFound,
  normalizeRemotePostStatus,
  readMarkdownPost,
} from "@blog-workspace/blog-core";
import { getConfiguredBlogger } from "./shared.js";

export function registerStatusCommand(program: Command): void {
  program
    .command("status <file>")
    .description("로컬 front matter와 Blogger의 게시글 상태를 비교합니다.")
    .action(async (filePath: string) => {
      const post = await readMarkdownPost(filePath);
      const postId = post.frontMatter.blogger_post_id;

      console.log("로컬 상태: " + post.frontMatter.status);
      console.log("Blogger 게시글 ID: " + (postId ?? "(없음)"));

      if (!postId) {
        console.log("원격 상태: not-created");
        return;
      }

      const { blogId, client } = await getConfiguredBlogger();
      try {
        const remotePost = await getBloggerPost(client, blogId, postId);
        const remoteStatus = normalizeRemotePostStatus(remotePost.status);
        console.log("원격 상태: " + remoteStatus);
        console.log("원격 제목: " + (remotePost.title ?? "-"));
        console.log("원격 수정 시각: " + (remotePost.updated ?? "-"));
      } catch (error) {
        if (isBloggerPostNotFound(error)) {
          console.log("원격 상태: deleted");
          return;
        }

        throw error;
      }
    });
}

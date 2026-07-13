import { Command } from "commander";
import {
  getBloggerPost,
  readMarkdownPost,
  updateExistingBloggerPost,
  updateMarkdownPostMetadata,
} from "@blog-workspace/blog-core";
import {
  getConfiguredBlogger,
  metadataAfterBloggerSave,
  toBloggerPostContent,
} from "./shared.js";

export function registerUpdateCommand(program: Command): void {
  program
    .command("update <file>")
    .description("blogger_post_id가 있는 기존 Blogger 게시글을 수정합니다.")
    .action(async (filePath: string) => {
      const post = await readMarkdownPost(filePath);
      const postId = post.frontMatter.blogger_post_id;
      if (!postId) {
        throw new Error(
          "blogger_post_id가 없습니다. 먼저 blog publish <file> --draft 또는 --publish를 사용하세요.",
        );
      }

      const { blogId, client } = await getConfiguredBlogger();
      const currentPost = await getBloggerPost(client, blogId, postId);
      const updatedPost = await updateExistingBloggerPost(
        client,
        blogId,
        postId,
        await toBloggerPostContent(post),
      );
      const savedPost = await updateMarkdownPostMetadata(
        post,
        metadataAfterBloggerSave(
          post,
          {
            ...currentPost,
            ...updatedPost,
          },
        ),
      );

      console.log("Blogger 게시글을 수정했습니다: " + postId);
      console.log("Markdown 메타데이터를 갱신했습니다: " + savedPost.filePath);
    });
}

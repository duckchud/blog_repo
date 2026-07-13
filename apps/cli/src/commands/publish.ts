import { Command } from "commander";
import {
  readMarkdownPost,
  saveBloggerPost,
  updateMarkdownPostMetadata,
} from "@blog-workspace/blog-core";
import type { BloggerSaveMode } from "@blog-workspace/blog-core";
import {
  getConfiguredBlogger,
  metadataAfterBloggerSave,
  toBloggerPostContent,
} from "./shared.js";

interface PublishOptions {
  draft?: boolean;
  publish?: boolean;
}

function resolvePublishMode(
  options: PublishOptions,
  defaultMode: BloggerSaveMode,
): BloggerSaveMode {
  if (options.draft && options.publish) {
    throw new Error("Use only one of --draft or --publish.");
  }

  if (options.publish) {
    return "publish";
  }

  if (options.draft) {
    return "draft";
  }

  return defaultMode;
}

export function registerPublishCommand(program: Command): void {
  program
    .command("publish <file>")
    .description("Markdown 글을 Blogger 초안으로 저장하거나 공개 발행합니다.")
    .option("--draft", "Blogger 초안으로 저장합니다.")
    .option("--publish", "Blogger에 공개 발행합니다.")
    .action(async (filePath: string, options: PublishOptions) => {
      const post = await readMarkdownPost(filePath);
      const { config, blogId, client } = await getConfiguredBlogger();
      const mode = resolvePublishMode(options, config.defaultPostStatus);
      const remotePost = await saveBloggerPost(
        client,
        blogId,
        {
          ...(await toBloggerPostContent(post)),
          bloggerPostId: post.frontMatter.blogger_post_id,
        },
        mode,
      );
      const savedPost = await updateMarkdownPostMetadata(
        post,
        metadataAfterBloggerSave(post, remotePost, mode),
      );

      console.log(
        (mode === "publish" ? "공개 발행" : "초안 저장") +
          " 완료: " +
          savedPost.frontMatter.blogger_post_id,
      );
      console.log("Markdown 메타데이터를 갱신했습니다: " + savedPost.filePath);
    });
}

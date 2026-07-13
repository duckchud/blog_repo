import { Command } from "commander";
import { pathToFileURL } from "node:url";
import {
  openExternalUrl,
  readMarkdownPost,
  writePreviewFile,
} from "@blog-workspace/blog-core";
import { errorMessage } from "./shared.js";

interface PreviewOptions {
  open: boolean;
}

export function registerPreviewCommand(program: Command): void {
  program
    .command("preview <file>")
    .description("Markdown을 임시 HTML로 변환하여 기본 브라우저에서 엽니다.")
    .option("--no-open", "HTML 파일만 만들고 브라우저를 열지 않습니다.")
    .action(async (filePath: string, options: PreviewOptions) => {
      const post = await readMarkdownPost(filePath);
      const previewPath = await writePreviewFile(post);
      console.log("미리보기 파일: " + previewPath);

      if (!options.open) {
        return;
      }

      try {
        await openExternalUrl(pathToFileURL(previewPath).href);
      } catch (error) {
        console.warn(
          "브라우저를 열지 못했습니다. 위의 HTML 파일을 직접 여세요: " +
            errorMessage(error),
        );
      }
    });
}

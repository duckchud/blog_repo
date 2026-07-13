import { Command } from "commander";
import { listBloggerBlogs } from "@blog-workspace/blog-core";
import { getAuthenticatedBlogger, printBlogList } from "./shared.js";

export function registerBlogsCommand(program: Command): void {
  program
    .command("blogs")
    .description("현재 계정이 관리할 수 있는 Blogger 블로그를 조회합니다.")
    .action(async () => {
      const { client } = await getAuthenticatedBlogger();
      const blogs = await listBloggerBlogs(client);
      printBlogList(blogs);
    });
}

import { Command } from "commander";
import {
  authenticateWithBrowser,
  createBloggerClient,
  listBloggerBlogs,
  loadBlogConfig,
} from "@blog-workspace/blog-core";
import { errorMessage, printBlogList } from "./shared.js";

export function registerAuthCommand(program: Command): void {
  program
    .command("auth")
    .description("Google OAuth 로그인 후 로컬 token.json을 생성합니다.")
    .action(async () => {
      const config = loadBlogConfig();
      console.log("Google 로그인 브라우저를 엽니다.");

      const result = await authenticateWithBrowser(config, {
        onAuthorizationUrl: (url) => {
          console.log("브라우저가 열리지 않으면 아래 URL을 직접 여세요.");
          console.log(url);
        },
        onBrowserOpenError: (error) => {
          console.warn("브라우저 자동 열기에 실패했습니다: " + errorMessage(error));
        },
      });

      console.log("OAuth token을 저장했습니다: " + config.tokenPath);
      console.log(
        "인증 계정: " + (result.email ?? "Google 계정 정보를 가져오지 못했습니다."),
      );

      const blogs = await listBloggerBlogs(createBloggerClient(result.oauthClient));
      console.log("접근 가능한 Blogger 블로그:");
      printBlogList(blogs);
    });
}

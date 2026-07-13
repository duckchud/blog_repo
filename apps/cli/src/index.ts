#!/usr/bin/env node

import { Command } from "commander";
import { registerAuthCommand } from "./commands/auth.js";
import { registerBlogsCommand } from "./commands/blogs.js";
import { registerNewCommand } from "./commands/new.js";
import { registerPreviewCommand } from "./commands/preview.js";
import { registerPublishCommand } from "./commands/publish.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerUpdateCommand } from "./commands/update.js";

const program = new Command();

program
  .name("blog")
  .description("Markdown-first Blogger publishing CLI")
  .version("0.1.0")
  .showHelpAfterError();

registerAuthCommand(program);
registerBlogsCommand(program);
registerNewCommand(program);
registerPreviewCommand(program);
registerPublishCommand(program);
registerUpdateCommand(program);
registerStatusCommand(program);

void program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("오류: " + message);
  process.exitCode = 1;
});

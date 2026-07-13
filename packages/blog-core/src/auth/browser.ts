import { spawn } from "node:child_process";

export function openExternalUrl(url: string): Promise<void> {
  let command: string;
  let args: string[];

  if (process.platform === "darwin") {
    command = "open";
    args = [url];
  } else if (process.platform === "win32") {
    command = "cmd.exe";
    args = ["/c", 'start "" "' + url.replace(/"/g, "") + '"'];
  } else {
    command = "xdg-open";
    args = [url];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

/**
 * Cross-platform utility to open a URL in the default browser.
 * Uses native OS commands: open (macOS), start (Windows), xdg-open (Linux)
 */
export function openBrowser(url: string): void {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  Bun.spawn([command, url], {
    stdout: "ignore",
    stderr: "ignore",
  });
}

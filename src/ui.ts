// ui.ts — colours, spinner and clipboard.
//
// No libraries. Terminal colours are just short text codes, and copying
// to the clipboard is a built-in command on every OS. Adding a dependency
// for either would be weight we do not need.

import { spawn } from "node:child_process";
import { platform } from "node:process";

// Respect NO_COLOR, and switch colours off when output is piped to a file.
const useColour = process.stdout.isTTY && !process.env.NO_COLOR;

function paint(code: string, text: string): string {
  return useColour ? `\x1b[${code}m${text}\x1b[0m` : text;
}

export const dim = (t: string) => paint("2", t);
export const bold = (t: string) => paint("1", t);
export const green = (t: string) => paint("32", t);
export const yellow = (t: string) => paint("33", t);
export const red = (t: string) => paint("31", t);
export const cyan = (t: string) => paint("36", t);

/** A small rotating spinner shown while we wait for the AI. */
export function startSpinner(label: string): () => void {
  if (!process.stdout.isTTY) {
    console.log("  " + label);
    return () => {};
  }

  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  const timer = setInterval(() => {
    process.stdout.write(`\r  ${cyan(frames[i]!)} ${dim(label)}`);
    i = (i + 1) % frames.length;
  }, 80);

  return () => {
    clearInterval(timer);
    // \r moves to the start of the line, \x1b[2K erases the whole line.
    // Padding with spaces instead leaves trailing whitespace behind.
    process.stdout.write("\r\x1b[2K");
  };
}

/**
 * Copies text to the system clipboard.
 * Returns false if it did not work — never throws, because failing to
 * copy should not lose the user their result.
 */
export function copyToClipboard(text: string): Promise<boolean> {
  const command =
    platform === "darwin"
      ? { cmd: "pbcopy", args: [] as string[] }
      : platform === "win32"
        ? { cmd: "clip", args: [] as string[] }
        : { cmd: "xclip", args: ["-selection", "clipboard"] };

  return new Promise((resolve) => {
    try {
      const child = spawn(command.cmd, command.args);
      child.on("error", () => resolve(false));
      child.on("close", (code) => resolve(code === 0));
      child.stdin.write(text);
      child.stdin.end();
    } catch {
      resolve(false);
    }
  });
}

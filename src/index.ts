// prompt-clarify — entry point
//
// The whole loop:
//   1. Load what we know about the user (or ask, on first run)
//   2. Take the rough prompt they typed
//   3. Fill the gaps from memory
//   4. Print the improved prompt and copy it to the clipboard

import { loadMemory, profileToContext, memoryPath } from "./memory.js";
import { runSetup } from "./setup.js";
import { improvePrompt } from "./fixer.js";
import {
  bold,
  cyan,
  dim,
  green,
  red,
  startSpinner,
  copyToClipboard,
} from "./ui.js";

const args = process.argv.slice(2);

// `setup` forces the questions again, e.g. if your job changed.
const forceSetup = args[0] === "setup";
const input = forceSetup ? "" : args.join(" ");

let memory = await loadMemory();

if (forceSetup || !memory) {
  if (!forceSetup) {
    console.log("");
    console.log("  " + bold("First run") + " — let's set up your profile.");
  }
  const profile = await runSetup();
  memory = { version: 1, createdAt: "", updatedAt: "", profile };

  if (forceSetup) process.exit(0);
}

// No prompt given — show help and what we remember.
if (!input) {
  console.log("");
  console.log("  " + bold("prompt-clarify"));
  console.log("  " + dim("Ask once. Remember forever."));
  console.log("");
  console.log("  Usage:  " + cyan('npx tsx src/index.ts "your prompt here"'));
  console.log("  Reset:  " + cyan("npx tsx src/index.ts setup"));
  console.log("");
  console.log("  " + bold("What I remember about you"));
  for (const line of profileToContext(memory.profile).split("\n")) {
    console.log("    " + dim(line));
  }
  console.log("");
  console.log("  " + dim("Stored at " + memoryPath()));
  console.log("");
  process.exit(0);
}

// The real work.
console.log("");
console.log("  " + dim("BEFORE"));
console.log("  " + dim(input));
console.log("");

const stopSpinner = startSpinner("Filling the gaps from memory...");

try {
  const improved = await improvePrompt(input, memory.profile);
  stopSpinner();

  console.log("  " + green(bold("AFTER")));
  console.log("");
  for (const line of improved.split("\n")) {
    console.log("  " + line);
  }
  console.log("");

  const copied = await copyToClipboard(improved);
  console.log(
    "  " +
      dim(copied ? "Copied to clipboard — just paste it." : "Copy it above."),
  );
  console.log("");
} catch (error) {
  stopSpinner();
  console.error(
    "  " + red(error instanceof Error ? error.message : String(error)),
  );
  console.error("");
  process.exit(1);
}

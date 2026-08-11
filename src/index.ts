#!/usr/bin/env node
// prompt-clarify — entry point
//
// The whole loop:
//   1. Load what we know about the user (or ask, on first run)
//   2. Take the rough prompt they typed
//   3. Fill the gaps from memory
//   4. Print the improved prompt and copy it to the clipboard

import { loadMemory, profileToContext, memoryPath } from "./memory.js";
import { runSetup, ensureApiKey } from "./setup.js";
import { improvePrompt, isMeaningfullyDifferent } from "./fixer.js";
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
// `setup --key` replaces just the API key, leaving the profile alone.
const forceSetup = args[0] === "setup";
const keyOnly = forceSetup && (args[1] === "--key" || args[1] === "key");
const input = forceSetup ? "" : args.join(" ");

if (keyOnly) {
  await ensureApiKey(true);
  process.exit(0);
}

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
  console.log("  Usage:    " + cyan('prompt-clarify "your prompt here"'));
  console.log("  Redo setup: " + cyan("prompt-clarify setup"));
  console.log("  New key:    " + cyan("prompt-clarify setup --key"));
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

// A profile can exist without a key — for example if someone set up inside a
// project folder using .env, then ran the tool from somewhere else. Collect
// the key rather than failing at them.
await ensureApiKey();

// The real work.
console.log("");
console.log("  " + dim("BEFORE"));
console.log("  " + dim(input));
console.log("");

const stopSpinner = startSpinner("Filling the gaps from memory...");

try {
  const improved = await improvePrompt(input, memory.profile);
  stopSpinner();

  // Be honest when the prompt did not need help.
  if (!isMeaningfullyDifferent(input, improved)) {
    console.log("  " + green(bold("ALREADY GOOD")));
    console.log("");
    console.log("  " + dim("Your prompt already says what it needs to."));
    console.log("  " + dim("Nothing worth changing. Send it as it is."));
    console.log("");
    process.exit(0);
  }

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

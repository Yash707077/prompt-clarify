// prompt-clarify — entry point
//
// Step 10: the whole loop.
//   1. Load what we know about the user (or ask, on first run)
//   2. Take the rough prompt they typed
//   3. Fill the gaps from memory
//   4. Print the improved prompt, ready to copy

import { loadMemory, profileToContext, memoryPath } from "./memory.js";
import { runSetup } from "./setup.js";
import { improvePrompt } from "./fixer.js";

const args = process.argv.slice(2);

// `setup` forces the questions again, e.g. if your job changed.
const forceSetup = args[0] === "setup";
const input = forceSetup ? "" : args.join(" ");

let memory = await loadMemory();

if (forceSetup || !memory) {
  if (!forceSetup) {
    console.log("");
    console.log("  First run — let's set up your profile.");
  }
  const profile = await runSetup();
  memory = { version: 1, createdAt: "", updatedAt: "", profile };

  if (forceSetup) process.exit(0);
}

// No prompt given — show help and what we remember.
if (!input) {
  console.log("");
  console.log("  prompt-clarify");
  console.log('  Usage:  npx tsx src/index.ts "your prompt here"');
  console.log("  Reset:  npx tsx src/index.ts setup");
  console.log("");
  console.log("  What I remember about you:");
  console.log("");
  for (const line of profileToContext(memory.profile).split("\n")) {
    console.log("    " + line);
  }
  console.log("");
  console.log("  Stored at " + memoryPath());
  console.log("");
  process.exit(0);
}

// The real work.
console.log("");
console.log("  BEFORE");
console.log("  " + input);
console.log("");
console.log("  Thinking...");

try {
  const improved = await improvePrompt(input, memory.profile);

  // Move the cursor up and clear the "Thinking..." line.
  process.stdout.write("[1A[2K");

  console.log("  AFTER");
  console.log("");
  for (const line of improved.split("\n")) {
    console.log("  " + line);
  }
  console.log("");
} catch (error) {
  process.stdout.write("[1A[2K");
  console.error("  " + (error instanceof Error ? error.message : String(error)));
  console.error("");
  process.exit(1);
}

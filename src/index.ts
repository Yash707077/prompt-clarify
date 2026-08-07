// prompt-clarify — entry point
//
// Step 9: on first run, ask five questions and save the answers.
// On every run after that, load them silently. No questions, ever again.

import { loadMemory, profileToContext, memoryPath } from "./memory.js";
import { runSetup } from "./setup.js";

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

// Step 10 will use this context to actually rewrite the prompt.
console.log("");
console.log("  Your prompt:  " + input);
console.log("");
console.log("  Memory I would use to fill the gaps:");
console.log("");
for (const line of profileToContext(memory.profile).split("\n")) {
  console.log("    " + line);
}
console.log("");
console.log("  (Step 10 will turn these two things into a better prompt.)");
console.log("");

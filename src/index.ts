// prompt-clarify — entry point
//
// Step 8: take whatever you type, send it to Gemini, print the reply.
// This is not the product yet. It only proves the AI connection works.

import { ask } from "./llm.js";

const input = process.argv.slice(2).join(" ");

if (!input) {
  console.log("");
  console.log("  prompt-clarify");
  console.log('  Usage: npx tsx src/index.ts "your prompt here"');
  console.log("");
  process.exit(0);
}

console.log("");
console.log("  Asking Gemini...");
console.log("");

try {
  const reply = await ask(input);
  console.log(reply);
  console.log("");
} catch (error) {
  console.error("  " + (error instanceof Error ? error.message : String(error)));
  console.error("");
  process.exit(1);
}

// testrun.ts — Step 12 helper.
//
// Reads test-prompts.txt, runs each one through the fixer, and writes the
// before/after pairs to test-results.md for a human to judge.
//
// It deliberately does NOT score anything. A tool cannot mark its own
// homework — the whole point of Step 12 is human judgement.
//
// Run with:  npx tsx src/testrun.ts

import { readFile, writeFile } from "node:fs/promises";
import { loadMemory, profileToContext } from "./memory.js";
import { improvePrompt } from "./fixer.js";

// Free tier is roughly 10 requests per minute — but a failed request still
// counts, and each retry is another request. 12s spacing leaves headroom.
const DELAY_MS = 12000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Testing burns 10 requests a run, and we often run it several times while
// tuning. Use the cheaper high-quota model here so test runs do not eat the
// daily budget that real usage needs.
process.env.GEMINI_MODEL ??= "gemini-flash-lite-latest";

const memory = await loadMemory();
if (!memory) {
  console.error("No profile found. Run: npx tsx src/index.ts setup");
  process.exit(1);
}

const raw = await readFile("test-prompts.txt", "utf8");
const prompts = raw
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith("#"));

console.log("");
console.log(`  Running ${prompts.length} prompts. This takes about ${Math.round((prompts.length * DELAY_MS) / 1000)}s.`);
console.log("");

const sections: string[] = [
  "# Step 12 — Test Results",
  "",
  `Run on ${new Date().toISOString().slice(0, 10)}`,
  "",
  "## Profile used",
  "",
  "```",
  profileToContext(memory.profile),
  "```",
  "",
  "## How to judge",
  "",
  "For each one, write **better**, **same**, or **worse** in the verdict line.",
  "Be harsh. A tool that improves 6 of 10 and leaves 4 alone is good.",
  "A tool that rewrites all 10 is over-editing.",
  "",
  "---",
  "",
];

for (const [i, prompt] of prompts.entries()) {
  process.stdout.write(`  ${i + 1}/${prompts.length} ... `);

  let after: string;
  try {
    after = await improvePrompt(prompt, memory.profile);
    console.log("ok");
  } catch (error) {
    after = `ERROR: ${error instanceof Error ? error.message : String(error)}`;
    console.log("failed");
  }

  sections.push(
    `### ${i + 1}`,
    "",
    "**Before**",
    "",
    "> " + prompt,
    "",
    "**After**",
    "",
    ...after.split("\n").map((l) => "> " + l),
    "",
    "**Verdict:** ",
    "",
    "**Why:** ",
    "",
    "---",
    "",
  );

  if (i < prompts.length - 1) await sleep(DELAY_MS);
}

await writeFile("test-results.md", sections.join("\n"), "utf8");

console.log("");
console.log("  Written to test-results.md");
console.log("  Open it, read each pair, and fill in the verdicts.");
console.log("");

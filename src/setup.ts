// setup.ts — the one-time interview.
//
// DESIGN RULE (from Step 0 testing):
// No checkboxes, no multi-select. When yash was given checkboxes he ticked
// every option, which made the memory meaningless. Open questions asking for
// ONE answer produce specific memory. Specific memory fills gaps well.

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { saveMemory, memoryPath, type Profile } from "./memory.js";
import { getApiKey, saveApiKey, looksLikeAKey, configPath } from "./config.js";
import { bold, cyan, dim } from "./ui.js";

interface Question {
  key: keyof Profile;
  ask: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  {
    key: "work",
    ask: "What do you do?",
    hint: "e.g. backend developer, marketing freelancer, final-year student",
  },
  {
    key: "focus",
    ask: "What are you working on right now?",
    hint: "e.g. a CLI tool in TypeScript, a clothing brand's Instagram",
  },
  {
    key: "audience",
    ask: "Who mainly reads or uses what you make?",
    hint: "Pick ONE — the most common. e.g. other developers, my clients",
  },
  {
    key: "commonTasks",
    ask: "What do you use AI for most often?",
    hint: "Pick ONE main use. e.g. writing code, drafting posts, research",
  },
  {
    key: "style",
    ask: "How do you want AI answers written?",
    hint: "e.g. short and direct, detailed with examples, simple English",
  },
];

/**
 * Asks for the API key and stores it in the home folder.
 * Skipped silently if a key is already available.
 */
export async function ensureApiKey(force = false): Promise<void> {
  if (!force && (await getApiKey())) return;

  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("");
  console.log("  " + bold("First, an API key."));
  console.log("");
  console.log("  This tool uses Google Gemini. The free tier costs nothing —");
  console.log("  no credit card, no expiry.");
  console.log("");
  console.log("  Get one here: " + cyan("https://aistudio.google.com/apikey"));
  console.log("  " + dim("Choose 'Create API key in new project'."));
  console.log("  " + dim("Leave billing OFF, or the free tier disappears."));
  console.log("");

  let key = "";
  while (!looksLikeAKey(key)) {
    key = (await rl.question("  Paste your key: ")).trim();
    if (!looksLikeAKey(key)) {
      console.log("  " + dim("That does not look like a key. Try again."));
    }
  }

  rl.close();

  await saveApiKey(key);
  console.log("");
  console.log("  " + dim("Saved to " + configPath() + " (readable only by you)"));
  console.log("");
}

export async function runSetup(): Promise<Profile> {
  await ensureApiKey();

  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("  " + bold("Now, five questions about you."));
  console.log("  " + dim("Asked once. After this it just remembers."));
  console.log("");

  const answers: Partial<Profile> = {};

  for (const [index, question] of QUESTIONS.entries()) {
    console.log(`  ${index + 1}/${QUESTIONS.length}  ${question.ask}`);
    console.log(`       ${dim("(" + question.hint + ")")}`);

    let answer = "";
    while (answer.length === 0) {
      answer = (await rl.question("  > ")).trim();
      if (answer.length === 0) {
        console.log("       " + dim("An answer is needed for this one."));
      }
    }

    answers[question.key] = answer;
    console.log("");
  }

  rl.close();

  const profile = answers as Profile;
  await saveMemory(profile);

  console.log("  " + dim("Profile saved to " + memoryPath()));
  console.log("  " + dim("You will not be asked these again."));
  console.log("");

  return profile;
}

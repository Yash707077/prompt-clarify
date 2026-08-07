// setup.ts — the one-time interview.
//
// DESIGN RULE (from Step 0 testing):
// No checkboxes, no multi-select. When yash was given checkboxes he ticked
// every option, which made the memory meaningless. Open questions asking for
// ONE answer produce specific memory. Specific memory fills gaps well.

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { saveMemory, memoryPath, type Profile } from "./memory.js";

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

export async function runSetup(): Promise<Profile> {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("");
  console.log("  Setting up your profile.");
  console.log("  Five questions, asked once. After this it just remembers.");
  console.log("");

  const answers: Partial<Profile> = {};

  for (const [index, question] of QUESTIONS.entries()) {
    console.log(`  ${index + 1}/${QUESTIONS.length}  ${question.ask}`);
    console.log(`       (${question.hint})`);

    let answer = "";
    while (answer.length === 0) {
      answer = (await rl.question("  > ")).trim();
      if (answer.length === 0) {
        console.log("       An answer is needed for this one.");
      }
    }

    answers[question.key] = answer;
    console.log("");
  }

  rl.close();

  const profile = answers as Profile;
  await saveMemory(profile);

  console.log("  Profile saved to " + memoryPath());
  console.log("  You will not be asked these again.");
  console.log("");

  return profile;
}

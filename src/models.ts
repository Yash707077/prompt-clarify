// models.ts — a one-off helper.
// Lists every model your API key is allowed to use.
// Run it with:  npx tsx src/models.ts
// You can delete this file later.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

console.log("");
console.log("  Models available to your key:");
console.log("");

const pager = await ai.models.list();

for await (const model of pager) {
  const actions = model.supportedActions ?? [];
  if (actions.length === 0 || actions.includes("generateContent")) {
    console.log("  " + model.name);
  }
}

console.log("");

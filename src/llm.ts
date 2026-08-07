// llm.ts — the only file in this project that talks to the AI.
//
// Why keep it separate?
// Every other file calls ask() and knows nothing about Gemini.
// If you ever switch to a different AI provider, you change THIS file only.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("");
  console.error("  No API key found.");
  console.error("  Create a file named .env in this folder containing:");
  console.error("");
  console.error("  GEMINI_API_KEY=your_key_here");
  console.error("");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Send text to Gemini, get text back.
 * This is the whole AI layer. Everything else is our own logic.
 */
export async function ask(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      // "gemini-flash-latest" is an alias that always points at the current
      // Flash model. Pinning an exact version (e.g. "gemini-3.6-flash") means
      // your code breaks when Google retires it — which already happened once.
      model: "gemini-flash-latest",
      contents: prompt,
    });
    return response.text ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // The free tier allows roughly 10 requests per minute.
    // Without this, hitting the limit shows an unreadable wall of JSON.
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      throw new Error(
        "Rate limit hit. The free tier allows ~10 requests per minute. Wait a minute and try again.",
      );
    }

    if (message.includes("404")) {
      throw new Error(
        "That model is no longer available. Run: npx tsx src/models.ts to see which models your key can use.",
      );
    }

    throw new Error(`Gemini call failed: ${message}`);
  }
}

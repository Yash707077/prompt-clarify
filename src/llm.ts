// llm.ts — the only file in this project that talks to the AI.
//
// Why keep it separate?
// Every other file calls ask() and knows nothing about Gemini.
// If you ever switch to a different AI provider, you change THIS file only.

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "./config.js";

// Which model to use. Override in .env or the shell with GEMINI_MODEL=...
//
// Default is Flash. Tested against flash-lite side by side: lite gave
// noticeably thinner rewrites (no structure, no length guidance). A real
// user runs this a handful of times a day, not hundreds, so the ~250/day
// free quota is plenty and the quality difference is worth it.
//
// Using a "-latest" alias rather than a pinned version because Google
// retires exact versions without warning — that already broke this once.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";

const MAX_ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The client is created on first use, NOT when this file is imported.
//
// v0.1.0 checked for the key at import time and called process.exit(1).
// That meant `prompt-clarify setup` — the command whose whole job is to
// collect the key — died before it could ask for one. Lazy is correct here.
let client: GoogleGenAI | null = null;

async function getClient(): Promise<GoogleGenAI> {
  if (client) return client;

  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error(
      "No API key found. Run: prompt-clarify setup",
    );
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Send text to Gemini, get text back.
 * This is the whole AI layer. Everything else is our own logic.
 *
 * Retries transient failures. Does NOT retry real errors like a bad key or a
 * dead model — repeating those just wastes the user's time.
 */
export async function ask(prompt: string, attempt = 1): Promise<string> {
  // Outside the try: a missing key is not a Gemini failure, and wrapping it
  // in "Gemini call failed:" would bury the one instruction that helps.
  const ai = await getClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text ?? "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // A dropped connection on our side.
    const isNetwork =
      message.includes("fetch failed") ||
      message.includes("ECONNRESET") ||
      message.includes("ETIMEDOUT") ||
      message.includes("socket hang up");

    // Google's servers are busy. Common on the free tier, always temporary.
    const isOverloaded =
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("overloaded") ||
      message.includes("high demand");

    // Too many requests too fast. Needs a longer pause than the others.
    const isRateLimited =
      message.includes("429") || message.includes("RESOURCE_EXHAUSTED");

    if ((isNetwork || isOverloaded || isRateLimited) && attempt < MAX_ATTEMPTS) {
      // Waits grow each attempt so we do not hammer a struggling server.
      const wait = isRateLimited ? attempt * 20_000 : attempt * 2_000;
      await sleep(wait);
      return ask(prompt, attempt + 1);
    }

    if (isNetwork) {
      throw new Error(
        "Could not reach Gemini after 3 tries. Check your internet connection.",
      );
    }

    if (isOverloaded) {
      throw new Error(
        "Gemini's servers are busy right now. This is temporary — try again in a minute.",
      );
    }

    if (isRateLimited) {
      throw new Error(
        "Rate limit hit. The free tier allows ~10 requests per minute. Wait a minute and try again.",
      );
    }

    if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      throw new Error(
        "That API key was rejected. Run: prompt-clarify setup --key",
      );
    }

    if (message.includes("404")) {
      throw new Error(
        `Model "${MODEL}" is no longer available. Set GEMINI_MODEL in your environment to a current one.`,
      );
    }

    throw new Error(`Gemini call failed: ${message}`);
  }
}

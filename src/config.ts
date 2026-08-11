// config.ts — where the API key lives.
//
// v0.1.0 shipped with the key read only from a .env file in the CURRENT
// WORKING DIRECTORY. That works when you run the tool from inside its own
// project, and fails everywhere else — which is every real user, since this
// is a globally installed CLI. You cannot put a .env in every folder you
// might ever type a prompt from.
//
// The fix: keep the key in the user's home folder, next to memory.json.
// One location, works from anywhere.

import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";

interface Config {
  apiKey?: string;
}

const CONFIG_DIR = join(homedir(), ".prompt-clarify");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function configPath(): string {
  return CONFIG_FILE;
}

async function readConfig(): Promise<Config> {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(await readFile(CONFIG_FILE, "utf8")) as Config;
  } catch {
    return {};
  }
}

/**
 * Finds the API key, in order of precedence:
 *
 *   1. GEMINI_API_KEY environment variable — lets CI and power users override
 *   2. A .env file in the current folder — kept so existing setups keep working
 *   3. ~/.prompt-clarify/config.json — the normal case for installed users
 *
 * dotenv has already loaded (1) and (2) into process.env by the time this runs.
 */
export async function getApiKey(): Promise<string | null> {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  const stored = (await readConfig()).apiKey?.trim();
  return stored && stored.length > 0 ? stored : null;
}

/**
 * Saves the key with owner-only permissions (0600).
 *
 * This is a credential sitting in a plain file. 0600 means other user accounts
 * on the machine cannot read it. That is the same approach npm, gh and aws
 * take for their own credential files — not perfect, but the normal bar.
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });

  const config = await readConfig();
  config.apiKey = apiKey.trim();

  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  await chmod(CONFIG_FILE, 0o600);
}

/** A rough shape check, so an obvious paste error is caught immediately. */
export function looksLikeAKey(value: string): boolean {
  const v = value.trim();
  return v.length >= 20 && !v.includes(" ");
}

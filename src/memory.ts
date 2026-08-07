// memory.ts — reads and writes the user's saved profile.
//
// The profile lives in the user's HOME folder, not the project folder:
//   ~/.prompt-clarify/memory.json
//
// Why home and not the project?
//  1. It survives if the project folder is deleted.
//  2. It can never be committed to GitHub by accident.
//  3. One profile works across every project the user has.

import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

/** The five things we remember about the user. */
export interface Profile {
  work: string;
  focus: string;
  audience: string;
  commonTasks: string;
  style: string;
}

export interface Memory {
  version: number;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
}

const MEMORY_DIR = join(homedir(), ".prompt-clarify");
const MEMORY_FILE = join(MEMORY_DIR, "memory.json");

/** Where the memory file lives. Shown to the user so it is never a mystery. */
export function memoryPath(): string {
  return MEMORY_FILE;
}

export function hasMemory(): boolean {
  return existsSync(MEMORY_FILE);
}

/** Returns the saved memory, or null if there is none or it is unreadable. */
export async function loadMemory(): Promise<Memory | null> {
  if (!existsSync(MEMORY_FILE)) return null;

  try {
    const raw = await readFile(MEMORY_FILE, "utf8");
    const parsed = JSON.parse(raw) as Memory;
    if (!parsed?.profile) return null;
    return parsed;
  } catch {
    // A corrupted file should not crash the tool. Treat it as "no memory".
    return null;
  }
}

/** Saves the profile, preserving the original creation date. */
export async function saveMemory(profile: Profile): Promise<Memory> {
  await mkdir(MEMORY_DIR, { recursive: true });

  const now = new Date().toISOString();
  const existing = await loadMemory();

  const memory: Memory = {
    version: 1,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    profile,
  };

  await writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2), "utf8");
  return memory;
}

/** Turns the profile into the block of text we hand to the AI. */
export function profileToContext(profile: Profile): string {
  return [
    `Work: ${profile.work}`,
    `Currently focused on: ${profile.focus}`,
    `Main audience: ${profile.audience}`,
    `Uses AI mostly for: ${profile.commonTasks}`,
    `Preferred output style: ${profile.style}`,
  ].join("\n");
}

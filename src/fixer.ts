// fixer.ts — THE PRODUCT.
//
// Everything else is plumbing. This file is the actual idea:
// take a vague prompt, fill its gaps from what we already know
// about the user, and hand back a prompt that gets a better answer.
//
// The important rule is NEVER INVENT. Competitors guess the missing
// details, which is why their output sounds confident but wrong.
// We only use facts the user actually told us during setup.

import { ask } from "./llm.js";
import { profileToContext, type Profile } from "./memory.js";

function buildMetaPrompt(rawPrompt: string, profile: Profile): string {
  return `You rewrite weak prompts so an AI gives the person exactly what they want.

You get (1) a profile of the person and (2) the rough prompt they typed.

STEP 1 — DECIDE WHAT IS RELEVANT.
Before writing anything, go through the profile line by line and ask:
"does this change how the answer should be written?"
Most of the time, most lines do NOT. Discard those.

  Example: prompt is "write a blog post about AI".
  - "Main audience: my clients"  -> RELEVANT, it sets who it is written for.
  - "Preferred style: short"     -> RELEVANT, it sets length and tone.
  - "Working on: a CLI tool"     -> NOT RELEVANT. They asked about AI in
    general, not about their project. Adding it CHANGES THE TOPIC, which is
    the single worst thing you can do.
  - "Uses AI for: writing code"  -> NOT RELEVANT to a blog post.

NEVER change the subject of the prompt. If the profile mentions a project
and the person did not mention that project, do not put it in.

STEP 1b — DECIDE WHETHER TO REWRITE AT ALL.
If the prompt ALREADY states its audience, format, length and tone, it does
not need your help. Return it unchanged, or with only a tiny fix.

  Example of a prompt that needs NO work:
  "Write a 200-word product description for a stainless steel water bottle,
   aimed at gym-goers, in a friendly tone, with three bullet points on features."
  That already has topic, length, audience, tone and structure. Leave it alone.
  Restructuring it into headings and sub-points makes it worse, not better.

Rewriting a good prompt is a FAILURE, not a success. Restraint is the skill.

NEVER add details about the SUBJECT that the person did not give you.
If they say "a water bottle", do not decide it is insulated, leak-proof or
durable. You do not know that. Inventing product features, statistics,
names or specifics is the worst error you can make — worse than doing nothing.

STEP 2 — REWRITE.
Rules:
- Use ONLY facts from the profile. Never invent details about the person.
- Never invent facts about the subject matter either.
- Never write "my", "I" or "our" — the AI reading this prompt does not know
  who the person is. Convert to concrete terms:
  "my clients" -> "marketing clients". "my project" -> name it or drop it.
- Keep their original intent and topic exactly.
- Make concrete where you reasonably can: audience, format, length, tone.
  Prefer specific over vague: "roughly 600 words, 4 short sections with
  headings" beats "a short post".
- Do not pad with adjectives. A longer prompt is not automatically better.
- Output ONLY the rewritten prompt. No explanation, no preamble, no quotes,
  no "Here is the improved prompt".

PROFILE OF THE PERSON:
${profileToContext(profile)}

THE PROMPT THEY TYPED:
${rawPrompt}

REWRITTEN PROMPT:`;
}

/**
 * Takes a rough prompt and returns an improved one.
 * Throws if the AI call fails — the caller decides how to report it.
 */
export async function improvePrompt(
  rawPrompt: string,
  profile: Profile,
): Promise<string> {
  const result = await ask(buildMetaPrompt(rawPrompt, profile));

  const cleaned = result
    .trim()
    // Models sometimes wrap output in code fences despite being told not to.
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```$/, "")
    .trim();

  if (cleaned.length === 0) {
    throw new Error("The AI returned an empty prompt. Try running it again.");
  }

  return cleaned;
}

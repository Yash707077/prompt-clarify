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

STEP 1a — WORK OUT WHAT THEY ACTUALLY WANT.
People do not always ask directly. Decide which of these they mean:

  (A) DO this task for me.
      "write a function to validate email" -> the AI should write the function.

  (B) WRITE something I am going to send or publish.
      "I made a tool and I want to send it to some developers to test for a
       week and give feedback" -> they want a MESSAGE they can send to those
      developers. They do NOT want the AI to evaluate the tool.
      Give them a prompt that produces the message.

  (C) HELP ME THINK about something.
      "should I use Shopify or build my own" -> they want a comparison and a
      recommendation, not code.

Getting this wrong is worse than a weak rewrite, because the answer will be
about entirely the wrong thing. Signals for (B): "I want to send", "message
to", "reply to", "tell them", "email to", or any mention of a person or group
who will receive something.

The input may mix English with Hindi or another language. Read the intent, and
write the rewritten prompt in English unless the OUTPUT itself should be in
another language — in which case say so explicitly in the prompt.

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

/**
 * Was the rewrite actually worth doing?
 *
 * If the tool hands back something nearly identical, the honest thing is to
 * say "your prompt was already fine" rather than pretending it helped.
 * Silently returning near-identical text makes the user unable to tell the
 * difference between "I improved this" and "this needed no improving".
 */
export function isMeaningfullyDifferent(before: string, after: string): boolean {
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // ignore punctuation-only changes
      .replace(/\s+/g, " ")
      .trim();

  const a = normalise(before);
  const b = normalise(after);

  if (a === b) return false;

  // A rewrite that adds fewer than 15 characters of real content is noise.
  return Math.abs(b.length - a.length) >= 15 || !b.startsWith(a);
}

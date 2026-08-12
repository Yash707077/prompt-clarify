// worker/src/index.js — the shared-key proxy.
//
// WHY THIS EXISTS
// Without it, every user must create their own Google Cloud project and paste
// an API key. Developers will do that. Almost nobody else will. This proxy
// holds ONE key server-side so users can just install and type.
//
// THE DANGER THIS GUARDS AGAINST
// The endpoint is public. Anyone who finds the URL can call it. Without limits,
// one person with a loop could drain the entire daily quota in seconds, or —
// if billing were ever enabled — run up a real bill.
//
// So there are TWO independent caps, both enforced here and not in the client.
// Client-side limits are a suggestion; server-side limits are a rule.
//
//   1. PER_USER_DAILY  — one install cannot exceed this many improvements a day
//   2. GLOBAL_DAILY    — everyone combined cannot exceed this, ever
//
// GLOBAL_DAILY sits deliberately below Gemini's free-tier allowance. If the cap
// is hit, requests are refused. That refusal is the entire point: it is what
// makes it impossible for this to cost money.

const PER_USER_DAILY = 15;

// Gemini's free tier allows ~250 requests/day. We stop at 200 so that a burst
// of retries near the limit cannot tip us over into a billable state.
const GLOBAL_DAILY = 200;

const MODEL = "gemini-flash-latest";
const MAX_PROMPT_LENGTH = 4000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** UTC day stamp, so counters reset at a predictable time worldwide. */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Increments a counter and reports whether it is now over the limit.
 * Keys expire after 48h so old days clean themselves up.
 */
async function bump(kv, key, limit) {
  const current = parseInt((await kv.get(key)) ?? "0", 10);
  if (current >= limit) return { allowed: false, used: current };

  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 48 });
  return { allowed: true, used: current + 1 };
}

function profileToContext(p) {
  return [
    `Work: ${p.work}`,
    `Currently focused on: ${p.focus}`,
    `Main audience: ${p.audience}`,
    `Uses AI mostly for: ${p.commonTasks}`,
    `Preferred output style: ${p.style}`,
  ].join("\n");
}

// Kept in step with src/fixer.ts and extension/prompt.js.
// If you change the rules, change them in all three.
function buildMetaPrompt(rawPrompt, profile) {
  return `You rewrite weak prompts so an AI gives the person exactly what they want.

STEP 1a — WORK OUT WHAT THEY ACTUALLY WANT.
  (A) DO this task for me.
  (B) WRITE something I am going to send or publish. Signals: "I want to send",
      "message to", "reply to", "tell them", or any mention of who receives it.
  (C) HELP ME THINK about something.
Getting this wrong is worse than a weak rewrite.

The input may mix English with Hindi or another language. Read the intent and
write the rewritten prompt in English, unless the OUTPUT itself should be in
another language — in which case say so explicitly.

STEP 1 — DECIDE WHAT IS RELEVANT.
Go through the profile line by line: "does this change how the answer should be
written?" Most lines usually do NOT. Discard those. NEVER change the subject of
the prompt — adding the person's current project to an unrelated request is the
worst possible error.

STEP 1b — DECIDE WHETHER TO REWRITE AT ALL.
If the prompt already states audience, format, length and tone, return it
unchanged. Rewriting a good prompt is a FAILURE. Never invent details about the
subject either: "a water bottle" is not necessarily insulated or leak-proof.

STEP 2 — REWRITE.
- Use ONLY facts from the profile. Never invent details about the person.
- Never write "my", "I" or "our" — convert to concrete terms.
- Keep their original intent and topic exactly.
- Make audience, format, length and tone concrete where the profile supports it.
- Do not pad. Output ONLY the rewritten prompt, no preamble, no quotes.

PROFILE OF THE PERSON:
${profileToContext(profile)}

THE PROMPT THEY TYPED:
${rawPrompt}

REWRITTEN PROMPT:`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const { prompt, profile, installId } = body ?? {};

    if (typeof installId !== "string" || installId.length < 8) {
      return json({ error: "Missing install ID" }, 400);
    }

    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return json({ error: "Missing prompt" }, 400);
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return json(
        { error: "That prompt is too long. Keep it under 4000 characters." },
        400,
      );
    }

    if (!profile || typeof profile !== "object") {
      return json({ error: "Missing profile" }, 400);
    }

    const day = today();

    // Global cap first. If the shared pool is exhausted there is no point
    // charging it against an individual user's allowance.
    const global = await bump(env.LIMITS, `g:${day}`, GLOBAL_DAILY);
    if (!global.allowed) {
      return json(
        {
          error:
            "The shared daily limit for everyone has been reached. Try again tomorrow.",
          reason: "global_limit",
        },
        429,
      );
    }

    const user = await bump(env.LIMITS, `u:${installId}:${day}`, PER_USER_DAILY);
    if (!user.allowed) {
      return json(
        {
          error: `You have used your ${PER_USER_DAILY} improvements for today. Try again tomorrow.`,
          reason: "user_limit",
        },
        429,
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    let upstream;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildMetaPrompt(prompt, profile) }] }],
        }),
      });
    } catch {
      return json({ error: "Could not reach Gemini. Try again." }, 502);
    }

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return json(
          { error: "Too many requests right now. Try again in a minute." },
          429,
        );
      }
      if (upstream.status === 503) {
        return json(
          { error: "Gemini's servers are busy. Try again in a minute." },
          503,
        );
      }
      // Never leak the upstream body — it can contain key details.
      return json({ error: "The AI service returned an error." }, 502);
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const cleaned = text
      .trim()
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/, "")
      .trim();

    if (!cleaned) {
      return json({ error: "Empty response. Try again." }, 502);
    }

    return json({
      improved: cleaned,
      usedToday: user.used,
      dailyLimit: PER_USER_DAILY,
    });
  },
};

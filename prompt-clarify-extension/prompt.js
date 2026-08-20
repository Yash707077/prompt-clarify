// prompt.js — the meta-prompt and the two ways to send it.
//
// This is deliberately a copy of the logic in src/fixer.ts rather than an
// import. A browser extension is sandboxed: it cannot reach the CLI or the
// filesystem. So the rules have to live here too.
//
// IF YOU CHANGE THE RULES, CHANGE THEM IN ALL THREE PLACES:
//   src/fixer.ts          (the CLI)
//   extension/prompt.js   (this file)
//   worker/src/index.js   (the shared proxy)

window.PC = window.PC || {};

(function (PC) {
  if (PC.improvePrompt) return; // already injected into this page

  function profileToContext(profile) {
    return [
      `Work: ${profile.work}`,
      `Currently focused on: ${profile.focus}`,
      `Main audience: ${profile.audience}`,
      `Uses AI mostly for: ${profile.commonTasks}`,
      `Preferred output style: ${profile.style}`,
    ].join("\n");
  }

  function buildMetaPrompt(rawPrompt, profile) {
    return `You rewrite weak prompts so an AI gives the person exactly what they want.

You get (1) a profile of the person and (2) the rough prompt they typed.

STEP 1a — WORK OUT WHAT THEY ACTUALLY WANT.
  (A) DO this task for me.
      "write a function to validate email" -> the AI should write the function.
  (B) WRITE something I am going to send or publish.
      "I made a tool and I want to send it to some developers to test for a
       week and give feedback" -> they want a MESSAGE to send those developers.
      They do NOT want the AI to evaluate the tool.
  (C) HELP ME THINK about something.
      "should I use Shopify or build my own" -> a comparison, not code.

Getting this wrong is worse than a weak rewrite. Signals for (B): "I want to
send", "message to", "reply to", "tell them", or any mention of who receives it.

The input may mix English with Hindi or another language. Read the intent and
write the rewritten prompt in English, unless the OUTPUT itself should be in
another language — in which case say so explicitly.

STEP 1 — DECIDE WHAT IS RELEVANT.
Go through the profile line by line: "does this change how the answer should be
written?" Most lines usually do NOT. Discard those.

  Example: prompt is "write a blog post about AI".
  - "Main audience: my clients"  -> RELEVANT, sets who it is written for.
  - "Preferred style: short"     -> RELEVANT, sets length and tone.
  - "Working on: a CLI tool"     -> NOT RELEVANT. Adding it CHANGES THE TOPIC,
    which is the single worst thing you can do.

NEVER change the subject of the prompt.

STEP 1b — DECIDE WHETHER TO REWRITE AT ALL.
If the prompt already states audience, format, length and tone, return it
unchanged. Rewriting a good prompt is a FAILURE, not a success.

NEVER add details about the SUBJECT the person did not give you. If they say
"a water bottle", do not decide it is insulated or leak-proof.

STEP 2 — REWRITE.
- Use ONLY facts from the profile. Never invent details about the person.
- Never write "my", "I" or "our" — convert to concrete terms.
  "my clients" -> "marketing clients".
- Keep their original intent and topic exactly.
- Make audience, format, length and tone concrete where the profile supports it.
- Do not pad. A longer prompt is not automatically better.
- Output ONLY the rewritten prompt. No explanation, no preamble, no quotes.

PROFILE OF THE PERSON:
${profileToContext(profile)}

THE PROMPT THEY TYPED:
${rawPrompt}

REWRITTEN PROMPT:`;
  }

  function clean(text) {
    return text
      .trim()
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/, "")
      .trim();
  }

  /** Was the rewrite worth doing, or did it just add punctuation? */
  PC.isMeaningfullyDifferent = function (before, after) {
    const normalise = (s) =>
      s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

    const a = normalise(before);
    const b = normalise(after);

    if (a === b) return false;
    return Math.abs(b.length - a.length) >= 15 || !b.startsWith(a);
  };

  /** Route 1 — the shared proxy. No API key needed from the user. */
  PC.improveViaProxy = async function (rawPrompt, profile, installId) {
    const response = await fetch(PC.PROXY_URL + "/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: rawPrompt, profile, installId }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }

    return data.improved;
  };

  /** Route 2 — the user's own key, called directly. */
  PC.improvePrompt = async function (rawPrompt, profile, apiKey, model) {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildMetaPrompt(rawPrompt, profile) }] }],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) throw new Error("Rate limit hit. Wait a minute and try again.");
      if (status === 503) throw new Error("Gemini's servers are busy. Try again in a minute.");
      if (status === 400 || status === 403) {
        throw new Error("API key rejected. Check it in the extension settings.");
      }
      if (status === 404) throw new Error(`Model "${model}" not available for this key.`);
      throw new Error(`Request failed (${status}).`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = clean(text);

    if (!cleaned) throw new Error("Empty response. Try again.");
    return cleaned;
  };
})(window.PC);

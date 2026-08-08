---
tags: [prompt-clarify, code, reference]
---

# 13 — Code Reference

[[00 - INDEX|← back to index]]

*Every file, what it does, why it exists. Total: ~450 lines.*

## File map

```
prompt-clarify/
├── src/
│   ├── index.ts      entry point — orchestrates everything
│   ├── memory.ts     load and save the user profile
│   ├── setup.ts      the one-time 5 questions
│   ├── fixer.ts      ⭐ THE PRODUCT — rewrites the prompt
│   ├── llm.ts        the only file that touches the AI
│   ├── ui.ts         colours, spinner, clipboard
│   ├── models.ts     dev helper — lists available models
│   └── testrun.ts    dev helper — batch tests prompts
├── blueprint/        these notes
├── test-prompts.txt  the 10 test prompts
├── test-results.md   generated output for human judging
├── .env              API key — NEVER committed
├── .env.example      template for other people
├── .gitignore        blocks .env and node_modules
├── package.json
├── tsconfig.json
├── LICENSE           MIT
└── README.md         still 2 lines — Step 14
```

---

## `index.ts` — entry point

The flow:

1. Read command-line arguments
2. Load memory — if none exists, run setup first
3. If no prompt given, show help + what it remembers
4. Otherwise: print BEFORE, start spinner, call the fixer, print AFTER, copy to clipboard

**Commands:**

```bash
npx tsx src/index.ts "your vague prompt"   # improve a prompt
npx tsx src/index.ts setup                 # redo the 5 questions
npx tsx src/index.ts                       # show help + memory
```

---

## `memory.ts` — the profile store

**Location:** `~/.prompt-clarify/memory.json` — home folder, not the project.

**Why home:** survives project deletion, can never be committed by accident, works across all projects.

**Shape:**

```json
{
  "version": 1,
  "createdAt": "2026-08-07T...",
  "updatedAt": "2026-08-07T...",
  "profile": {
    "work": "marketing freelancer",
    "focus": "a prompting tool called prompt-clarify",
    "audience": "my clients' customers on social media",
    "commonTasks": "writing code",
    "style": "short and direct"
  }
}
```

**Key functions:** `loadMemory()`, `saveMemory()`, `profileToContext()`, `memoryPath()`

**Design note:** a corrupted memory file returns `null` rather than throwing. A broken profile should trigger re-setup, not a crash.

---

## `setup.ts` — the one-time interview

Five open questions using Node's built-in `readline/promises` — no dependency.

| # | Question | Captures |
|---|---|---|
| 1 | What do you do? | work |
| 2 | What are you working on right now? | focus |
| 3 | Who mainly reads or uses what you make? | audience |
| 4 | What do you use AI for most often? | commonTasks |
| 5 | How do you want AI answers written? | style |

**The rule enforced here:** open text, ONE answer each. Never checkboxes. See [[11 - Step 0 Validation]] Finding 1.

Empty answers are rejected and re-asked.

---

## `fixer.ts` — ⭐ THE PRODUCT

Builds a meta-prompt and sends it to the AI. The meta-prompt has three stages:

**Step 1 — Decide what is relevant.** Go through the profile line by line, discard anything that does not change how the answer should be written. Includes worked examples of what to drop.

**Step 1b — Decide whether to rewrite at all.** If the prompt already states audience, format, length and tone, leave it alone. *"Rewriting a good prompt is a FAILURE, not a success. Restraint is the skill."*

**Step 2 — Rewrite.** Only relevant gaps. No invention, about the person *or* the subject. No first-person words.

**Output cleaning:** strips code fences the model adds despite being told not to; throws on empty output.

---

## `llm.ts` — the AI boundary

**One function: `ask(prompt)`.** Nothing else in the project knows Gemini exists.

**Model:** `process.env.GEMINI_MODEL ?? "gemini-flash-latest"`

**Retry logic** — up to 3 attempts:

| Error type | Detected by | Wait |
|---|---|---|
| Network | `fetch failed`, `ECONNRESET`, `ETIMEDOUT`, `socket hang up` | 2s, 4s |
| Server overload | `503`, `UNAVAILABLE`, `high demand` | 2s, 4s |
| Rate limit | `429`, `RESOURCE_EXHAUSTED` | 20s, 40s |

**Not retried:** bad API key, missing model (404). Repeating those wastes the user's time.

Each error type gets a plain-English message instead of raw JSON.

---

## `ui.ts` — presentation

Zero dependencies.

- **Colours** — raw ANSI codes. Respects `NO_COLOR` and disables when piped
- **Spinner** — braille frames at 80ms. Cleared with `\r\x1b[2K` *(padding with spaces leaves trailing whitespace — a real bug that was fixed)*
- **Clipboard** — `pbcopy` (mac), `clip` (win), `xclip` (linux). Never throws; failing to copy must not lose the result

---

## `models.ts` and `testrun.ts` — dev helpers

`models.ts` lists every model a key can access. Written when Gemini retired a model mid-build. **Keep it** — this will happen again.

`testrun.ts` runs `test-prompts.txt` and writes before/after pairs to `test-results.md`. Forces flash-lite and 12s spacing.

> **It deliberately does not score anything.** A tool cannot mark its own homework.

⚠️ **Both would ship to npm users.** Exclude before Step 15.

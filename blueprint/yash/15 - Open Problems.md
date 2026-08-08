---
tags: [prompt-clarify, open, honest]
---

# 15 — Open Problems

[[00 - INDEX|← back to index]]

*An honest list of what is still wrong. Nothing here is hidden or softened.*

---

## 🔴 Critical — affects the core pitch

### 1. The "context" half of the product does not exist

The positioning is:

> **Memory** for who you are. **Context** for what you're doing.

**Only memory is built.**

[[11 - Step 0 Validation]] found that 2 of 7 real prompts could not be fixed by memory — they needed to know *what the user was looking at* (`can u mak this horizonatal`). That gap was identified as the sharper wedge, the thing no competitor does.

Right now the product is a memory-based prompt rewriter. Still differentiated from Pretty Prompt, but **it is the smaller half of the idea**.

**Options:**
- Ship memory-only, get real feedback, add context later *(recommended — feedback beats building)*
- Build context before publishing *(delays the only step that validates anything)*

**Either way: do not describe the product as doing both until it does.**

---

### 2. The target user is unresolved

Research recommended **developers first**, because they install CLI tools without friction and the GitHub repo becomes the distribution channel.

The user chose **"for everyone"**, then in practice built for their own profile — a marketing freelancer.

**Why it matters:** the setup questions, the example prompts, and where it gets announced all depend on this. "For everyone" means vague questions, which means vague memory, which is exactly [[11 - Step 0 Validation]] Finding 1 in a different form.

**Unresolved.**

---

## 🟠 Important — before publishing

### 3. Step 12 is not finished

The full 10-prompt test has never completed cleanly. **No human verdicts are filled in.**

This is the gate that decides whether the tool actually works. Everything after it is premature until it is done.

### 4. The freelancer audience problem is patched, not fixed

See [[14 - Bugs and Lessons]] #10. The current fix is rewording one profile answer. Any other freelancer hits the same confusion.

**Proper fix:** a sixth question separating who commissions from who reads.

### 5. `npx prompt-clarify` does not work

No `bin` entry in `package.json`. Only `npx tsx src/index.ts` works — unacceptable for a published tool.

### 6. Dev helpers would ship to users

`models.ts` and `testrun.ts` are development tools. They must be excluded from the published package.

### 7. README is two lines

The repo currently looks abandoned to anyone who finds it.

### 8. `test-results.md` is committed full of errors

Generated output from a failed run is in the repo. Either regenerate it or add it to `.gitignore`.

---

## 🟡 Known gaps — scheduled

| Gap | Scheduled for |
|---|---|
| No tests | Step 12 |
| No CI | Optional, after Step 15 |
| No `.env.example` guidance in README | Step 14 |
| Only one AI provider | Deliberate — pick one, do it well |

---

## ⚪ Honest uncertainties — cannot be resolved by building

**Will people actually use it?**
Adding a step before typing is friction. Memory reduces that friction more than competitors do — that is the bet. Nobody knows until Step 16.

**Does a better prompt always mean a better answer?**
Usually. But sometimes the AI was fine and the user expected something it cannot do. This tool cannot fix that.

**Is "runs locally, prompts never leave your machine" true?**
**No.** Prompts go to Gemini. Only the *memory* is local. Do not overclaim this in the README — it is the kind of thing that destroys trust when someone notices.

**Can this beat Pretty Prompt?**
On the memory idea, plausibly. On polish, distribution and 40,000 existing users, no. Not yet, and not soon.

---

## The single most important next action

> **Step 16 — show it to five real developers.**

Not more features. Not the extension. Not a better README.

Every problem on this page except #1 and #2 is a small, fixable engineering task. The unresolved question is whether anyone wants this, and only real users answer that.

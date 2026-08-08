---
tags: [prompt-clarify, lessons, debugging]
---

# 14 — Bugs and Lessons

[[00 - INDEX|← back to index]]

*Every real failure found so far, and what fixed it. This is the most useful note in the vault — these are the things that would have been discovered painfully later.*

---

## 1. The idea was not original ⭐

**Found:** Day 1, after the blueprint was drawn.

Pretty Prompt (40,000 users), LogicBalls, SecondBrain and Anthropic's own prompt improver already do clarify-then-rewrite.

**Lesson:** research competitors *before* designing, not after. The blueprint was drawn on assumptions that turned out to be wrong.

**What saved it:** the research also revealed the three cracks that became the actual strategy. See [[06 - Competitor Teardown]].

---

## 2. Checkboxes destroy memory ⭐

**Found:** Step 0, within 4 minutes.

Given multi-select questions, the user ticked **every option**. Memory reading *"audience: everyone, pain: everything"* knows nothing.

**Fix:** open questions asking for ONE answer.

**Lesson:** this cost 4 minutes to find by hand. It would have cost 3 weeks to find in code.

---

## 3. Google retired a model mid-build

**Found:** Step 8. `gemini-2.5-flash` returned 404 — *"no longer available to new users"*.

**Fix:** use the `-latest` alias instead of a pinned version, and write `models.ts` to query what a key can actually access.

**Lesson:** never pin an exact model version. Vendors retire them without warning.

---

## 4. Licence contradiction

**Found:** during a review, not by any error.

`npm init -y` defaulted `package.json` to **ISC** while the `LICENSE` file said **MIT**. Two different answers about what people are allowed to do. Version also said `1.0.0` at step 8 of 18.

**Fix:** MIT everywhere, version `0.1.0`.

**Lesson:** defaults from generators are not decisions. Read what they wrote.

---

## 5. Topic drift — the worst failure ⭐⭐

**Found:** Step 10, first test.

Profile said *"currently working on: a prompting tool called prompt-clarify."*
Prompt was *"write a blog post about AI."*
Output: *"write a blog post about AI **focusing on the prompting tool prompt-clarify**."*

**It changed the subject of the request.**

**Fix:** a relevance-filtering stage in the meta-prompt with worked examples of what to discard.

**Lesson:** *"use only facts from the profile"* was not enough. The model needed to be told explicitly that **most profile facts are irrelevant to most prompts**.

---

## 6. First-person leakage

**Found:** same test.

Output contained *"aimed at my clients"*. An AI reading that prompt has no idea who "my" is.

**Fix:** meta-prompt rule banning `my`, `I`, `our`. `my clients` → `marketing clients`.

---

## 7. Over-editing and inventing subject facts ⭐⭐

**Found:** Step 12, test prompt #6.

Given an already-good prompt — *"Write a 200-word product description for a stainless steel water bottle, aimed at gym-goers, in a friendly tone, with three bullet points on features"* — the tool tripled its length **and invented product features that were never mentioned**: "temperature retention, durability, leak-proof seal."

Two failures at once: over-editing a good prompt, and inventing facts about the *subject*.

**Fix:** a "decide whether to rewrite at all" stage, plus an explicit ban on inventing subject facts.

> **Rewriting a good prompt is a failure, not a success. Restraint is the skill.**

**Lesson:** the original "never invent" rule only covered facts about the *person*. It never occurred to anyone that the model would invent facts about the *product being described*.

---

## 8. No retry logic

**Found:** Step 12, run 1. A single dropped connection killed the whole run.

**Fix:** retries for network failures.

**Then run 2 failed differently** — four 503 "high demand" errors. The retry logic only covered network errors, not server overload.

**Then run 3 failed differently again** — eight rate limits.

**Final fix:** three categories, with 20s+ backoff for rate limits specifically.

**Lesson:** each fix revealed the next failure. Three runs, three completely different error classes.

---

## 9. Model choice is a quota decision, not just a quality one

**Found:** Step 12, run 3. Four test runs exhausted the daily quota.

`gemini-flash-latest` allows ~250 requests/day. `gemini-flash-lite-latest` allows ~1,000.

**Fix:** model configurable via `.env`. Real usage on Flash for quality; test runner forces Flash-lite.

**Lesson:** the `-latest` alias was chosen for resilience without considering that newer models have *tighter* free quotas. Two good properties in tension.

---

## 10. The freelancer audience problem ⭐

**Found:** Step 12.

For a marketing freelancer, "audience" is ambiguous. The user answered *"my clients"*, so the tool wrote captions *"aimed at marketing clients"* — but an Instagram caption for a jewellery brand is read by the **client's customers**, not the client.

**Current fix:** reworded the profile answer to *"my clients' customers on social media"*. **That is a patch, not a fix** — any other freelancer installing this hits the same confusion.

**Proper fix:** a sixth setup question separating *who commissions the work* from *who reads it*.

**Status:** ⚠️ open. See [[15 - Open Problems]].

---

## 11. Spinner left trailing whitespace

**Found:** Step 11, visually.

Clearing the spinner by writing spaces left trailing whitespace on the output line.

**Fix:** `\r\x1b[2K` — carriage return plus erase-line.

**Lesson:** small, but it would have shown up in the README GIF.

---

## Meta-lesson

**Writing the code was fast. Finding out it was wrong was slow.**

Steps 9–11 took one session. Step 12 — testing — has taken longer than all the building combined, and found seven distinct problems.

> Anyone who says a project is "nearly done" because the code is written has not tested it yet.

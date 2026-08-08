---
tags: [prompt-clarify, validation, research]
date: 2026-08-05
---

# 11 — Step 0 Validation

[[00 - INDEX|← back to index]]

> **Step 0 was a day with no code.** Test the idea by hand before building it. If nobody cares, three months are saved.

## What was tested

Can memory alone fix a vague prompt, with **zero questions asked**?

**Test data:** 7 real prompts yash wrote during the planning session — before the tool existed, with no idea they would be used as test data. Not invented, not cleaned up.

## Result

**5 of 7 fully fixable from memory alone. Verdict: PASS.**

yash confirmed the rewritten prompts would have produced better answers.

### Example

**What was typed:**
> `first we should make a blue print in miro`

**What memory alone produced:**
> Create a product blueprint in Miro for a memory-first prompting tool. Cover: the problem, user flow, architecture, competitors, roadmap. I'm new to coding, so keep it simple. Be direct.

**Zero questions asked.**

## Finding 1 — Checkbox onboarding does not work

In setup, yash was given multi-select checkboxes and **ticked every option** on 2 of 4 questions.

That is normal user behaviour, not indecision. But *"audience: everyone, pain: everything"* is memory that knows nothing.

**Design decision:** the real product must use **open questions asking for ONE answer**, never multi-select.

> Found in 4 minutes. Would have cost 3 weeks to discover in code.

This is now implemented in `src/setup.ts`.

## Finding 2 — Two kinds of missing information

| Prompt | Fixable by memory? |
|---|---|
| `first we should make a blue print in miro` | ✅ Yes |
| `so tell me how much time it will take` | ✅ Yes |
| `add also a blueprint about where we start...` | ✅ Yes |
| `i want to add in github repos` | 🟡 Partly |
| `can u mak this horizonatal` | ❌ **No** |

Both failures needed **what the user was looking at**, not who the user is.

**This produced the positioning:**

> ### Memory for who you are. Context for what you're doing.

Competitors have neither properly. This is a sharper wedge than anything in [[06 - Competitor Teardown]].

## Honest caveat

**Sample size: 1 user, 7 prompts.**

This proves the *mechanic* is worth building. It does **not** prove people will use it.

> **Step 16 — showing it to 5 real developers — is the step that actually validates the product.** Do not skip it.

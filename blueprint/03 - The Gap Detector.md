---
tags: [prompt-clarify, product, core]
---

# 03 — The Gap Detector

[[00 - INDEX|← back to index]]

**This is the product.** Everything else is packaging.

## The seven dimensions

A prompt can be missing any of these. The engine checks each one.

| # | Dimension | The question it answers |
|---|---|---|
| 1 | **Goal** | What outcome does the user actually want? |
| 2 | **Audience** | Who reads or uses the result? |
| 3 | **Format** | Essay, table, code, bullets, JSON? How long? |
| 4 | **Constraints** | Tone, budget, tech stack, word count, must-avoids |
| 5 | **Context** | Domain facts the model can't know |
| 6 | **Examples** | A sample of "good" — the highest-leverage input |
| 7 | **Success criteria** | How the user will judge the output |

## Rule 1 — Never fill more than three

If a gap can't be filled from memory and isn't critical, leave it. A prompt stuffed with seven filled dimensions is bloated, not better.

## Rule 2 — Relevance before rewriting

The single biggest failure in testing came from applying *all* profile facts to *every* prompt.

**What went wrong:** the profile said "currently working on: a prompting tool called prompt-clarify." The prompt was "write a blog post about AI." Output: *"write a blog post about AI focusing on the prompting tool prompt-clarify."*

**It changed the subject.** That is the worst possible failure — worse than doing nothing.

**The fix:** the meta-prompt now runs a relevance pass *first*, with worked examples of what to discard:

```
Example: prompt is "write a blog post about AI".
- "Main audience: my clients"  -> RELEVANT, sets who it is written for.
- "Preferred style: short"     -> RELEVANT, sets length and tone.
- "Working on: a CLI tool"     -> NOT RELEVANT. Adding it CHANGES THE TOPIC.
- "Uses AI for: writing code"  -> NOT RELEVANT to a blog post.
```

## Rule 3 — Never invent

Two kinds of invention, both banned:

- **About the person** — only facts from the profile
- **About the subject** — if they say "a water bottle", do not decide it is insulated, leak-proof or durable

The second one was discovered in testing and was not in the original design. See [[14 - Bugs and Lessons]].

## Rule 4 — No first-person words

`my clients` means nothing to an AI that has never met you. It must become `marketing clients`.

Same for `I`, `our`, `my project`.

## Worked example

**In:** `write a blog post about AI`

**Out:**

> Write a short and direct blog post about artificial intelligence aimed at marketing clients. Structure the post with concise sections and clear headings, keeping the overall length around 500 words.

Filled: audience, format, length, structure, tone.
Correctly ignored: the user's current project, their coding habits.

## Critical design note — checkboxes destroy memory

During Step 0 the user was given multi-select checkbox questions and **ticked every option**.

That is normal behaviour, not indecision. But a profile saying *"audience: everyone, pain: everything"* knows nothing.

> **The setup must use open questions asking for ONE answer. Never checkboxes.**

This is implemented in `src/setup.ts` and is the reason the memory is specific enough to be useful.

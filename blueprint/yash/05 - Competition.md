---
tags: [prompt-clarify, competition, strategy]
---

# 05 — Competition

[[00 - INDEX|← back to index]]

> **The idea is not original.** Several products already do clarify-then-rewrite. That was discovered on day 1, after the blueprint was drawn. See [[06 - Competitor Teardown]] for the researched detail.

## Why that is good news, not bad

An idea nobody has built usually means nobody wants it. Several teams independently converging on this problem is evidence the problem is real.

**Ideas are not the scarce resource. Execution and distribution are.** Dropbox was not the first file sync. Notion was not the first notes app.

What you cannot do is build the same thing with no differentiator and hope.

## Who you're actually up against

**1. The models themselves — the biggest threat**
ChatGPT, Claude and Gemini all do quiet prompt-repair internally, improving every release. Any tool that only *polishes wording* gets absorbed within a year.
→ **Defence:** memory the model cannot have, because it does not persist across your sessions and does not control the UI.

**2. Pretty Prompt — the leader**
40,000+ users, Chrome extension, MCP server, two Product Hunt #2 finishes. Their "Refine mode" *is* clarify-then-rewrite.
→ **Defence:** their clarifying questions are **paywalled at $8.25/month**. A free, open-source tool that asks nothing and remembers everything attacks their differentiator directly.

**3. One-shot rewriters (LogicBalls, SecondBrain)**
Paste in, get a longer prompt out. Fast, but they hallucinate context.
→ **Defence:** you recall instead of guessing.

**4. Doing nothing**
Most people just re-prompt four times until it works. This is the real default, and it is free.
→ **Defence:** be faster than four rounds of retry. If your flow is slower, you lose. This is why memory-first matters more than questions.

## The moat, ranked honestly

1. **Memory of the user** — compounds with use, cannot be copied
2. **Distribution** — living where prompts get typed
3. **Open source trust** — people will not paste confidential prompts into a black box
4. ~~The rewrite logic~~ — copyable in a weekend. Not a moat.

## The positioning

> ### Memory for who you are. Context for what you're doing.

Competitors have neither properly. Pretty Prompt's memory is a paid add-on bolted onto a per-prompt tool. Nobody reads session or screen context at all.

## Why "for everyone" is the wrong first move

"For everyone" is exactly where Pretty Prompt already lives, with 40,000 users and paid distribution.

Choosing one group first does **not** limit who can use the tool. It only decides who you build for first, whose problems you fix first, and where you announce it.

- *"For everyone"* → setup questions must be vague enough to fit a novelist, a lawyer and an engineer. Vague questions produce vague memory produce mediocre output for all three.
- *"For developers first"* → ask about stack, codebase, testing. Memory is immediately useful. Then add a marketer profile. Then a writer profile. **Same engine, more profiles.**

You reach everyone by *sequence*, not by *dilution*.

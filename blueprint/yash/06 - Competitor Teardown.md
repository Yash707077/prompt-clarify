---
tags: [prompt-clarify, competition, research]
researched: 2026-08-05
---

# 06 — Competitor Teardown

[[00 - INDEX|← back to index]]

*Researched 5 August 2026. Re-check before launch — this market moves.*

## Pretty Prompt — the leader

**prettyprompt.com** · *"Grammarly for Prompting"*

| Metric | Value |
|---|---|
| Users | 40,000+ |
| Chrome Store rating | 4.9★ from 132 reviews |
| Product Hunt | #2 Product of the Day, **twice** (May 2025, Jan 2026) |
| Surfaces | Chrome extension, web app, **MCP server** |
| Pricing | Free 5/week → Pro **$8.25/mo** → Team $12.99/seat |

**Features:** one-click improve, Refine mode (clarifying questions), prompt library, history, image-to-prompt, templates, per-use-case landing pages for 11 verticals including "Non-Native English".

**Verdict:** well-executed, 18+ months ahead. **Do not attack head-on.**

## Others

| Tool | What it does |
|---|---|
| **LogicBalls** | Free. Markets "refuses to guess", asks 1–2 questions |
| **SecondBrain** | Asks for goal, audience, context, constraints, format |
| **Anthropic prompt improver** | Free, built into the platform |
| **prompt-ops** (Meta), **DSPy**, **promptfoo**, **TextGrad** | Open source, but aimed at *developers optimising production prompts*, not everyday users |

## The three cracks

### 1. Clarifying questions are behind a paywall

*"Refine Prompts (follow-up questions)"* is a **Pro** feature — $99/year.

The single most valuable mechanism in the category, the one that separates asking from guessing, costs money.

> **A free, open-source tool that never needs to ask undercuts their differentiator entirely.**

### 2. Nothing serious in this category is open source for everyday users

Everything is closed and hosted. Every prompt you paste goes to someone's server. For anyone handling client or company information, that is disqualifying.

> **"Runs locally, your prompts never leave your machine" is a real, unclaimed position.**

Note: currently *not fully true* — prompts go to Gemini. True local-first would need a local model. Worth being precise about in the README rather than overclaiming.

### 3. The developer surface is thin

Pretty Prompt has an MCP server, but the open-source tooling (DSPy, promptfoo) targets production prompt optimisation — not the "I'm about to type something vague into Claude Code" moment.

## Wedge options considered

| Option | Why it could work | Risk |
|---|---|---|
| **A. Local-first / privacy CLI** | Nobody owns "your prompts never leave your machine" | Small market; not yet true |
| **B. Coding-agent clarifier** | Vague prompts to Claude Code / Cursor waste real money. Pain is acute and measurable. Devs install CLI tools without friction. | Requires understanding dev workflows |
| **C. Non-English-first** | Pretty Prompt has a "Non-Native English" page but it's an afterthought | Needs real user research |

**Recommendation at the time: B, then A.**

**What actually happened:** the user chose "for everyone", then in practice built for their own profile (marketing freelancer). This is the single biggest unresolved strategic question. See [[15 - Open Problems]].

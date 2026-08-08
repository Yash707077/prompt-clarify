---
tags: [prompt-clarify, product, flow]
---

# 02 — How It Works

[[00 - INDEX|← back to index]]

## The design decision that defines the product

Every competitor sits on one side of a trade-off:

- **Fast but guessing** — one-click rewrite, invents the missing details
- **Accurate but slow** — asks clarifying questions on every prompt

Neither is satisfying. Asking costs time; saving time is the whole point.

**The third path:** ask once during setup, then never again.

> Day one: five questions, two minutes, once.
> Every day after: zero questions, zero friction, and it isn't guessing — it's recalling.

This is faster than Refine mode *and* more accurate than one-click mode. That is the entire competitive argument.

## The loop

```mermaid
flowchart LR
    classDef general fill:#fff6b6,stroke:#af7e02
    classDef decision fill:#c6dcff,stroke:#305bab
    classDef terminator fill:#adf0c7,stroke:#087429
    classDef core fill:#dedaff,stroke:#6631d7

    n1([User types a vague prompt]):::terminator
    n2{Is there a saved profile?}:::decision
    n3[Run one-time setup: 5 questions]:::core
    n4[Load profile from disk]:::general
    n5[Decide which profile facts are RELEVANT]:::core
    n6{Prompt already well specified?}:::decision
    n7[Return almost unchanged]:::general
    n8[Rewrite, filling only relevant gaps]:::core
    n9[Print + copy to clipboard]:::general
    n10([User pastes it into their AI]):::terminator

    n1 --> n2
    n2 -->|No| n3
    n2 -->|Yes| n4
    n3 --> n4
    n4 --> n5
    n5 --> n6
    n6 -->|Yes| n7
    n6 -->|No| n8
    n7 --> n9
    n8 --> n9
    n9 --> n10
```

## Why the "already well specified?" branch matters

It is not an optimisation. It is a correctness requirement.

A tool that rewrites *every* prompt is not judging — it is just generating. In testing, the tool took a prompt that already specified length, audience, tone and structure, and made it three times longer and worse.

> **Rewriting a good prompt is a failure, not a success. Restraint is the skill.**

That sentence is now literally in the meta-prompt. See [[13 - Code Reference]].

## What memory can and cannot fix

Tested against seven real prompts written by the user before the tool existed:

| Prompt | Memory alone? |
|---|---|
| `first we should make a blue print in miro` | ✅ Yes |
| `so tell me how much time it will take` | ✅ Yes |
| `add also a blueprint about where we start...` | ✅ Yes |
| `i want to add in github repos` | 🟡 Partly |
| `can u mak this horizonatal` | ❌ **No** |

**5 of 7 recoverable from memory alone.**

Both failures needed **what the user was looking at**, not who the user is. Hence the two-part positioning:

> **Memory** for who you are. **Context** for what you're doing.

The context half is not built. See [[15 - Open Problems]].

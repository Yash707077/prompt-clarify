---
tags: [prompt-clarify, problem, strategy]
---

# 01 — The Problem

[[00 - INDEX|← back to index]]

## What people experience

They type a short, vague prompt. They get generic, unusable output. They conclude *"AI isn't that good."*

## The actual root cause

The prompt was **underspecified**, not badly worded.

> "Make me a marketing plan."

The model has no idea: what product, which audience, what budget, what channel, what format, what success looks like. So it averages across everything it has ever seen — and average output is what *generic* means.

## Why existing fixes fall short

A rewriter that silently expands that prompt is **inventing** the missing details. The output *sounds* more confident but is built on guesses the user never approved.

This is not a hypothetical failure. It happened in our own testing — see [[14 - Bugs and Lessons]], failure #6, where the tool invented that a water bottle was "leak-proof and insulated" because it needed something to say.

## The insight the product is built on

> **You cannot fix an underspecified prompt without getting the missing information from somewhere.**

The information lives in the user's head, not in the text. Every tool in this category has to solve that. There are only three ways:

| Approach | Who does it | Problem |
|---|---|---|
| **Guess** | Most one-click rewriters | Invents facts. Confident and wrong. |
| **Ask every time** | Pretty Prompt's Refine mode, LogicBalls | Accurate but slow. Friction on every single prompt. |
| **Ask once, remember** | **This product** | Requires building memory. Nobody has done it properly. |

## Who this is for

- **First:** developers and freelancers who use AI daily and have never learned prompt structure
- **Later:** everyone else, via added profiles rather than diluted questions

See [[05 - Competition]] for why "for everyone" is the losing move at the start.

## What "solved" looks like

The user types the same short prompt they always would. The tool silently fills in what it already knows. They get usable output on the first try, instead of five rounds of *"no, not like that."*

**Time saved is the metric. Not prompt length.**

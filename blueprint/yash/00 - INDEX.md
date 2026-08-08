---
project: prompt-clarify
owner: yash raj
started: 2026-08-05
status: v0 in progress — 11.5 of 18 steps
repo: https://github.com/Yash707077/prompt-clarify
tags: [project, prompt-clarify, index]
---

# prompt-clarify — Blueprint

> **The one-line pitch**
> Memory for who you are. Context for what you're doing.

> **The one-sentence goal**
> Make the second prompt as good as the tenth — without the user doing anything.

---

## Start here

| Note | What's in it |
|---|---|
| [[01 - The Problem]] | Why bad prompts happen, and why rewriting alone can't fix them |
| [[02 - How It Works]] | The core loop, with diagrams |
| [[03 - The Gap Detector]] | The seven dimensions and the "ask at most 3" rule |
| [[04 - Architecture]] | One engine, many surfaces |

## Market

| Note | What's in it |
|---|---|
| [[05 - Competition]] | Who else is doing this, and how far ahead they are |
| [[06 - Competitor Teardown]] | Researched detail on Pretty Prompt and the three cracks in it |

## Building it

| Note | What's in it |
|---|---|
| [[07 - The 18 Steps]] | The whole plan, with live progress |
| [[08 - Setup Guide]] | Accounts, installs, API keys |
| [[09 - Tools and Costs]] | Every tool, what it does, what it costs |
| [[10 - GitHub and Publishing]] | Repo, commits, npm, what makes a repo credible |

## What actually happened

| Note | What's in it |
|---|---|
| [[11 - Step 0 Validation]] | The by-hand test that decided whether to build at all |
| [[12 - Progress Log]] | Day by day, what got done |
| [[13 - Code Reference]] | Every file, what it does, why it exists |
| [[14 - Bugs and Lessons]] | Every failure found, and what fixed it |
| [[15 - Open Problems]] | What is still wrong, honestly |

---

## Current state at a glance

**Done:** working CLI on the local machine. Asks five questions once, saves a profile, uses it to rewrite vague prompts. Colours, spinner, auto-copy. Published to GitHub.

**Not done:** npm publishing, README, tests, and the entire *context* half of the pitch.

**Completion:**

- v0 working locally — **~90%**
- Published for others to use — **~75%**
- Full vision including browser extension — **~30%**

**Honest caveat:** the positioning is "memory for who you are, context for what you're doing." Only the memory half exists. See [[15 - Open Problems]].

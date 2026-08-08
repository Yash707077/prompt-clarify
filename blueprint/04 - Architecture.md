---
tags: [prompt-clarify, architecture, technical]
---

# 04 — Architecture

[[00 - INDEX|← back to index]]

## The principle

**One core engine. Many surfaces.**

The CLI, the future npm library and the future browser extension all call the same code. Nothing about the product logic knows which surface it is running under.

```mermaid
flowchart LR
    classDef surface fill:#ccf4ff,stroke:#108ab3
    classDef core fill:#dedaff,stroke:#6631d7
    classDef data fill:#adf0c7,stroke:#087429
    classDef ext fill:#e7e7e7,stroke:#595959
    classDef later fill:#ffd8f4,stroke:#af3fb9

    s1[CLI - v0 BUILT]:::surface
    s2[npm library - v1]:::later
    s3[Browser extension - v2]:::later

    c1[index.ts - entry point]:::core
    c2[memory.ts - load and save profile]:::core
    c3[setup.ts - the 5 questions]:::core
    c4[fixer.ts - THE PRODUCT]:::core
    c5[ui.ts - colours, spinner, clipboard]:::core
    c6[llm.ts - the only file touching AI]:::core

    d1[(~/.prompt-clarify/memory.json)]:::data
    e1{{Google Gemini API}}:::ext

    s1 --> c1
    s2 --> c1
    s3 --> c1

    c1 --> c2
    c1 --> c3
    c1 --> c4
    c1 --> c5
    c3 --> c2
    c2 --> d1
    c4 --> c6
    c6 --> e1
```

## Why `llm.ts` is isolated

Every AI call goes through one function: `ask()`.

Nothing else in the project knows Gemini exists. If you switch to OpenAI, Claude or a local model, you change **one file** and nothing else breaks.

This already paid off twice:

1. When Google retired `gemini-2.5-flash` mid-build, the fix was one line
2. When we needed retry logic for rate limits, it went in one place and every caller benefited

## Why memory lives in the home folder

`~/.prompt-clarify/memory.json` — **not** in the project folder.

Three reasons:

1. It survives if the project folder is deleted
2. It can never be committed to GitHub by accident
3. One profile works across every project the user has

## Why zero dependencies for the UI

Colours are ANSI escape codes. Clipboard is `pbcopy` / `clip` / `xclip`, all built into the OS.

Adding `chalk` and `clipboardy` would mean two more packages, two more supply-chain risks, and a bigger install — for something that takes 40 lines.

**Current dependency count: 2** (`@google/genai`, `dotenv`).

## What is deliberately NOT built yet

| Thing | Why not |
|---|---|
| Tests | Step 12 |
| `bin` entry for `npx prompt-clarify` | Step 15 |
| Context reading (screen / session) | See [[15 - Open Problems]] |
| Multi-model support | Pick one, make it excellent |
| Hosted web app | Extension beats it on distribution |

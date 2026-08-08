---
tags: [prompt-clarify, tools, reference]
---

# 09 — Tools and Costs

[[00 - INDEX|← back to index]]

## Currently installed

| Tool | What it does | Type |
|---|---|---|
| **TypeScript** | JavaScript that catches mistakes before running | dev |
| **tsx** | Runs TypeScript instantly, no build step | dev |
| **@types/node** | Type definitions for Node's built-ins | dev |
| **@google/genai** | Talks to Gemini in 3 lines instead of 30 | runtime |
| **dotenv** | Loads the API key from `.env` | runtime |

**Runtime dependencies: 2.** Deliberately small — every dependency is a supply-chain risk and a bigger install.

## Deliberately NOT installed

| Tool | Why not |
|---|---|
| `chalk` | ANSI colour codes are 8 lines of code |
| `clipboardy` | `pbcopy` / `clip` / `xclip` are built into every OS |
| `@inquirer/prompts` | Node's built-in `readline/promises` does the job |
| `zod` | Not needed while output is plain text, not JSON |
| `commander` | One argument does not need an argument parser |

> **The trap:** beginners lose weeks configuring tools instead of building the product. Add a tool only when something actually hurts.

## Needed later

| Stage | Tool | For |
|---|---|---|
| Step 12 | **Vitest** | Running tests |
| Step 15 | **tsup** | Bundling TypeScript into shippable JavaScript |
| Step 15 | **npm registry** | Publishing |
| Optional | **GitHub Actions** | Running tests automatically on push |
| Step 17 | **WXT** or **Plasmo** | Extension framework |
| Step 17 | **React + Tailwind** | The popup UI |

## Costs — the honest total

| Thing | Cost |
|---|---|
| Node, VS Code, Git, GitHub, npm | **₹0 forever** |
| Gemini API | **₹0** — free tier, no card |
| Everything in Parts 1–3 | **₹0** |
| Chrome Web Store (Step 18 only) | **$5 one-time** |

> **Do not pay the $5 early.** It is for Step 18, which is 6–8 weeks away. Money spent on an unfinished project makes it harder to quit if you should.

## Model configuration

Set in `.env`, read by `src/llm.ts`:

```bash
GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-flash-latest    # optional override
```

| Context | Model | Why |
|---|---|---|
| Real usage | `gemini-flash-latest` | Better quality rewrites |
| Test runner | `gemini-flash-lite-latest` | 4× quota; testing burns 10 requests a run |

**Tested side by side.** Flash-lite gave visibly thinner rewrites — no structure, no length guidance. Quota was not worth the quality drop for normal use.

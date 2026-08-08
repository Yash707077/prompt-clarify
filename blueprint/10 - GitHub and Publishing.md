---
tags: [prompt-clarify, github, publishing]
---

# 10 — GitHub and Publishing

[[00 - INDEX|← back to index]]

**Repo:** https://github.com/Yash707077/prompt-clarify
**npm name:** `prompt-clarify` — checked and available as of 5 Aug 2026

> Always check **npmjs.com** before naming a repo. Discovering the package name is taken *after* building is a painful rename.

## The daily loop — the only commands needed

```bash
git add .
git commit -m "what you changed"
git push
```

Plus `git status` when unsure what is happening.

> **Commit every time something works**, not once a week. Small commits are how you recover when you break something.

## Branches

Solo project: commit straight to `main`. Branches solve a coordination problem that does not exist yet. Add them when a second person joins.

## Commit history so far

| Commit | What |
|---|---|
| `Connect to Gemini API` | First working AI call |
| `Fix licence mismatch, version, and package metadata` | ISC → MIT, 1.0.0 → 0.1.0 |
| `Add memory system` | `memory.ts`, `setup.ts` |
| `Add prompt fixer - the core product` | `fixer.ts` |
| `Add colours, spinner and clipboard copy` | `ui.ts` |
| `Make model configurable, add retries, fix over-editing` | Retry logic, model config |

## Publishing to npm (Step 15)

```bash
npm login
npm version 0.1.0
npm publish --access public
```

**Before that works, `package.json` needs a `bin` entry** so `npx prompt-clarify` runs. Currently only `npx tsx src/index.ts` works.

> ⚠️ You cannot un-publish after 72 hours. Start at `0.1.0`, never `1.0.0`.

## What makes a repo look credible

**README is 90% of it.** In order:

1. One sentence: what it does
2. **An animated GIF of it running** ← highest-impact single element
3. Install command
4. Before/after example of a real prompt it improved
5. How it works, briefly
6. Contributing + licence

**Also:** `LICENSE` (done — MIT), topics/tags (`prompt-engineering`, `cli`, `llm`), a repo description (done), and 3–5 issues tagged `good first issue`.

## Security

- `.gitignore` must contain `.env` and `node_modules` **before the first push** ✅ verified
- Enable **secret scanning** in repo settings
- If a key is ever pushed: **revoke it immediately**. Deleting the commit is not enough — it is already in the history.

## Getting the first users

**Ship first, announce second.** When v0 works: post to **r/LocalLLaMA**, **Hacker News (Show HN)**, and **Product Hunt**.

Lead with the before/after example, not the tech stack.

## Milestones

- [x] Repo exists, `.gitignore` correct
- [x] First commit that runs
- [x] v0 works end-to-end on own prompts
- [ ] README with GIF
- [ ] Published to npm
- [ ] **First user who isn't you** ← the only one that really counts

---
tags: [prompt-clarify, setup, reference]
---

# 08 — Setup Guide

[[00 - INDEX|← back to index]]

*Everything needed before writing a line of code. Budget half a day. Completed 5 Aug 2026.*

## Accounts (all free)

| Account | Why | Cost |
|---|---|---|
| **GitHub** | Where the code lives and gets published | Free |
| **npm** (npmjs.com) | Where people run `npm install` from | Free |
| **Google AI Studio** | The Gemini API key | Free tier, no card |

## Software

**1. Node.js** — lets JavaScript run on the computer instead of only in a browser. Installs `npm` too.
Verify: `node -v`

**2. VS Code** — the editor. Has a built-in terminal.

**3. Git** — tracks every change and pushes to GitHub.
Verify: `git --version`

## One-time Git config

```bash
git config --global user.name "yash raj"
git config --global user.email "raj800472@gmail.com"
```

## The Gemini API key — read carefully

Get it at **aistudio.google.com/apikey** → **Create API key in new project**.

> ⚠️ **Use a NEW project, not an existing one.**
> Free-tier quota is counted **per Google Cloud project**, not per account or per key. Extra keys in the same project add nothing — they all draw from the same pool. A separate project gets fresh quota.

> ⚠️ **Never enable billing on that project.**
> Turning billing on permanently removes the free tier. Every call bills from the first token.

Quota, as of Aug 2026 *(Google cut these 50–80% in Dec 2025 — verify before relying on them)*:

| Model | Requests/day |
|---|---|
| `gemini-2.5-pro` | ~100 |
| `gemini-flash-latest` | ~250 |
| `gemini-flash-lite-latest` | ~1,000 |

## The API key rule

An API key is a password that costs money if leaked. People have had thousands of dollars stolen from keys pushed to public repos.

- Store it in **`.env`**
- `.env` must be in **`.gitignore`** before the first commit
- Never paste it into code, chat, or a screenshot

**Verify it's protected:**

```bash
grep -n "^\.env" .gitignore
```

If that prints nothing, stop and fix it.

## GitHub authentication

GitHub stopped accepting passwords in 2021. Pushing needs a **personal access token**.

1. **github.com/settings/tokens** → Generate new token (classic)
2. Note: `prompt-clarify`, Expiration: 30 days
3. Scope: tick **`public_repo`** only *(least privilege — full `repo` grants more than needed for a public project)*
4. Copy the token — shown once
5. On `git push`: username = GitHub username, password = **the token**

> The paste is invisible in Terminal. That is normal.

**Current token expires 5 Sep 2026.** Regenerate at the same URL when pushes start failing.

## Done when

`node -v` works, VS Code opens, a key sits in `.env`, and an empty repo pushes successfully.

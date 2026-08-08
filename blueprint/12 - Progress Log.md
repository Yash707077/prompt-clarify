---
tags: [prompt-clarify, log, progress]
---

# 12 — Progress Log

[[00 - INDEX|← back to index]]

---

## Day 1 — 5 August 2026

**Strategy and setup.**

- Idea proposed: a tool that rewrites bad prompts
- **Pushed back on originality** — research found Pretty Prompt, LogicBalls, SecondBrain and Anthropic's own prompt improver already do clarify-then-rewrite. See [[06 - Competitor Teardown]]
- Researched competitors properly. Found three cracks: paywalled questions, no open-source option, thin developer surface
- **Pivoted the idea:** from "ask questions every time" to **"ask once, remember forever"**
- Ran [[11 - Step 0 Validation]] — 5 of 7 real prompts fixable from memory alone. **GO.**
- Discovered the checkbox problem and the memory/context split
- Steps 1–5 complete: Node, VS Code, Git, GitHub account, repo, API key

**End state:** 5 of 18. Repo exists, no code yet.

---

## Day 2 — 6 August 2026

**First working code.**

- Step 6: repo cloned to `~/Desktop/prompt-clarify`
- Step 7: TypeScript running, first terminal output
- Step 8: **Gemini connected, first AI reply received**
- **Hit first real bug:** `gemini-2.5-flash` returned 404 — retired for new users mid-build. Fixed by switching to the `gemini-flash-latest` alias and writing `src/models.ts` to list what a key can actually access
- GitHub push required a personal access token (passwords deprecated since 2021)
- Fixed package metadata: licence said ISC while `LICENSE` said MIT; version said 1.0.0 at step 8 of 18

**End state:** 8 of 18. Working code on GitHub.

---

## Day 3 — 7 August 2026

**The product itself.**

- Step 9: memory system built — `memory.ts`, `setup.ts`. Profile at `~/.prompt-clarify/memory.json`
- Step 10: **`fixer.ts` — the actual product.** First version was bad; see [[14 - Bugs and Lessons]]
- Step 11: `ui.ts` — colours, spinner, clipboard. **Zero new dependencies**
- Step 12 started: built `testrun.ts` and a 10-prompt test set chosen to probe failure modes, not to flatter
- **Three test runs, three different failures:** over-editing, then 503 overload, then rate limits
- Model made configurable. Real usage on Flash, tests on Flash-lite
- Retry logic added for network errors, server overload and rate limits
- **Found the freelancer audience problem** — "my clients" vs "my clients' customers"
- Daily quota exhausted. Stopped.

**End state:** 11.5 of 18. Working product, half-tested.

---

## Next session

1. Re-run the full 10-prompt test on fresh quota
2. Fill in human verdicts — **this cannot be automated**
3. Fix what it reveals
4. Steps 13–15: README, `bin` entry, npm publish

## Cumulative

| Day | Steps completed | Cumulative |
|---|---|---|
| 1 | Step 0 + Steps 1–5 | 5 / 18 |
| 2 | Steps 6–8 | 8 / 18 |
| 3 | Steps 9–11, half of 12 | 11.5 / 18 |

**Three days from idea to working product.** The estimate was 10 days for v0.

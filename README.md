# prompt-clarify

**Ask once. Remember forever.**

Most prompt tools either guess what you meant, or interrogate you every single time. This one asks you five questions on the first run, then never asks again — it fills the gaps from what it already knows about you.

```bash
npx prompt-clarify "write a blog post about AI"
```

---

## What it actually does

**Before**

```
write a blog post about AI
```

**After**

```
Write a short, direct blog post about artificial intelligence aimed at a
business's social media audience. Keep the length to roughly 400–500 words,
using short paragraphs, clear headings, and a straightforward, accessible tone.
```

It knew the audience, length, structure and tone because you told it once, during setup. **It did not ask you anything.**

## It also knows when to leave you alone

```
$ prompt-clarify "Write a 200-word product description for a stainless steel
  water bottle, aimed at gym-goers, in a friendly tone, with three bullet
  points on features."

  ALREADY GOOD

  Your prompt already says what it needs to.
  Nothing worth changing. Send it as it is.
```

A tool that rewrites *every* prompt isn't judging — it's just generating. Restraint is the point.

---

## Install

```bash
npm install -g prompt-clarify
```

Or run it without installing:

```bash
npx prompt-clarify "your prompt"
```

## Setup

Just run it. On first use it walks you through everything:

```bash
prompt-clarify setup
```

It asks for a Google Gemini API key, then five questions about you. Both are saved to `~/.prompt-clarify/`, so it works from any folder afterwards.

**Getting a key** — the free tier is genuinely free, no credit card, no expiry:

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Choose **Create API key in new project**

> **Use a new project.** Free-tier quota is counted per Google Cloud project, not per key.
> **Never enable billing on it** — that permanently removes the free tier.

The key is stored in `~/.prompt-clarify/config.json` with owner-only permissions. If you prefer, set `GEMINI_API_KEY` as an environment variable instead — that takes precedence.

## Usage

```bash
prompt-clarify "your vague prompt"   # improve a prompt
prompt-clarify                       # show what it remembers about you
prompt-clarify setup                 # redo the five questions
prompt-clarify setup --key           # replace just the API key
```

The improved prompt is copied to your clipboard automatically.

---

## How it works

On first run it asks five open questions: what you do, what you're working on, who reads your output, what you use AI for, and how you want answers written.

That profile is saved to `~/.prompt-clarify/memory.json` — your home folder, not the project folder, so it works everywhere and can never be committed to a repo by accident.

After that, every prompt goes through three stages:

1. **Intent** — do you want the AI to *do* a task, to *write something you'll send*, or to *help you think*? Getting this backwards is worse than a weak rewrite. "I made a tool and sent it to some developers, give me feedback" means you want a message to send them, not a review of your tool.
2. **Relevance** — which profile facts actually matter for *this* prompt? Usually most of them don't. A note that you're building a CLI tool has no business appearing in a prompt about a blog post.
3. **Restraint** — does this prompt need help at all? If it already states audience, format, length and tone, it's returned unchanged.
4. **Rewrite** — fill only the relevant gaps. Never invent facts about you, and never invent facts about the subject.

Mixed-language input works — Hinglish, or any mix. It reads the intent and writes the prompt in English.

### Configuration

| Variable | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` | from `~/.prompt-clarify/config.json` | Set as an env var to override the stored key |
| `GEMINI_MODEL` | `gemini-flash-latest` | `gemini-flash-lite-latest` has ~4× the daily quota but produces thinner rewrites |

Files it creates, both in your home folder:

- `~/.prompt-clarify/config.json` — your API key (permissions `0600`)
- `~/.prompt-clarify/memory.json` — your profile

---

## Honest limitations

- **Your prompts are sent to Google Gemini.** Only the *memory* stays on your machine. This is not a local-only tool.
- **It has no idea what's on your screen.** Prompts like "make this horizontal" can't be fixed by memory — that needs context this tool doesn't have yet.
- **One profile.** If you switch between very different kinds of work, the memory will be too general to help.
- **Free-tier limits apply** — roughly 10 requests per minute and 250 per day.

---

## Contributing

Issues and pull requests welcome, particularly:

- Better handling of ambiguous prompts (right now "help me with a pitch" guesses, rather than saying it guessed)
- Support for more than one profile
- Providers other than Gemini

## Licence

MIT

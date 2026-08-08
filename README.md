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

You need a Google Gemini API key. The free tier is genuinely free — no credit card, no expiry.

1. Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → **Create API key in new project**
2. Create a `.env` file where you run the tool:

```bash
GEMINI_API_KEY=your_key_here
```

> **Use a new Google Cloud project.** Free-tier quota is counted per project, not per key.
> **Never enable billing on it** — that permanently removes the free tier.

Then run it once. It asks five questions, saves the answers, and never asks again.

## Usage

```bash
prompt-clarify "your vague prompt"   # improve a prompt
prompt-clarify setup                 # redo the five questions
prompt-clarify                       # show what it remembers about you
```

The improved prompt is copied to your clipboard automatically.

---

## How it works

On first run it asks five open questions: what you do, what you're working on, who reads your output, what you use AI for, and how you want answers written.

That profile is saved to `~/.prompt-clarify/memory.json` — your home folder, not the project folder, so it works everywhere and can never be committed to a repo by accident.

After that, every prompt goes through three stages:

1. **Relevance** — which profile facts actually matter for *this* prompt? Usually most of them don't. A note that you're building a CLI tool has no business appearing in a prompt about a blog post.
2. **Restraint** — does this prompt need help at all? If it already states audience, format, length and tone, it's returned unchanged.
3. **Rewrite** — fill only the relevant gaps. Never invent facts about you, and never invent facts about the subject.

### Configuration

| Variable | Default | Notes |
|---|---|---|
| `GEMINI_API_KEY` | *(required)* | Your key |
| `GEMINI_MODEL` | `gemini-flash-latest` | `gemini-flash-lite-latest` has ~4× the daily quota but produces thinner rewrites |

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

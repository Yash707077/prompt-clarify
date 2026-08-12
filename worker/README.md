# prompt-clarify — shared-key proxy

This is what lets people use the extension **without creating their own API key**.

It holds one Gemini key server-side and enforces two hard limits so it can never
cost money.

## The limits

| Limit | Value | Why |
|---|---|---|
| Per install, per day | **15** | Enough for real use; stops one person draining the pool |
| Everyone, per day | **200** | Sits below Gemini's ~250/day free tier, with headroom for retries |

Both are enforced **server-side**. A client-side limit is a suggestion; only the
server can actually stop anyone.

When the global cap is reached, requests are refused for the rest of the day.
**That refusal is the feature** — it is what makes a surprise bill impossible.

## Deploy it

You need a free Cloudflare account.

**1. Install the tool and log in**

```bash
cd worker
npm install -g wrangler
wrangler login
```

**2. Create the counter store**

```bash
npx wrangler kv namespace create LIMITS
```

It prints an `id`. Paste that into `wrangler.toml`, replacing `PASTE_YOUR_KV_ID_HERE`.

**3. Add your Gemini key as a secret**

```bash
npx wrangler secret put GEMINI_API_KEY
```

Paste the key when asked. It is stored encrypted by Cloudflare and never
appears in this repo.

> ⚠️ Use a key from a project with **billing OFF**. That is the last line of
> defence: even if every limit here failed, Google cannot charge a project that
> has no billing enabled.

**4. Deploy**

```bash
npx wrangler deploy
```

It prints a URL like `https://prompt-clarify-api.<you>.workers.dev`.

**5. Point the extension at it**

Put that URL in `extension/config.js`.

## Checking usage

```bash
npx wrangler kv key get --binding=LIMITS "g:$(date -u +%F)"
```

That returns how many requests everyone has made today.

## If it gets popular

The free tier will not be enough. At that point the honest options are:

1. **Leave the cap.** Early users get it free, then it stops. No cost, no growth.
2. **Turn on billing and pay.** Roughly $0.10–0.30 per 1,000 requests for Flash.
   At 10,000 requests/month that is a few dollars. It grows with every user.
3. **Ask users for their own key** once the shared pool runs out. The extension
   already supports personal keys — this is the path that scales at zero cost.

Do not enable billing until real people are using this daily. Paying for
strangers' API calls before anyone has asked for the tool is how side projects
turn into bills.

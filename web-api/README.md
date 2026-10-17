# bruh web (bruh.is)

One page, one serverless function. Paste text (or a URL), pick short / full / roast, get a shareable card.

```
web/
  public/        index.html, style.css, app.js  (static, no build, no deps)
  api/bruh.js    POST /api/bruh -> Anthropic (key stays server-side)
  api/_skill.js  GENERATED copy of skills/bruh/SKILL.md (the prompt)
  dev.js         zero-dep local server
```

## Run locally

```bash
cd web
npm run dev:mock                          # canned answer, no API key needed
ANTHROPIC_API_KEY=sk-ant-... npm run dev  # real model
# http://localhost:3000   (PORT=3111 to change)
npm test                                  # unit tests for the function (no network)
```

If you edit `skills/bruh/SKILL.md`, run `npm run sync` (the test fails if the copy is stale).

## Env vars

| Var | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes (prod) | server only, never sent to the browser |
| `BRUH_MODEL` | no | default `claude-sonnet-4-5` |
| `BRUH_MOCK` | no | `1` returns a canned answer (dev/testing only, don't set in prod) |

## Deploy (Vercel)

1. Import `TheCraigHewitt/bruh` in Vercel, set **Root Directory** to `web`. Framework preset: Other, no build command.
2. Add `ANTHROPIC_API_KEY` under Project Settings > Environment Variables.
3. Deploy. `public/` is served statically and `api/bruh.js` becomes `/api/bruh`.
4. Add the `bruh.is` domain in Project Settings > Domains and set the DNS records Vercel shows.

## Limits and abuse notes

- Input capped at 60,000 characters (client and server). Longer docs: use the CLI.
- Rate limit is **best effort**: 8 requests/min per IP, in memory per warm serverless instance, so it resets on cold start and isn't shared across instances. Before real traffic, put Vercel Firewall rate limiting (or Upstash/Vercel KV) in front, and set a spend cap on the Anthropic key.
- URL fetching: http(s) only, blocks localhost/private/link-local hosts, no redirects, 8s timeout, 2 MB cap. It checks the hostname, not resolved IPs, so DNS-rebinding isn't covered; if that matters, resolve and check before fetching.
- Share links keep the result in the URL hash (nothing stored server-side). Text isn't logged by this code.

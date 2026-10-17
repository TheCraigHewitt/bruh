<div align="center">

# bruh

### your AI wrote 10 pages. bruh tells you what it said.

**Caveman makes the AI talk less. bruh makes *you* understand what it already said.**

[![npm](https://img.shields.io/npm/v/bruh-ai?style=flat-square&color=black)](https://www.npmjs.com/package/bruh-ai)
![license](https://img.shields.io/badge/license-MIT-black?style=flat-square)
![node](https://img.shields.io/badge/node-18%2B-black?style=flat-square)
![deps](https://img.shields.io/badge/dependencies-0-black?style=flat-square)
![works with](https://img.shields.io/badge/works%20with-claude%20code%20%C2%B7%20codex%20%C2%B7%20cursor%20%C2%B7%20a%20terminal-black?style=flat-square)

[Install](#install) · [Before / after](#before--after) · [Modes](#modes) · [Does it work?](#does-it-work-what-bruh-cant-do) · [FAQ](#faq) · [Roadmap](#roadmap) · [bruh.is](https://bruh.is)

</div>

---

AI made writing free. So now reading is the job.

Your teammate's AI sent a 10-page "strategy." Your agent wrote 3,000 words to say it fixed a typo. Someone pasted a 40-message thread and said "thoughts?"

You don't have time. bruh does.

## Before / after

<table>
<tr>
<th width="50%">The slop · 77 words</th>
<th width="50%">bruh · 29 words</th>
</tr>
<tr>
<td valign="top">

> In today's rapidly evolving digital landscape, it is increasingly important for organizations to leverage a holistic, data-driven content strategy that unlocks synergies across channels. By committing to a consistent publishing cadence and amplifying our owned media footprint, we can drive meaningful engagement and position ourselves for sustainable growth. To operationalize this vision, we recommend onboarding a best-in-class automation platform at a cost of $4,000, pending approval by Friday. Early benchmarks suggest a 300% uplift in qualified leads.

</td>
<td valign="top">

> **bruh, the whole thing is:** post more and send more emails.
> **They want:** you to approve a $4,000 tool by Friday.
> **Double-check:** "300% uplift". no source. looks made up.

</td>
</tr>
</table>

*Illustrative example, written by hand to show the format. Not a benchmark.*

Same text. Now you know what's being asked and what to be suspicious of. Took four seconds.

## Install

```bash
# the CLI: no install, no deps
export ANTHROPIC_API_KEY=sk-ant-...      # or OPENAI_API_KEY
npx bruh-ai report.md
```

> prefer a global command? `npm i -g bruh-ai`, then just run `bruh report.md`. Or run from a clone: `git clone https://github.com/TheCraigHewitt/bruh && cd bruh && node bin/bruh.js report.md`.

```bash
npx bruh-ai report.md                   # a file
npx bruh-ai https://example.com/post    # a URL
pbpaste | npx bruh-ai --full            # stdin
npx bruh-ai --clipboard --roast         # clipboard (macOS)
npx bruh-ai doc.txt --model gpt-4o --provider openai
npx bruh-ai doc.txt --provider ollama   # local, no key (see below)
```

Needs Node 18+ and your own API key. Inputs over 400k characters get truncated, with a warning.

**As a skill** (Claude Code, Codex, Cursor, anything that reads Agent Skills):

```bash
mkdir -p ~/.claude/skills && cp -r skills/bruh ~/.claude/skills/
```

Then say `bruh this` and paste the thing. The CLI uses the same `skills/bruh/SKILL.md` as its system prompt, so both behave the same.

## Modes

| say this | you get |
|---|---|
| `bruh` | the point and the ask. two lines. you're busy. |
| `bruh --full` | point, ask, fluff, double-check. |
| `bruh --roast` | the full version, but funny. mean to the slop, never to the person. |

What you get in full mode:

1. **The point.** One line. `bruh, the whole thing is: ___`
2. **They want.** The ask, the decision, the deadline. Or "nothing. this is FYI."
3. **Fluff.** What you can skip, with a rough share ("8 of 10 pages").
4. **Double-check.** Unsourced stats, made-up quotes, vague claims, contradictions.

## Runs on your laptop

No API key? No problem. bruh talks to [Ollama](https://ollama.com), so the whole thing runs on your machine and **nothing leaves it**.

```bash
ollama pull llama3.2
npx bruh-ai report.md --provider ollama          # default model: llama3.2
npx bruh-ai report.md --provider ollama -m qwen2.5:7b
```

- Auto-detect order: `ANTHROPIC_API_KEY`, then `OPENAI_API_KEY`, then a running Ollama. If you have no keys and Ollama is up, bruh just uses it.
- Custom host: `OLLAMA_HOST=http://my-mac-studio:11434`. Default is `http://localhost:11434`.
- Model not pulled or Ollama not running? bruh tells you the exact command to fix it.

**Honest note:** small local models (3B-8B) are fine for the short and `--full` modes on normal-length docs. They're worse than big hosted models at long documents and at catching made-up stats. Use a bigger model if it matters. As a skill inside your agent, bruh uses whatever model the agent already runs.

## Does it work? What bruh can't do

Honest section. bruh is a prompt and a thin CLI. It's as good as the model you point it at.

- **No benchmarks yet.** We haven't measured accuracy, and we won't invent a number to put on a banner. If you run bruh on real docs and it gets something wrong, open an issue with the (redacted) text.
- **It can miss things.** A summary is lossy by definition. For contracts, medical, legal, or money you actually have to read, read it.
- **It flags "looks made up", it doesn't fact-check.** bruh doesn't browse. It tells you which claims have no source in the text, not whether they're true.
- **Garbage in, honest garbage out.** If the text doesn't say what it wants, bruh says it can't tell. That's a finding, not a bug.
- **It sends your text to a model.** Whatever provider you pick sees the document (with `--provider ollama`, that's your own machine). Don't pipe in anything you wouldn't paste into that provider.
- **Live model calls untested in CI.** The tests cover arg parsing, input handling, and the prompt. The end-to-end model call is on you and your key.

The rules are baked into the skill: exact numbers, no invented content, no manufactured slop. If the doc is actually good, bruh says so.

## FAQ

**Is this just "summarize"?**
A summary tells you what the doc says. bruh also tells you what it wants from you, what's padding, and what smells made up. Also it says "bruh."

**Why not just ask ChatGPT to summarize?**
You can. You'll get "Here's a concise summary of the key points!" followed by a summary that's 40% as long as the original and has the same vibe. bruh is a prompt that refuses to do that.

**Will it hurt the sender's feelings?**
Roast mode roasts the slop, never the person. Your coworker is fine. Their AI has it coming.

**Is it the reverse of Caveman?**
Spiritually. Caveman makes the AI say less. bruh helps you with what was already said. Use both. Take a nap.

**Does it work offline?**
It needs a model. Point it at anything OpenAI-compatible later; local model support is on the roadmap.

**Why is the error message so rude?**
It's not rude. It's honest. `input is empty, bruh.`

**Can I run it on this repo's README?**
Yes. bruh says "the whole thing is: install it and run it on your homework."

## Roadmap

- [x] Skill
- [x] CLI: file, URL, stdin, clipboard
- [x] Static site on GitHub Pages (`docs/`)
- [x] published to npm as `bruh-ai` (command stays `bruh`)
- [ ] local models (Ollama / any OpenAI-compatible endpoint)
- [ ] Slack and Gmail: bruh it before you see it
- [ ] team digests

## Run the site

The site is plain static files in `docs/`. No build step.

```bash
open docs/index.html        # or: npx serve docs
```

### Put it on GitHub Pages + bruh.is

1. Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs`**.
2. Same page, **Custom domain**: `bruh.is`. Then at your DNS provider add `A` records for the apex pointing at GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `CNAME` for `www` → `thecraighewitt.github.io`. Check the [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for the current IPs. Tick **Enforce HTTPS** once the cert is ready.

(Setting the domain in the UI adds a `docs/CNAME` file for you. We don't commit one so the repo works without the domain.)

`web-api/` is the old serverless paste-box (Vercel-style function). It's optional and not used by the static site; kept in case we want hosted model calls later.

## License

MIT. Do whatever. Just don't use it to write more slop.

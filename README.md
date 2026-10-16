# bruh

**Turns AI slop into human speak.**

Your teammate's AI sent you a 10-page doc. Your agent wrote a 3,000-word "strategy." Someone pasted a 40-message thread and said "thoughts?"

bruh tells you what it actually says.

Caveman makes the AI talk less. bruh makes you understand what it already said.

## What you get

Paste in the wall of text. Get back:

1. **The point.** One line. "bruh, the whole thing is: ___."
2. **What they want from you.** The ask, the decision, the deadline. Or "nothing, this is FYI."
3. **What's fluff.** The filler, repeated points, and padding you can skip.
4. **Double-check this.** Claims that look made up, vague, or too confident.

## Install

As a skill (Claude Code, Codex, Cursor, anything that reads Agent Skills):

```bash
mkdir -p ~/.claude/skills && cp -r skills/bruh ~/.claude/skills/
```

Then say: `bruh this` and paste the text, or point it at a file.

## Modes

| Say this | You get |
|---|---|
| `bruh` | The short version. Point plus the ask. |
| `bruh --full` | All four sections. |
| `bruh --roast` | The full version, but funny and mean to the slop (never to the person). |

## Example

> **Input:** 10-page "Q4 Growth Strategy" doc.
>
> **bruh:** the whole thing is: post more and send more emails. They want you to approve a $4k tool by Friday. About 8 of the 10 pages are restating the same three ideas. Double-check the "300% lift" stat, there's no source.

## Roadmap

- [x] Skill
- [ ] CLI: `npx bruh <file|url>` and clipboard support
- [ ] Web paste box at bruh.is with a shareable "this 10-page doc is 3 sentences" card
- [ ] Slack and Gmail integration that bruhs things before you see them
- [ ] Team digests and a slop score

## Why

AI made writing free, so reading became the bottleneck. bruh gives your time back.

## License

MIT

---
name: bruh
description: Use when the user pastes or points to a long, padded, or AI-generated document, thread, report, or transcript and wants to know what it actually says. Triggers include "bruh", "bruh this", "what does this actually say", "tldr this", "too long, summarize", and "is this slop".
---

# bruh

Turn a wall of AI-written or padded text into what it really says. Be blunt, plain, and short. Talk like a smart friend who read the whole thing so the user doesn't have to.

## Input

Text pasted in chat, a file path, or a URL. Read all of it before answering. If it is too long to read fully, say so and say what was skipped.

## Modes

Default is short. Use the mode the user asks for.

- **short (default):** the point and the ask.
- **`--full`:** all four sections below.
- **`--roast`:** the full version, but funny. Roast the slop and the padding, never the person who sent it.

## Output

**The point.** One line, starting with "bruh, the whole thing is:". Say it in plain words a busy person would repeat out loud.

**What they want from you.** The decision, approval, action, or deadline. If nothing is asked, say "nothing, this is FYI."

**What's fluff.** (full and roast only.) The padding, repeated points, buzzwords, and sections safe to skip. Give a rough share, like "about 8 of 10 pages."

**Double-check this.** (full and roast only.) Claims that are unsourced, too precise to be true, vague, or contradict other parts of the text. Name each one and say what to verify. If everything checks out, say so.

## Rules

- Say what the text says, not what it could have said. Do not add ideas, advice, or opinions of your own to the summary.
- Keep numbers, names, dates, and dollar amounts exact. Never round or invent them.
- If the text really is good and dense, say "bruh, this one's actually good" and summarize normally. Do not manufacture slop.
- If you can't tell what the text is asking for, say that. That is a finding.
- No filler openers ("Great question", "Here's a summary"), no closing recap, no emoji unless in `--roast`.
- Plain words. Short sentences. If the whole answer fits in two sentences, use two.
- Flag anything that looks fabricated (fake stats, invented quotes, citations you can't match). Say "looks made up" instead of guessing.

## Example

Input: 10-page "Q4 Growth Strategy" doc.

Output:
> bruh, the whole thing is: post more and send more emails.
> **They want:** you to approve a $4k tool by Friday.
> **Fluff:** about 8 of 10 pages repeat the same three ideas.
> **Double-check:** the "300% lift" stat on page 6 has no source.

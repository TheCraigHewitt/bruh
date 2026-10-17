import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from '../src/args.js';
import { htmlToText, truncate, isUrl, readInput } from '../src/input.js';
import { pickProvider, loadSystemPrompt } from '../src/llm.js';

test('parseArgs defaults to short', () => {
  assert.equal(parseArgs(['a.txt']).mode, 'short');
  assert.equal(parseArgs(['a.txt']).source, 'a.txt');
});
test('parseArgs modes and flags', () => {
  assert.equal(parseArgs(['--full', 'x']).mode, 'full');
  assert.equal(parseArgs(['--roast']).mode, 'roast');
  assert.equal(parseArgs(['-c']).clipboard, true);
  assert.equal(parseArgs(['--model', 'foo']).model, 'foo');
  assert.equal(parseArgs(['--model=bar']).model, 'bar');
});
test('parseArgs errors', () => {
  assert.throws(() => parseArgs(['--nope']));
  assert.throws(() => parseArgs(['--model']));
  assert.throws(() => parseArgs(['a', 'b']));
  assert.throws(() => parseArgs(['--provider', 'x']));
});
test('isUrl', () => {
  assert.ok(isUrl('https://a.com'));
  assert.ok(!isUrl('./a.txt'));
});
test('htmlToText strips tags, scripts, entities', () => {
  const t = htmlToText('<html><head><title>x</title></head><body><script>bad()</script><p>Hi &amp; bye</p><p>two</p></body></html>');
  assert.equal(t, 'Hi & bye\ntwo');
});
test('truncate', () => {
  assert.deepEqual(truncate('abc', 5), { text: 'abc', truncated: false });
  assert.deepEqual(truncate('abcdef', 3), { text: 'abc', truncated: true });
});
test('readInput reads a file', async () => {
  const f = join(mkdtempSync(join(tmpdir(), 'bruh-')), 'a.txt');
  writeFileSync(f, 'hello');
  assert.equal(await readInput({ source: f }), 'hello');
});
test('readInput errors: missing file, empty file, no input on TTY', async () => {
  await assert.rejects(readInput({ source: '/nope/nope.txt' }), /can't read/);
  const f = join(mkdtempSync(join(tmpdir(), 'bruh-')), 'e.txt');
  writeFileSync(f, '  \n');
  await assert.rejects(readInput({ source: f }), /empty/);
  await assert.rejects(readInput({}, { stdinIsTTY: true }), /nothing to read/);
});
test('pickProvider prefers anthropic, falls back, errors clearly', () => {
  assert.equal(pickProvider({ ANTHROPIC_API_KEY: 'a', OPENAI_API_KEY: 'b' }).provider, 'anthropic');
  assert.equal(pickProvider({ OPENAI_API_KEY: 'b' }).provider, 'openai');
  assert.throws(() => pickProvider({}), /ANTHROPIC_API_KEY/);
  assert.throws(() => pickProvider({ OPENAI_API_KEY: 'b' }, 'anthropic'), /not set/);
});
test('system prompt uses SKILL.md without frontmatter plus mode', async () => {
  const p = await loadSystemPrompt('roast');
  assert.ok(p.includes('bruh, the whole thing is:'));
  assert.ok(!p.startsWith('---'));
  assert.ok(p.includes('--roast'));
});

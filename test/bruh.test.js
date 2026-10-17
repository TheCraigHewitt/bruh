import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from '../src/args.js';
import { htmlToText, truncate, isUrl, readInput } from '../src/input.js';
import { pickProvider, resolveProvider, ask, ollamaHost, loadSystemPrompt } from '../src/llm.js';

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

test('parseArgs accepts ollama provider', () => {
  assert.equal(parseArgs(['--provider', 'ollama']).provider, 'ollama');
});
test('no-key error mentions ollama', () => {
  assert.throws(() => pickProvider({}), /ollama/);
});
test('ollamaHost default, env, and scheme fixup', () => {
  assert.equal(ollamaHost({}), 'http://localhost:11434');
  assert.equal(ollamaHost({ OLLAMA_HOST: 'box:1234/' }), 'http://box:1234');
});
test('resolveProvider: keys beat ollama; ollama used when reachable; else friendly error', async () => {
  const up = async () => ({ ok: true });
  const down = async () => { throw new Error('ECONNREFUSED'); };
  assert.equal((await resolveProvider({ OPENAI_API_KEY: 'k' }, null, up)).provider, 'openai');
  assert.equal((await resolveProvider({}, null, up)).provider, 'ollama');
  await assert.rejects(resolveProvider({}, null, down), /ollama pull/);
  assert.equal((await resolveProvider({}, 'ollama', down)).provider, 'ollama');
});
test('ask ollama: posts to /api/chat with stream false and system prompt', async () => {
  let seen;
  const f = async (url, init) => { seen = { url, body: JSON.parse(init.body) }; return { ok: true, status: 200, json: async () => ({ message: { content: ' hi ' } }) }; };
  const out = await ask({ provider: 'ollama', host: 'http://h:1', system: 'SYS', text: 'T' }, f);
  assert.equal(out, 'hi');
  assert.equal(seen.url, 'http://h:1/api/chat');
  assert.equal(seen.body.stream, false);
  assert.equal(seen.body.model, 'llama3.2');
  assert.equal(seen.body.messages[0].content, 'SYS');
  const f2 = async (u, i) => { seen = JSON.parse(i.body); return { ok: true, json: async () => ({ message: { content: 'x' } }) }; };
  await ask({ provider: 'ollama', host: 'http://h:1', model: 'qwen2.5:3b', system: 's', text: 't' }, f2);
  assert.equal(seen.model, 'qwen2.5:3b');
});
test('ask ollama: not running and model missing errors', async () => {
  const down = async () => { throw new Error('ECONNREFUSED'); };
  await assert.rejects(ask({ provider: 'ollama', host: 'http://h:1', system: 's', text: 't' }, down), /ollama serve/);
  const missing = async () => ({ ok: false, status: 404, json: async () => ({ error: "model 'llama3.2' not found" }) });
  await assert.rejects(ask({ provider: 'ollama', host: 'http://h:1', system: 's', text: 't' }, missing), /ollama pull llama3.2/);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseModel, isBlockedHost, htmlToText, rateLimited, run, buildSystem } from '../api/bruh.js';
import { SKILL } from '../api/_skill.js';

test('skill copy is in sync with skills/bruh/SKILL.md', async () => {
  const raw = await readFile(new URL('../../skills/bruh/SKILL.md', import.meta.url), 'utf8');
  assert.equal(SKILL, raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim());
});
test('parseModel handles json, fenced json, and prose', () => {
  assert.equal(parseModel('```json\n{"point":"p","ask":"a","fluff":null,"check":"c"}\n```').check, 'c');
  assert.equal(parseModel('{"point":"p","ask":"a","fluff":null,"check":null}').fluff, null);
  assert.equal(parseModel('just words').point, 'just words');
});
test('ssrf host blocking', () => {
  for (const h of ['localhost', '127.0.0.1', '10.1.2.3', '192.168.0.1', '169.254.169.254', '172.20.0.1', '[::1]', 'foo.internal']) assert.ok(isBlockedHost(h), h);
  assert.ok(!isBlockedHost('example.com'));
});
test('htmlToText strips scripts and tags', () => assert.equal(htmlToText('<p>hi <script>x()</script><b>there</b></p>'), 'hi there'));
test('rate limit trips after 8', () => { let r; for (let i = 0; i < 9; i++) r = rateLimited('t'); assert.ok(r); });
test('run: mock, size limit, empty', async () => {
  process.env.BRUH_MOCK = '1';
  const r = await run({ text: 'one two three', mode: 'short' });
  assert.equal(r.words, 3); assert.equal(r.fluff, null);
  assert.ok((await run({ text: 'x', mode: 'full' })).fluff);
  await assert.rejects(run({ text: 'x'.repeat(60001) }), /too long/);
  await assert.rejects(run({}), /paste something/);
  await assert.rejects(run({ url: 'http://127.0.0.1/' }), /can't fetch/);
  assert.match(buildSystem('roast'), /Mode: roast/);
});

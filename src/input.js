import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

export const MAX_CHARS = 400000;

export function isUrl(s) {
  return /^https?:\/\//i.test(s);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function htmlToText(html) {
  return html
    .replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? m)
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function truncate(text, max = MAX_CHARS) {
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max), truncated: true };
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchUrl(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'bruh-cli' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`couldn't fetch ${url} (${res.status}). the internet said no`);
  const body = await res.text();
  const type = res.headers.get('content-type') || '';
  return /html/i.test(type) || /^\s*<(!doctype|html)/i.test(body) ? htmlToText(body) : body;
}

export async function readInput(opts, { stdinIsTTY = process.stdin.isTTY } = {}) {
  let text;
  if (opts.clipboard) {
    if (process.platform !== 'darwin') throw new Error('--clipboard only works on macOS for now (needs pbpaste). pipe it in instead, bruh.');
    text = execFileSync('pbpaste', { encoding: 'utf8' });
  } else if (opts.source && isUrl(opts.source)) text = await fetchUrl(opts.source);
  else if (opts.source && opts.source !== '-') {
    try {
      text = await readFile(opts.source, 'utf8');
    } catch (e) {
      throw new Error(`can't read ${opts.source}: ${e.code || e.message}`);
    }
  } else if (!stdinIsTTY || opts.source === '-') text = await readStdin();
  else throw new Error('nothing to read. give me a file, a URL, pipe something in, or use --clipboard. i can\'t summarize vibes. (bruh --help)');
  if (!text || !text.trim()) throw new Error('input is empty, bruh. nothing to unslop.');
  return text;
}

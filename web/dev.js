// Zero-dep local dev server: static files + /api/bruh. `npm run dev` (or dev:mock for no API key)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import handler from './api/bruh.js';

const root = new URL('./public/', import.meta.url).pathname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = process.env.PORT || 3000;

http.createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (path === '/api/bruh') return handler(req, res);
  const file = normalize(join(root, path === '/' ? 'index.html' : path));
  if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
  try {
    const buf = await readFile(file);
    res.setHeader('content-type', types[extname(file)] || 'application/octet-stream');
    res.end(buf);
  } catch { res.statusCode = 404; res.end('not found'); }
}).listen(port, () => console.log(`bruh web on http://localhost:${port}${process.env.BRUH_MOCK ? ' (mock LLM)' : ''}`));

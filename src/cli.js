import { readFile } from 'node:fs/promises';
import { parseArgs, HELP } from './args.js';
import { readInput, truncate } from './input.js';
import { loadSystemPrompt, pickProvider, ask } from './llm.js';

export async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.help) return void process.stdout.write(HELP);
  if (opts.version) {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    return void console.log(pkg.version);
  }
  const { provider, key } = pickProvider(process.env, opts.provider);
  const raw = await readInput(opts);
  const { text, truncated } = truncate(raw);
  if (truncated) console.error(`bruh: this thing is huge (${raw.length} chars). only reading the first ${text.length}. the rest got skipped, which, honestly, is probably fine.`);
  const system = await loadSystemPrompt(opts.mode);
  console.log(await ask({ provider, key, model: opts.model, system, text }));
}

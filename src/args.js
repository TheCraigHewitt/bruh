export const HELP = `bruh - turns AI slop into human speak.
your coworker's AI wrote 10 pages. bruh tells you what it said.

Usage:
  bruh <file|url>        read a file or URL
  cat doc.txt | bruh     read from stdin
  bruh --clipboard       read from the clipboard (macOS: pbpaste)

Modes:
  (default)   short: the point and the ask. two lines. you're busy.
  --full      all four sections: point, ask, fluff, double-check
  --roast     the full version, but mean to the slop (never the person)

Options:
  -m, --model <name>     model to use (default: claude-sonnet-4-5 / gpt-4o / llama3.2)
  --provider <name>      anthropic | openai | ollama (default: whichever key is set,
                         else a running ollama)
  -c, --clipboard        read from clipboard
  -h, --help             show help
  -v, --version          show version

Env: ANTHROPIC_API_KEY, OPENAI_API_KEY, or OLLAMA_HOST (default http://localhost:11434)
     no key? run a local model: ollama pull llama3.2 && bruh doc.md --provider ollama

examples:
  bruh strategy.md
  pbpaste | bruh --roast
  bruh https://some.blog/ten-thousand-words --full

https://bruh.is
`;

export function parseArgs(argv) {
  const o = { mode: 'short', source: null, clipboard: false, model: null, provider: null, help: false, version: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--full') o.mode = 'full';
    else if (a === '--roast') o.mode = 'roast';
    else if (a === '-c' || a === '--clipboard') o.clipboard = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a === '-v' || a === '--version') o.version = true;
    else if (a === '-m' || a === '--model' || a === '--provider') {
      const v = argv[++i];
      if (!v || v.startsWith('-')) throw new Error(`${a} needs a value, bruh`);
      if (a === '--provider') {
        if (!['anthropic', 'openai', 'ollama'].includes(v)) throw new Error('provider must be anthropic, openai, or ollama. pick one, bruh.');
        o.provider = v;
      } else o.model = v;
    } else if (a.startsWith('--model=')) o.model = a.slice(8);
    else if (a.startsWith('--provider=')) {
      o.provider = a.slice(11);
      if (!['anthropic', 'openai', 'ollama'].includes(o.provider)) throw new Error('provider must be anthropic, openai, or ollama. pick one, bruh.');
    } else if (a.startsWith('-') && a !== '-') throw new Error(`unknown option ${a}. try bruh --help`);
    else if (o.source) throw new Error('one file or URL at a time. bruh is good, not magic.');
    else o.source = a;
  }
  return o;
}

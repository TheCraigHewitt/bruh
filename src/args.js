export const HELP = `bruh - turns AI slop into human speak

Usage:
  bruh <file|url>        read a file or URL
  cat doc.txt | bruh     read from stdin
  bruh --clipboard       read from the clipboard (macOS: pbpaste)

Modes:
  (default)   short: the point and the ask
  --full      all four sections
  --roast     the full version, but funny

Options:
  -m, --model <name>     model to use (default: claude-sonnet-4-5 / gpt-4o)
  --provider <name>      anthropic | openai (default: from whichever key is set)
  -c, --clipboard        read from clipboard
  -h, --help             show help
  -v, --version          show version

Env: ANTHROPIC_API_KEY (default) or OPENAI_API_KEY
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
      if (!v || v.startsWith('-')) throw new Error(`${a} needs a value`);
      if (a === '--provider') {
        if (!['anthropic', 'openai'].includes(v)) throw new Error('provider must be anthropic or openai');
        o.provider = v;
      } else o.model = v;
    } else if (a.startsWith('--model=')) o.model = a.slice(8);
    else if (a.startsWith('--provider=')) {
      o.provider = a.slice(11);
      if (!['anthropic', 'openai'].includes(o.provider)) throw new Error('provider must be anthropic or openai');
    } else if (a.startsWith('-') && a !== '-') throw new Error(`unknown option ${a}`);
    else if (o.source) throw new Error('only one file or URL at a time');
    else o.source = a;
  }
  return o;
}

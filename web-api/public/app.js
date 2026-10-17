const $ = (id) => document.getElementById(id);
let mode = 'short', current = null;

document.querySelectorAll('.mode').forEach((b) => b.onclick = () => {
  mode = b.dataset.mode;
  document.querySelectorAll('.mode').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
});
$('text').oninput = () => { $('count').textContent = `${$('text').value.length.toLocaleString()} / 60,000`; };
$('npx').onclick = () => navigator.clipboard?.writeText('npx @thecraighewitt/bruh');

const sentences = (s) => (s ? (s.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).length : 0);

function headline(r) {
  const n = sentences(r.point) + sentences(r.ask);
  const w = r.words ? `this ${r.words.toLocaleString()}-word thing` : 'this thing';
  return `${w} is actually ${n} sentence${n === 1 ? '' : 's'}.`;
}

function show(r) {
  current = r;
  $('headline').textContent = headline(r);
  $('r-point').textContent = r.point;
  $('r-ask').textContent = r.ask || 'nothing, this is FYI.';
  for (const k of ['fluff', 'check']) {
    $(`b-${k}`).hidden = !r[k];
    $(`r-${k}`).textContent = r[k] || '';
  }
  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function asText(r) {
  return [headline(r), '', r.point, `they want: ${r.ask || 'nothing, this is FYI.'}`,
    r.fluff && `fluff: ${r.fluff}`, r.check && `double-check: ${r.check}`, '', 'via bruh.is'].filter((x) => x !== null && x !== false && x !== undefined).join('\n');
}

// shareable link: the result lives in the URL hash (no server storage, never sent anywhere)
const enc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));

$('go').onclick = async () => {
  const text = $('text').value, url = $('url').value;
  $('err').hidden = true;
  if (!text.trim() && !url.trim()) { $('err').textContent = 'paste something first, bruh.'; $('err').hidden = false; return; }
  $('go').disabled = true; $('go').textContent = 'reading the slop…';
  try {
    const res = await fetch('/api/bruh', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, url, mode }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'something broke.');
    show(data);
  } catch (e) { $('err').textContent = e.message; $('err').hidden = false; }
  finally { $('go').disabled = false; $('go').textContent = 'bruh this'; }
};

const flash = (btn, msg) => { const o = btn.textContent; btn.textContent = msg; setTimeout(() => btn.textContent = o, 1200); };
$('copy').onclick = async () => { await navigator.clipboard.writeText(asText(current)); flash($('copy'), 'copied'); };
$('link').onclick = async () => {
  const { point, ask, fluff, check, words } = current;
  await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${enc({ point, ask, fluff, check, words })}`);
  flash($('link'), 'copied');
};
$('again').onclick = () => { $('result').hidden = true; history.replaceState(null, '', location.pathname); window.scrollTo({ top: 0, behavior: 'smooth' }); };

$('png').onclick = () => {
  const W = 1080, pad = 60, f = '"SF Mono",Menlo,Consolas,monospace';
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const wrap = (t, size, maxW) => {
    g.font = `${size}px ${f}`;
    const lines = [];
    for (const para of String(t).split('\n')) {
      let line = '';
      for (const w of para.split(' ')) {
        if (g.measureText((line + ' ' + w).trim()).width > maxW && line) { lines.push(line); line = w; } else line = (line + ' ' + w).trim();
      }
      lines.push(line);
    }
    return lines;
  };
  const items = [{ t: headline(current), s: 44, col: '#ffd23f', bold: true }, { gap: 20 }];
  const add = (label, t) => { items.push({ t: label.toUpperCase(), s: 22, col: '#8d8a83' }, { t, s: 34, col: '#f4f1ea' }, { gap: 24 }); };
  add('the point', current.point); add('they want', current.ask || 'nothing, this is FYI.');
  if (current.fluff) add('fluff', current.fluff);
  if (current.check) add('double-check', current.check);
  let y = pad + 20;
  const laid = items.map((it) => {
    if (it.gap) { y += it.gap; return it; }
    const lines = wrap(it.t, it.s, W - pad * 2); const o = { ...it, lines, y }; y += lines.length * it.s * 1.35 + 8; return o;
  });
  c.width = W; c.height = Math.ceil(y + 90);
  g.fillStyle = '#0f0f10'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#1a1a1c'; g.fillRect(24, 24, W - 48, c.height - 48);
  g.textBaseline = 'top';
  for (const it of laid) {
    if (!it.lines) continue;
    g.fillStyle = it.col; g.font = `${it.bold ? 'bold ' : ''}${it.s}px ${f}`;
    it.lines.forEach((l, i) => g.fillText(l, pad, it.y + i * it.s * 1.35));
  }
  g.fillStyle = '#8d8a83'; g.font = `24px ${f}`; g.textAlign = 'right'; g.fillText('bruh.is', W - pad, c.height - 70);
  const a = document.createElement('a'); a.download = 'bruh.png'; a.href = c.toDataURL('image/png'); a.click();
};

// open a shared link
if (location.hash.length > 1) { try { show(dec(location.hash.slice(1))); } catch {} }

document.querySelectorAll('.copy').forEach((b) => {
  b.addEventListener('click', async () => {
    const t = b.parentElement.querySelector('code').innerText;
    try { await navigator.clipboard.writeText(t); b.textContent = 'copied, bruh'; }
    catch { b.textContent = 'ctrl+c it'; }
    setTimeout(() => (b.textContent = 'copy'), 1500);
  });
});

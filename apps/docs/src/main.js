// Everything interactive on this site is native HTML. This file only adds conveniences.

for (const el of document.querySelectorAll('[data-origin]')) el.textContent = location.origin;

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const code = button.closest('[data-code]').querySelector('code').textContent;
  await navigator.clipboard.writeText(code);
  button.textContent = 'Copied';
  setTimeout(() => (button.textContent = 'Copy'), 1400);
});

// The framework picker is CSS too (:has on a radio group named framework). This just remembers it.
document.addEventListener('change', (event) => {
  if (event.target.name !== 'framework') return;
  document.documentElement.dataset.framework = event.target.value;
  localStorage.setItem('framework', event.target.value);
});

// The theme switch itself is CSS (:has on a select named color-scheme). This just remembers it.
document.querySelector('select[name=color-scheme]')?.addEventListener('change', (event) => {
  localStorage.setItem('color-scheme', event.target.value);
});

const editor = document.querySelector('[data-theme-editor]');
if (editor) {
  const preview = editor.querySelector('[data-theme-preview]');
  const output = editor.nextElementSibling.querySelector('code');
  const apply = () => {
    const { hue, chroma, radius, spacing } = Object.fromEntries(new FormData(editor.querySelector('form')));
    const css = {
      '--primary': `light-dark(oklch(.55 ${chroma} ${hue}), oklch(.72 ${chroma} ${hue}))`,
      '--primary-foreground': 'oklch(.985 0 0)',
      '--radius': `${radius}rem`,
      '--spacing': `${spacing}rem`,
    };
    for (const [name, value] of Object.entries(css)) preview.style.setProperty(name, value);
    output.textContent = `:root {\n${Object.entries(css).map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`;
  };
  editor.addEventListener('input', apply);
  apply();
}

if (document.querySelector('[data-builder]')) import('./builder.js');

// Search: the dialog is a list of every page. ⌘K or / opens it; typing hides what doesn't match.
const search = document.querySelector('[data-search]');
if (search) {
  const input = search.querySelector('input');
  const links = [...search.querySelectorAll('[data-results] a')];
  addEventListener('keydown', (event) => {
    const typing = event.target.closest?.('input, textarea, select, [contenteditable]');
    if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
      event.preventDefault();
      search.showModal();
    }
  });
  search.addEventListener('toggle', (event) => event.newState === 'open' && input.select());
  input.addEventListener('input', () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const link of links) link.parentElement.hidden = !words.every((word) => link.textContent.toLowerCase().includes(word));
    for (const group of search.querySelectorAll('[data-results] > li')) group.hidden = !group.querySelector('li:not([hidden])');
    search.toggleAttribute('data-empty-results', !links.some((link) => !link.parentElement.hidden));
  });
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = links.find((link) => !link.parentElement.hidden);
    if (first) location.href = first.href;
  });
}

// Preview frames grow to fit their page, so a block never scrolls inside the gallery.
function autosize(frame) {
  const watch = () => {
    const doc = frame.contentDocument;
    if (!doc?.body || doc.URL === 'about:blank') return;
    const fit = () => (frame.style.blockSize = `${doc.documentElement.scrollHeight}px`);
    fit();
    new ResizeObserver(fit).observe(doc.body);
  };
  frame.addEventListener('load', watch);
  // A frame can finish before this module runs.
  if (frame.contentDocument?.readyState === 'complete') watch();
}
document.querySelectorAll('iframe[data-autosize]').forEach(autosize);

// Width presets win over a width dragged with the resize handle.
document.addEventListener('change', (event) => {
  if (event.target.name?.startsWith('vp-')) event.target.closest('[data-block]').querySelector('[data-resize]').style.inlineSize = '';
});

// Theme and style for every preview frame. Frames (and preview tabs) pick it up from the storage event.
for (const select of document.querySelectorAll('[data-preview-controls] select')) {
  select.value = localStorage.getItem(select.name) ?? select.options[0].value;
  select.addEventListener('change', () => {
    for (const twin of document.querySelectorAll(`select[name="${select.name}"]`)) twin.value = select.value;
    localStorage.setItem(select.name, select.value);
  });
}

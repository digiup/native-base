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

// The theme switch itself is CSS (:has on a select named color-scheme). This just remembers it.
document.querySelector('select[name=color-scheme]')?.addEventListener('change', (event) => {
  localStorage.setItem('color-scheme', event.target.value);
});

const editor = document.querySelector('[data-theme-editor]');
if (editor) {
  const preview = editor.querySelector('[data-theme-preview]');
  const output = editor.nextElementSibling.querySelector('code');
  const apply = () => {
    const { hue, chroma, radius } = Object.fromEntries(new FormData(editor.querySelector('form')));
    const css = {
      '--primary': `light-dark(oklch(.55 ${chroma} ${hue}), oklch(.72 ${chroma} ${hue}))`,
      '--primary-foreground': 'oklch(.985 0 0)',
      '--radius': `${radius}rem`,
    };
    for (const [name, value] of Object.entries(css)) preview.style.setProperty(name, value);
    output.textContent = `:root {\n${Object.entries(css).map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`;
  };
  editor.addEventListener('input', apply);
  apply();
}

if (document.querySelector('[data-builder]')) import('./builder.js');

import { css, resolve } from '@digiup/native-base';

const form = document.querySelector('[data-builder]');
const summary = form.querySelector('[data-builder-summary]');
const command = form.querySelector('[data-builder-output] code');
const download = form.querySelector('[download]');
const boxes = [...form.querySelectorAll('[name=items]')];

// Restore a shared selection: ?items=button&items=dialog
const shared = new URLSearchParams(location.search).getAll('items');
if (shared.length) for (const box of boxes) box.checked = shared.includes(box.value);

async function gzipSize(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  return (await new Response(stream).arrayBuffer()).byteLength;
}

async function update() {
  const names = boxes.filter((box) => box.checked).map((box) => box.value);
  const included = resolve(names);
  const selected = new Set(names);
  for (const box of boxes) box.indeterminate = !selected.has(box.value) && included.some((item) => item.name === box.value);

  const bundle = css(names);
  const gzip = await gzipSize(bundle);
  summary.textContent = names.length
    ? `${included.length} items (${included.length - names.length} pulled in as dependencies): ${bundle.length.toLocaleString('en')} B minified, ${gzip.toLocaleString('en')} B gzip.`
    : 'Select components to see the bundle.';
  command.textContent = `npx native-base add ${names.join(' ')}`;

  URL.revokeObjectURL(download.href);
  download.href = URL.createObjectURL(new Blob([bundle], { type: 'text/css' }));
  history.replaceState(null, '', names.length ? `?${new URLSearchParams(names.map((name) => ['items', name]))}#builder` : location.pathname);
}

form.addEventListener('change', update);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  update();
});
update();

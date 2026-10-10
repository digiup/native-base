import { STYLE_PRESETS, THEME_PRESETS, slug } from '@digiup/native-base/presets';
import { codeBlock, esc, variants } from '../html.js';
import { page } from '../layout.js';

const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const DESKTOP = icon('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>');
const TABLET = icon('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>');
const PHONE = icon('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>');
const EXTERNAL = icon('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');

/** A block or template on its own: the shipped stylesheet and the markup, nothing from the docs site. */
export function preview(pattern, kind) {
  // Sections, headers and footers are full-bleed; anything else (a card, a stack) gets room around it, as it would in an app.
  const bleeds = /^<(section|header|footer)\b/.test(pattern.code);
  const body = kind === 'block' ? `<main${bleeds ? '' : ' style="padding: clamp(1rem, 4vw, 3rem)"'}>\n${pattern.code}\n</main>` : pattern.code;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pattern.title)} · native-base ${kind}</title>
<meta name="description" content="${esc(pattern.description)}">
<link rel="icon" href="/favicon.svg">
<script type="module" src="/src/preview.js"></script>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Theme and style pickers for every preview frame on the page. main.js stores the choice; each frame's
 * preview.js hears about it through the storage event, so one change restyles them all.
 */
function previewControls() {
  const options = (presets) => presets.map((preset) => `<option value="${slug(preset.name)}">${esc(preset.name)}</option>`).join('');
  return `<div data-preview-controls>
  <label>Theme <select name="preview-theme">${options(THEME_PRESETS)}</select></label>
  <label>Style <select name="preview-style">${options(STYLE_PRESETS)}</select></label>
</div>`;
}

const usesLinks = (uses) =>
  uses
    .filter((name) => name !== 'base')
    .map((name) => `<a href="/docs/${name}/">${name}</a>`)
    .join('');

function block(item) {
  const id = item.name;
  const viewport = (value, label, svg, checked) =>
    `<label data-tooltip="${label}"><input type="radio" name="vp-${id}" value="${value}"${checked ? ' checked' : ''} aria-label="${label}">${svg}</label>`;
  return `<article data-block id="${id}">
  <header>
    <div>
      <h3><a href="#${id}">${esc(item.title)}</a></h3>
      <p>${esc(item.description)}</p>
    </div>
    <div data-block-meta><span data-badge data-variant="secondary">${item.tokens.toLocaleString('en')} tokens</span><span data-uses>${usesLinks(item.uses)}</span></div>
  </header>
  <div data-tabs data-block-tabs>
    <details name="view-${id}" open><summary>Preview</summary>
      <div data-stage><div data-resize><iframe src="/blocks/${id}/" title="${esc(item.title)} preview" loading="lazy" data-autosize></iframe></div></div>
    </details>
    <details name="view-${id}"><summary>Code</summary><div>${variants({ title: item.title, code: item.code, tokens: item.tokens })}</div></details>
    <div data-block-tools>
      <fieldset data-segmented data-size="sm" aria-label="Preview width">
        ${viewport('desktop', 'Desktop', DESKTOP, true)}${viewport('tablet', 'Tablet', TABLET)}${viewport('phone', 'Phone', PHONE)}
      </fieldset>
      <a href="/blocks/${id}/" target="_blank" data-variant="ghost" data-size="icon" aria-label="Open ${esc(item.title)} in a new tab" data-tooltip="Open in a new tab">${EXTERNAL}</a>
    </div>
  </div>
  ${codeBlock(`npx native-base add block-${id}`, 'sh')}
</article>`;
}

export function blocksGallery(site) {
  const { registry } = site;
  const groups = [...Map.groupBy(registry.blocks, (item) => item.category)];
  const tokens = registry.blocks.reduce((sum, item) => sum + item.tokens, 0);

  const body = `<main data-wrap data-gallery>
  <header data-gallery-head>
    <p data-kicker><span data-badge>New</span> ${registry.blocks.length} blocks · ${groups.length} categories</p>
    <h1>Blocks</h1>
    <p data-lead>Whole sections, built only from native-base components: heroes, pricing, dashboards, settings, checkout. Copy the HTML, or let the CLI bring it with exactly the components it uses. On average ${Math.round(tokens / Math.max(1, registry.blocks.length)).toLocaleString('en')} tokens each.</p>
    ${previewControls()}
  </header>
  <div data-gallery-layout>
    <nav data-gallery-nav aria-label="Block categories">
      <ol>${groups.map(([category, items]) => `<li><a href="#${slug(category)}">${esc(category)}<small>${items.length}</small></a></li>`).join('')}</ol>
    </nav>
    <div data-gallery-list>
      ${groups.map(([category, items]) => `<section aria-labelledby="${slug(category)}"><h2 id="${slug(category)}">${esc(category)}</h2>${items.map(block).join('')}</section>`).join('')}
    </div>
  </div>
</main>`;

  return page({
    site,
    path: '/blocks/',
    title: 'Blocks',
    description: `${registry.blocks.length} copy-paste sections built from native-base components: heroes, pricing, dashboards, auth, settings and more.`,
    body,
  });
}

export function templatesGallery(site) {
  const { registry } = site;
  const { templates } = registry;
  const fan = ['dashboard', 'landing', 'product'].map((name) => templates.find((template) => template.name === name)).filter(Boolean);

  const cards = templates
    .map(
      (template) => `<article data-template id="${template.name}">
  <a href="/templates/${template.name}/" data-thumb aria-label="Open the ${esc(template.title)} template">
    <iframe src="/templates/${template.name}/" title="${esc(template.title)}" loading="lazy" tabindex="-1" inert></iframe>
  </a>
  <header>
    <h2><a href="/templates/${template.name}/">${esc(template.title)}</a></h2>
    <span data-badge data-variant="secondary">${template.tokens.toLocaleString('en')} tokens</span>
  </header>
  <p>${esc(template.description)}</p>
  <p data-uses>${usesLinks(template.uses)}</p>
  <footer data-row>
    <a href="/templates/${template.name}/" data-variant data-size="sm">Open template ${EXTERNAL}</a>
    <button commandfor="code-${template.name}" command="show-modal" data-variant="outline" data-size="sm">View markup</button>
  </footer>
  <dialog id="code-${template.name}" closedby="any" data-code-dialog aria-label="${esc(template.title)} markup">
    <button commandfor="code-${template.name}" command="close" aria-label="Close">✕</button>
    <header><h2>${esc(template.title)}</h2><p>${esc(template.description)}</p></header>
    ${codeBlock(`npx native-base add template-${template.name}`, 'sh')}
    ${codeBlock(template.code, 'html', { label: `templates/${template.name}.html`, tokens: template.tokens })}
  </dialog>
</article>`,
    )
    .join('');

  const body = `<main data-gallery data-templates>
  <section data-fan-hero>
    <div data-wrap>
      <p data-kicker><span data-badge>New</span> ${templates.length} full-page templates</p>
      <h1>Whole pages.<br>Zero class names.</h1>
      <p data-lead>Dashboards, landing pages, inboxes and checkouts, written as plain HTML on one stylesheet. Pick a theme and a style and every page below changes with it.</p>
      ${previewControls()}
    </div>
    <div data-fan aria-hidden="true">
      ${fan.map((template) => `<div data-fan-card><iframe src="/templates/${template.name}/" title="${esc(template.title)}" tabindex="-1" inert></iframe></div>`).join('')}
    </div>
  </section>
  <div data-wrap data-template-grid>${cards}</div>
</main>`;

  return page({
    site,
    path: '/templates/',
    title: 'Templates',
    description: `${templates.length} full-page templates in plain HTML on native-base: dashboard, landing page, settings, mail, pricing, product page and more.`,
    body,
  });
}

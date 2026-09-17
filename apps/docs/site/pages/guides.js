import { countTokens } from 'gpt-tokenizer';
import { codeBlock, esc, kb } from '../html.js';
import { docsPage } from '../layout.js';

const firstPage = `<!doctype html>
<html lang="en">
<link rel="stylesheet" href="{origin}/native-base.css">
<main data-stack style="max-width: 24rem; margin: 4rem auto">
  <h1>Hello</h1>
  <label>Email <input type="email" required></label>
  <button commandfor="done" command="show-modal">Subscribe</button>
  <dialog id="done" closedby="any">
    <header><h2>You're in</h2><p>Check your inbox.</p></header>
  </dialog>
</main>`;

const support = [
  ['Customizable select', 'appearance: base-select', 'A regular native select with a chevron.'],
  ['Invoker commands', 'commandfor, command', 'Buttons do nothing. Add the invokers-polyfill package for older browsers.'],
  ['Anchor positioning', 'position-area', 'Popovers and menus open centered in the viewport.'],
  ['Hint popovers', 'interestfor', 'The hint never shows. Use data-tooltip for essential labels.'],
  ['Details animation', '::details-content', 'Accordions open instantly.'],
  ['Tabs layout', 'details { display: contents }', 'Tabs render as an accordion.'],
  ['Scroll buttons and markers', '::scroll-button, ::scroll-marker', 'A swipeable scroll-snap row with a scrollbar.'],
  ['View transitions', '@view-transition', 'Pages navigate instantly.'],
  ['Auto-growing textarea', 'field-sizing: content', 'A resizable textarea with a fixed starting height.'],
];

export function gettingStarted(site) {
  const { registry } = site;
  const content = `<h1>Getting started</h1>
<p data-lead>native-base is CSS for plain HTML. Buttons are <code>&lt;button&gt;</code>, dialogs are <code>&lt;dialog&gt;</code>, and composite components take one data attribute. There is no JavaScript to install.</p>

<h2 id="link">Link the stylesheet</h2>
<p>All ${registry.items.length} components in ${kb(registry.bundle.size.gzip)}. The fastest way to try it.</p>
${codeBlock('<link rel="stylesheet" href="{origin}/native-base.css">', 'html')}

<h2 id="npm">Install from npm</h2>
<p>Import the whole bundle or individual components. Per-component files expect their dependencies (listed on each page) to be imported first.</p>
${codeBlock(`npm i @native-base/css`, 'sh')}
${codeBlock(`@import "@native-base/css/native-base.css";

/* or only what you use */
@import "@native-base/css/components/tokens.css";
@import "@native-base/css/components/button.css";
@import "@native-base/css/components/dialog.css";`, 'css')}

<h2 id="registry">Copy it into your project</h2>
<p>Like shadcn/ui, you can own the source. The CLI copies each component’s CSS and its dependencies, then keeps an <code>index.css</code> in cascade order. <a href="/docs/registry/">More on the registry</a>.</p>
${codeBlock(`npx native-base init
npx native-base add dialog select tabs`, 'sh')}

<h2 id="first-page">Write HTML</h2>
<p>A complete page with a validated field and a working modal, in ${countTokens(firstPage)} tokens.</p>
${codeBlock(firstPage, 'html', { tokens: countTokens(firstPage) })}

<h2 id="frameworks">With a framework</h2>
<p>There is nothing to adapt: a Vue template and a Svelte component are HTML already, and JSX only renames a handful of attributes. Every example on the component pages can be shown as <a href="/docs/react/">React</a>, <a href="/docs/vue/">Vue</a>, <a href="/docs/svelte/">Svelte</a> or <a href="/docs/solid/">Solid</a> — pick one in any code block and the whole site follows.</p>

<h2 id="rules">The rules</h2>
<ol data-rules>${registry.rules.map((rule) => `<li>${esc(rule)}</li>`).join('')}</ol>

<h2 id="ai">Using it with AI</h2>
<p>The whole markup API, with one example per component, is in <a href="/llms.txt">/llms.txt</a>: ${registry.llms.tokens.toLocaleString('en')} tokens. Paste it into a system prompt or your agent’s rules file. <code>npx native-base view dialog</code> prints any single component’s API in the terminal.</p>

<h2 id="support">Browser support</h2>
<p>Everything is progressive enhancement. Where a feature is missing, you get working native behavior:</p>
<table data-support>
  <thead><tr><th>Feature</th><th>Uses</th><th>Without support</th></tr></thead>
  <tbody>${support.map(([name, uses, fallback]) => `<tr><td>${name}</td><td><code>${esc(uses)}</code></td><td>${esc(fallback)}</td></tr>`).join('')}</tbody>
</table>`;

  return docsPage({ site, path: '/docs/', title: 'Getting started', description: 'Install native-base and write your first page.', content });
}

export function registryGuide(site) {
  const { registry } = site;
  const endpoints = [
    ['/r/index.json', 'Every item, without file contents'],
    ['/r/{name}.json', 'One item: metadata, API, examples and CSS source'],
    ['/r/{name}.css', 'One item’s minified CSS, ready for a link tag'],
    ['/native-base.css', 'Everything, minified'],
    ['/llms.txt', 'The markup API for language models'],
  ];

  const content = `<h1>Registry & CLI</h1>
<p data-lead>Components ship as a registry: JSON and CSS files served over plain GET. The format follows shadcn/ui’s registry schema, so both CLIs can read it.</p>

<h2 id="endpoints">Endpoints</h2>
<table data-api>
  <thead><tr><th>GET</th><th>Returns</th></tr></thead>
  <tbody>${endpoints.map(([path, what]) => `<tr><td><a href="${path.includes('{') ? path.replace('{name}', 'dialog') : path}"><code>${path}</code></a></td><td>${what}</td></tr>`).join('')}</tbody>
</table>

<h2 id="cli">native-base CLI</h2>
<p>Dependencies resolve automatically and are written first. Existing files are left alone unless you pass <code>--force</code>.</p>
${codeBlock(`# create native-base.json and add tokens + base
npx native-base init

# copy components (and their dependencies)
npx native-base add dialog menu

# browse
npx native-base list
npx native-base view select

# from your own deployed registry, or any registry item URL
npx native-base add tabs --registry {origin}/r
npx native-base add https://example.com/r/fancy-card.json`, 'sh')}
${codeBlock(`{
  "out": "src/styles/native-base",
  "registry": "{origin}/r"
}`, 'json', { label: 'native-base.json' })}

<h2 id="shadcn">shadcn CLI</h2>
<p>Items are universal <code>registry:item</code>s with explicit targets, so shadcn can install them by URL. Add the namespace to <code>components.json</code> to resolve dependencies by name.</p>
${codeBlock(`npx shadcn add {origin}/r/dialog.json`, 'sh')}
${codeBlock(`{
  "registries": {
    "@native-base": "{origin}/r/{name}.json"
  }
}`, 'json', { label: 'components.json' })}

<h2 id="builder">Build a bundle</h2>
<p>Pick components; dependencies are added for you. The selection lives in the URL (a plain <code>method="get"</code> form), so you can share it.</p>
<form data-builder method="get">
  <fieldset data-builder-items>
    <legend>Components</legend>
    ${registry.items.map((item) => `<label><input type="checkbox" name="items" value="${item.name}"${['button', 'dialog'].includes(item.name) ? ' checked' : ''}> ${esc(item.title)}</label>`).join('')}
  </fieldset>
  <noscript><button>Update</button></noscript>
  <output data-builder-output for="items">
    <p data-builder-summary>Select components to see the bundle.</p>
    ${codeBlock('npx native-base add button dialog', 'sh')}
    <a data-variant download="native-base.css" href="/native-base.css">Download CSS</a>
  </output>
</form>

<h2 id="authoring">Authoring</h2>
<p>The registry is generated by a rolldown plugin from <code>registry.json</code> plus one folder per item: <code>registry/{name}/{name}.css</code> and <code>examples.html</code>. Examples are split on <code>&lt;!-- @example: Title --&gt;</code> comments and token-counted at build time.</p>`;

  return docsPage({ site, path: '/docs/registry/', title: 'Registry & CLI', description: 'Install native-base components from a URL, with our CLI or shadcn’s.', content });
}

export function theming(site) {
  const variables = [
    ['--background, --foreground', 'Page surface and text'],
    ['--card, --popover (+ -foreground)', 'Raised surfaces'],
    ['--primary, --primary-foreground', 'Default buttons, badges, checked controls'],
    ['--secondary, --muted, --accent (+ -foreground)', 'Quiet surfaces and hover states'],
    ['--destructive, --success, --warning', 'Status colors for data-variant'],
    ['--border, --input, --ring', 'Lines, field borders, focus rings'],
    ['--radius', 'Base corner radius; components derive from it'],
    ['--font-sans, --font-mono', 'Font stacks'],
    ['--duration, --ease', 'Motion'],
  ];

  const content = `<h1>Theming</h1>
<p data-lead>Themes are CSS variables with shadcn/ui’s names. Colors use <code>light-dark()</code>, so one declaration covers both schemes, and everything is layered so your overrides never fight specificity.</p>

<h2 id="editor">Try it</h2>
<div data-theme-editor>
  <form data-stack>
    <label>Hue <input type="range" min="0" max="360" value="265" name="hue"></label>
    <label>Chroma <input type="range" min="0" max="0.3" step="0.01" value="0.18" name="chroma"></label>
    <label>Radius <input type="range" min="0" max="1.25" step="0.125" value="0.625" name="radius"></label>
    <fieldset data-row>
      <legend>Scheme</legend>
      <label><input type="radio" name="editor-scheme" value="light" checked> Light</label>
      <label><input type="radio" name="editor-scheme" value="dark"> Dark</label>
    </fieldset>
  </form>
  <article data-card data-theme-preview>
    <header><h3>Upgrade to Pro</h3><p>Unlimited projects and priority support.</p></header>
    <label>Seats <input type="number" value="3" min="1"></label>
    <label><input type="checkbox" role="switch" checked> Annual billing</label>
    <footer data-row="between"><span data-badge>Save 20%</span><button>Upgrade</button></footer>
  </article>
</div>
${codeBlock(`:root {
  --primary: light-dark(oklch(.55 .18 265), oklch(.72 .18 265));
  --primary-foreground: oklch(.985 0 0);
  --radius: .625rem;
}`, 'css', { label: 'your.css' })}

<h2 id="variables">Variables</h2>
<table data-api><thead><tr><th>Variable</th><th>Used for</th></tr></thead>
<tbody>${variables.map(([name, use]) => `<tr><td><code>${name}</code></td><td>${use}</td></tr>`).join('')}</tbody></table>

<h2 id="shadcn-themes">Using a shadcn/ui theme</h2>
<p>Paste the <code>:root</code> block as-is. shadcn themes put dark colors under <code>.dark</code>; rename that selector to <code>[data-theme=dark]</code>, or wrap it in <code>@media (prefers-color-scheme: dark)</code>.</p>
${codeBlock(`:root { --primary: oklch(0.205 0 0); /* … */ }
[data-theme=dark] { --primary: oklch(0.922 0 0); /* … */ }`, 'css')}

<h2 id="scheme">Light and dark</h2>
<p>The default follows the operating system. Force a scheme on any subtree with <code>data-theme</code>, or let users choose with any control named <code>color-scheme</code>: the page reacts through <code>:has()</code>, no script needed. The switcher in this site’s header is exactly that; a one-line script only remembers your choice.</p>
${codeBlock(`<select name="color-scheme" aria-label="Theme">
  <option value="system">System</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>`, 'html')}

<h2 id="layers">Overrides always win</h2>
<p>All styles live in <code>@layer nb.tokens, nb.base, nb.components, nb.transitions</code>. Unlayered CSS beats every layer regardless of specificity, so <code>button { border-radius: 0 }</code> just works. No <code>!important</code>, no <code>:where()</code> gymnastics.</p>`;

  return docsPage({ site, path: '/docs/theming/', title: 'Theming', description: 'Theme native-base with shadcn/ui-compatible CSS variables.', content });
}

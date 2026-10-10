import { esc } from './html.js';
import { FRAMEWORK_LINKS } from './pages/frameworks.js';

const GUIDES = [
  ['/docs/', 'Getting started'],
  ['/docs/registry/', 'Registry & CLI'],
  ['/docs/theming/', 'Theming'],
];

const FRAMEWORKS = FRAMEWORK_LINKS;

const GUIDE_PATHS = [...GUIDES, ...FRAMEWORKS].map(([href]) => href);

/** The top bar names sections only. Pages inside a section live in its sidebar or gallery. */
const SECTIONS = [
  ['/docs/', 'Docs', (path) => GUIDE_PATHS.includes(path)],
  ['/docs/components/', 'Components', (path) => path.startsWith('/docs/') && !GUIDE_PATHS.includes(path)],
  ['/blocks/', 'Blocks', (path) => path.startsWith('/blocks/')],
  ['/templates/', 'Templates', (path) => path.startsWith('/templates/')],
  ['/playground/', 'Playground', (path) => path === '/playground/'],
];

/** Shipped in the last minor: the sidebar and overview flag them. */
export const NEW = new Set(['segmented', 'rating', 'dropzone', 'stat', 'chart', 'timeline', 'empty', 'navbar', 'shell', 'pagination', 'steps', 'section', 'marquee']);

const LOGO = `<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--mark)"/><path d="m12.5 10-6 6 6 6m7-12 6 6-6 6" fill="none" stroke="var(--mark-ink)" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const MENU = icon('<path d="M4 6h16M4 12h16M4 18h16"/>');
const SEARCH = icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>');
const GITHUB = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`;

const current = (path, href) => (path === href ? ' aria-current="page"' : '');

/** Every page, for the ⌘K dialog. Filtering is a few lines in main.js; the list itself is plain links. */
function searchDialog(registry) {
  const group = (title, links) =>
    `<li><small>${title}</small><ul>${links.map(([href, label, hint = '']) => `<li><a href="${href}">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</a></li>`).join('')}</ul></li>`;
  const groups = [
    group('Guides', [...GUIDES, ['/playground/', 'Theme playground'], ['/kitchen-sink/', 'Kitchen sink']].concat(FRAMEWORKS.map(([href, label]) => [href, `${label} guide`]))),
    group('Components', registry.items.map((item) => [`/docs/${item.name}/`, item.title, item.category])),
    group('Blocks', registry.blocks.map((block) => [`/blocks/#${block.name}`, block.title, block.category])),
    group('Templates', registry.templates.map((template) => [`/templates/#${template.name}`, template.title, 'Template'])),
  ];
  return `<dialog id="search" closedby="any" aria-label="Search" data-search>
  <search><label>${SEARCH}<input type="search" placeholder="Search components, blocks, templates…" aria-label="Search the site" autocomplete="off"></label><kbd>esc</kbd></search>
  <ul data-results>${groups.join('')}</ul>
  <p data-no-results>Nothing matches. Try “form”, “chart” or “pricing”.</p>
</dialog>`;
}

export function page({ site, path, title, description, body, modules = [], styles = [] }) {
  const nav = SECTIONS.map(([href, label, active]) => `<a href="${href}"${active(path) ? ' aria-current="page"' : ''}>${label}</a>`).join('');

  return `<!doctype html>
<html lang="en" data-transition="slide">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? `${esc(title)} · native-base` : 'native-base · UI in a fraction of the tokens'}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/src/site.css">
${styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('')}
<script type="speculationrules">{"prerender":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
<script>document.documentElement.dataset.framework=localStorage.getItem("framework")||"html"</script>
<script>addEventListener("pagereveal",(e)=>{if(e.viewTransition&&window.navigation?.activation?.navigationType==="traverse")e.viewTransition.types.add("back")})</script>
<script type="module" src="/src/main.js"></script>
${modules.map((src) => `<script type="module" src="${src}"></script>`).join('')}
</head>
<body>
<header data-navbar="sticky" data-site-header>
  <a href="/" data-logo>${LOGO}<span>native-base</span></a>
  <nav popover id="site-nav" aria-label="Main">${nav}</nav>
  <button popovertarget="site-nav" data-variant="ghost" data-size="icon" aria-label="Menu">${MENU}</button>
  <div>
    <button commandfor="search" command="show-modal" data-variant="outline" data-search-button>${SEARCH}<span>Search</span><kbd>⌘K</kbd></button>
    <a href="https://github.com/digiup/native-base" data-variant="ghost" data-size="icon" aria-label="GitHub">${GITHUB}</a>
    <select name="color-scheme" aria-label="Color scheme">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
    <script>document.currentScript.previousElementSibling.value=localStorage.getItem("color-scheme")||"system"</script>
  </div>
</header>
${body}
${searchDialog(site.registry)}
<footer data-site-footer>
  <div data-wrap>
    <div>
      <a href="/" data-logo>${LOGO}<span>native-base</span></a>
      <p>CSS for the HTML you already write. MIT licensed. This site loads no web fonts and no client router; only the framework guides load a framework.</p>
    </div>
    <nav aria-label="Docs"><small>Docs</small><a href="/docs/">Getting started</a><a href="/docs/theming/">Theming</a><a href="/docs/registry/">Registry & CLI</a><a href="/playground/">Playground</a></nav>
    <nav aria-label="Library"><small>Library</small><a href="/docs/components/">Components</a><a href="/blocks/">Blocks</a><a href="/templates/">Templates</a><a href="/kitchen-sink/">Kitchen sink</a></nav>
    <nav aria-label="For agents"><small>For agents</small><a href="/llms.txt">llms.txt</a><a href="/llms-full.txt">llms-full.txt</a><a href="/skill/native-base/SKILL.md">Agent skill</a><a href="/r/index.json">Registry JSON</a></nav>
    <nav aria-label="Get it"><small>Get it</small><a href="https://www.npmjs.com/package/@digiup/native-base">npm</a><a href="https://github.com/digiup/native-base">GitHub</a></nav>
  </div>
</footer>
</body>
</html>`;
}

function sidebar(registry, path) {
  const link = ([href, label, badge]) => `<li><a href="${href}"${current(path, href)}>${esc(label)}${badge ? `<span data-badge data-variant="outline">${badge}</span>` : ''}</a></li>`;
  const categories = Map.groupBy(registry.items, (item) => item.category);
  const groups = [...categories].map(
    ([category, items]) => `<h2>${category}</h2><ul>${items.map((item) => link([`/docs/${item.name}/`, item.title, NEW.has(item.name) && 'New'])).join('')}</ul>`,
  );
  return `<nav data-docs-nav aria-label="Documentation">
  <h2>Guides</h2><ul>${GUIDES.map(link).join('')}</ul>
  <h2>Frameworks</h2><ul>${FRAMEWORKS.map(link).join('')}</ul>
  <h2>Library</h2><ul>${[['/docs/components/', 'All components'], ['/blocks/', 'Blocks'], ['/templates/', 'Templates'], ['/kitchen-sink/', 'Kitchen sink']].map(link).join('')}</ul>
  ${groups.join('')}
</nav>`;
}

/** The "On this page" rail: [id, text] pairs, or every h2[id] in the content. Live demos can hold h2s too, so pages with demos pass theirs. */
function outline(content, headings = [...content.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map(([, id, text]) => [id, text])) {
  if (headings.length < 3) return '';
  return `<nav data-toc aria-label="On this page"><small>On this page</small><ol>${headings.map(([id, text]) => `<li><a href="#${id}">${text}</a></li>`).join('')}</ol></nav>`;
}

export function docsPage({ site, path, title, description, content, modules, toc: headings }) {
  const nav = sidebar(site.registry, path);
  const toc = outline(content, headings);
  return page({
    site,
    path,
    title,
    description,
    modules,
    body: `<div data-wrap data-docs${toc ? ' data-has-toc' : ''}>
  <aside>${nav}</aside>
  <dialog id="docs-nav" data-side="left" closedby="any" aria-label="Documentation">
    <button commandfor="docs-nav" command="close" aria-label="Close">✕</button>
    ${nav}
  </dialog>
  <main data-prose>
    <button commandfor="docs-nav" command="show-modal" data-variant="outline" data-size="sm" data-menu-button>${MENU} Browse docs</button>
    ${content}
  </main>
  ${toc ? `<aside data-toc-rail>${toc}</aside>` : ''}
</div>`,
  });
}

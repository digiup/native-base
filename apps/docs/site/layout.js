import { esc } from './html.js';

const MAIN_NAV = [
  ['/docs/', 'Docs'],
  ['/docs/button/', 'Components'],
  ['/kitchen-sink/', 'Kitchen sink'],
  ['/docs/registry/', 'Registry'],
];

const GUIDES = [
  ['/docs/', 'Getting started'],
  ['/docs/registry/', 'Registry & CLI'],
  ['/docs/theming/', 'Theming'],
];

const LOGO = `<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--mark)"/><path d="m12.5 10-6 6 6 6m7-12 6 6-6 6" fill="none" stroke="var(--mark-ink)" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const current = (path, href) => (path === href ? ' aria-current="page"' : '');

export function page({ path, title, description, body }) {
  const nav = MAIN_NAV.map(([href, label]) => {
    const active = href === '/docs/button/' ? path.startsWith('/docs/') && !['/docs/', '/docs/registry/', '/docs/theming/'].includes(path) : path === href;
    return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');

  return `<!doctype html>
<html lang="en" data-transition="slide">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title ? `${esc(title)} · native-base` : 'native-base · UI in a fraction of the tokens'}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg">
<link rel="stylesheet" href="/src/site.css">
<script type="speculationrules">{"prerender":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
<script>addEventListener("pagereveal",(e)=>{if(e.viewTransition&&window.navigation?.activation?.navigationType==="traverse")e.viewTransition.types.add("back")})</script>
<script type="module" src="/src/main.js"></script>
</head>
<body>
<header>
  <nav data-wrap data-topbar aria-label="Main">
    <a href="/" data-logo>${LOGO}<span>native-base</span></a>
    <div data-nav>
      ${nav}
      <select name="color-scheme" aria-label="Color scheme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <script>document.currentScript.previousElementSibling.value=localStorage.getItem("color-scheme")||"system"</script>
    </div>
  </nav>
</header>
${body}
<footer data-wrap data-footer>
  <p>MIT licensed. Built with native-base, Vite and rolldown. This site loads no web fonts, no framework and no client router.</p>
  <p><a href="/llms.txt">llms.txt</a> · <a href="/r/index.json">registry</a> · <a href="/native-base.css">native-base.css</a></p>
</footer>
</body>
</html>`;
}

function sidebar(registry, path) {
  const link = ([href, label]) => `<li><a href="${href}"${current(path, href)}>${esc(label)}</a></li>`;
  const categories = Map.groupBy(registry.items, (item) => item.category);
  const groups = [...categories].map(
    ([category, items]) => `<h2>${category}</h2><ul>${items.map((item) => link([`/docs/${item.name}/`, item.title])).join('')}</ul>`,
  );
  return `<nav data-sidebar aria-label="Documentation"><h2>Guides</h2><ul>${GUIDES.map(link).join('')}</ul>${groups.join('')}</nav>`;
}

export function docsPage({ site, path, title, description, content }) {
  const nav = sidebar(site.registry, path);
  return page({
    path,
    title,
    description,
    body: `<div data-wrap data-docs>
  <aside>${nav}</aside>
  <dialog id="docs-nav" data-side="left" closedby="any" aria-label="Documentation">
    <button commandfor="docs-nav" command="close" aria-label="Close">✕</button>
    ${nav}
  </dialog>
  <main data-prose>
    <button commandfor="docs-nav" command="show-modal" data-variant="outline" data-size="sm" data-menu-button>Browse docs</button>
    ${content}
  </main>
</div>`,
  });
}

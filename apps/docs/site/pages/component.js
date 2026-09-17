import { codeBlock, esc, kb, resolveItems, slug } from '../html.js';
import { docsPage } from '../layout.js';
import { FRAMEWORK_LABELS, translatable, translate } from '../translate.js';

/** "Destructive with icon" → DestructiveWithIcon, so the generated component has a name to export. */
const componentName = (title) => title.replace(/(?:^|[^a-z0-9])([a-z0-9])/gi, (_, character) => character.toUpperCase()).replace(/[^A-Za-z0-9]/g, '');

/** The same example in every framework, switched by the picker in the code bar. */
function variants(ex) {
  if (!translatable(ex.code)) return codeBlock(ex.code, 'html', { tokens: ex.tokens });
  const translated = translate(ex.code, componentName(ex.title));
  const blocks = Object.keys(FRAMEWORK_LABELS).map((framework) => {
    const { code, language, file } = translated[framework];
    return codeBlock(code, language, { label: file, framework, tokens: framework === 'html' ? ex.tokens : undefined });
  });
  return `<div data-variants>${blocks.join('')}</div>`;
}

function example(ex) {
  const id = slug(ex.title);
  return `<section data-example aria-labelledby="${id}">
  <h2 id="${id}">${esc(ex.title)}</h2>
  <figure data-demo>
    ${ex.live ? `<div data-preview>${ex.code}</div>` : ''}
    ${variants(ex)}
  </figure>
</section>`;
}

export default function component(site, item) {
  const { registry } = site;
  const index = registry.items.indexOf(item);
  const prev = registry.items[index - 1];
  const next = registry.items[index + 1];
  const deps = resolveItems(registry, [item.name]);
  const depCount = deps.length - 1;

  const api = Object.entries(item.api)
    .map(([hook, meaning]) => `<tr><td><code>${esc(hook)}</code></td><td>${esc(meaning)}</td></tr>`)
    .join('');

  const install = [
    ['CLI', codeBlock(`npx native-base add ${item.name}`, 'sh')],
    ['URL', codeBlock(deps.map((dep) => `<link rel="stylesheet" href="{origin}/r/${dep.name}.css">`).join('\n'), 'html')],
    ['npm', codeBlock(deps.map((dep) => `@import "@digiup/native-base/components/${dep.name}.css";`).join('\n'), 'css')],
    ['shadcn', codeBlock(`npx shadcn add {origin}/r/${item.name}.json`, 'sh')],
  ];

  const content = `<nav aria-label="Breadcrumb">
  <ol data-breadcrumb><li><a href="/docs/">Docs</a></li><li>${item.category}</li><li aria-current="page">${esc(item.title)}</li></ol>
</nav>
<h1>${esc(item.title)}</h1>
<p data-lead>${esc(item.description)}</p>
<div data-row data-meta>
  <span data-badge>${item.size.gzip.toLocaleString('en')} B gzip</span>
  ${item.native.map((feature) => `<span data-badge data-variant="outline">${esc(feature)}</span>`).join('')}
</div>

${item.examples.map(example).join('')}

<h2 id="api">API</h2>
<table data-api><thead><tr><th>Markup</th><th>Behavior</th></tr></thead><tbody>${api}</tbody></table>

<h2 id="install">Install</h2>
<p>${depCount ? `Brings along ${deps.slice(0, -1).map((dep) => `<a href="/docs/${dep.name}/">${dep.name}</a>`).join(', ')}.` : 'No dependencies.'}</p>
<div data-tabs>
  ${install.map(([label, block], i) => `<details name="install"${i === 0 ? ' open' : ''}><summary>${label}</summary><div>${block}</div></details>`).join('')}
</div>

<h2 id="source">Source</h2>
<details data-source>
  <summary>${item.name}.css <small>${kb(item.size.bytes)} minified · ${item.size.gzip.toLocaleString('en')} B gzip</small></summary>
  ${codeBlock(item.source, 'css', { label: `registry/${item.name}/${item.name}.css` })}
</details>

<nav data-pager aria-label="Pagination">
  ${prev ? `<a href="/docs/${prev.name}/" rel="prev"><small>Previous</small>${esc(prev.title)}</a>` : '<span></span>'}
  ${next ? `<a href="/docs/${next.name}/" rel="next"><small>Next</small>${esc(next.title)}</a>` : ''}
</nav>`;

  return docsPage({ site, path: `/docs/${item.name}/`, title: item.title, description: item.description, content });
}

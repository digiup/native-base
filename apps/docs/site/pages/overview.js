import { esc, kb, slug } from '../html.js';
import { NEW, docsPage } from '../layout.js';

/** Every component as a card with its first live example running in it. */
export default function overview(site) {
  const { registry } = site;
  const groups = [...Map.groupBy(registry.items, (item) => item.category)];

  const card = (item) => {
    const demo = item.examples.find((ex) => ex.live);
    return `<li data-overview-card>
  <div data-overview-demo inert>${demo ? demo.code : ''}</div>
  <a href="/docs/${item.name}/">
    <strong>${esc(item.title)}${NEW.has(item.name) ? ' <span data-badge>New</span>' : ''}</strong>
    <small>${esc(item.description)}</small>
  </a>
</li>`;
  };

  const content = `<h1>Components</h1>
<p data-lead>${registry.items.length} components in ${kb(registry.bundle.size.gzip)} of CSS. Each one is a native element or a single data attribute, and each card below is running its real markup.</p>
<div data-row data-meta>
  ${groups.map(([category, items]) => `<a href="#${slug(category)}"><span data-badge data-variant="outline">${category} · ${items.length}</span></a>`).join('')}
  <a href="/kitchen-sink/"><span data-badge data-variant="secondary">Kitchen sink →</span></a>
</div>
${groups.map(([category, items]) => `<h2 id="${slug(category)}">${category}</h2><ul data-overview>${items.map(card).join('')}</ul>`).join('')}`;

  return docsPage({
    site,
    path: '/docs/components/',
    title: 'Components',
    description: `All ${registry.items.length} native-base components, live.`,
    content,
    toc: groups.map(([category]) => [slug(category), category]),
  });
}

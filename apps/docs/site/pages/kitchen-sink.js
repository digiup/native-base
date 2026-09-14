import { esc, kb } from '../html.js';
import { page } from '../layout.js';

export default function kitchenSink({ registry }) {
  const categories = [...new Set(registry.items.map((item) => item.category))];
  const demos = registry.items.flatMap((item) => item.examples.filter((ex) => ex.live).map((ex) => ({ item, ex })));
  const tokens = demos.reduce((sum, { ex }) => sum + ex.tokens, 0);

  const blocks = demos
    .map(
      ({ item, ex }) => `<section data-sink-item data-category="${item.category}">
  <header><h2><a href="/docs/${item.name}/">${esc(item.title)}</a></h2><small>${esc(ex.title)} · ${ex.tokens} tokens</small></header>
  <div data-sink-demo>${ex.code}</div>
</section>`,
    )
    .join('');

  const body = `<main data-wrap data-sink>
  <header data-sink-head>
    <div>
      <h1>Kitchen sink</h1>
      <p data-lead>${demos.length} live demos, ${tokens.toLocaleString('en')} tokens of HTML in total, one ${kb(registry.bundle.size.gzip)} stylesheet. Filtering below is CSS <code>:has()</code>.</p>
    </div>
    <fieldset data-filter>
      <legend>Show</legend>
      ${categories.map((category) => `<label><input type="checkbox" value="${category}" checked> ${category}</label>`).join('')}
    </fieldset>
  </header>
  <div data-sink-grid>${blocks}</div>
</main>`;

  return page({
    path: '/kitchen-sink/',
    title: 'Kitchen sink',
    description: 'Every native-base component, live on one page.',
    body,
  });
}

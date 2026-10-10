import { STYLE_PRESETS, STYLE_VAR_NAMES, THEME_PRESETS, THEME_VAR_NAMES, slug, styleFrom, themeFrom } from '@digiup/native-base/presets';
import { countTokens } from 'gpt-tokenizer';
import { cases, primaryButton } from '../compare.js';
import { codeBlock, esc, kb } from '../html.js';
import { page } from '../layout.js';

const features = [
  {
    title: 'Dialogs that open themselves',
    text: 'Invoker commands connect a button to a dialog. Focus trapping, Esc and backdrop clicks are the browser’s job.',
    code: '<button commandfor="hi" command="show-modal">',
    lang: 'html',
    demo: `<button commandfor="feature-dialog" command="show-modal" data-variant="outline">Open dialog</button>
<dialog id="feature-dialog" closedby="any" aria-labelledby="feature-dialog-title">
  <header><h2 id="feature-dialog-title">Hello from &lt;dialog&gt;</h2><p>Press Esc or click outside. No JavaScript ran.</p></header>
  <footer><button commandfor="feature-dialog" command="close">Close</button></footer>
</dialog>`,
  },
  {
    title: 'Popovers that find their anchor',
    text: 'The popover attribute handles light dismiss. CSS anchor positioning places it under its trigger and flips it at the edge.',
    code: '<menu popover id="actions">',
    lang: 'html',
    demo: `<button popovertarget="feature-menu" data-variant="outline">Actions</button>
<menu popover id="feature-menu">
  <li><button>Duplicate <kbd>⌘D</kbd></button></li>
  <li><button>Archive</button></li>
  <li><hr></li>
  <li><button data-variant="destructive">Delete</button></li>
</menu>`,
  },
  {
    title: 'Selects you can finally style',
    text: 'appearance: base-select turns the real select into a styleable picker with rich options. Older browsers keep the native one.',
    code: 'select { appearance: base-select }',
    lang: 'css',
    demo: `<select aria-label="Plan">
  <button><selectedcontent></selectedcontent></button>
  <option><span data-badge data-variant="secondary">Free</span> Hobby</option>
  <option selected><span data-badge>$20</span> Pro</option>
  <option><span data-badge data-variant="outline">Custom</span> Enterprise</option>
</select>`,
  },
  {
    title: 'Accordions that animate to auto',
    text: 'A shared name makes details exclusive. ::details-content and interpolate-size animate the height.',
    code: '<details name="faq">',
    lang: 'html',
    demo: `<div>
  <details name="feature-faq" open><summary>Does it need JavaScript?</summary><p>No. Not for this, anyway.</p></details>
  <details name="feature-faq"><summary>Does it animate?</summary><p>To height: auto, in CSS.</p></details>
</div>`,
  },
  {
    title: 'Validation without state',
    text: ':user-invalid waits until someone has touched the field, so errors never shout at an empty form.',
    code: 'label:has(:user-invalid) [data-error]',
    lang: 'css',
    demo: `<label>
  Work email
  <input type="email" placeholder="Type, then tab away" required>
  <small data-error>That doesn’t look like an email.</small>
</label>`,
  },
  {
    title: 'Page transitions without a router',
    text: 'One at-rule animates every same-origin navigation. This site has no client router: every page is a real document.',
    code: '@view-transition { navigation: auto }',
    lang: 'css',
    demo: `<a href="/docs/" data-variant="outline">Navigate to the docs →</a>`,
  },
];

const install = [
  ['Everything, one tag', '<link rel="stylesheet" href="{origin}/native-base.css">', 'html'],
  ['Just what you use, from npm', '@import "@digiup/native-base/components/dialog.css";', 'css'],
  ['Own the source', 'npx native-base add dialog select', 'sh'],
  ['A whole section', 'npx native-base add block-hero-centered', 'sh'],
];

const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
  home: icon('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>'),
  chart: icon('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>'),
  users: icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  box: icon('<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
  gear: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
  check: icon('<path d="M20 6 9 17l-5-5"/>'),
  arrow: icon('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
};

const bars = [38, 52, 44, 61, 58, 73, 66, 81, 77, 92, 86, 98];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * The hero: a real dashboard pulled apart into layers in 3D. Scrolling (a scroll-driven animation on one
 * registered number, --explode) puts it back together. Every layer is ordinary native-base markup.
 */
const scene = `<div data-scene-stage aria-hidden="true" inert>
  <div data-scene>
    <div data-layer="app">
      <aside>
        <strong>${ICONS.box} Northwind</strong>
        <a aria-current="page">${ICONS.home} Overview</a>
        <a>${ICONS.chart} Analytics</a>
        <a>${ICONS.users} Customers <span data-badge data-variant="secondary">12</span></a>
        <a>${ICONS.gear} Settings</a>
        <footer><span data-avatar data-size="sm">AL</span> Ada Lovelace</footer>
      </aside>
      <header>
        <strong>Overview</strong>
        <fieldset data-segmented data-size="sm"><label><input type="radio" name="scene-range"> 7d</label><label><input type="radio" name="scene-range" checked> 30d</label><label><input type="radio" name="scene-range"> 90d</label></fieldset>
        <button data-size="sm">Export</button>
      </header>
    </div>
    <div data-layer="stats">
      <article data-card data-stat><small>Revenue</small><strong>$48,290</strong><span data-trend="up">12.4%</span></article>
      <article data-card data-stat><small>Active users</small><strong>8,912</strong><span data-trend="up">5.1%</span></article>
      <article data-card data-stat><small>Churn</small><strong>1.8%</strong><span data-trend="down">0.4%</span></article>
    </div>
    <div data-layer="panels">
      <article data-card>
        <header><h3>Revenue</h3><p>Last 12 months</p></header>
        <ul data-chart style="--max: 100">${bars.map((v, i) => `<li style="--v: ${v}"${i === 9 ? ' aria-current="true"' : ''}><span>${MONTHS[i][0]}</span></li>`).join('')}</ul>
      </article>
      <article data-card>
        <header><h3>Recent orders</h3></header>
        <table><tbody>
          <tr><td>#3201</td><td><span data-badge data-variant="success">Paid</span></td><td data-numeric>$420</td></tr>
          <tr><td>#3200</td><td><span data-badge data-variant="warning">Pending</span></td><td data-numeric>$1,280</td></tr>
          <tr><td>#3199</td><td><span data-badge data-variant="success">Paid</span></td><td data-numeric>$96</td></tr>
          <tr><td>#3198</td><td><span data-badge data-variant="destructive">Failed</span></td><td data-numeric>$310</td></tr>
        </tbody></table>
      </article>
    </div>
    <div data-layer="float">
      <menu popover>
        <li><small>Export as</small></li>
        <li><button>CSV <kbd>⌘E</kbd></button></li>
        <li><button>PDF report</button></li>
        <li><hr></li>
        <li><button data-variant="destructive">Clear filters</button></li>
      </menu>
      <output popover data-toast data-variant="success"><strong>Report scheduled</strong><p>Every Monday at 9:00.</p></output>
    </div>
    <code data-callout>&lt;div data-shell&gt;</code>
    <code data-callout>data-stat</code>
    <code data-callout>&lt;ul data-chart&gt;</code>
    <code data-callout>&lt;menu popover&gt;</code>
  </div>
</div>`;

/** Preset → declarations. Themes keep both halves through light-dark(), so the color-scheme switch still applies. */
function presetRules() {
  const styleRules = STYLE_PRESETS.map((preset) => {
    const { vars } = styleFrom(preset);
    const decls = STYLE_VAR_NAMES.map((name) => `${name}: ${vars[name]};`).join(' ');
    return `[data-restyle]:has([name=home-style][value=${slug(preset.name)}]:checked) [data-restyled] { ${decls} }`;
  });
  const themeRules = THEME_PRESETS.slice(1).map((preset) => {
    const { light, dark } = themeFrom(preset);
    const decls = THEME_VAR_NAMES.map((name) => `${name}: ${light[name] === dark[name] ? light[name] : `light-dark(${light[name]}, ${dark[name]})`};`).join(' ');
    return `[data-restyle]:has([name=home-theme][value=${slug(preset.name)}]:checked) [data-restyled] { ${decls} }`;
  });
  return [...styleRules, ...themeRules].join('\n');
}

const chips = (name, presets, first) =>
  presets
    .map((preset, i) => `<label title="${esc(preset.note)}"><input type="radio" name="${name}" value="${slug(preset.name)}"${i === first ? ' checked' : ''}> ${esc(preset.name)}</label>`)
    .join('');

/** One composition, restyled by whichever chips are checked. */
const restyled = `<div data-restyled>
  <form data-card>
    <header><h3>Sign in to Northwind</h3><p>Welcome back. Pick up where you left off.</p></header>
    <label>Email <input type="email" placeholder="ada@northwind.dev" required><small data-error>Enter a valid email.</small></label>
    <label>Password <input type="password" value="hunter22"></label>
    <label><input type="checkbox" role="switch" checked> Remember this device</label>
    <button type="button">Continue</button>
  </form>
  <div data-stack>
    <article data-card>
      <header><h3>Pro <span data-badge>Popular</span></h3><p>For teams shipping every day.</p></header>
      <p data-price><strong>$24</strong> per seat / month</p>
      <ul data-checks><li>${ICONS.check} Unlimited projects</li><li>${ICONS.check} Preview deployments</li><li>${ICONS.check} Audit log</li></ul>
      <footer><button type="button">Upgrade</button><button type="button" data-variant="outline">Compare</button></footer>
    </article>
    <div data-alert data-variant="success">${ICONS.check}<strong>Deploy finished</strong><p>main → production in 41 s.</p></div>
  </div>
  <div data-stack>
    <article data-card data-stat><small>Monthly revenue</small><strong>$128.4k</strong><span data-trend="up">8.2%</span><p>vs. last month</p></article>
    <article data-card>
      <header><h3>Team</h3></header>
      <div data-row><span data-avatar>AL</span><span data-avatar>GH</span><span data-avatar>KJ</span><span data-badge data-variant="outline">+4</span></div>
      <label>Storage <small>72 of 100 GB</small><progress value="72" max="100"></progress></label>
      <fieldset data-segmented aria-label="Plan period"><label><input type="radio" name="restyle-period" checked> Monthly</label><label><input type="radio" name="restyle-period"> Yearly</label></fieldset>
    </article>
  </div>
</div>`;

export default function home(site) {
  const { registry, llms } = site;
  const measured = cases.map((item) => ({ ...item, tw: countTokens(item.tailwind), nb: countTokens(item.native) }));
  const percent = (tw, nb) => Math.round((1 - nb / tw) * 100);
  const overall = percent(
    measured.reduce((sum, item) => sum + item.tw, 0),
    measured.reduce((sum, item) => sum + item.nb, 0),
  );
  const classCount = primaryButton.split(/\s+/).length;
  const largest = Math.max(...registry.items.map((item) => item.size.gzip));
  const llmsExcerpt = llms.split('\n').slice(0, 26).join('\n');
  const showcase = ['dashboard', 'landing', 'mail', 'product', 'settings', 'pricing'].map((name) => registry.templates.find((t) => t.name === name)).filter(Boolean);

  const tabs = measured
    .map(
      (item) => `<details name="compare"${item.id === 'login' ? ' open' : ''}>
  <summary>${item.title}</summary>
  <div data-compare>
    <div data-compare-preview>${item.native}</div>
    <div data-compare-meters>
      <div data-meter><span>Tailwind</span><i style="--v: ${item.tw}; --max: ${item.tw}"></i><strong>${item.tw}</strong></div>
      <div data-meter data-ours><span>native-base</span><i style="--v: ${item.nb}; --max: ${item.tw}"></i><strong>${item.nb}</strong></div>
      <p><strong>${percent(item.tw, item.nb)}% fewer tokens.</strong> ${item.note ? esc(item.note) : ''}</p>
    </div>
    <div data-compare-code>
      ${codeBlock(item.native, 'html', { label: 'native-base', tokens: item.nb })}
      <div data-tailwind>${codeBlock(item.tailwind, 'html', { label: 'Tailwind, shadcn/ui classes', tokens: item.tw })}</div>
    </div>
  </div>
</details>`,
    )
    .join('');

  const featureCards = features
    .map(
      (feature, i) => `<li data-bento-card>
  <div data-bento-demo>${feature.demo}</div>
  <div>
    <small>${String(i + 1).padStart(2, '0')}</small>
    <h3>${feature.title}</h3>
    <p>${esc(feature.text)}</p>
    ${codeBlock(feature.code, feature.lang)}
  </div>
</li>`,
    )
    .join('');

  const sizeRows = registry.items
    .map(
      (item) => `<tr>
  <td><a href="/docs/${item.name}/">${item.title}</a></td>
  <td data-size-bar><i style="--v: ${item.size.gzip}; --max: ${largest}"></i></td>
  <td data-numeric>${item.size.gzip.toLocaleString('en')} B</td>
</tr>`,
    )
    .join('');

  const body = `<main data-home>
<section data-home-hero data-theme="dark">
  <div data-wrap data-hero-copy>
    <a href="/blocks/" data-pill><span data-badge>New</span> ${registry.blocks.length} blocks and ${registry.templates.length} full-page templates ${ICONS.arrow}</a>
    <h1>Write <code>&lt;button&gt;</code>.<br>Skip the <s>${classCount}&nbsp;classes</s>.</h1>
    <p data-lead>native-base styles the HTML you already know. No utility classes, no runtime, no Tailwind. Your AI reads less, writes less, and ships the same interface.</p>
    <div data-row data-cta>
      <a href="/docs/" data-variant data-size="lg">Get started</a>
      <a href="/templates/" data-variant="outline" data-size="lg">Browse templates</a>
    </div>
    ${codeBlock('npx native-base add dialog', 'sh')}
  </div>
  ${scene}
</section>

<section data-proof>
  <dl data-wrap>
    <div><dt>Components</dt><dd>${registry.items.length}</dd></div>
    <div><dt>Blocks · templates</dt><dd>${registry.blocks.length} · ${registry.templates.length}</dd></div>
    <div><dt>CSS, gzipped</dt><dd>${kb(registry.bundle.size.gzip)}</dd></div>
    <div><dt>JavaScript</dt><dd>0 KB</dd></div>
    <div><dt>Fewer tokens</dt><dd>${overall}%</dd></div>
  </dl>
</section>

<section data-band data-restyle id="styles">
  <style>${presetRules()}</style>
  <div data-wrap>
    <header data-band-head>
      <h2>One markup. Every style.</h2>
      <p>A theme sets the colors; a style sets spacing, type, corner shape, borders and motion. Click through them: the HTML below never changes. This switcher is CSS <code>:has()</code>, with no JavaScript.</p>
    </header>
    <div data-restyle-controls>
      <fieldset data-chips><legend>Style</legend>${chips('home-style', STYLE_PRESETS, 0)}</fieldset>
      <fieldset data-chips><legend>Theme</legend><label><input type="radio" name="home-theme" value="site" checked> This site</label>${chips('home-theme', THEME_PRESETS.slice(1), -1)}</fieldset>
    </div>
    ${restyled}
    <p data-band-foot><a href="/playground/">Build your own theme and style in the playground ${ICONS.arrow}</a></p>
  </div>
</section>

<section data-band id="compare">
  <div data-wrap>
    <header data-band-head>
      <h2>Same interface. ${overall}% fewer tokens.</h2>
      <p>Each pair renders the same UI. The Tailwind side uses shadcn/ui’s class strings, which your model reads and writes whether they live in your JSX or in <code>components/ui</code>. Counted at build time with the o200k_base tokenizer.</p>
    </header>
    <div data-tabs data-compare-tabs>${tabs}</div>
  </div>
</section>

<section data-band data-why data-theme="dark">
  <div data-wrap>
    <h2>Tokens are the new bundle size.</h2>
    <dl>
      <div><dt>Input</dt><dd>Every file an agent opens is billed. Markup without class soup means more of your app fits in the window.</dd></div>
      <div><dt>Output</dt><dd>Generated tokens are the slow, expensive ones. Fewer attributes to write means faster, cheaper edits.</dd></div>
      <div><dt>Accuracy</dt><dd>There is no class vocabulary to hallucinate. <code>&lt;dialog&gt;</code> has meant the same thing since 2022.</dd></div>
    </dl>
  </div>
</section>

<section data-band id="platform">
  <div data-wrap>
    <header data-band-head>
      <h2>The browser already built your component library.</h2>
      <p>native-base is mostly a stylesheet for features that shipped while everyone was busy re-implementing them in JavaScript. Every card is live: open the dialog, the menu, the select.</p>
    </header>
    <ol data-bento>${featureCards}</ol>
  </div>
</section>

<section data-band data-showcase id="templates">
  <div data-wrap>
    <header data-band-head>
      <h2>Then whole pages.</h2>
      <p>${registry.blocks.length} blocks and ${registry.templates.length} templates composed from the same components: dashboards, inboxes, landing pages, checkouts. Each one is plain HTML you can read in a minute, and installs with the components it uses.</p>
    </header>
  </div>
  <div data-wall aria-label="Templates">
    ${showcase.map((t) => `<a href="/templates/${t.name}/" data-wall-card><iframe src="/templates/${t.name}/" title="${esc(t.title)}" loading="lazy" tabindex="-1" inert></iframe><span>${esc(t.title)}</span></a>`).join('')}
  </div>
  <div data-wrap data-row data-showcase-cta>
    <a href="/templates/" data-variant data-size="lg">All templates</a>
    <a href="/blocks/" data-variant="outline" data-size="lg">Browse ${registry.blocks.length} blocks</a>
  </div>
</section>

<section data-band data-llms>
  <div data-wrap data-home-split>
    <header>
      <h2>The entire API is ${registry.llms.tokens.toLocaleString('en')} tokens.</h2>
      <p><a href="/llms.txt">llms.txt</a> lists every markup hook and one example per component. Put it in a system prompt and your model knows the whole kit. Or install the agent skill, which also carries every block and template.</p>
      ${codeBlock('npx native-base skill', 'sh')}
    </header>
    <div data-llms-file>${codeBlock(llmsExcerpt, 'md', { label: 'llms.txt', tokens: registry.llms.tokens })}</div>
  </div>
</section>

<section data-band id="registry">
  <div data-wrap data-home-split>
    <header>
      <h2>Own the code, shadcn-style.</h2>
      <p>Every component, block and template is a registry item: JSON and CSS over plain GET. Link it, import it, or copy the source into your project and make it yours.</p>
      <a href="/docs/registry/" data-variant="outline">Registry and CLI docs</a>
    </header>
    <dl data-install>
      ${install.map(([title, code, lang]) => `<div><dt>${title}</dt><dd>${codeBlock(code, lang)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<section data-band id="sizes">
  <div data-wrap data-home-split>
    <header>
      <h2>Every byte, itemized.</h2>
      <p>All ${registry.items.length} components weigh ${kb(registry.bundle.size.gzip)} gzipped, ${kb(registry.bundle.size.brotli)} with brotli. Or take only the rows you need.</p>
    </header>
    <table data-sizes>
      <caption>Minified and gzipped, per registry item</caption>
      <tbody>${sizeRows}</tbody>
    </table>
  </div>
</section>

<section data-closing data-theme="dark">
  <div data-wrap>
    <h2>Stop paying for class names.</h2>
    <div data-row>
      <a href="/docs/" data-variant data-size="lg">Read the docs</a>
      <a href="/blocks/" data-variant="outline" data-size="lg">Browse blocks</a>
    </div>
  </div>
</section>
</main>`;

  return page({
    site,
    path: '/',
    description: `A classless, registry-driven UI kit on native HTML. ${registry.items.length} components, ${registry.blocks.length} blocks and ${registry.templates.length} templates. ${overall}% fewer tokens than Tailwind markup, ${kb(registry.bundle.size.gzip)} of CSS, no JavaScript.`,
    body,
  });
}

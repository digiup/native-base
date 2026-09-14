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
  ['Just what you use, from npm', '@import "@native-base/css/components/dialog.css";', 'css'],
  ['Own the source', 'npx native-base add dialog select', 'sh'],
  ['Or with the shadcn CLI', 'npx shadcn add {origin}/r/dialog.json', 'sh'],
];

export default function home({ registry, llms }) {
  const measured = cases.map((item) => ({ ...item, tw: countTokens(item.tailwind), nb: countTokens(item.native) }));
  const login = measured.find((item) => item.id === 'login');
  const percent = (tw, nb) => Math.round((1 - nb / tw) * 100);
  const overall = percent(
    measured.reduce((sum, item) => sum + item.tw, 0),
    measured.reduce((sum, item) => sum + item.nb, 0),
  );
  const classCount = primaryButton.split(/\s+/).length;
  const largest = Math.max(...registry.items.map((item) => item.size.gzip));
  const llmsExcerpt = llms.split('\n').slice(0, 26).join('\n');

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

  const featureRows = features
    .map(
      (feature) => `<li data-feature>
  <div>
    <h3>${feature.title}</h3>
    <p>${esc(feature.text)}</p>
    ${codeBlock(feature.code, feature.lang)}
  </div>
  <div data-feature-demo>${feature.demo}</div>
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
<section data-hero>
  <div data-wrap data-hero-grid>
    <div data-hero-copy>
      <p data-kicker>${registry.items.length} components on native HTML · v${registry.version}</p>
      <h1>Write <code>&lt;button&gt;</code>.<br>Skip the <s>${classCount}&nbsp;classes</s>.</h1>
      <p data-lead>native-base styles the HTML you already know. No utility classes, no runtime, no Tailwind. Your AI reads less, writes less, and ships the same interface.</p>
      <div data-row data-cta>
        <a href="/docs/" data-variant data-size="lg">Get started</a>
        <a href="/kitchen-sink/" data-variant="outline" data-size="lg">See every component</a>
      </div>
      ${codeBlock('npx native-base add dialog', 'sh')}
    </div>
    <figure data-receipt aria-labelledby="receipt-title">
      <figcaption id="receipt-title"><strong>Token receipt</strong><span>Login card · o200k_base</span></figcaption>
      <dl>
        <div><dt>Tailwind markup</dt><dd>${login.tw}</dd></div>
        <div><dt>native-base markup</dt><dd>${login.nb}</dd></div>
        <div><dt>JavaScript required</dt><dd>0 KB</dd></div>
        <div><dt>CSS for all ${registry.items.length}</dt><dd>${kb(registry.bundle.size.gzip)}</dd></div>
      </dl>
      <p data-total><span>Tokens saved</span><strong>${percent(login.tw, login.nb)}%</strong></p>
      <p data-thanks>Thank you for not writing class names</p>
    </figure>
  </div>
</section>

<section data-section id="compare">
  <div data-wrap>
    <header data-section-head>
      <h2>Same interface. ${overall}% fewer tokens.</h2>
      <p>Each pair renders the same UI. The Tailwind side uses shadcn/ui’s class strings, which your model reads and writes whether they live in your JSX or in <code>components/ui</code>. Counted at build time with the o200k_base tokenizer.</p>
    </header>
    <div data-tabs data-compare-tabs>${tabs}</div>
  </div>
</section>

<section data-section data-why>
  <div data-wrap>
    <h2>Tokens are the new bundle size.</h2>
    <dl>
      <div><dt>Input</dt><dd>Every file an agent opens is billed. Markup without class soup means more of your app fits in the window.</dd></div>
      <div><dt>Output</dt><dd>Generated tokens are the slow, expensive ones. Fewer attributes to write means faster, cheaper edits.</dd></div>
      <div><dt>Accuracy</dt><dd>There is no class vocabulary to hallucinate. <code>&lt;dialog&gt;</code> has meant the same thing since 2022.</dd></div>
    </dl>
  </div>
</section>

<section data-section id="platform">
  <div data-wrap>
    <header data-section-head>
      <h2>The browser already built your component library.</h2>
      <p>native-base is mostly a stylesheet for features that shipped while everyone was busy re-implementing them in JavaScript. Try them; these are live.</p>
    </header>
    <ol data-features>${featureRows}</ol>
  </div>
</section>

<section data-section data-llms>
  <div data-wrap data-split>
    <header>
      <h2>The entire API is ${registry.llms.tokens.toLocaleString('en')} tokens.</h2>
      <p><a href="/llms.txt">llms.txt</a> lists every markup hook and one example per component. Put it in a system prompt and your model knows the whole kit.</p>
      ${codeBlock('curl {origin}/llms.txt', 'sh')}
    </header>
    <div data-llms-file>${codeBlock(llmsExcerpt, 'md', { label: 'llms.txt', tokens: registry.llms.tokens })}</div>
  </div>
</section>

<section data-section id="registry">
  <div data-wrap data-split>
    <header>
      <h2>Own the code, shadcn-style.</h2>
      <p>Every component is a registry item: JSON and CSS over plain GET. Link it, import it, or copy the source into your project and make it yours.</p>
      <a href="/docs/registry/" data-variant="outline">Registry and CLI docs</a>
    </header>
    <dl data-install>
      ${install.map(([title, code, lang]) => `<div><dt>${title}</dt><dd>${codeBlock(code, lang)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<section data-section id="sizes">
  <div data-wrap data-split>
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

<section data-hero data-closing>
  <div data-wrap>
    <h2>Stop paying for class names.</h2>
    <div data-row>
      <a href="/docs/" data-variant data-size="lg">Read the docs</a>
      <a href="/kitchen-sink/" data-variant="outline" data-size="lg">Open the kitchen sink</a>
    </div>
  </div>
</section>
</main>`;

  return page({
    path: '/',
    description: `A classless, registry-driven UI kit on native HTML. ${overall}% fewer tokens than Tailwind markup, ${kb(registry.bundle.size.gzip)} of CSS, no JavaScript.`,
    body,
  });
}

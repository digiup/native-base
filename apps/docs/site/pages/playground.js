import { SEED_FIELDS, STYLE_PRESETS, STYLE_VARS, THEME_PRESETS, THEME_VARS } from '@digiup/native-base/presets';
import { codeBlock, esc } from '../html.js';
import { page } from '../layout.js';

const BELL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
const INFO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

/** One copy of the preview. Ids carry a suffix so the light and dark copies can coexist. */
function preview(scheme) {
  const id = (name) => `pg-${name}-${scheme}`;
  return `<div data-pg-preview data-theme="${scheme}" aria-label="${scheme} preview">
  <div data-pg-app>
    <header data-row="between">
      <ol data-breadcrumb><li><a href="#">Acme</a></li><li><a href="#">Settings</a></li><li aria-current="page">Billing</li></ol>
      <div data-row>
        <button type="button" data-variant="ghost" data-size="icon" data-tooltip="Notifications" aria-label="Notifications">${BELL}</button>
        <div data-group><span data-avatar style="--_h: 2rem">FK</span><span data-avatar style="--_h: 2rem">AL</span><span data-avatar style="--_h: 2rem">+3</span></div>
      </div>
    </header>
    <div>
      <h2>Billing</h2>
      <p>You’re on the <strong>Hobby</strong> plan. Body copy with <a href="#">a link</a>, <code>inline code</code>, <kbd>⌘K</kbd> and <small>small print</small>.</p>
    </div>
    <div data-grid style="--min: 15rem">
      <article data-card>
        <header><h3>Upgrade to Pro</h3><p>Unlimited projects and priority support.</p></header>
        <label>Seats <input type="number" value="3" min="1"></label>
        <label>Billing email <input type="email" placeholder="you@company.com" required><small data-hint>Receipts go here.</small><small data-error>Enter a valid email.</small></label>
        <label>Plan
          <select aria-label="Plan">
            <button><selectedcontent></selectedcontent></button>
            <option><span data-badge data-variant="secondary">Free</span> Hobby</option>
            <option selected><span data-badge>$20</span> Pro</option>
            <option><span data-badge data-variant="outline">Custom</span> Enterprise</option>
          </select>
        </label>
        <label><input type="checkbox" role="switch" checked> Annual billing</label>
        <footer data-row="between"><span data-badge>Save 20%</span><button commandfor="${id('dialog')}" command="show-modal">Upgrade</button></footer>
      </article>
      <div data-stack>
        <div data-alert>${INFO}<strong>Card expiring</strong><p>Your card ending in 4242 expires next month.</p></div>
        <div data-alert data-variant="success">${CHECK}<strong>Backup complete</strong><p>All 12 projects are safe.</p></div>
        <label>Storage <small>68% of 100 GB</small><progress value="68" max="100"></progress></label>
        <div data-tabs>
          <details name="${id('tabs')}" open><summary>Members</summary><div>
            <table>
              <thead><tr><th>Name</th><th>Role</th><th data-numeric>Seats</th></tr></thead>
              <tbody>
                <tr><td>Faisal</td><td><span data-badge data-variant="secondary">Owner</span></td><td data-numeric>1</td></tr>
                <tr><td>Alex</td><td>Admin</td><td data-numeric>2</td></tr>
              </tbody>
            </table>
          </div></details>
          <details name="${id('tabs')}"><summary>Invoices</summary><div><p>No invoices yet.</p></div></details>
        </div>
      </div>
    </div>
    <div data-row>
      <button type="button">Primary</button>
      <button type="button" data-variant="secondary">Secondary</button>
      <button type="button" data-variant="outline">Outline</button>
      <button type="button" data-variant="ghost">Ghost</button>
      <button type="button" data-variant="link">Link</button>
      <button type="button" data-variant="destructive">Delete</button>
      <button type="button" data-size="sm">Small</button>
      <button type="button" data-size="lg">Large</button>
      <button type="button" aria-busy="true">Saving</button>
      <button type="button" disabled>Disabled</button>
      <button type="button" popovertarget="${id('menu')}" data-variant="outline">Actions</button>
      <menu popover id="${id('menu')}">
        <li><small>Project</small></li>
        <li><button type="button">Duplicate <kbd>⌘D</kbd></button></li>
        <li><button type="button">Archive</button></li>
        <li><hr></li>
        <li><button type="button" data-variant="destructive">Delete</button></li>
      </menu>
    </div>
    <div data-row>
      <label><input type="checkbox" checked> Email me</label>
      <label><input type="checkbox"> Weekly digest</label>
      <fieldset data-row><legend hidden>Visibility</legend><label><input type="radio" name="${id('vis')}" checked> Public</label><label><input type="radio" name="${id('vis')}"> Private</label></fieldset>
      <span data-badge data-variant="outline">Outline</span><span data-badge data-variant="destructive">Overdue</span><span data-badge data-variant="warning">Trial</span>
    </div>
    <div>
      <details name="${id('faq')}"><summary>Can I cancel anytime?</summary><p>Yes. Your plan stays active until the end of the period.</p></details>
      <details name="${id('faq')}"><summary>Do you offer refunds?</summary><p>Within 14 days, no questions asked.</p></details>
    </div>
    <dialog id="${id('dialog')}" closedby="any" aria-labelledby="${id('dialog-title')}">
      <button commandfor="${id('dialog')}" command="close" aria-label="Close">✕</button>
      <header><h2 id="${id('dialog-title')}">Confirm upgrade</h2><p>3 seats on Pro, billed annually: $576 today.</p></header>
      <label>Coupon <input placeholder="Optional"></label>
      <footer><button commandfor="${id('dialog')}" command="close" data-variant="outline">Cancel</button><button commandfor="${id('dialog')}" command="close">Pay $576</button></footer>
    </dialog>
  </div>
</div>`;
}

const chips = (kind, presets) =>
  `<div data-pg-chips data-kind="${kind}" role="group" aria-label="${kind} presets">${presets.map((p) => `<button type="button" data-chip data-name="${esc(p.name)}"${p.note ? ` title="${esc(p.note)}"` : ''} aria-pressed="false">${esc(p.name)}</button>`).join('')}</div>`;

function themePanel() {
  const seeds = SEED_FIELDS.map(
    ({ key, label, min, max, step, hint }) => `<label data-pg-var data-seed="${key}">
      <span data-pg-label>${label}<output></output>${hint ? `<small>${hint}</small>` : ''}</span>
      <input type="range" name="${key}" min="${min}" max="${max}" step="${step}">
    </label>`,
  ).join('');

  const groups = Map.groupBy(THEME_VARS, ([, , group]) => group);
  const rows = [...groups]
    .map(
      ([group, vars]) => `<h3>${group}</h3>${vars
        .map(
          ([name, label]) => `<div data-pg-color data-var="${name}">
        <span data-pg-label><code>${name}</code><small>${esc(label)}</small><button type="button" data-reset data-variant="ghost" data-size="sm" hidden title="Back to generated value">↺</button></span>
        ${['light', 'dark']
          .map(
            (scheme) => `<span data-pg-swatch>
          <input type="color" data-scheme="${scheme}" aria-label="${esc(label)}, ${scheme} picker">
          <input type="text" data-scheme="${scheme}" aria-label="${esc(label)}, ${scheme}" spellcheck="false">
        </span>`,
          )
          .join('')}
      </div>`,
        )
        .join('')}`,
    )
    .join('');

  return `<section data-pg-section data-kind="theme">
  <header><h2>Theme</h2><p>Colors only. Light and dark at once, as <code>light-dark()</code>.</p></header>
  ${chips('theme', THEME_PRESETS)}
  <div data-row data-pg-save>
    <input name="theme-name" aria-label="Theme name" placeholder="Theme name">
    <button type="button" data-save="theme" data-variant="outline">Save</button>
  </div>
  <fieldset data-pg-seed>
    <legend data-row="between">Quick <button type="button" data-random data-variant="ghost" data-size="sm">Surprise me</button></legend>
    <p data-pg-imported hidden><small>Imported colors. Moving a slider regenerates all unlocked ones.</small></p>
    ${seeds}
    <label><input type="checkbox" name="tintFollows" checked> Tint follows hue</label>
  </fieldset>
  <details data-pg-all>
    <summary>All colors <small>${THEME_VARS.length} variables × 2 schemes</small></summary>
    <p><small>Edit any value; it stays put while the sliders regenerate the rest. Any CSS color works.</small></p>
    <div data-pg-colors>
      <div data-pg-colhead><span></span><span>Light</span><span>Dark</span></div>
      ${rows}
    </div>
  </details>
</section>`;
}

function stylePanel() {
  const groups = Map.groupBy(STYLE_VARS, (v) => v.group);
  const control = (v) => {
    if (v.type === 'range') return `<input type="range" min="${v.min}" max="${v.max}" step="${v.step}" aria-label="${esc(v.label)}">`;
    const options = Object.entries(v.options).map(([label, value]) => `<option value="${esc(value)}">${esc(label)}</option>`);
    return `<select aria-label="${esc(v.label)}">${options.join('')}<option value="">Custom</option></select>`;
  };
  const sets = [...groups]
    .map(
      ([group, vars]) => `<fieldset><legend>${group}</legend>${vars
        .map(
          (v) => `<div data-pg-var data-var="${v.name}" data-type="${v.type}"${v.unit != null ? ` data-unit="${v.unit}"` : ''}>
      <span data-pg-label><code>${v.name}</code>${v.hint ? `<small>${esc(v.hint)}</small>` : ''}</span>
      ${control(v)}
      <input type="text" data-raw aria-label="${esc(v.label)} value" spellcheck="false">
    </div>`,
        )
        .join('')}</fieldset>`,
    )
    .join('');

  return `<section data-pg-section data-kind="style">
  <header><h2>Style</h2><p>Everything that isn’t a color: spacing, shape, type and motion.</p></header>
  ${chips('style', STYLE_PRESETS)}
  <p data-pg-note><small></small></p>
  <div data-row data-pg-save>
    <input name="style-name" aria-label="Style name" placeholder="Style name">
    <button type="button" data-save="style" data-variant="outline">Save</button>
  </div>
  ${sets}
</section>`;
}

export default function playground() {
  const body = `<main data-wrap data-pg>
  <header data-pg-head>
    <div>
      <h1>Playground</h1>
      <p data-lead>A <strong>theme</strong> is colors. A <strong>style</strong> is spacing, shape, type and motion. Mix any theme with any style, tweak every variable, then export one <code>:root</code> block.</p>
    </div>
    <div data-row data-pg-tools>
      <fieldset data-row data-pg-scheme>
        <legend hidden>Preview scheme</legend>
        <label><input type="radio" name="pg-scheme" value="light"> Light</label>
        <label><input type="radio" name="pg-scheme" value="dark"> Dark</label>
        <label><input type="radio" name="pg-scheme" value="both" checked> Both</label>
      </fieldset>
      <button type="button" data-share data-variant="outline">Copy link</button>
      <button type="button" data-reset-all data-variant="ghost">Reset</button>
    </div>
  </header>

  <div data-pg-layout>
    <aside data-pg-panel>
      ${themePanel()}
      ${stylePanel()}
    </aside>
    <section data-pg-stage aria-label="Preview">
      ${preview('light')}
      ${preview('dark')}
    </section>
  </div>

  <section data-pg-export id="export">
    <header data-row="between">
      <h2>Export</h2>
      <fieldset data-row data-pg-include>
        <legend hidden>Include</legend>
        <label><input type="checkbox" name="include-theme" checked> Theme</label>
        <label><input type="checkbox" name="include-style" checked> Style</label>
      </fieldset>
    </header>
    <p>Themes and styles are independent, so export either half and combine it with another later. Paste the CSS unlayered anywhere after native-base and it wins, or let the CLI write it for you.</p>
    <div data-tabs>
      <details name="pg-export" open data-export="sh"><summary>CLI</summary><div>
        ${codeBlock('npx native-base theme neutral --style meridian', 'sh', { label: 'terminal' })}
        <p data-pg-cli-note><small></small></p>
      </div></details>
      <details name="pg-export" data-export="css"><summary>CSS</summary><div>
        ${codeBlock('/* … */', 'css', { label: 'native-base-theme.css' })}
        <div data-row><a data-variant="outline" data-size="sm" data-download="css" download="native-base-theme.css" href="#">Download CSS</a></div>
      </div></details>
      <details name="pg-export" data-export="json"><summary>JSON</summary><div>
        ${codeBlock('{}', 'json', { label: 'native-base-theme.json' })}
        <div data-row><a data-variant="outline" data-size="sm" data-download="json" download="native-base-theme.json" href="#">Download JSON</a></div>
      </div></details>
      <details name="pg-export"><summary>Import</summary><div data-stack>
        <label>Paste CSS or JSON
          <textarea data-import rows="6" placeholder=":root { --primary: oklch(.55 .2 265); --radius: .5rem; }&#10;.dark { --primary: oklch(.72 .2 265); }" spellcheck="false"></textarea>
          <small>Our export, a shadcn/ui theme (<code>:root</code> and <code>.dark</code> blocks), or any CSS with these variables in it.</small>
        </label>
        <div data-row><button type="button" data-import-run>Import</button><output data-import-status></output></div>
      </div></details>
    </div>
  </section>
</main>`;

  return page({
    path: '/playground/',
    title: 'Playground',
    description: 'Compose a native-base theme (colors) with a style (spacing, type, radius, motion), tweak every variable, export CSS.',
    body,
    styles: ['/src/playground.css'],
    modules: ['/src/playground.js'],
  });
}

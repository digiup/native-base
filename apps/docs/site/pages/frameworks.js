import { readFileSync } from 'node:fs';
import { codeBlock, esc, slug } from '../html.js';
import { docsPage } from '../layout.js';

/** Demos are read off disk and mounted on the page, so the code shown is the code running. */
const source = (framework, file) => readFileSync(new URL(`../../src/${framework}/${file}`, import.meta.url), 'utf8').trim();

const LANGUAGE = { jsx: 'jsx', vue: 'html', svelte: 'html' };

function demo(framework, ext, { title, intro, component }) {
  const id = slug(title);
  const file = `${component}.${ext}`;
  return `<section data-example aria-labelledby="${id}">
  <h2 id="${id}">${esc(title)}</h2>
  ${intro}
  <figure data-demo>
    <div data-preview data-${framework}-demo="${component}"></div>
    ${codeBlock(source(framework, file), LANGUAGE[ext], { label: `src/${framework}/${file}` })}
  </figure>
</section>`;
}

const table = (head, rows) => `<table data-api>
  <thead><tr>${head.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<td>${index === 1 && !cell.includes('<') ? `<code>${esc(cell)}</code>` : cell}</td>`).join('')}</tr>`).join('')}</tbody>
</table>`;

const SKIPPED = [
  ['A component library', 'Elements are the components. <code>&lt;button&gt;</code>, <code>&lt;dialog&gt;</code>, <code>&lt;table&gt;</code>.'],
  ['Portals and teleports', 'Dialogs and popovers render in the top layer, wherever they sit in the tree.'],
  ['Focus traps and scroll locks', '<code>showModal()</code> and the popover API do both.'],
  ['Tab and accordion state', '<code>&lt;details&gt;</code> elements sharing a <code>name</code> keep one open between them.'],
  ['A theme provider', 'A control named <code>color-scheme</code> flips the page through <code>:has()</code>.'],
];

const GUIDES = {
  react: {
    title: 'React',
    ext: 'jsx',
    description: 'Use native-base from React as plain JSX: no wrapper components and no client runtime.',
    lead: 'native-base is CSS, so React gets it for free: write the same HTML as JSX. There are no wrapper components to import, nothing to put in a provider, and no client runtime beyond your own.',
    entry: 'main.jsx',
    sections: [
      ['Write JSX', 'Team', '<p>Data goes in, elements come out. Variants are attributes, so they take an expression like anything else.</p>'],
      ['Overlays without state', 'KeyboardShortcuts', '<p>Invoker commands mean the common case needs no React at all: no <code>open</code> flag, no effect that syncs it, no portal. This component imports nothing.</p>'],
      ['A dialog that needs data', 'RemoveMember', '<p>When the contents depend on a row, keep the row in state and open the element through a ref. <code>method="dialog"</code> closes it and hands the button’s value to <code>onClose</code>.</p>'],
      ['Forms', 'InviteForm', '<p>Let the browser validate. React only holds what the server said: a rejected address becomes a real constraint violation, which is what reveals the error text.</p>'],
      ['Tabs and tables', 'Invoices', '<p>Sorting and selection are state. Which tab is open is not — that is the browser’s job.</p>'],
    ],
    attributes: [
      ['data-card, data-variant, …', 'data-card=""', 'Bare <code>data-card</code> is <code>{true}</code> in JSX and renders <code>data-card="true"</code>, which still matches.'],
      ['A variant you compute', 'data-variant={tone ?? undefined}', '<code>false</code> renders the string <code>"false"</code>, so the element keeps the attribute.'],
      ['commandfor, command, closedby, interestfor', 'commandfor="edit"', 'Lowercase, as in HTML. React passes them through untouched.'],
      ['popovertarget', 'popoverTarget="menu"', 'React knows this one and wants it camelCased; lowercase logs a warning.'],
      ['popover', 'popover=""', 'Bare <code>popover</code> is <code>{true}</code>, which React drops entirely — the popover never opens.'],
      ['Custom properties', 'style={{ "--min": "13rem" }}', 'React wants an object, and keeps custom property names as written.'],
      ['class, for, colspan, stroke-width', 'className, htmlFor, colSpan, strokeWidth', 'The usual JSX renames, SVG attributes included.'],
      ['A customizable select', '&lt;button&gt;&lt;selectedcontent&gt;', 'Renders correctly in the browser; React’s <em>server</em> renderer logs a “malformed HTML” warning about it.'],
    ],
    skipped: [['use client', 'Cards, tables, alerts and command-driven dialogs are markup, so they stay server components.']],
  },

  vue: {
    title: 'Vue',
    ext: 'vue',
    description: 'Use native-base from Vue: the template is the HTML, with no wrapper components.',
    lead: 'A Vue template is HTML, and native-base is CSS for HTML, so the two need no adapter. Paste any example from these docs into a <code>&lt;template&gt;</code> and it works.',
    entry: 'main.js',
    sections: [
      ['Write the template', 'Team', '<p>Every attribute is spelled exactly as in HTML. Only the parts that come from data get a binding.</p>'],
      ['Overlays without state', 'KeyboardShortcuts', '<p>Invoker commands mean the common case needs no Vue at all: no <code>ref</code>, no watcher, no <code>Teleport</code>. This component has no <code>&lt;script&gt;</code> block.</p>'],
      ['A dialog that needs data', 'RemoveMember', '<p>When the contents depend on a row, keep the row in a <code>ref</code> and open the element through a template ref. <code>method="dialog"</code> closes it and hands the button’s value to the <code>close</code> event.</p>'],
      ['Forms', 'InviteForm', '<p>Let the browser validate. Vue only holds what the server said: a rejected address becomes a real constraint violation, which is what reveals the error text.</p>'],
      ['Tabs and tables', 'Invoices', '<p>Sorting and selection are state. Which tab is open is not — that is the browser’s job.</p>'],
    ],
    attributes: [
      ['Any static attribute', 'data-card, commandfor, popover', 'Written exactly as in HTML. Vue passes static attributes through untouched.'],
      ['A variant you compute', ':data-variant="tone ?? null"', '<code>null</code> and <code>undefined</code> remove the attribute; <code>false</code> renders the string <code>"false"</code>.'],
      ['Custom properties', 'style="--min: 13rem"', 'A plain string. Vue only needs an object when the value is dynamic.'],
      ['Native events', '@close, @submit.prevent', 'Unknown event names on a native element become <code>addEventListener</code> calls.'],
      ['An element reference', 'ref="dialog" + const dialog = ref(null)', 'In <code>&lt;script setup&gt;</code> the variable name must match the string.'],
      ['Several root elements', 'No wrapper needed', 'Vue 3 templates are fragments, so a trigger and its dialog can sit side by side.'],
    ],
    skipped: [['A UI library', 'Vue’s ecosystem is optional here: the element is the component.']],
  },

  svelte: {
    title: 'Svelte',
    ext: 'svelte',
    description: 'Use native-base from Svelte: the component is the HTML, with no wrapper components.',
    lead: 'A Svelte component is HTML with holes in it, which is exactly what native-base styles. Most examples in these docs are already valid Svelte components — paste and save.',
    entry: 'main.js',
    sections: [
      ['Write the markup', 'Team', '<p>The markup is the HTML, unchanged. Only the values come from the script block.</p>'],
      ['Overlays without state', 'KeyboardShortcuts', '<p>Invoker commands mean the common case needs no Svelte at all: no state, no <code>$effect</code>, no portal action. This component has no <code>&lt;script&gt;</code> block.</p>'],
      ['A dialog that needs data', 'RemoveMember', '<p>When the contents depend on a row, keep the row in <code>$state</code> and grab the element with <code>bind:this</code>. <code>method="dialog"</code> closes it and hands the button’s value to the <code>close</code> event.</p>'],
      ['Forms', 'InviteForm', '<p>Let the browser validate. Svelte only holds what the server said: a rejected address becomes a real constraint violation, which is what reveals the error text.</p>'],
      ['Tabs and tables', 'Invoices', '<p>Sorting and selection are state. Which tab is open is not — that is the browser’s job.</p>'],
    ],
    attributes: [
      ['Any static attribute', 'data-card, commandfor, popover', 'Written exactly as in HTML, including bare boolean attributes.'],
      ['A variant you compute', 'data-variant={tone}', '<code>null</code> and <code>undefined</code> remove the attribute; <code>false</code> renders the string <code>"false"</code>.'],
      ['Custom properties', 'style="--min: 13rem"', 'A plain string, or <code>style:--min="13rem"</code> for a dynamic one.'],
      ['Native events', 'onclick, onclose, oninput', 'Svelte 5 events are plain attributes, so any DOM event works.'],
      ['An element reference', 'bind:this={dialog}', 'Then call <code>dialog.showModal()</code> or <code>toast.showPopover()</code>.'],
      ['A whole component', 'No wrapper needed', 'The file is the component: markup at the top level, no return statement.'],
    ],
    skipped: [['A transition library', 'Dialogs, popovers and <code>::details-content</code> animate from CSS, including <code>@starting-style</code>.']],
  },

  solid: {
    title: 'Solid',
    ext: 'jsx',
    description: 'Use native-base from Solid: JSX that stays HTML, with no wrapper components.',
    lead: 'Solid’s JSX keeps HTML’s own attribute names — <code>class</code>, <code>for</code>, <code>stroke-width</code> — so native-base examples move over almost character for character. And since Solid never re-renders, the DOM the browser is animating stays put.',
    entry: 'index.jsx',
    sections: [
      ['Write JSX', 'Team', '<p><code>&lt;For&gt;</code> keeps the rows, and every attribute is spelled the way HTML spells it.</p>'],
      ['Overlays without state', 'KeyboardShortcuts', '<p>Invoker commands mean the common case needs no Solid at all: no signal, no effect, no portal. This component imports nothing.</p>'],
      ['A dialog that needs data', 'RemoveMember', '<p>When the contents depend on a row, keep the row in a signal and grab the element with <code>ref</code>. <code>method="dialog"</code> closes it and hands the button’s value to the <code>close</code> event.</p>'],
      ['Forms', 'InviteForm', '<p>Let the browser validate. Solid only holds what the server said: a rejected address becomes a real constraint violation, which is what reveals the error text.</p>'],
      ['Tabs and tables', 'Invoices', '<p>Sorting and selection are signals. Which tab is open is not — that is the browser’s job.</p>'],
    ],
    attributes: [
      ['data-card, data-variant, …', 'data-card=""', 'Bare <code>data-card</code> is <code>{true}</code> in JSX and renders <code>data-card="true"</code>, which still matches.'],
      ['A variant you compute', 'data-variant={tone()}', '<code>undefined</code> and <code>null</code> remove the attribute; <code>false</code> renders the string <code>"false"</code>.'],
      ['commandfor, popovertarget, closedby', 'commandfor="edit"', 'Lowercase, as in HTML. Solid sets unknown props as attributes.'],
      ['class, for, stroke-width', 'Unchanged from HTML', 'Solid has no renames, so SVG icons paste straight in.'],
      ['Custom properties', 'style="--min: 13rem"', 'Solid accepts a style string as well as an object.'],
      ['Delegated and native events', 'onClick, onSubmit, on:close', '<code>on:</code> reaches events Solid does not delegate, like <code>close</code>.'],
    ],
    skipped: [['Memoising the markup', 'Solid updates the one attribute that changed, so a dialog mid-animation is never re-created.']],
  },
};

const INSTALL = {
  react: `import '@digiup/native-base/native-base.css';

// or only what you use, in cascade order
import '@digiup/native-base/components/tokens.css';
import '@digiup/native-base/components/button.css';`,
  vue: `import { createApp } from 'vue';
import App from './App.vue';
import '@digiup/native-base/native-base.css';

createApp(App).mount('#app');`,
  svelte: `import { mount } from 'svelte';
import App from './App.svelte';
import '@digiup/native-base/native-base.css';

mount(App, { target: document.querySelector('#app') });`,
  solid: `import { render } from 'solid-js/web';
import App from './App.jsx';
import '@digiup/native-base/native-base.css';

render(() => <App />, document.querySelector('#app'));`,
};

const INSTALL_NOTE = {
  react: 'One import in your entry file. In Next.js that is <code>app/layout.js</code> — it is a stylesheet, so it works from a server component.',
  vue: 'One import in your entry file. In Nuxt, add it to <code>css</code> in <code>nuxt.config.ts</code> instead.',
  svelte: 'One import in your entry file. In SvelteKit, import it in the root <code>+layout.svelte</code> instead.',
  solid: 'One import in your entry file. In SolidStart, import it in <code>app.tsx</code> instead.',
};

export function guide(name) {
  const config = GUIDES[name];

  return (site) => {
    const content = `<h1>${config.title}</h1>
<p data-lead>${config.lead}</p>
<p>Every component below is complete and unedited: the preview beside it is that file running on this page. It is also the only page here that loads ${config.title}.</p>

<h2 id="install">Install</h2>
<p>${INSTALL_NOTE[name]}</p>
${codeBlock('npm i @digiup/native-base', 'sh')}
${codeBlock(INSTALL[name], name === 'vue' || name === 'svelte' ? 'js' : 'jsx', { label: config.entry })}

${config.sections.map(([title, component, intro]) => demo(name, config.ext, { title, component, intro })).join('\n')}

<h2 id="attributes">${name === 'react' ? 'What React spells differently' : `${config.title} and the markup`}</h2>
${table(['You want', 'Write', 'Why'], config.attributes)}

<h2 id="skip">What you can delete</h2>
${table(['Not needed', 'Because'], [...SKIPPED, ...config.skipped])}

<h2 id="example">The full app</h2>
<p>The same patterns, assembled into one app with a menu, a tooltip, a skeleton and theme switching, live in <code>examples/${name}</code>.</p>
${codeBlock(`pnpm install
pnpm --filter @native-base/example-${name} dev`, 'sh')}`;

    return docsPage({
      site,
      path: `/docs/${name}/`,
      title: config.title,
      description: config.description,
      content,
      modules: [`/src/${name}/mount.${name === 'vue' || name === 'svelte' ? 'js' : 'jsx'}`],
    });
  };
}

export const FRAMEWORK_NAMES = Object.keys(GUIDES);
export const FRAMEWORK_LINKS = Object.entries(GUIDES).map(([name, config]) => [`/docs/${name}/`, config.title]);

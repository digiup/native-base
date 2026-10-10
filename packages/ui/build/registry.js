import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { countTokens } from 'gpt-tokenizer';
import { transform } from 'lightningcss';
import { STYLE_PRESETS, STYLE_VARS, THEME_PRESETS, THEME_VARS, slug, styleFrom, themeFrom, toCSS } from '../src/presets.js';

const root = new URL('../', import.meta.url);
const VIRTUAL_ID = 'virtual:native-base/registry';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const NAMESPACE = '@native-base';

// Newer than lightningcss knows about. It preserves them verbatim, so these warnings are noise.
const KNOWN_MODERN = /scroll-button|scroll-marker|target-current|interest-source|interest-target/;
const EXAMPLE_MARKER = /^<!-- @example: (.+?)( \[code\])? -->\n/m;
const BLOCK_MARKER = /^<!-- @block: (.+?)(?: \| (.+?))? -->\n/m;

/**
 * The markup each registry item styles. Blocks and templates are plain HTML, so their dependencies are
 * read off the markup itself: whatever hooks a block writes is exactly what `add` has to bring along.
 */
const USES = {
  layout: /\sdata-(row|stack|grid)\b/,
  button: /<button\b|<a\b[^>]*\sdata-variant|\sdata-group\b/,
  input: /<(input|textarea)\b/,
  checkbox: /type="(checkbox|radio)"/,
  switch: /role="switch"/,
  select: /<select\b/,
  progress: /<(progress|meter)\b/,
  card: /\sdata-card\b/,
  badge: /\sdata-badge\b/,
  alert: /\sdata-alert\b/,
  avatar: /\sdata-avatar\b/,
  table: /<table\b/,
  loading: /\sdata-(skeleton|spinner)\b|aria-busy=/,
  breadcrumb: /\sdata-breadcrumb\b/,
  dialog: /<dialog\b/,
  popover: /\spopover\b/,
  menu: /<menu\b/,
  tooltip: /\sdata-tooltip=/,
  toast: /\sdata-toast\b/,
  accordion: /<details\b/,
  tabs: /\sdata-tabs\b/,
  carousel: /\sdata-carousel\b/,
  section: /\sdata-(section|split|frame)\b/,
  navbar: /\sdata-navbar\b/,
  shell: /\sdata-shell\b/,
  pagination: /\sdata-pagination\b/,
  steps: /\sdata-steps\b/,
  stat: /\sdata-(stat|trend)\b/,
  chart: /\sdata-chart\b/,
  timeline: /\sdata-timeline\b/,
  empty: /\sdata-empty\b/,
  segmented: /\sdata-segmented\b/,
  rating: /\sdata-rating\b/,
  dropzone: /\sdata-dropzone\b/,
  marquee: /\sdata-marquee\b/,
};

/** Registry items a piece of markup uses, in cascade order. base is always there: it styles the page itself. */
function usedBy(code, items) {
  return items.filter((item) => item.name === 'base' || USES[item.name]?.test(code)).map((item) => item.name);
}

const sizes = (text) => ({
  bytes: Buffer.byteLength(text),
  gzip: gzipSync(text, { level: 9 }).length,
  brotli: brotliCompressSync(text).length,
});

function parseExamples(html) {
  const parts = html.split(EXAMPLE_MARKER);
  const examples = [];
  for (let i = 1; i < parts.length; i += 3) {
    const code = parts[i + 2].trim();
    examples.push({ title: parts[i], live: !parts[i + 1], code, tokens: countTokens(code) });
  }
  return examples;
}

/** blocks/<file>.html: one or more blocks, each introduced by `<!-- @block: Title | One-line description -->`. */
function parseBlocks(html, category, items) {
  const parts = html.split(BLOCK_MARKER);
  const blocks = [];
  for (let i = 1; i < parts.length; i += 3) {
    const code = parts[i + 2].trim();
    blocks.push({ name: slug(parts[i]), title: parts[i], description: parts[i + 1] ?? '', category, code, tokens: countTokens(code), uses: usedBy(code, items) });
  }
  return blocks;
}

/** One component as Markdown: what it is, its markup API, then its examples. */
function renderItem(item, { allExamples }) {
  const lines = [`## ${item.title}`, '', item.description, ''];
  if (allExamples) {
    const meta = [`Registry name: \`${item.name}\``];
    if (item.registryDependencies.length) meta.push(`needs ${item.registryDependencies.map((dep) => `\`${dep}\``).join(', ')}`);
    if (item.native.length) meta.push(`uses ${item.native.join(', ')}`);
    lines.push(`${meta.join('; ')}.`, '');
  }
  for (const [hook, meaning] of Object.entries(item.api)) lines.push(`- \`${hook}\`: ${meaning}`);
  for (const example of allExamples ? item.examples : item.examples.slice(0, 1)) {
    if (allExamples) lines.push('', `### ${example.title}`);
    lines.push('', '```html', example.code, '```');
  }
  lines.push('');
  return lines;
}

function renderPresets(presets) {
  const lines = [];
  for (const kind of ['theme', 'style']) {
    for (const preset of presets.filter((p) => p.kind === kind)) lines.push(`- \`${preset.name}\`: ${preset.description}`);
    lines.push('');
  }
  return lines;
}

const header = (pkg, manifest) => [`# ${manifest.name}`, '', `> ${pkg.description}`, '', ...manifest.rules.map((rule) => `- ${rule}`), ''];

function renderLlms(pkg, manifest, items, presets) {
  const lines = header(pkg, manifest);
  for (const item of items) lines.push(...renderItem(item, { allExamples: false }));
  lines.push('## Themes and styles', '', 'A theme sets the colors; a style sets spacing, radius, corner shape, borders, type and motion. Pick one of each: `npx native-base theme <theme> --style <style>`, or `npx native-base add theme-<name> style-<name>`.', '');
  lines.push(...renderPresets(presets));
  lines.push('## Optional', '', '- [llms-full.txt](/llms-full.txt): every example of every component, plus install, CLI, theming and framework notes', '');
  return lines.join('\n');
}

/** Install, CLI and framework notes: the parts of the docs site an agent needs to set a project up. */
const SETUP = `## Setup

Pick one:

- npm: \`npm i @digiup/native-base\`, then \`@import "@digiup/native-base/native-base.css";\` once in the app's entry CSS or JS. Per-component files live at \`@digiup/native-base/components/<name>.css\`; import each one's dependencies first.
- Own the source: \`npx native-base init\` writes native-base.json and copies tokens + base; \`npx native-base add dialog tabs\` copies more, dependencies first, and keeps an index.css in cascade order. Import that index.css once.

Next.js: import it in app/layout.js. Nuxt: add it to \`css\` in nuxt.config.ts. SvelteKit: the root +layout.svelte. SolidStart: app.tsx.

## CLI

- \`npx native-base list [components|themes|styles]\`: the registry
- \`npx native-base view <name>\`: one item's markup API and every example
- \`npx native-base add <name...>\`: copy items into the project (\`--force\` overwrites)
- \`npx native-base theme <theme> --style <style>\`: write theme.css and style.css. Also \`--hue 0-360 --chroma 0-0.3 --tint 0-1\` to generate a theme, a playground share link, or a shadcn/ui theme file.
- \`npx native-base skill\`: install the native-base agent skill into .claude/skills

## Frameworks

There is nothing to wrap. Vue and Svelte templates take the HTML as written. JSX needs only its usual renames: React uses \`className\`, \`htmlFor\`, \`popoverTarget\`, \`defaultValue\`/\`defaultChecked\` and a style object; Solid keeps HTML spelling. In JSX, write valueless data attributes and \`popover\` as \`=""\` (\`data-card=""\`, \`popover=""\`), because \`{true}\` is dropped or becomes "true". \`commandfor\` and \`command\` stay lowercase.

Keep open/closed state in the browser. Use invoker commands for overlays; when a dialog's contents depend on data, keep the data in state and call \`showModal()\` through a ref. \`<form method="dialog">\` closes it and its \`close\` event exposes the clicked button's value as \`dialog.returnValue\`. For server-side validation errors, call \`input.setCustomValidity(message)\` so \`<small data-error>\` shows.
`;

function renderLlmsFull(pkg, manifest, items, presets, blocks, templates) {
  const lines = header(pkg, manifest);
  lines.push(SETUP);
  for (const item of items) lines.push(...renderItem(item, { allExamples: true }));
  lines.push(renderThemes(presets));
  lines.push(...renderPatternIndex(blocks, templates));
  return lines.join('\n');
}

/** Blocks and templates by name only: their markup is long, and it is one `view` away. */
function renderPatternIndex(blocks, templates) {
  const lines = ['## Blocks and templates', '', 'Blocks are sections built only from the components above (hero, pricing, dashboard cards, …); templates are whole pages. Print one with `npx native-base view block-<name>` or copy it with `npx native-base add block-<name>`, which brings the components it uses.', ''];
  for (const [category, group] of Map.groupBy(blocks, (block) => block.category)) {
    lines.push(`### ${category}`, '');
    for (const block of group) lines.push(`- \`block-${block.name}\`: ${block.title}. ${block.description}`);
    lines.push('');
  }
  lines.push('### Templates', '');
  for (const template of templates) lines.push(`- \`template-${template.name}\`: ${template.title}. ${template.description}`);
  lines.push('');
  return lines;
}

function renderPatterns(pkg, blocks, templates) {
  const lines = [`# native-base ${pkg.version} blocks and templates`, '', 'Complete markup for every block (a section) and template (a page). Each one uses only native-base components and layout hooks; reuse the structure, change the words.', ''];
  for (const block of blocks) lines.push(`## Block: ${block.title} (\`block-${block.name}\`)`, '', `${block.category}. ${block.description} Uses ${block.uses.join(', ')}.`, '', '```html', block.code, '```', '');
  for (const template of templates) lines.push(`## Template: ${template.title} (\`template-${template.name}\`)`, '', `${template.description} Uses ${template.uses.join(', ')}.`, '', '```html', template.code, '```', '');
  return lines.join('\n');
}

function renderThemes(presets) {
  const lines = [
    '## Themes and styles',
    '',
    'Colors are the theme; every other token is the style. Each half is an unlayered `:root` block, so it overrides the kit. Pick one of each with `npx native-base theme <theme> --style <style>` (writes theme.css and style.css), or `npx native-base add theme-<name> style-<name>`. A theme always replaces theme.css and a style replaces style.css. Existing shadcn/ui themes work as they are.',
    '',
    '### Theme variables (light and dark)',
    '',
    ...THEME_VARS.map(([name, label]) => `- \`${name}\`: ${label}`),
    '',
    '### Style variables',
    '',
    ...STYLE_VARS.map(({ name, label, hint }) => `- \`${name}\`: ${label}${hint ? `. ${hint}` : ''}`),
    '',
    '### Presets',
    '',
    ...renderPresets(presets),
  ];
  return lines.join('\n');
}

/** The agent skill: a hand-written SKILL.md plus generated references, so the API it carries matches this build. */
function renderSkill(pkg, items, presets, blocks, templates) {
  const components = [`# native-base ${pkg.version} components`, '', 'Every component: description, registry name, dependencies, markup API and all examples. Find one with its `## Title` heading.', ''];
  for (const item of items) components.push(...renderItem(item, { allExamples: true }));
  return {
    'references/components.md': components.join('\n'),
    'references/setup.md': `# native-base ${pkg.version} setup\n\n${SETUP}`,
    'references/patterns.md': renderPatterns(pkg, blocks, templates),
    'references/theming.md': `# native-base ${pkg.version} theming\n\n${renderThemes(presets)
      .replace(/^## Themes and styles\n\n/, '')
      .replace(/^### /gm, '## ')}`,
  };
}

/** Registry item in the shadcn "universal item" shape, so `npx shadcn add <url>` works too. */
function toRegistryItem(item, withContent) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: 'registry:item',
    title: item.title,
    description: item.description,
    registryDependencies: item.registryDependencies.map((dep) => `${NAMESPACE}/${dep}`),
    files: [
      {
        path: `registry/${item.name}/${item.name}.css`,
        type: 'registry:file',
        target: `~/styles/native-base/${item.name}.css`,
        ...(withContent && { content: item.source }),
      },
    ],
    categories: [item.category],
    ...(withContent && { docs: item.examples[0]?.code }),
    meta: { api: item.api, native: item.native, size: item.size, ...(withContent && { examples: item.examples }) },
  };
}

/**
 * A block or template as a registry item. Its file is HTML: `add` writes it next to the project's pages
 * instead of importing it, and pulls in the components it uses as ordinary dependencies.
 */
function toPatternItem(pattern, kind, withContent) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: `${kind}-${pattern.name}`,
    type: 'registry:block',
    title: pattern.title,
    description: pattern.description,
    registryDependencies: pattern.uses.map((dep) => `${NAMESPACE}/${dep}`),
    files: [
      {
        path: `${kind}s/${pattern.name}.html`,
        type: 'registry:file',
        target: `~/${kind}s/${pattern.name}.html`,
        ...(withContent && { content: pattern.code }),
      },
    ],
    categories: [kind === 'block' ? pattern.category : 'Templates'],
    ...(withContent && { docs: pattern.code }),
    meta: { kind, tokens: pattern.tokens, ...(pattern.category && { category: pattern.category }) },
  };
}

/**
 * Every theme and style preset as its own registry item. A theme always lands in theme.css and a style in
 * style.css, so adding another one swaps it instead of stacking. Unlayered, so they beat the kit's defaults.
 */
function presetItems() {
  const neutral = themeFrom(THEME_PRESETS[0]);
  const base = styleFrom(STYLE_PRESETS[0]);
  const item = (kind, preset, css, meta) => ({
    name: `${kind}-${slug(preset.name)}`,
    kind,
    title: preset.name,
    description: preset.note,
    css,
    size: sizes(css),
    meta,
  });
  return [
    ...THEME_PRESETS.map((preset) => {
      const theme = themeFrom(preset);
      const css = toCSS({ theme, style: base }, { theme: true, style: false });
      return item('theme', preset, css, { kind: 'theme', seed: theme.seed, light: theme.light, dark: theme.dark });
    }),
    ...STYLE_PRESETS.map((preset) => {
      const style = styleFrom(preset);
      const css = toCSS({ theme: neutral, style }, { theme: false, style: true });
      return item('style', preset, css, { kind: 'style', vars: style.vars });
    }),
  ];
}

function toPresetItem(preset, withContent) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: preset.name,
    type: 'registry:item',
    title: preset.title,
    description: preset.description,
    registryDependencies: [`${NAMESPACE}/tokens`],
    files: [
      {
        path: `${preset.kind}s/${preset.name.slice(preset.kind.length + 1)}.css`,
        type: 'registry:file',
        target: `~/styles/native-base/${preset.kind}.css`,
        ...(withContent && { content: preset.css }),
      },
    ],
    categories: [preset.kind === 'theme' ? 'Themes' : 'Styles'],
    meta: { ...preset.meta, size: preset.size },
  };
}

export function nativeBaseRegistry() {
  let registry;

  async function read(ctx, path) {
    const url = new URL(path, root);
    ctx.addWatchFile(fileURLToPath(url));
    return readFile(url, 'utf8');
  }

  function minify(ctx, filename, source) {
    const { code, warnings } = transform({ filename, code: Buffer.from(source), minify: true, errorRecovery: true });
    for (const { message } of warnings) if (!KNOWN_MODERN.test(message)) ctx.warn(`${filename}: ${message}`);
    return code.toString();
  }

  return {
    name: 'native-base-registry',

    async buildStart() {
      const manifest = JSON.parse(await read(this, 'registry.json'));
      const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
      const seen = new Set();
      const items = [];

      for (const entry of manifest.items) {
        const registryDependencies = entry.registryDependencies ?? [];
        for (const dep of registryDependencies) {
          if (!seen.has(dep)) this.error(`registry.json: "${entry.name}" depends on "${dep}", which must be declared before it`);
        }
        seen.add(entry.name);

        const source = await read(this, `registry/${entry.name}/${entry.name}.css`);
        const css = minify(this, `${entry.name}.css`, source);
        const examples = parseExamples(await read(this, `registry/${entry.name}/examples.html`));
        items.push({ ...entry, registryDependencies, native: entry.native ?? [], api: entry.api ?? {}, source, css, examples, size: sizes(css) });
      }

      for (const name of Object.keys(USES)) if (!seen.has(name)) this.error(`build/registry.js: USES names "${name}", which is not in registry.json`);

      const blocks = [];
      for (const { file, title } of manifest.blocks ?? []) blocks.push(...parseBlocks(await read(this, `blocks/${file}.html`), title, items));
      const templates = [];
      for (const entry of manifest.templates ?? []) {
        const code = (await read(this, `templates/${entry.name}.html`)).trim();
        templates.push({ ...entry, code, tokens: countTokens(code), uses: usedBy(code, items) });
      }
      for (const list of [blocks, templates]) {
        const names = list.map((pattern) => pattern.name);
        const dupe = names.find((name, i) => names.indexOf(name) !== i);
        if (dupe) this.error(`Two blocks or templates are named "${dupe}"; titles must be unique`);
      }

      const bundle = minify(this, 'native-base.css', items.map((item) => item.source).join('\n'));
      const presets = presetItems();
      const llms = renderLlms(pkg, manifest, items, presets);
      const llmsFull = renderLlmsFull(pkg, manifest, items, presets, blocks, templates);
      const skillTemplate = await read(this, 'skill/SKILL.md');
      const skill = {
        'SKILL.md': skillTemplate.replace('{{rules}}', manifest.rules.map((rule) => `- ${rule}`).join('\n')),
        ...renderSkill(pkg, items, presets, blocks, templates),
      };

      registry = {
        name: manifest.name,
        version: pkg.version,
        description: pkg.description,
        rules: manifest.rules,
        items,
        blocks,
        templates,
        bundle: { css: bundle, size: sizes(bundle) },
        llms: { text: llms, tokens: countTokens(llms), size: sizes(llms) },
        llmsFull: { text: llmsFull, tokens: countTokens(llmsFull), size: sizes(llmsFull) },
        skill,
        presets,
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      const { bundle, llms, llmsFull, skill, presets, ...rest } = registry;
      const data = {
        ...rest,
        bundle: { size: bundle.size },
        llms: { tokens: llms.tokens, size: llms.size },
        llmsFull: { tokens: llmsFull.tokens, size: llmsFull.size },
      };
      return `export default ${JSON.stringify(data)};`;
    },

    async generateBundle() {
      const emit = (fileName, source) => this.emitFile({ type: 'asset', fileName, source });

      emit('native-base.css', registry.bundle.css);
      emit('llms.txt', registry.llms.text);
      emit('llms-full.txt', registry.llmsFull.text);
      for (const [path, text] of Object.entries(registry.skill)) emit(`skill/native-base/${path}`, text);
      emit('index.d.ts', await read(this, 'src/index.d.ts'));
      emit(
        'r/index.json',
        JSON.stringify(
          {
            $schema: 'https://ui.shadcn.com/schema/registry.json',
            name: registry.name,
            version: registry.version,
            bundle: registry.bundle.size,
            items: [
              ...registry.items.map((item) => toRegistryItem(item, false)),
              ...registry.presets.map((preset) => toPresetItem(preset, false)),
              ...registry.blocks.map((block) => toPatternItem(block, 'block', false)),
              ...registry.templates.map((template) => toPatternItem(template, 'template', false)),
            ],
          },
          null,
          2,
        ),
      );
      for (const item of registry.items) {
        emit(`components/${item.name}.css`, item.css);
        emit(`r/${item.name}.json`, JSON.stringify(toRegistryItem(item, true), null, 2));
      }
      for (const preset of registry.presets) {
        emit(`${preset.kind}s/${preset.name.slice(preset.kind.length + 1)}.css`, preset.css);
        emit(`r/${preset.name}.json`, JSON.stringify(toPresetItem(preset, true), null, 2));
      }
      for (const [kind, list] of [['block', registry.blocks], ['template', registry.templates]]) {
        for (const pattern of list) emit(`r/${kind}-${pattern.name}.json`, JSON.stringify(toPatternItem(pattern, kind, true), null, 2));
      }
      emit('presets.d.ts', await read(this, 'src/presets.d.ts'));
    },
  };
}

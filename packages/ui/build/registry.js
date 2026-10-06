import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { countTokens } from 'gpt-tokenizer';
import { transform } from 'lightningcss';
import { STYLE_PRESETS, THEME_PRESETS, slug, styleFrom, themeFrom, toCSS } from '../src/presets.js';

const root = new URL('../', import.meta.url);
const VIRTUAL_ID = 'virtual:native-base/registry';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const NAMESPACE = '@native-base';

// Newer than lightningcss knows about. It preserves them verbatim, so these warnings are noise.
const KNOWN_MODERN = /scroll-button|scroll-marker|target-current|interest-source|interest-target/;
const EXAMPLE_MARKER = /^<!-- @example: (.+?)( \[code\])? -->\n/m;

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

function renderLlms(pkg, manifest, items, presets) {
  const lines = [`# ${manifest.name}`, '', `> ${pkg.description}`, '', ...manifest.rules.map((rule) => `- ${rule}`), ''];
  for (const item of items) {
    lines.push(`## ${item.title}`, '', item.description, '');
    for (const [hook, meaning] of Object.entries(item.api)) lines.push(`- \`${hook}\`: ${meaning}`);
    const example = item.examples[0];
    if (example) lines.push('', '```html', example.code, '```');
    lines.push('');
  }
  lines.push('## Themes and styles', '', 'A theme sets the colors; a style sets spacing, radius, corner shape, borders, type and motion. Pick one of each: `npx native-base theme <theme> --style <style>`, or `npx native-base add theme-<name> style-<name>`.', '');
  for (const kind of ['theme', 'style']) {
    for (const preset of presets.filter((p) => p.kind === kind)) lines.push(`- \`${preset.name}\`: ${preset.description}`);
    lines.push('');
  }
  return lines.join('\n');
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

      const bundle = minify(this, 'native-base.css', items.map((item) => item.source).join('\n'));
      const presets = presetItems();
      const llms = renderLlms(pkg, manifest, items, presets);

      registry = {
        name: manifest.name,
        version: pkg.version,
        description: pkg.description,
        rules: manifest.rules,
        items,
        bundle: { css: bundle, size: sizes(bundle) },
        llms: { text: llms, tokens: countTokens(llms), size: sizes(llms) },
        presets,
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      const { bundle, llms, presets, ...rest } = registry;
      const data = { ...rest, bundle: { size: bundle.size }, llms: { tokens: llms.tokens, size: llms.size } };
      return `export default ${JSON.stringify(data)};`;
    },

    async generateBundle() {
      const emit = (fileName, source) => this.emitFile({ type: 'asset', fileName, source });

      emit('native-base.css', registry.bundle.css);
      emit('llms.txt', registry.llms.text);
      emit('index.d.ts', await read(this, 'src/index.d.ts'));
      emit(
        'r/index.json',
        JSON.stringify(
          {
            $schema: 'https://ui.shadcn.com/schema/registry.json',
            name: registry.name,
            version: registry.version,
            bundle: registry.bundle.size,
            items: [...registry.items.map((item) => toRegistryItem(item, false)), ...registry.presets.map((preset) => toPresetItem(preset, false))],
          },
          null,
          2,
        ),
      );
      for (const item of registry.items) {
        emit(`components/${item.name}.css`, item.css);
        emit(`r/${item.name}.css`, item.css);
        emit(`r/${item.name}.json`, JSON.stringify(toRegistryItem(item, true), null, 2));
      }
      for (const preset of registry.presets) {
        emit(`${preset.kind}s/${preset.name.slice(preset.kind.length + 1)}.css`, preset.css);
        emit(`r/${preset.name}.css`, preset.css);
        emit(`r/${preset.name}.json`, JSON.stringify(toPresetItem(preset, true), null, 2));
      }
      emit('presets.d.ts', await read(this, 'src/presets.d.ts'));
    },
  };
}

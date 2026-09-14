import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { countTokens } from 'gpt-tokenizer';
import { transform } from 'lightningcss';

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

function renderLlms(pkg, manifest, items) {
  const lines = [`# ${manifest.name}`, '', `> ${pkg.description}`, '', ...manifest.rules.map((rule) => `- ${rule}`), ''];
  for (const item of items) {
    lines.push(`## ${item.title}`, '', item.description, '');
    for (const [hook, meaning] of Object.entries(item.api)) lines.push(`- \`${hook}\`: ${meaning}`);
    const example = item.examples[0];
    if (example) lines.push('', '```html', example.code, '```');
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
      const llms = renderLlms(pkg, manifest, items);

      registry = {
        name: manifest.name,
        version: pkg.version,
        description: pkg.description,
        rules: manifest.rules,
        items,
        bundle: { css: bundle, size: sizes(bundle) },
        llms: { text: llms, tokens: countTokens(llms), size: sizes(llms) },
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      const { bundle, llms, ...rest } = registry;
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
            items: registry.items.map((item) => toRegistryItem(item, false)),
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
    },
  };
}

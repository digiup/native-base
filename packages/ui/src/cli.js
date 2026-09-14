import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, styleText } from 'node:util';

const CONFIG_FILE = 'native-base.json';
const NAMESPACE = '@native-base/';
const BUNDLED_REGISTRY = new URL('./r/', import.meta.url).href;

const HELP = `
native-base: add native HTML components to your project

Usage
  native-base init                 Create ${CONFIG_FILE} and add tokens + base
  native-base add <item...>        Copy items (and their dependencies) into your project
  native-base list                 Show every item in the registry
  native-base view <item>          Print an item's markup API and examples

Items can be names (button), namespaced (@native-base/button) or URLs to any registry item JSON.

Options
  -o, --out <dir>        Where CSS files go (default: src/styles/native-base)
  -r, --registry <url>   Registry base URL (default: the registry bundled with this package)
  -f, --force            Overwrite files that already exist
  -h, --help
`;

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o' },
    registry: { type: 'string', short: 'r' },
    force: { type: 'boolean', short: 'f' },
    help: { type: 'boolean', short: 'h' },
  },
});

const config = existsSync(CONFIG_FILE) ? JSON.parse(await readFile(CONFIG_FILE, 'utf8')) : {};
const registryBase = withSlash(flags.registry ?? config.registry ?? BUNDLED_REGISTRY);
const outDir = flags.out ?? config.out ?? 'src/styles/native-base';

function withSlash(url) {
  if (!/^[a-z]+:/.test(url)) url = new URL(url, `file://${process.cwd()}/`).href;
  return url.endsWith('/') ? url : `${url}/`;
}

/** A name resolves against the registry it was referenced from, so third-party registries keep working. */
function toUrl(ref, base = registryBase) {
  if (/^(https?|file):/.test(ref)) return ref;
  return new URL(`${ref.replace(NAMESPACE, '')}.json`, base).href;
}

async function fetchJson(url) {
  if (url.startsWith('file:')) return JSON.parse(await readFile(fileURLToPath(url), 'utf8'));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

/** Depth-first so dependencies land before the items that need them. */
async function collect(refs) {
  const ordered = new Map();
  const visit = async (url) => {
    if (ordered.has(url)) return;
    ordered.set(url, null);
    const item = await fetchJson(url);
    for (const dep of item.registryDependencies ?? []) await visit(toUrl(dep, url));
    ordered.delete(url);
    ordered.set(url, item);
  };
  for (const ref of refs) await visit(toUrl(ref));
  return [...ordered.values()];
}

async function add(refs) {
  if (!refs.length) throw new Error('Nothing to add. Try: native-base add button dialog');
  const items = await collect(refs);
  await mkdir(outDir, { recursive: true });

  const indexPath = join(outDir, 'index.css');
  const index = existsSync(indexPath) ? await readFile(indexPath, 'utf8') : '';
  const imports = new Set(index.match(/@import "[^"]+";/g));

  for (const item of items) {
    for (const file of item.files) {
      const name = file.target?.split('/').pop() ?? file.path.split('/').pop();
      const path = join(outDir, name);
      if (existsSync(path) && !flags.force) {
        console.log(`${styleText('dim', 'skip')}  ${relative('.', path)} ${styleText('dim', '(exists, use --force)')}`);
      } else {
        await writeFile(path, file.content);
        console.log(`${styleText('green', 'add')}   ${relative('.', path)}`);
      }
      imports.add(`@import "./${name}";`);
    }
  }
  await writeFile(indexPath, `${[...imports].join('\n')}\n`);

  console.log(`\nImport once: ${styleText('cyan', `@import "./${relative('.', indexPath)}";`)}`);
  const last = items.at(-1);
  if (last.docs) console.log(`\n${styleText('bold', last.title)} markup:\n\n${last.docs}\n`);
}

async function list() {
  const index = await fetchJson(new URL('index.json', registryBase).href);
  const width = Math.max(...index.items.map((item) => item.name.length));
  for (const item of index.items) {
    const kb = `${(item.meta.size.gzip / 1024).toFixed(1)}kb`.padStart(6);
    console.log(`${item.name.padEnd(width)}  ${styleText('dim', kb)}  ${item.description}`);
  }
}

async function view(ref) {
  const item = await fetchJson(toUrl(ref));
  console.log(styleText('bold', `${item.title}`), styleText('dim', `(${item.meta.size.gzip} B gzip)`));
  console.log(item.description, '\n');
  for (const [hook, meaning] of Object.entries(item.meta.api)) console.log(`  ${styleText('cyan', hook)}  ${meaning}`);
  for (const example of item.meta.examples) console.log(`\n${styleText('dim', `<!-- ${example.title} · ${example.tokens} tokens -->`)}\n${example.code}`);
}

async function init() {
  if (!existsSync(CONFIG_FILE)) {
    const initial = { out: outDir, ...(flags.registry && { registry: flags.registry }) };
    await writeFile(CONFIG_FILE, `${JSON.stringify(initial, null, 2)}\n`);
    console.log(`${styleText('green', 'add')}   ${CONFIG_FILE}`);
  }
  await add(['tokens', 'base']);
}

const [command, ...args] = positionals;
const commands = { add: () => add(args), list, view: () => view(args[0]), init };

try {
  if (flags.help || !commands[command]) console.log(HELP);
  else await commands[command]();
} catch (error) {
  console.error(styleText('red', error.message));
  process.exitCode = 1;
}

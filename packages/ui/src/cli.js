import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, styleText } from 'node:util';
import {
  STYLE_PRESETS,
  THEME_PRESETS,
  decodeShare,
  findStyle,
  findTheme,
  generateTheme,
  parse,
  slug,
  styleFrom,
  themeFrom,
  toCSS,
} from './presets.js';

const CONFIG_FILE = 'native-base.json';
const NAMESPACE = '@native-base/';
const BUNDLED_REGISTRY = new URL('./r/', import.meta.url).href;
const BUNDLED_SKILL = new URL('./skill/native-base/', import.meta.url);

const HELP = `
native-base: add native HTML components to your project

Usage
  native-base init                 Create ${CONFIG_FILE} and add tokens + base
  native-base add <item...>        Copy items (and their dependencies) into your project
  native-base list [kind]          Show the registry: components, blocks, templates, themes or styles
  native-base view <item>          Print an item's markup API and examples, or a theme's CSS
  native-base theme [theme]        Write theme.css (colors) and style.css (spacing, shape, type)
  native-base skill                Install the native-base agent skill for coding agents

Items can be names (button), namespaced (@native-base/button) or URLs to any registry item JSON.
Themes and styles are items too: native-base add theme-indigo style-mochi
Blocks and templates are HTML: native-base add block-hero-centered template-dashboard

Theme and style sources
  A preset name (indigo, mochi), a playground link (…/playground/#s=…), or a .json/.css file
  exported from the playground or copied from a shadcn/ui theme.

  native-base theme indigo --style mochi
  native-base theme --hue 200 --chroma .14 --tint .3 --style ledger
  native-base theme "https://native-base.dev/playground/#s=eyJ0Ijp7…"
  native-base theme ./brand.json --print > brand.css
  native-base init --theme rose --style hygge

  native-base skill --out .agents/skills

Options
  -o, --out <dir>        Where CSS files go (default: src/styles/native-base), or skills for skill
      --pages <dir>      Where block and template HTML goes (default: src/native-base)
  -r, --registry <url>   Registry base URL (default: the registry bundled with this package)
  -f, --force            Overwrite files that already exist
  -t, --theme <source>   Theme for init and theme
  -s, --style <source>   Style for init and theme
      --hue <0-360>      Generate a theme: primary hue
      --chroma <0-0.3>   Generate a theme: primary strength (0 is black and white)
      --tint <0-1>       Generate a theme: how much hue the greys get
      --tint-hue <0-360> Generate a theme: hue for the greys (default: --hue)
      --only <half>      theme or style: write just that half of a playground link or file
      --print            Print the CSS instead of writing files
  -h, --help
`;

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', short: 'o' },
    pages: { type: 'string' },
    registry: { type: 'string', short: 'r' },
    force: { type: 'boolean', short: 'f' },
    theme: { type: 'string', short: 't' },
    style: { type: 'string', short: 's' },
    hue: { type: 'string' },
    chroma: { type: 'string' },
    tint: { type: 'string' },
    'tint-hue': { type: 'string' },
    print: { type: 'boolean' },
    only: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

const config = existsSync(CONFIG_FILE) ? JSON.parse(await readFile(CONFIG_FILE, 'utf8')) : {};
const registryBase = withSlash(flags.registry ?? config.registry ?? BUNDLED_REGISTRY);
const outDir = flags.out ?? config.out ?? 'src/styles/native-base';
const pagesDir = flags.pages ?? config.pages ?? 'src/native-base';

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

  const pages = [];
  for (const item of items) {
    for (const file of item.files) {
      const name = file.target?.split('/').pop() ?? file.path.split('/').pop();
      // Blocks and templates are markup to paste from, not stylesheets to import.
      if (name.endsWith('.html')) {
        const path = join(pagesDir, `${item.meta.kind}s`, name);
        await mkdir(join(pagesDir, `${item.meta.kind}s`), { recursive: true });
        if (existsSync(path) && !flags.force) console.log(`${styleText('dim', 'skip')}  ${relative('.', path)} ${styleText('dim', '(exists, use --force)')}`);
        else {
          await writeFile(path, `${file.content}\n`);
          console.log(`${styleText('green', 'add')}   ${relative('.', path)}`);
        }
        pages.push(path);
        continue;
      }
      const path = join(outDir, name);
      const swap = item.meta?.kind === 'theme' || item.meta?.kind === 'style';
      if (swap) {
        await writeFile(path, file.content);
        console.log(`${styleText('green', 'set')}   ${relative('.', path)} ${styleText('dim', `(${item.meta.kind} ${item.title})`)}`);
      } else if (existsSync(path) && !flags.force) {
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
  if (pages.length) return console.log(`Paste the markup from ${pages.map((path) => styleText('cyan', relative('.', path))).join(', ')} into your pages.`);
  const last = items.at(-1);
  if (last.docs) console.log(`\n${styleText('bold', last.title)} markup:\n\n${last.docs}\n`);
}

const KINDS = { components: 'Components', blocks: 'Blocks', templates: 'Templates', themes: 'Themes', styles: 'Styles' };
const kindOf = (item) => (item.meta?.kind ? KINDS[`${item.meta.kind}s`] : 'Components');

async function list(filter) {
  const wanted = filter && (KINDS[filter] ?? KINDS[`${filter}s`]);
  if (filter && !wanted) throw new Error(`Unknown kind "${filter}". Try: components, blocks, templates, themes or styles`);
  const index = await fetchJson(new URL('index.json', registryBase).href);
  const width = Math.max(...index.items.map((item) => item.name.length));
  for (const [group, items] of Map.groupBy(index.items, kindOf)) {
    if (wanted && group !== wanted) continue;
    if (!wanted) console.log(`\n${styleText('bold', group)}`);
    for (const item of items) {
      const size = item.meta?.size ? `${(item.meta.size.gzip / 1024).toFixed(1)}kb`.padStart(6) : ''.padStart(6);
      console.log(`${item.name.padEnd(width)}  ${styleText('dim', size)}  ${item.description}`);
    }
  }
  if (!wanted) console.log(`\n${styleText('dim', 'Compose a theme and a style: native-base theme indigo --style mochi')}`);
}

async function view(ref) {
  const item = await fetchJson(toUrl(ref));
  if (item.meta?.kind === 'block' || item.meta?.kind === 'template') {
    console.log(styleText('bold', `${item.title}`), styleText('dim', `(${item.meta.kind} · ${item.meta.tokens} tokens · uses ${item.registryDependencies.map((dep) => dep.replace(NAMESPACE, '')).join(', ')})`));
    console.log(item.description, '\n');
    console.log(item.files[0].content);
    console.log(`\n${styleText('dim', `native-base add ${item.name}`)}`);
    return;
  }
  if (item.meta?.kind) {
    console.log(styleText('bold', `${item.title}`), styleText('dim', `(${item.meta.kind})`));
    console.log(item.description, '\n');
    console.log(item.files[0].content);
    console.log(`\n${styleText('dim', `native-base add ${item.name}`)}`);
    return;
  }
  console.log(styleText('bold', `${item.title}`), styleText('dim', `(${item.meta.size.gzip} B gzip)`));
  console.log(item.description, '\n');
  for (const [hook, meaning] of Object.entries(item.meta.api)) console.log(`  ${styleText('cyan', hook)}  ${meaning}`);
  for (const example of item.meta.examples) console.log(`\n${styleText('dim', `<!-- ${example.title} · ${example.tokens} tokens -->`)}\n${example.code}`);
}

/** A preset name, a playground link or a file. Returns whatever halves it contained. */
async function load(source) {
  const shared = decodeShare(source);
  if (shared) return shared;
  if (existsSync(source)) {
    const text = await readFile(source, 'utf8');
    const result = decodeShare(text.trim()) ?? parse(text);
    if (!result.theme && !result.style) throw new Error(`${source} has no native-base theme or style variables in it`);
    return result;
  }
  const theme = findTheme(source);
  const style = findStyle(source);
  if (theme || style) return { theme: theme && themeFrom(theme), style: style && styleFrom(style) };
  const names = [...THEME_PRESETS, ...STYLE_PRESETS].map((preset) => slug(preset.name)).join(', ');
  throw new Error(`"${source}" is not a preset, a playground link or a file. Presets: ${names}`);
}

/** Partial imports (a shadcn theme with only some colors) fill in from the defaults. */
function complete(theme) {
  if (!theme?.partial) return theme;
  const base = themeFrom(THEME_PRESETS[0]);
  const pick = (scheme, other) => Object.fromEntries(Object.keys(base.light).map((name) => [name, theme[scheme][name] ?? theme[other][name] ?? base[scheme][name]]));
  return { name: theme.name, seed: null, light: pick('light', 'dark'), dark: pick('dark', 'light'), locked: [] };
}

const number = (name, min, max) => {
  if (flags[name] == null) return undefined;
  const value = Number(flags[name]);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`--${name} must be a number from ${min} to ${max}`);
  return value;
};

async function theme(source = flags.theme) {
  const loaded = source ? await load(source) : {};
  let themeState = complete(loaded.theme);
  // `native-base theme mochi` writes just the style; `native-base theme mochi --style hygge` is a mistake.
  if (source && !themeState && flags.style) throw new Error(`"${source}" is a style, not a theme. Try: native-base theme <theme> --style ${source}`);

  const seed = { hue: number('hue', 0, 360), chroma: number('chroma', 0, 0.4), tint: number('tint', 0, 1), tintHue: number('tint-hue', 0, 360) };
  if (Object.values(seed).some((value) => value !== undefined)) {
    const start = themeState?.seed ?? { hue: 265, chroma: 0.15, tint: 0.2, tintHue: null };
    const next = { ...start, ...Object.fromEntries(Object.entries(seed).filter(([, value]) => value !== undefined)) };
    if (seed.hue !== undefined && seed.tintHue === undefined && start.tintHue === null) next.tintHue = null;
    const name = themeState && seed.hue === undefined ? `${themeState.name} (tuned)` : `Hue ${next.hue}`;
    themeState = { name, seed: next, ...generateTheme(next), locked: [] };
  }

  let styleState = loaded.style?.partial ? styleFrom({ name: 'Imported', vars: loaded.style.vars }) : loaded.style && styleFrom(loaded.style);
  if (flags.style) {
    const fromStyle = await load(flags.style);
    if (!fromStyle.style) throw new Error(`"${flags.style}" has no style variables in it`);
    styleState = styleFrom(fromStyle.style);
  }
  if (!themeState && !styleState) throw new Error('Nothing to write. Try: native-base theme indigo --style mochi');

  if (flags.only && !['theme', 'style'].includes(flags.only)) throw new Error('--only takes theme or style');
  if (flags.only === 'theme') styleState = undefined;
  if (flags.only === 'style') themeState = undefined;
  if (!themeState && !styleState) throw new Error(`Nothing left to write with --only ${flags.only}`);

  const state = { theme: themeState ?? themeFrom(THEME_PRESETS[0]), style: styleState ?? styleFrom(STYLE_PRESETS[0]) };
  const files = [
    themeState && ['theme.css', toCSS(state, { theme: true, style: false })],
    styleState && ['style.css', toCSS(state, { theme: false, style: true })],
  ].filter(Boolean);

  if (flags.print) {
    console.log(files.length === 2 ? toCSS(state) : files[0][1]);
    return;
  }

  await mkdir(outDir, { recursive: true });
  const indexPath = join(outDir, 'index.css');
  const index = existsSync(indexPath) ? await readFile(indexPath, 'utf8') : '';
  const imports = new Set(index.match(/@import "[^"]+";/g));
  for (const [name, css] of files) {
    const path = join(outDir, name);
    await writeFile(path, `${css}\n`);
    const label = name === 'theme.css' ? `theme ${state.theme.name}` : `style ${state.style.name}`;
    console.log(`${styleText('green', 'set')}   ${relative('.', path)} ${styleText('dim', `(${label})`)}`);
    imports.add(`@import "./${name}";`);
  }
  await writeFile(indexPath, `${[...imports].join('\n')}\n`);
  if (!existsSync(join(outDir, 'tokens.css'))) console.log(`\n${styleText('yellow', 'note')}  No tokens.css in ${outDir} yet. Run native-base init, or link native-base.css first.`);
  console.log(`\nImport once: ${styleText('cyan', `@import "./${relative('.', indexPath)}";`)}`);
}

/** The skill ships inside the package, so it always describes the version that is installed. */
async function skill() {
  const path = join(flags.out ?? '.claude/skills', 'native-base');
  if (existsSync(path) && !flags.force) throw new Error(`${relative('.', path)} exists. Pass --force to replace it`);
  await rm(path, { recursive: true, force: true });
  await cp(BUNDLED_SKILL, path, { recursive: true });
  console.log(`${styleText('green', 'add')}   ${relative('.', path)}/SKILL.md ${styleText('dim', '(and references/)')}`);
}

async function init() {
  if (!existsSync(CONFIG_FILE)) {
    const initial = { out: outDir, ...(flags.registry && { registry: flags.registry }) };
    await writeFile(CONFIG_FILE, `${JSON.stringify(initial, null, 2)}\n`);
    console.log(`${styleText('green', 'add')}   ${CONFIG_FILE}`);
  }
  await add(['tokens', 'base']);
  if (flags.theme || flags.style || flags.hue) {
    console.log('');
    await theme(flags.theme);
  }
}

const [command, ...args] = positionals;
const commands = { add: () => add(args), list: () => list(args[0]), view: () => view(args[0]), theme: () => theme(args[0] ?? flags.theme), skill, init };

try {
  if (flags.help || !commands[command]) console.log(HELP);
  else await commands[command]();
} catch (error) {
  console.error(styleText('red', error.message));
  process.exitCode = 1;
}

/**
 * Every registry example, in every framework: React's version is rendered and compared with the
 * HTML it came from, and Solid, Vue and Svelte's versions are put through their own compilers.
 *
 *   node check-frameworks.js
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { translatable, translate } from './site/translate.js';

const require = createRequire(import.meta.url);
const { registry } = await import(pathToFileURL(require.resolve('@native-base/css')).href);
const { compile: compileSvelte } = await import('svelte/compiler');
const { parse: parseSfc, compileScript, compileTemplate } = await import('vue/compiler-sfc');
const { transformAsync } = await import('@babel/core');
const solidPreset = require.resolve('babel-preset-solid');
const { rolldown } = await import('rolldown');
const { renderToStaticMarkup } = await import('react-dom/server');

const pascal = (text) => text.replace(/(^|[^a-z0-9])([a-z0-9])/gi, (_, __, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '');
const TAG = /(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)(\s*\/?)>/g;
const ATTR = /([^\s=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
const entities = (text) => text.replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x2F;/g, '/');

/** Compare DOM meaning, not spelling: attribute order, case, empty values and entity escapes are all noise. */
function normalise(html) {
  return entities(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<link[^>]*rel="preload"[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(TAG, (match, open, tag, attrs, close) => {
      if (open === '</') return `</${tag.toLowerCase()}>`;
      const list = [];
      for (const [, name, value] of (attrs ?? '').matchAll(ATTR)) {
        if (!name.trim()) continue;
        const clean = value === undefined ? '' : value.replace(/^["']|["']$/g, '').replace(/\s*([:;])\s*/g, '$1').replace(/;$/, '');
        list.push(`${name.toLowerCase()}${clean ? `="${clean}"` : ''}`);
      }
      return `<${tag.toLowerCase()}${list.sort().map((attr) => ` ${attr}`).join('')}>`;
    })
    .replace(/<([a-z][\w-]*)([^>]*)><\/\1>/g, '<$1$2>')
    .trim();
}

const cases = [];
for (const item of registry.items) {
  for (const example of item.examples) {
    if (translatable(example.code)) cases.push({ id: `${item.name}/${example.title}`, name: pascal(`${item.name} ${example.title}`), html: example.code });
  }
}

const failures = [];
mkdirSync('node_modules/.framework-check', { recursive: true });

// React: bundle every generated component, render it, compare with the HTML it came from.
const entry = [];
cases.forEach((testCase, index) => {
  const { react } = translate(testCase.html, testCase.name);
  writeFileSync(`node_modules/.framework-check/case${index}.jsx`, react.code);
  entry.push(`import C${index} from './case${index}.jsx';`);
});
entry.push(`export default [${cases.map((_, index) => `C${index}`).join(', ')}];`);
writeFileSync('node_modules/.framework-check/index.jsx', entry.join('\n'));

const bundle = await rolldown({
  input: 'node_modules/.framework-check/index.jsx',
  external: ['react', 'react/jsx-runtime', 'react-dom/server'],
  transform: { jsx: { runtime: 'automatic' } },
});
await bundle.write({ file: 'node_modules/.framework-check/bundle.js', format: 'esm' });
const components = (await import(pathToFileURL(`${process.cwd()}/node_modules/.framework-check/bundle.js`).href)).default;

const warnings = [];
const originalError = console.error;
console.error = (...args) => warnings.push(String(args[0]).slice(0, 120));
components.forEach((Component, index) => {
  const rendered = renderToStaticMarkup(Component());
  if (normalise(rendered) !== normalise(cases[index].html)) {
    failures.push(`react ${cases[index].id}\n  html:  ${normalise(cases[index].html).slice(0, 220)}\n  react: ${normalise(rendered).slice(0, 220)}`);
  }
});
console.error = originalError;

// Solid, Vue and Svelte: compile only — if their compilers accept it, the markup is valid in that framework.
for (const testCase of cases) {
  const out = translate(testCase.html, testCase.name);
  try {
    await transformAsync(out.solid.code, { filename: `${testCase.name}.jsx`, presets: [[solidPreset, {}]], babelrc: false, configFile: false });
  } catch (error) {
    failures.push(`solid ${testCase.id}: ${error.message.split('\n')[0]}`);
  }
  try {
    const { descriptor, errors } = parseSfc(out.vue.code, { filename: `${testCase.name}.vue` });
    if (errors.length) throw new Error(errors[0].message);
    compileTemplate({ source: descriptor.template.content, filename: `${testCase.name}.vue`, id: testCase.name });
  } catch (error) {
    failures.push(`vue ${testCase.id}: ${error.message.split('\n')[0]}`);
  }
  try {
    const { warnings: svelteWarnings } = compileSvelte(out.svelte.code, { filename: `${testCase.name}.svelte`, generate: 'client' });
    for (const warning of svelteWarnings) warnings.push(`svelte ${testCase.id}: ${warning.code}`);
  } catch (error) {
    failures.push(`svelte ${testCase.id}: ${error.message.split('\n')[0]}`);
  }
}

console.log(`${cases.length} examples × 4 frameworks`);
console.log(failures.length ? `FAILURES (${failures.length}):\n${failures.join('\n')}` : 'all match');
const unique = [...new Set(warnings)];
if (unique.length) console.log(`\nwarnings (${unique.length}):\n${unique.slice(0, 20).join('\n')}`);

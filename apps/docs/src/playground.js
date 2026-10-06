import {
  STYLE_PRESETS,
  STYLE_VARS,
  THEME_PRESETS,
  THEME_VAR_NAMES,
  decodeShare,
  encodeShare,
  fileName,
  generateTheme,
  hexToOklch,
  oklchToHex,
  parse,
  parseOklch,
  styleFrom,
  themeFrom,
  toCSS,
  toJSON,
  slug,
} from '@digiup/native-base/presets';

const STORAGE = 'nb-playground';
const root = document.querySelector('[data-pg]');
const panel = root.querySelector('[data-pg-panel]');
const stage = root.querySelector('[data-pg-stage]');
const $ = (selector, scope = root) => scope.querySelector(selector);
const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];

/* ---------- State ---------- */

const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null') ?? { themes: [], styles: [], current: null };

const toHash = encodeShare;

const initial = decodeShare(location.hash) ?? saved.current;
const state = {
  theme: initial?.theme ?? themeFrom(THEME_PRESETS[0]),
  style: styleFrom(initial?.style ?? STYLE_PRESETS[0]),
};
state.theme.locked ??= [];

const builtIn = (kind) => (kind === 'theme' ? THEME_PRESETS : STYLE_PRESETS);
const store = (kind) => (kind === 'theme' ? saved.themes : saved.styles);

/* ---------- Color helpers ---------- */

const probe = document.createElement('span');
probe.style.display = 'none';
document.body.append(probe);

/** Best-effort hex for the picker swatch: our oklch strings directly, anything else through the browser. */
function toHex(value) {
  const ok = parseOklch(value);
  if (ok) return oklchToHex(ok.L, ok.C, ok.h);
  probe.style.color = '';
  probe.style.color = value;
  const computed = getComputedStyle(probe).color;
  const rgb = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) return `#${rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  const srgb = computed.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
  if (srgb) return `#${srgb.slice(1, 4).map((n) => Math.round(Number(n) * 255).toString(16).padStart(2, '0')).join('')}`;
  const lch = parseOklch(computed.replace(/\s*\/\s*[\d.]+\)$/, ')'));
  return lch ? oklchToHex(lch.L, lch.C, lch.h) : '#808080';
}

/* ---------- Apply ---------- */

const esc = (text) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const CSS_TOKEN = /(\/\*[\s\S]*?\*\/)|("[^"]*")|(--?[a-zA-Z][\w-]*)(?=\s*:[^{};]*[;}])|\b(var|light-dark|oklch|cubic-bezier)(?=\()/g;
const JSON_TOKEN = /("[^"]*")(?=\s*:)|("[^"]*")|(-?\d[\d.]*)/g;

const highlight = (code, lang) =>
  esc(code).replace(lang === 'css' ? CSS_TOKEN : JSON_TOKEN, (text, a, b, c) =>
    lang === 'css'
      ? `<span data-t="${a ? 'c' : b ? 's' : c ? 'a' : 't'}">${text}</span>`
      : `<span data-t="${a ? 'a' : b ? 's' : 'k'}">${text}</span>`,
  );

/* ---------- The same state as a CLI command ---------- */

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const presetTheme = (theme) => (theme.seed && !theme.locked.length ? THEME_PRESETS.find((p) => same(p.seed, theme.seed)) : undefined);
const presetStyle = (style) => STYLE_PRESETS.find((p) => same(styleFrom(p).vars, style.vars));
const num = (value) => String(Number(value.toFixed(3))).replace(/^0\./, '.');

/** The shortest command that reproduces what's on screen: preset names, then seed flags, then the share link. */
function cliCommand(include) {
  const { theme, style } = state;
  const link = () => `"${location.origin}${location.pathname}#s=${toHash(state)}"`;
  const themePreset = presetTheme(theme);
  const stylePreset = presetStyle(style);
  const generated = theme.seed && !theme.locked.length;
  const seedFlags = () => {
    const { hue, chroma, tint, tintHue } = theme.seed;
    return `--hue ${Math.round(hue)} --chroma ${num(chroma)} --tint ${num(tint)}${tintHue == null ? '' : ` --tint-hue ${Math.round(tintHue)}`}`;
  };
  if (include.theme && include.style) {
    if (themePreset && stylePreset) return [`npx native-base theme ${slug(themePreset.name)} --style ${slug(stylePreset.name)}`, 'Both are presets: this is also npx native-base add theme-… style-….'];
    if (generated && stylePreset) return [`npx native-base theme ${seedFlags()} --style ${slug(stylePreset.name)}`, 'The theme is generated from four numbers, so the flags carry it.'];
    return [`npx native-base theme ${link()}`, 'Custom values travel in the link, so the CLI writes exactly what you see.'];
  }
  if (include.theme) {
    if (themePreset) return [`npx native-base theme ${slug(themePreset.name)}`, 'Writes theme.css only.'];
    if (generated) return [`npx native-base theme ${seedFlags()}`, 'Writes theme.css only.'];
    return [`npx native-base theme ${link()} --only theme`, 'Writes theme.css only.'];
  }
  if (include.style) {
    if (stylePreset) return [`npx native-base theme --style ${slug(stylePreset.name)}`, 'Writes style.css only.'];
    return [`npx native-base theme --style ${link()}`, 'Writes style.css only.'];
  }
  return ['# Tick Theme or Style above', ''];
}

const urls = {};
function output(kind, text, include) {
  const details = $(`[data-pg-export] details[data-export=${kind}]`);
  $('code', details).innerHTML = kind === 'sh' ? esc(text) : highlight(text, kind);
  if (kind === 'sh') return;
  const link = $(`[data-download=${kind}]`);
  URL.revokeObjectURL(urls[kind]);
  urls[kind] = URL.createObjectURL(new Blob([text], { type: kind === 'css' ? 'text/css' : 'application/json' }));
  link.href = urls[kind];
  link.download = `${fileName(state, include)}.${kind}`;
  $('[data-code-bar] small', details).textContent = link.download;
}

let hashTimer;
function apply() {
  const { theme, style } = state;
  for (const name of THEME_VAR_NAMES) {
    const l = theme.light[name];
    const d = theme.dark[name];
    stage.style.setProperty(name, l === d ? l : `light-dark(${l}, ${d})`);
  }
  for (const [name, value] of Object.entries(style.vars)) stage.style.setProperty(name, value);

  const include = { theme: $('[name=include-theme]').checked, style: $('[name=include-style]').checked };
  const [command, note] = cliCommand(include);
  output('sh', command, include);
  $('[data-pg-cli-note] small').textContent = note;
  output('css', toCSS(state, include), include);
  output('json', toJSON(state, include), include);

  saved.current = { theme, style };
  localStorage.setItem(STORAGE, JSON.stringify(saved));
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => history.replaceState(null, '', `#s=${toHash({ theme, style })}`), 300);
}

/* ---------- Render controls from state ---------- */

function renderChips(kind) {
  const box = $(`[data-pg-chips][data-kind=${kind}]`);
  const name = state[kind].name;
  $$('[data-saved]', box).forEach((el) => el.remove());
  for (const item of store(kind)) {
    const chip = document.createElement('span');
    chip.dataset.saved = '';
    chip.innerHTML = `<button type="button" data-chip data-name="${esc(item.name)}" aria-pressed="false">${esc(item.name)}</button><button type="button" data-delete aria-label="Delete ${esc(item.name)}">✕</button>`;
    box.append(chip);
  }
  for (const chip of $$('[data-chip]', box)) chip.setAttribute('aria-pressed', String(chip.dataset.name === name));
  $(`[name=${kind}-name]`).value = name;
}

function renderTheme() {
  const { theme } = state;
  renderChips('theme');
  const seedBox = $('[data-pg-seed]');
  $('[data-pg-imported]').hidden = Boolean(theme.seed);
  const seed = theme.seed ?? { hue: 265, chroma: 0.15, tint: 0.2, tintHue: null };
  for (const label of $$('[data-seed]', seedBox)) {
    const key = label.dataset.seed;
    const input = $('input', label);
    const value = key === 'tintHue' ? (seed.tintHue ?? seed.hue) : seed[key];
    input.value = value;
    $('output', label).value = key === 'hue' || key === 'tintHue' ? `${Math.round(value)}°` : String(value);
    if (key === 'tintHue') label.hidden = seed.tintHue == null;
  }
  $('[name=tintFollows]').checked = seed.tintHue == null;

  for (const row of $$('[data-pg-color]')) {
    const name = row.dataset.var;
    for (const scheme of ['light', 'dark']) {
      const value = theme[scheme][name];
      $(`input[type=text][data-scheme=${scheme}]`, row).value = value;
      $(`input[type=color][data-scheme=${scheme}]`, row).value = toHex(value);
    }
    $('[data-reset]', row).hidden = !theme.locked.includes(name) || !theme.seed;
  }
}

function renderStyle() {
  renderChips('style');
  const note = STYLE_PRESETS.find((p) => p.name === state.style.name)?.note;
  $('[data-pg-note]').hidden = !note;
  $('[data-pg-note] small').textContent = note ?? '';
  for (const row of $$('[data-pg-var][data-var]')) {
    const value = state.style.vars[row.dataset.var];
    $('[data-raw]', row).value = value;
    if (row.dataset.type === 'range') {
      $('input[type=range]', row).value = parseFloat(value) || 0;
    } else {
      const select = $('select', row);
      select.value = [...select.options].some((o) => o.value === value) ? value : '';
    }
  }
}

function render() {
  renderTheme();
  renderStyle();
  apply();
}

/* ---------- Theme editing ---------- */

function regenerate() {
  const { theme } = state;
  if (!theme.seed) return;
  const fresh = generateTheme(theme.seed);
  for (const name of THEME_VAR_NAMES) {
    if (theme.locked.includes(name)) continue;
    theme.light[name] = fresh.light[name];
    theme.dark[name] = fresh.dark[name];
  }
}

const fmt = (value) => String(Number(value.toFixed(3))).replace(/^0\./, '.');

$('[data-pg-seed]').addEventListener('input', (event) => {
  const { theme } = state;
  const box = $('[data-pg-seed]');
  const read = (key) => Number($(`[name=${key}]`, box).value);
  if (!theme.seed) {
    // Imported colors: the first slider move starts a fresh generated theme from the slider positions.
    theme.seed = { hue: read('hue'), chroma: read('chroma'), tint: read('tint'), tintHue: null };
    theme.locked = [];
  }
  theme.seed.hue = read('hue');
  theme.seed.chroma = read('chroma');
  theme.seed.tint = read('tint');
  theme.seed.tintHue = $('[name=tintFollows]', box).checked ? null : read('tintHue');
  regenerate();
  renderTheme();
  apply();
});

$('[data-random]').addEventListener('click', () => {
  const { theme } = state;
  theme.seed = { hue: Math.round(Math.random() * 360), chroma: +(0.1 + Math.random() * 0.12).toFixed(3), tint: +(Math.random() * 0.5).toFixed(2), tintHue: null };
  theme.locked = [];
  regenerate();
  renderTheme();
  apply();
});

$('[data-pg-colors]').addEventListener('input', (event) => {
  const row = event.target.closest('[data-pg-color]');
  if (!row) return;
  const { theme } = state;
  const name = row.dataset.var;
  const { scheme } = event.target.dataset;
  const value = event.target.type === 'color' ? hexToOklch(event.target.value) : event.target.value.trim();
  if (!value) return;
  theme[scheme][name] = value;
  if (!theme.locked.includes(name)) theme.locked.push(name);
  $(`input[type=text][data-scheme=${scheme}]`, row).value = value;
  $(`input[type=color][data-scheme=${scheme}]`, row).value = toHex(value);
  $('[data-reset]', row).hidden = !theme.seed;
  apply();
});

$('[data-pg-colors]').addEventListener('click', (event) => {
  const button = event.target.closest('[data-reset]');
  if (!button) return;
  const name = button.closest('[data-pg-color]').dataset.var;
  state.theme.locked = state.theme.locked.filter((n) => n !== name);
  regenerate();
  renderTheme();
  apply();
});

/* ---------- Style editing ---------- */

$('[data-pg-section][data-kind=style]').addEventListener('input', (event) => {
  const row = event.target.closest('[data-pg-var][data-var]');
  if (!row) return;
  const name = row.dataset.var;
  let value;
  if (event.target.matches('[data-raw]')) value = event.target.value.trim();
  else if (event.target.type === 'range') value = `${fmt(Number(event.target.value))}${row.dataset.unit}`;
  else if (event.target.value === '') return $('[data-raw]', row).focus();
  else value = event.target.value;
  if (!value) return;
  state.style.vars[name] = value;
  $('[data-raw]', row).value = value;
  if (row.dataset.type === 'range') $('input[type=range]', row).value = parseFloat(value) || 0;
  else {
    const select = $('select', row);
    select.value = [...select.options].some((o) => o.value === value) ? value : '';
  }
  apply();
});

/* ---------- Presets: load, save, delete ---------- */

panel.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-chip]');
  const del = event.target.closest('[data-delete]');
  const save = event.target.closest('[data-save]');
  if (!chip && !del && !save) return;
  const kind = (chip ?? del ?? save).closest('[data-pg-section]').dataset.kind;

  if (chip) {
    const name = chip.dataset.name;
    const item = store(kind).find((p) => p.name === name) ?? builtIn(kind).find((p) => p.name === name);
    if (!item) return;
    state[kind] = kind === 'theme' ? (item.seed && !item.light ? themeFrom(item) : structuredClone({ ...item, locked: item.locked ?? [] })) : styleFrom(item);
  } else if (del) {
    const name = $('[data-chip]', del.parentElement).dataset.name;
    const list = store(kind);
    list.splice(list.findIndex((p) => p.name === name), 1);
  } else {
    let name = $(`[name=${kind}-name]`).value.trim() || state[kind].name;
    if (builtIn(kind).some((p) => p.name === name)) name = `${name} copy`;
    state[kind].name = name;
    const list = store(kind);
    const index = list.findIndex((p) => p.name === name);
    const copy = structuredClone(state[kind]);
    if (index >= 0) list[index] = copy;
    else list.push(copy);
    save.textContent = 'Saved';
    setTimeout(() => (save.textContent = 'Save'), 1200);
  }
  render();
});

panel.addEventListener('input', (event) => {
  if (event.target.name === 'theme-name') state.theme.name = event.target.value.trim() || state.theme.name;
  if (event.target.name === 'style-name') state.style.name = event.target.value.trim() || state.style.name;
  if (event.target.name?.endsWith('-name')) apply();
});

/* ---------- Toolbar, export, import ---------- */

$('[data-reset-all]').addEventListener('click', () => {
  state.theme = themeFrom(THEME_PRESETS[0]);
  state.style = styleFrom(STYLE_PRESETS[0]);
  render();
});

$('[data-share]').addEventListener('click', async (event) => {
  history.replaceState(null, '', `#s=${toHash({ theme: state.theme, style: state.style })}`);
  await navigator.clipboard.writeText(location.href);
  event.target.textContent = 'Link copied';
  setTimeout(() => (event.target.textContent = 'Copy link'), 1400);
});

$('[data-pg-include]').addEventListener('change', apply);

$('[data-import-run]').addEventListener('click', () => {
  const status = $('[data-import-status]');
  const text = $('[data-import]').value;
  try {
    const result = parse(text);
    if (!result.theme && !result.style) throw new Error('No native-base variables found.');
    if (result.theme?.partial) {
      // Merge into the current theme and lock what came in. A full shadcn theme replaces it outright.
      const { light, dark } = result.theme;
      const found = new Set([...Object.keys(light), ...Object.keys(dark)]);
      const full = found.size >= THEME_VAR_NAMES.length / 2;
      const theme = full ? { name: 'Imported', seed: null, light: {}, dark: {}, locked: [...THEME_VAR_NAMES] } : state.theme;
      const base = full ? generateTheme(THEME_PRESETS[0].seed) : theme;
      for (const name of THEME_VAR_NAMES) {
        theme.light[name] = light[name] ?? (full ? base.light[name] : theme.light[name]);
        theme.dark[name] = dark[name] ?? (full ? base.dark[name] : theme.dark[name]);
        if (found.has(name) && !theme.locked.includes(name)) theme.locked.push(name);
      }
      state.theme = theme;
    } else if (result.theme) state.theme = result.theme;
    if (result.style?.partial) state.style = { name: state.style.name, vars: { ...state.style.vars, ...result.style.vars } };
    else if (result.style) state.style = styleFrom(result.style);
    status.textContent = `Imported ${[result.theme && 'theme', result.style && 'style'].filter(Boolean).join(' and ')}.`;
    render();
  } catch (error) {
    status.textContent = error.message;
  }
});

// Keep the preview's own controls from navigating or submitting anything.
stage.addEventListener('click', (event) => {
  if (event.target.closest('a[href="#"]')) event.preventDefault();
});

render();

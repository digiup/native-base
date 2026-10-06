// Themes and styles: shared by the registry build, the CLI and the docs playground. No DOM, no Node APIs.
// A *theme* is colors. A *style* is everything else: spacing, shape, type, motion. They compose.

/* ---------- Theme ---------- */

export const THEME_VARS = [
  ['--background', 'Background', 'Surfaces'],
  ['--foreground', 'Foreground', 'Surfaces'],
  ['--card', 'Card', 'Surfaces'],
  ['--card-foreground', 'Card foreground', 'Surfaces'],
  ['--popover', 'Popover', 'Surfaces'],
  ['--popover-foreground', 'Popover foreground', 'Surfaces'],
  ['--primary', 'Primary', 'Brand'],
  ['--primary-foreground', 'Primary foreground', 'Brand'],
  ['--secondary', 'Secondary', 'Brand'],
  ['--secondary-foreground', 'Secondary foreground', 'Brand'],
  ['--accent', 'Accent (hover)', 'Brand'],
  ['--accent-foreground', 'Accent foreground', 'Brand'],
  ['--muted', 'Muted', 'Text'],
  ['--muted-foreground', 'Muted foreground', 'Text'],
  ['--destructive', 'Destructive', 'Status'],
  ['--success', 'Success', 'Status'],
  ['--warning', 'Warning', 'Status'],
  ['--border', 'Border', 'Lines'],
  ['--input', 'Field border', 'Lines'],
  ['--ring', 'Focus ring', 'Lines'],
];

export const THEME_VAR_NAMES = THEME_VARS.map(([name]) => name);

/** The four knobs of the quick generator. tintHue null means "follow hue". */
export const SEED_FIELDS = [
  { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1 },
  { key: 'chroma', label: 'Chroma', min: 0, max: 0.3, step: 0.005, hint: '0 is the shadcn/ui black-and-white primary' },
  { key: 'tint', label: 'Neutral tint', min: 0, max: 1, step: 0.05, hint: 'How much hue leaks into greys' },
  { key: 'tintHue', label: 'Tint hue', min: 0, max: 360, step: 1 },
];

const n = (value, digits = 3) => {
  const s = Number(value.toFixed(digits));
  return String(s).replace(/^(-?)0\./, '$1.');
};
export const oklch = (l, c, h, alpha) => `oklch(${n(l)} ${n(Math.max(0, c))} ${n(h, 1)}${alpha != null ? ` / ${alpha}%` : ''})`;

/** Twenty colors for both schemes from four numbers. */
export function generateTheme(seed) {
  const { hue, chroma, tint } = seed;
  const th = seed.tintHue ?? hue;
  const t = tint * 0.03; // max chroma of a "neutral"
  const vivid = chroma >= 0.02;
  const light = {
    '--background': oklch(1 - 0.012 * tint, t * 0.25, th),
    '--foreground': oklch(0.145, t * 0.6, th),
    '--card': oklch(1, t * 0.15, th),
    '--popover': oklch(1, t * 0.15, th),
    '--primary': vivid ? oklch(0.55, chroma, hue) : oklch(0.205, t, th),
    '--primary-foreground': vivid ? oklch(0.985, Math.min(chroma * 0.05, 0.01), hue) : oklch(0.985, 0, 0),
    '--secondary': oklch(0.97, t * 0.4, th),
    '--muted': oklch(0.97, t * 0.4, th),
    '--muted-foreground': oklch(0.556, t * 0.5, th),
    '--accent': oklch(0.97, t * 0.4, th),
    '--destructive': oklch(0.577, 0.245, 27.3),
    '--success': oklch(0.6, 0.15, 150),
    '--warning': oklch(0.68, 0.16, 70),
    '--border': oklch(0.922, t * 0.4, th),
    '--input': oklch(0.922, t * 0.4, th),
    '--ring': vivid ? oklch(0.65, chroma * 0.7, hue) : oklch(0.708, t, th),
  };
  const dark = {
    '--background': oklch(0.145, t * 0.5, th),
    '--foreground': oklch(0.985, t * 0.2, th),
    '--card': oklch(0.205, t * 0.5, th),
    '--popover': oklch(0.205, t * 0.5, th),
    '--primary': vivid ? oklch(0.72, chroma, hue) : oklch(0.922, t * 0.3, th),
    '--primary-foreground': vivid ? oklch(0.2, chroma * 0.3, hue) : oklch(0.205, 0, 0),
    '--secondary': oklch(0.269, t * 0.5, th),
    '--muted': oklch(0.269, t * 0.5, th),
    '--muted-foreground': oklch(0.708, t * 0.4, th),
    '--accent': oklch(0.269, t * 0.5, th),
    '--destructive': oklch(0.704, 0.191, 22.2),
    '--success': oklch(0.72, 0.17, 150),
    '--warning': oklch(0.8, 0.16, 80),
    '--border': oklch(1, 0, 0, 10),
    '--input': oklch(1, 0, 0, 15),
    '--ring': vivid ? oklch(0.6, chroma * 0.7, hue) : oklch(0.556, t, th),
  };
  for (const scheme of [light, dark]) {
    scheme['--card-foreground'] = scheme['--foreground'];
    scheme['--popover-foreground'] = scheme['--foreground'];
    scheme['--secondary-foreground'] = scheme['--foreground'];
    scheme['--accent-foreground'] = scheme['--foreground'];
  }
  return { light, dark };
}

export const THEME_PRESETS = [
  { name: 'Neutral', note: 'Pure greys with a black-and-white primary, the shadcn/ui default.', seed: { hue: 0, chroma: 0, tint: 0, tintHue: null } },
  { name: 'Stone', note: 'Warm greys and an ink primary, like paper and pencil.', seed: { hue: 60, chroma: 0, tint: 0.35, tintHue: null } },
  { name: 'Indigo', note: 'A confident blue-violet primary on cool, faintly tinted greys.', seed: { hue: 265, chroma: 0.18, tint: 0.2, tintHue: null } },
  { name: 'Emerald', note: 'A fresh green primary on greys with a hint of mint.', seed: { hue: 155, chroma: 0.15, tint: 0.15, tintHue: null } },
  { name: 'Rose', note: 'A vivid pink-red primary on nearly neutral greys.', seed: { hue: 10, chroma: 0.2, tint: 0.1, tintHue: null } },
  { name: 'Amber', note: 'A honey-orange primary on sand-tinted greys.', seed: { hue: 65, chroma: 0.16, tint: 0.25, tintHue: 75 } },
];

/** A complete theme object from a preset: generated colors plus the seed that made them. */
export function themeFrom(preset) {
  return { name: preset.name, seed: { ...preset.seed }, ...generateTheme(preset.seed), locked: [] };
}

/** "Béton" → "beton". Registry names and file names use it. */
export const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const find = (list, ref) => {
  const key = slug(String(ref).replace(/^(@native-base\/)?(theme|style)-/, ''));
  return list.find((preset) => slug(preset.name) === key);
};
/** Accepts "Indigo", "indigo" or "theme-indigo". */
export const findTheme = (ref) => find(THEME_PRESETS, ref);
/** Accepts "Béton", "beton" or "style-beton". */
export const findStyle = (ref) => find(STYLE_PRESETS, ref);

/* ---------- Style ---------- */

export const FONT_STACKS = {
  System: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  'Neo-grotesque': 'Inter, Roboto, "Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif',
  Humanist: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif',
  Geometric: 'Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif',
  Rounded: 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT", "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif',
  Industrial: 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif',
  Transitional: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
  'Old style': '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif',
  Slab: 'Rockwell, "Rockwell Nova", "Roboto Slab", "DejaVu Serif", "Sitka Small", serif',
  Didone: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif',
  'System mono': 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  'Code mono': 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
};

export const SHADOWS = {
  None: 'none',
  Subtle: '0 1px 2px oklch(0 0 0 / 6%)',
  Soft: '0 2px 8px -2px oklch(0 0 0 / 10%)',
  Lifted: '0 4px 14px -4px oklch(0 0 0 / 18%), 0 1px 2px oklch(0 0 0 / 6%)',
  Hard: '3px 3px 0 var(--foreground)',
};

export const SHADOWS_LG = {
  None: 'none',
  Default: '0 10px 38px -10px oklch(0 0 0 / 25%), 0 10px 20px -15px oklch(0 0 0 / 20%)',
  Soft: '0 24px 60px -20px oklch(0 0 0 / 22%)',
  Lifted: '0 12px 32px -8px oklch(0 0 0 / 30%), 0 2px 6px oklch(0 0 0 / 10%)',
  Hard: '6px 6px 0 var(--foreground)',
};

export const EASES = {
  Default: 'cubic-bezier(.2, .8, .2, 1)',
  Linear: 'linear',
  'Ease out': 'cubic-bezier(.16, 1, .3, 1)',
  Snappy: 'cubic-bezier(.4, 0, .2, 1)',
  Spring: 'cubic-bezier(.34, 1.56, .64, 1)',
};

/** CSS corner-shape. Unsupported browsers ignore it and draw the plain rounded corner. */
export const CORNER_SHAPES = {
  Round: 'round',
  Squircle: 'squircle',
  'Soft squircle': 'superellipse(1.5)',
  Bevel: 'bevel',
  Notch: 'notch',
  Scoop: 'scoop',
  Square: 'square',
};

const WEIGHTS = { Regular: '400', Medium: '500', Semibold: '600', Bold: '700', Black: '800' };

/** Every non-color variable, with the control that edits it. The raw value is always editable too. */
export const STYLE_VARS = [
  { name: '--spacing', label: 'Spacing unit', group: 'Space', type: 'range', min: 0.15, max: 0.4, step: 0.01, unit: 'rem', hint: 'Every gap, padding and control height is a multiple of it' },
  { name: '--radius', label: 'Radius', group: 'Shape', type: 'range', min: 0, max: 2, step: 0.125, unit: 'rem' },
  { name: '--corner-shape', label: 'Corner shape', group: 'Shape', type: 'choice', options: CORNER_SHAPES, hint: 'Needs a radius to show. Chrome 139+; elsewhere corners stay round' },
  { name: '--border-width', label: 'Border width', group: 'Shape', type: 'range', min: 0, max: 3, step: 1, unit: 'px' },
  { name: '--shadow', label: 'Shadow', group: 'Shape', type: 'choice', options: SHADOWS },
  { name: '--shadow-lg', label: 'Shadow, overlays', group: 'Shape', type: 'choice', options: SHADOWS_LG },
  { name: '--font-sans', label: 'Body font', group: 'Type', type: 'choice', options: FONT_STACKS },
  { name: '--font-heading', label: 'Heading font', group: 'Type', type: 'choice', options: FONT_STACKS },
  { name: '--font-mono', label: 'Mono font', group: 'Type', type: 'choice', options: FONT_STACKS },
  { name: '--text-xs', label: 'Text xs', group: 'Type', type: 'range', min: 0.625, max: 0.9375, step: 0.0625, unit: 'rem', hint: 'Badges, hints, tooltips' },
  { name: '--text-sm', label: 'Text sm', group: 'Type', type: 'range', min: 0.75, max: 1.0625, step: 0.0625, unit: 'rem', hint: 'Controls, labels, tables' },
  { name: '--text-base', label: 'Text base', group: 'Type', type: 'range', min: 0.875, max: 1.25, step: 0.0625, unit: 'rem', hint: 'Body copy; headings scale from it' },
  { name: '--text-lg', label: 'Text lg', group: 'Type', type: 'range', min: 1, max: 1.5, step: 0.0625, unit: 'rem', hint: 'Dialog titles' },
  { name: '--leading', label: 'Line height', group: 'Type', type: 'range', min: 1.2, max: 2, step: 0.05, unit: '' },
  { name: '--tracking', label: 'Heading tracking', group: 'Type', type: 'range', min: -0.06, max: 0.06, step: 0.005, unit: 'em' },
  { name: '--weight', label: 'UI weight', group: 'Type', type: 'choice', options: WEIGHTS, hint: 'Buttons, labels, titles' },
  { name: '--weight-heading', label: 'Heading weight', group: 'Type', type: 'choice', options: WEIGHTS },
  { name: '--duration', label: 'Duration', group: 'Motion', type: 'range', min: 0, max: 0.6, step: 0.02, unit: 's' },
  { name: '--ease', label: 'Easing', group: 'Motion', type: 'choice', options: EASES },
];

export const STYLE_VAR_NAMES = STYLE_VARS.map(({ name }) => name);

export const DEFAULT_STYLE = {
  '--spacing': '.25rem',
  '--radius': '.625rem',
  '--corner-shape': 'round',
  '--border-width': '1px',
  '--shadow': SHADOWS.Subtle,
  '--shadow-lg': SHADOWS_LG.Default,
  '--font-sans': FONT_STACKS.System,
  '--font-heading': FONT_STACKS.System,
  '--font-mono': FONT_STACKS['System mono'],
  '--text-xs': '.75rem',
  '--text-sm': '.875rem',
  '--text-base': '1rem',
  '--text-lg': '1.125rem',
  '--leading': '1.6',
  '--tracking': '-.02em',
  '--weight': '500',
  '--weight-heading': '600',
  '--duration': '.18s',
  '--ease': EASES.Default,
};

const style = (name, note, vars) => ({ name, note, vars: { ...DEFAULT_STYLE, ...vars } });

export const STYLE_PRESETS = [
  style('Meridian', 'The reference line: balanced defaults everything else is measured from.', {}),
  style('Ledger', 'Dense like an accounts book: tight rhythm and small type for data-heavy screens.', {
    '--spacing': '.2rem',
    '--radius': '.375rem',
    '--text-xs': '.6875rem',
    '--text-sm': '.8125rem',
    '--text-base': '.9375rem',
    '--text-lg': '1.0625rem',
    '--leading': '1.45',
    '--tracking': '-.01em',
    '--duration': '.12s',
  }),
  style('Hygge', 'Danish coziness: roomy spacing, soft shadows, squircle corners, unhurried motion.', {
    '--spacing': '.3rem',
    '--radius': '.875rem',
    '--corner-shape': CORNER_SHAPES['Soft squircle'],
    '--shadow': SHADOWS.Soft,
    '--shadow-lg': SHADOWS_LG.Soft,
    '--text-base': '1.0625rem',
    '--text-lg': '1.1875rem',
    '--leading': '1.7',
    '--duration': '.22s',
  }),
  style('Zurich', 'Swiss International Style: square corners, grotesque type, no ornament.', {
    '--radius': '0rem',
    '--corner-shape': CORNER_SHAPES.Square,
    '--shadow': SHADOWS.None,
    '--shadow-lg': SHADOWS_LG.Lifted,
    '--font-sans': FONT_STACKS['Neo-grotesque'],
    '--font-heading': FONT_STACKS.Industrial,
    '--tracking': '0em',
    '--weight-heading': '700',
    '--duration': '.1s',
    '--ease': EASES.Snappy,
  }),
  style('Mochi', 'Squishy rice cake: big squircles, rounded type and a springy bounce.', {
    '--spacing': '.27rem',
    '--radius': '1.5rem',
    '--corner-shape': CORNER_SHAPES.Squircle,
    '--shadow': SHADOWS.Soft,
    '--shadow-lg': SHADOWS_LG.Soft,
    '--font-sans': FONT_STACKS.Rounded,
    '--font-heading': FONT_STACKS.Rounded,
    '--tracking': '-.01em',
    '--weight': '600',
    '--weight-heading': '700',
    '--duration': '.25s',
    '--ease': EASES.Spring,
  }),
  style('Origami', 'Folded paper: crisp bevelled corners, flat surfaces, geometric type.', {
    '--radius': '.625rem',
    '--corner-shape': CORNER_SHAPES.Bevel,
    '--shadow': SHADOWS.None,
    '--shadow-lg': SHADOWS_LG.Lifted,
    '--font-sans': FONT_STACKS.Geometric,
    '--font-heading': FONT_STACKS.Geometric,
    '--tracking': '-.015em',
    '--weight-heading': '700',
    '--duration': '.14s',
    '--ease': EASES.Snappy,
  }),
  style('Folio', 'A printed page: serif reading type, generous leading, quiet edges.', {
    '--radius': '.25rem',
    '--shadow': SHADOWS.None,
    '--font-sans': FONT_STACKS.Transitional,
    '--font-heading': FONT_STACKS.Didone,
    '--text-base': '1.0625rem',
    '--leading': '1.7',
    '--tracking': '-.03em',
    '--weight': '500',
    '--weight-heading': '700',
    '--duration': '.2s',
  }),
  style('Gatsby', 'Art Deco lobby: scooped corners, high-contrast display serif, open tracking.', {
    '--spacing': '.27rem',
    '--radius': '.75rem',
    '--corner-shape': CORNER_SHAPES.Scoop,
    '--shadow': SHADOWS.None,
    '--shadow-lg': SHADOWS_LG.Lifted,
    '--font-sans': FONT_STACKS.Humanist,
    '--font-heading': FONT_STACKS.Didone,
    '--tracking': '.02em',
    '--weight': '500',
    '--weight-heading': '600',
    '--duration': '.3s',
    '--ease': EASES['Ease out'],
  }),
  style('Béton', 'Béton brut, the raw concrete brutalism is named after: notched slabs, thick lines, hard shadows.', {
    '--radius': '.375rem',
    '--corner-shape': CORNER_SHAPES.Notch,
    '--border-width': '2px',
    '--shadow': SHADOWS.Hard,
    '--shadow-lg': SHADOWS_LG.Hard,
    '--font-sans': FONT_STACKS['Neo-grotesque'],
    '--font-heading': FONT_STACKS['Code mono'],
    '--tracking': '0em',
    '--weight': '600',
    '--weight-heading': '700',
    '--duration': '.08s',
    '--ease': EASES.Linear,
  }),
];

/** Fills in variables added after a style was saved, so old saves and links keep working. */
export const styleFrom = (preset) => ({ name: preset.name, vars: { ...DEFAULT_STYLE, ...preset.vars } });

/* ---------- Share links: only what can't be regenerated ---------- */

/** Theme as seed + locked overrides, style as its diff from the defaults. Full copies when there is no seed. */
export function compact({ theme, style: st }) {
  const out = { t: { n: theme.name }, s: { n: st.name, v: {} } };
  if (theme.seed) {
    out.t.s = theme.seed;
    out.t.l = Object.fromEntries((theme.locked ?? []).map((name) => [name, [theme.light[name], theme.dark[name]]]));
  } else {
    out.t.light = theme.light;
    out.t.dark = theme.dark;
  }
  for (const name of STYLE_VAR_NAMES) if (st.vars[name] !== DEFAULT_STYLE[name]) out.s.v[name] = st.vars[name];
  return out;
}

export function expand({ t, s }) {
  let theme;
  if (t.s) {
    theme = { name: t.n, seed: t.s, ...generateTheme(t.s), locked: Object.keys(t.l ?? {}) };
    for (const [name, [light, dark]] of Object.entries(t.l ?? {})) {
      theme.light[name] = light;
      theme.dark[name] = dark;
    }
  } else theme = { name: t.n, seed: null, light: t.light, dark: t.dark, locked: [...THEME_VAR_NAMES] };
  return { theme, style: { name: s.n, vars: { ...DEFAULT_STYLE, ...s.v } } };
}

/* ---------- Serialization ---------- */

/** `:root { … }` with light-dark() colors. Pass include = { theme, style } to export one half only. */
export function toCSS({ theme, style: st }, include = { theme: true, style: true }) {
  const lines = [];
  const title = [include.theme && `theme “${theme.name}”`, include.style && `style “${st.name}”`].filter(Boolean).join(' · ');
  lines.push(`/* native-base · ${title} */`, ':root {');
  if (include.theme) {
    lines.push(`  /* Theme: ${theme.name} */`);
    for (const name of THEME_VAR_NAMES) {
      const l = theme.light[name];
      const d = theme.dark[name];
      lines.push(`  ${name}: ${l === d ? l : `light-dark(${l}, ${d})`};`);
    }
  }
  if (include.theme && include.style) lines.push('');
  if (include.style) {
    lines.push(`  /* Style: ${st.name} */`);
    for (const name of STYLE_VAR_NAMES) lines.push(`  ${name}: ${st.vars[name]};`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function toJSON({ theme, style: st }, include = { theme: true, style: true }) {
  const out = {};
  if (include.theme) out.theme = { name: theme.name, seed: theme.seed, light: theme.light, dark: theme.dark };
  if (include.style) out.style = { name: st.name, vars: st.vars };
  return JSON.stringify(out, null, 2);
}

export const fileName = (state, include) =>
  `native-base-${[include.theme && slug(state.theme.name), include.style && slug(state.style.name)].filter(Boolean).join('-')}`;

/* ---------- Share links: the playground's #s=… hash, also accepted by the CLI ---------- */

const toBase64Url = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (code) => new TextDecoder().decode(Uint8Array.from(atob(code.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

export const encodeShare = (state) => toBase64Url(JSON.stringify(compact(state)));

/** A full playground URL, a bare hash or just the code. Returns null when there is nothing to decode. */
export function decodeShare(text) {
  const code = String(text).match(/#s=([\w-]+)/)?.[1] ?? (/^[\w-]{16,}$/.test(text) ? text : null);
  if (!code) return null;
  try {
    return expand(JSON.parse(fromBase64Url(code)));
  } catch {
    return null;
  }
}

/**
 * Read a theme and/or style back from CSS or JSON. CSS can be ours, or a shadcn/ui theme:
 * `:root { … }` for light, `.dark { … }` / `[data-theme=dark]` / a prefers-color-scheme block for dark.
 */
export function parse(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    const data = JSON.parse(trimmed);
    const result = {};
    if (data.theme?.light && data.theme?.dark) {
      result.theme = { name: data.theme.name || 'Imported', seed: data.theme.seed ?? null, light: data.theme.light, dark: data.theme.dark, locked: data.theme.seed ? [] : [...THEME_VAR_NAMES] };
    }
    if (data.style?.vars) result.style = { name: data.style.name || 'Imported', vars: { ...DEFAULT_STYLE, ...data.style.vars } };
    return result;
  }

  const light = {};
  const dark = {};
  const vars = {};
  // Walk declaration blocks; a selector decides "dark". Dark media queries were rewritten to .dark above.
  const blocks = markDarkMedia(trimmed).matchAll(/([^{}]*)\{([^{}]*)\}/g);
  for (const [, head, body] of blocks) {
    const isDark = /\.dark\b|data-theme=["']?dark|\[data-dark\]|\.theme-dark/.test(head);
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) {
      const v = value.trim();
      if (STYLE_VAR_NAMES.includes(name)) {
        vars[name] = v;
        continue;
      }
      if (!THEME_VAR_NAMES.includes(name)) continue;
      const ld = v.match(/^light-dark\((.+)\)$/s);
      if (ld) {
        const [a, b] = splitTop(ld[1]);
        light[name] = a.trim();
        dark[name] = (b ?? a).trim();
      } else if (isDark) dark[name] = v;
      else light[name] = v;
    }
  }
  // Partial on purpose: the caller merges into the current theme and style, locking what was found.
  const result = {};
  if (Object.keys(light).length || Object.keys(dark).length) result.theme = { name: 'Imported', light, dark, partial: true };
  if (Object.keys(vars).length) result.style = { name: 'Imported', vars, partial: true };
  return result;
}

/** `@media (prefers-color-scheme: dark) { :root { … } }` becomes `.dark { … }`, so one block walk sees it. */
function markDarkMedia(css) {
  const re = /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{/g;
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(css))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < css.length && depth) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    const inner = css.slice(re.lastIndex, i - 1);
    out += css.slice(last, match.index) + inner.replace(/(^|[,}\s])(:root|html|body)(?=[\s,{])/g, '$1.dark');
    last = i;
    re.lastIndex = i;
  }
  return out + css.slice(last);
}

/** Split "a, b" at the top-level comma only, so oklch(…) commas inside stay intact. */
function splitTop(text) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    else if (text[i] === ',' && depth === 0) return [text.slice(0, i), text.slice(i + 1)];
  }
  return [text];
}

/* ---------- Color math (OKLCH ↔ sRGB), enough for swatches and pickers ---------- */

const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const linear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const hex2 = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');

export function oklchToHex(L, C, h) {
  const rad = (h * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return `#${hex2(gamma(clamp01(r)))}${hex2(gamma(clamp01(g)))}${hex2(gamma(clamp01(bl)))}`;
}

export function hexToOklch(hex) {
  const v = hex.replace('#', '');
  const r = linear(parseInt(v.slice(0, 2), 16) / 255);
  const g = linear(parseInt(v.slice(2, 4), 16) / 255);
  const b = linear(parseInt(v.slice(4, 6), 16) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  const h = C < 0.0005 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return oklch(L, C, h);
}

/** Parse our own oklch() strings without the browser. Returns null for anything else. */
export function parseOklch(value) {
  const m = value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)%?)?\s*\)$/);
  if (!m) return null;
  let L = Number(m[1]);
  if (value.includes('%') && m[1].includes('%')) L /= 100;
  return { L, C: Number(m[2]), h: Number(m[3]), alpha: m[4] == null ? 1 : Number(m[4]) > 1 ? Number(m[4]) / 100 : Number(m[4]) };
}

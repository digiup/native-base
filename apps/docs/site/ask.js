import { STYLE_PRESETS, STYLE_VAR_NAMES, THEME_VAR_NAMES, findStyle, findTheme, generateTheme, styleFrom, themeFrom } from '@digiup/native-base/presets';

/**
 * Requests a person might type, and what an agent with the native-base skill runs for each. Every command
 * is a real `native-base theme` invocation; the output lines are what the CLI prints for it.
 */
export const asks = [
  {
    id: 'brand',
    prompt: 'Use our brand teal, #0D9488.',
    reply: '#0D9488 sits at hue 185 in OKLCH. I’ll generate the colors from it and leave your style alone.',
    args: '--hue 185 --chroma .1 --tint .25',
    theme: { name: 'Hue 185', seed: { hue: 185, chroma: 0.1, tint: 0.25, tintHue: null } },
  },
  {
    id: 'finance',
    prompt: 'It’s a finance dashboard. Make it dense and serious.',
    reply: 'Indigo reads as trustworthy, and Ledger is the tight style made for data-heavy screens.',
    args: 'indigo --style ledger',
    theme: 'indigo',
    style: 'ledger',
  },
  {
    id: 'reading',
    prompt: 'A reading app. It should feel like a printed book.',
    reply: 'Stone’s warm greys look like paper, and Folio sets serif type with generous leading.',
    args: 'stone --style folio',
    theme: 'stone',
    style: 'folio',
  },
  {
    id: 'kids',
    prompt: 'Playful, for a kids’ coding course.',
    reply: 'Rose for energy, and Mochi for big squircles, rounded type and a springy bounce.',
    args: 'rose --style mochi',
    theme: 'rose',
    style: 'mochi',
  },
  {
    id: 'brutalist',
    prompt: 'Brutalist portfolio. Black and white, thick lines.',
    reply: 'Neutral is pure black and white. Béton brings notched corners, heavy borders and hard shadows.',
    args: 'neutral --style beton',
    theme: 'neutral',
    style: 'beton',
  },
].map((ask) => {
  const theme = typeof ask.theme === 'string' ? themeFrom(findTheme(ask.theme)) : { ...ask.theme, ...generateTheme(ask.theme.seed) };
  const style = ask.style ? styleFrom(findStyle(ask.style)) : null;
  const out = [
    `set   src/styles/native-base/theme.css (theme ${theme.name})`,
    style && `set   src/styles/native-base/style.css (style ${style.name})`,
  ].filter(Boolean);
  return { ...ask, command: `npx native-base theme ${ask.args}`, out, theme, style: style ?? styleFrom(STYLE_PRESETS[0]) };
});

/** Declarations for a theme. light-dark() keeps both schemes, so the site's color-scheme switch still applies. */
export const themeDecls = ({ light, dark }) =>
  THEME_VAR_NAMES.map((name) => `${name}: ${light[name] === dark[name] ? light[name] : `light-dark(${light[name]}, ${dark[name]})`};`).join(' ');

export const styleDecls = ({ vars }) => STYLE_VAR_NAMES.map((name) => `${name}: ${vars[name]};`).join(' ');

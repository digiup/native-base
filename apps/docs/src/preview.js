// Block and template previews load only native-base.css (bundled here, not linked). This applies the theme, style and color
// scheme picked anywhere on the site: every preview listens to the same localStorage keys, so changing
// them in a gallery restyles every frame at once (the storage event reaches same-origin iframes).
import '@digiup/native-base/native-base.css';
import { STYLE_PRESETS, THEME_PRESETS, findStyle, findTheme, styleFrom, themeFrom, toCSS } from '@digiup/native-base/presets';

const sheet = document.createElement('style');
document.head.append(sheet);

function apply() {
  const theme = findTheme(localStorage.getItem('preview-theme') ?? '') ?? THEME_PRESETS[0];
  const style = findStyle(localStorage.getItem('preview-style') ?? '') ?? STYLE_PRESETS[0];
  const scheme = localStorage.getItem('color-scheme');
  sheet.textContent = theme === THEME_PRESETS[0] && style === STYLE_PRESETS[0] ? '' : toCSS({ theme: themeFrom(theme), style: styleFrom(style) });
  document.documentElement.style.colorScheme = scheme === 'light' || scheme === 'dark' ? scheme : '';
}

apply();
addEventListener('storage', apply);

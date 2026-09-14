const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (value) => String(value).replace(/[&<>"]/g, (char) => ENTITIES[char]);

export const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
export const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Item names plus dependencies, in cascade order. */
export function resolveItems(registry, names) {
  const wanted = new Set();
  const visit = (name) => {
    if (wanted.has(name)) return;
    registry.items.find((item) => item.name === name).registryDependencies.forEach(visit);
    wanted.add(name);
  };
  names.forEach(visit);
  return registry.items.filter((item) => wanted.has(item.name));
}

const span = (type, text) => `<span data-t="${type}">${esc(text)}</span>`;

const HTML_TOKEN = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)(\s*\/?>)|([^<]+|<)/g;
const HTML_ATTR = /([^\s=]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+))?/g;
const CSS_TOKEN = /(\/\*[\s\S]*?\*\/)|("[^"]*")|(@[\w-]+)|(--?[a-zA-Z][\w-]*)(?=\s*:[^{};]*[;}])|\b(var|light-dark|oklch|color-mix|calc|url|attr|anchor-size)(?=\()/g;

function highlightHtml(code) {
  return code.replace(HTML_TOKEN, (match, comment, open, name, attrs, close) => {
    if (comment) return span('c', comment);
    if (!name) return esc(match);
    const highlightedAttrs = attrs.replace(HTML_ATTR, (_, attr, eq, value) => span('a', attr) + (eq ? esc(eq) + span('s', value) : ''));
    return span('p', open) + span('t', name) + highlightedAttrs + span('p', close);
  });
}

function highlightCss(code) {
  let out = '';
  let last = 0;
  for (const match of code.matchAll(CSS_TOKEN)) {
    const [text, comment, string, atRule, property] = match;
    out += esc(code.slice(last, match.index)) + span(comment ? 'c' : string ? 's' : atRule ? 'k' : property ? 'a' : 't', text);
    last = match.index + text.length;
  }
  return out + esc(code.slice(last));
}

function highlightShell(code) {
  return code
    .split('\n')
    .map((line) => (line.startsWith('#') ? span('c', line) : esc(line).replace(/^(npx|npm|pnpm|curl)\b/, '<span data-t="k">$1</span>')))
    .join('\n');
}

const HIGHLIGHTERS = { html: highlightHtml, css: highlightCss, sh: highlightShell };

/** `{origin}` in code becomes the live site origin (filled in by main.js). */
export function highlight(code, lang) {
  const html = (HIGHLIGHTERS[lang] ?? esc)(code);
  return html.replaceAll('{origin}', '<span data-origin>https://your-site.dev</span>');
}

export function codeBlock(code, lang, { label = lang, tokens } = {}) {
  const meta = tokens ? ` <span>${tokens.toLocaleString('en')} tokens</span>` : '';
  const inline = !tokens && !code.includes('\n') && label === lang;
  return `<div data-code${inline ? ' data-inline' : ''}>
<div data-code-bar><small>${esc(label)}${meta}</small><button type="button" data-copy data-variant="ghost" data-size="sm">Copy</button></div>
<pre><code>${highlight(code, lang)}</code></pre>
</div>`;
}

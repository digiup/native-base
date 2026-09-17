/**
 * Registry examples are plain HTML. This turns one into the same markup in each framework:
 * Vue and Svelte take HTML as it is, React and Solid need JSX's few renames.
 */
const TAG = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)(\s*\/?)>/g;
const ATTR = /([^\s=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** JSX needs "" rather than a bare attribute here: React drops popover={true}, and data-x={true} becomes "true". */
const NEEDS_EMPTY_VALUE = (name) => name === 'popover' || name.startsWith('data-');

/** React's renames. Solid keeps HTML's own spelling for all of them. */
const REACT_NAMES = {
  class: 'className',
  for: 'htmlFor',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  novalidate: 'noValidate',
  formnovalidate: 'formNoValidate',
  srcset: 'srcSet',
  popovertarget: 'popoverTarget',
  popovertargetaction: 'popoverTargetAction',
  crossorigin: 'crossOrigin',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'fill-rule': 'fillRule',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
};

/** Uncontrolled defaults, but only on the elements React treats as form state. */
const REACT_DEFAULTS = { value: 'defaultValue', checked: 'defaultChecked' };
const FORM_FIELDS = new Set(['input', 'textarea', 'select']);

const unquote = (value) => (/^["']/.test(value) ? value.slice(1, -1) : value);
const camel = (property) => property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** style="--min: 10rem; flex: 1" → style={{ "--min": "10rem", flex: 1 }} */
function styleObject(value) {
  const entries = value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const index = declaration.indexOf(':');
      const property = declaration.slice(0, index).trim();
      const setting = declaration.slice(index + 1).trim();
      return `${property.startsWith('--') ? `'${property}'` : camel(property)}: '${setting}'`;
    });
  return `style={{ ${entries.join(', ')} }}`;
}

function attributes(tag, source, flavor) {
  return source.replace(ATTR, (match, rawName, rawValue) => {
    if (!rawName.trim()) return match;
    const name = rawName.toLowerCase();

    if (name === 'style' && flavor === 'react' && rawValue !== undefined) return styleObject(unquote(rawValue));

    const renamed =
      flavor === 'react' ? (FORM_FIELDS.has(tag) && REACT_DEFAULTS[name]) || REACT_NAMES[name] || rawName : rawName;
    if (rawValue === undefined) return NEEDS_EMPTY_VALUE(name) ? `${renamed}=""` : renamed;
    return `${renamed}=${rawValue}`;
  });
}

/** JSX treats braces as expressions, so any literal ones in text have to be escaped. */
const escapeBraces = (text) => text.replace(/[{}]/g, (brace) => `{'${brace}'}`);

function toJsx(html, flavor) {
  let out = '';
  let last = 0;
  for (const match of html.matchAll(TAG)) {
    const [text, comment, open, tag, attrs, close] = match;
    out += escapeBraces(html.slice(last, match.index));
    last = match.index + text.length;

    if (comment) {
      out += `{/* ${comment.slice(4, -3).trim()} */}`;
    } else if (open === '</') {
      out += text;
    } else {
      const rewritten = attrs ? attributes(tag.toLowerCase(), attrs, flavor) : '';
      const selfClose = VOID.has(tag.toLowerCase()) || close.includes('/');
      out += `<${tag}${rewritten}${selfClose ? ' />' : '>'}`;
    }
  }
  return out + escapeBraces(html.slice(last));
}

/** How many elements sit at the top level: more than one needs a fragment. */
function roots(html) {
  let depth = 0;
  let count = 0;
  for (const [, comment, open, tag, , close] of html.matchAll(TAG)) {
    if (comment) continue;
    if (open === '</') depth -= 1;
    else {
      if (depth === 0) count += 1;
      if (!VOID.has(tag.toLowerCase()) && !close.includes('/')) depth += 1;
    }
  }
  return count;
}

const indent = (text, spaces) =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');

function component(html, name, flavor) {
  const jsx = toJsx(html, flavor);
  const body = roots(html) > 1 ? `<>\n${indent(jsx, 6)}\n    </>` : indent(jsx, 4).trimStart();
  return `export default function ${name}() {\n  return (\n    ${body}\n  );\n}`;
}

/** Document-level snippets and raw CSS or JS are not component markup, so they stay HTML only. */
export const translatable = (html) => !/<(script|style|html)\b/i.test(html);

/** The same markup in every framework. Vue and Svelte get the HTML verbatim. */
export function translate(html, name) {
  return {
    html: { code: html, language: 'html', file: 'html' },
    react: { code: component(html, name, 'react'), language: 'jsx', file: `${name}.jsx` },
    vue: { code: `<template>\n${indent(html, 2)}\n</template>`, language: 'html', file: `${name}.vue` },
    svelte: { code: html, language: 'html', file: `${name}.svelte` },
    solid: { code: component(html, name, 'solid'), language: 'jsx', file: `${name}.jsx` },
  };
}

export const FRAMEWORK_LABELS = { html: 'HTML', react: 'React', vue: 'Vue', svelte: 'Svelte', solid: 'Solid' };

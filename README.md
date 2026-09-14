# native-base

A classless, registry-driven UI kit built on native HTML. Inspired by shadcn/ui's registry model, without Tailwind or a JavaScript runtime.

```html
<button commandfor="hi" command="show-modal">Open</button>
<dialog id="hi" closedby="any">
  <header><h2>Hello</h2><p>No classes, no JS.</p></header>
</dialog>
```

- **Elements first.** `button`, `input`, `select`, `dialog`, `details`, `table`, `progress` are styled as-is.
- **One hook per composite.** `data-card`, `data-tabs`, `data-toast`, … Variants are shared: `data-variant`, `data-size`.
- **Platform features.** Invoker commands, popover + anchor positioning, customizable select, `details name`, `::details-content`, `:user-invalid`, `field-sizing`, `@starting-style`, scroll markers, cross-document view transitions.
- **You always win.** Everything lives in `@layer nb.*`; unlayered CSS overrides it without specificity fights.
- **shadcn/ui variable names.** Existing shadcn themes drop in.

## Repo

```
packages/ui     @native-base/css: registry source, rolldown build, CLI
apps/docs       landing page, docs, kitchen sink (Vite 8, real multi-page HTML)
```

```sh
pnpm install
pnpm dev        # rolldown --watch + vite
pnpm build      # library, then docs
pnpm preview
```

## The library

Each registry item is a folder: `packages/ui/registry/<name>/<name>.css` plus `examples.html` (split on `<!-- @example: Title -->`, suffix `[code]` for non-live snippets). `registry.json` holds metadata, the markup API and dependencies (declared in cascade order).

`rolldown -c` runs a plugin that minifies with lightningcss, token-counts every example (o200k_base) and emits:

| Output | What |
| --- | --- |
| `dist/native-base.css` | Everything, minified |
| `dist/components/<name>.css` | One item, minified |
| `dist/r/index.json`, `dist/r/<name>.json` | shadcn-compatible registry items (`registry:item`) with source |
| `dist/r/<name>.css` | For `<link>` straight from a URL |
| `dist/llms.txt` | The whole markup API for language models |
| `dist/index.js` | `registry`, `getItem`, `resolve(names)`, `css(names)` |
| `dist/cli.js` | `native-base init / add / list / view` |

## The docs

`apps/docs/site/plugin.js` renders every route to a real HTML document (in dev through middleware, in build as virtual HTML inputs), so navigation uses cross-document view transitions instead of a client router. It also serves the library's registry at `/r/*`, `/native-base.css` and `/llms.txt`.

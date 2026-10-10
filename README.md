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
- **shadcn/ui variable names.** Existing shadcn themes drop in. Colors are the *theme*; spacing, radius, fonts, type scale, weights, shadows and motion are the *style* (including CSS corner-shape: squircle, bevel, notch, scoop). Compose either half with the other in the [playground](apps/docs/site/pages/playground.js).

## Repo

```
packages/ui     @digiup/native-base: registry source, rolldown build, CLI
apps/docs       landing page, docs, blocks and templates galleries, kitchen sink, theme playground (Vite 8, real multi-page HTML)
examples/*      the kit used from React, Vue, Svelte and Solid: no wrapper components
```

```sh
pnpm install
pnpm dev        # rolldown --watch + vite
pnpm build      # library, then docs
pnpm preview
```

## The library

Each registry item is a folder: `packages/ui/registry/<name>/<name>.css` plus `examples.html` (split on `<!-- @example: Title -->`, suffix `[code]` for non-live snippets). `registry.json` holds metadata, the markup API and dependencies (declared in cascade order).

Blocks and templates are plain HTML built from those items, with no CSS of their own. `packages/ui/blocks/<category>.html` holds one category of sections, each introduced by `<!-- @block: Title | Description -->`; `packages/ui/templates/<name>.html` is one whole page's `<body>`. Both are listed in `registry.json`. The build reads the components each one uses straight off its markup (`USES` in `build/registry.js`), so `npx native-base add block-<name>` brings exactly those.

`rolldown -c` runs a plugin that minifies with lightningcss, token-counts every example (o200k_base) and emits:

| Output | What |
| --- | --- |
| `dist/native-base.css` | Everything, minified |
| `dist/components/<name>.css` | One item, minified |
| `dist/r/index.json`, `dist/r/<name>.json` | shadcn-compatible registry items (`registry:item`) with source |
| `dist/llms.txt` | The whole markup API for language models, one example per component |
| `dist/llms-full.txt` | Every example, plus setup, CLI, theming and framework notes |
| `dist/skill/native-base/` | Agent skill: `skill/SKILL.md` with the registry's rules filled in, plus generated `references/` (components, blocks and templates, setup, theming) |
| `dist/index.js` | `registry`, `getItem`, `resolve(names)`, `css(names)` |
| `dist/themes/<name>.css`, `dist/styles/<name>.css` | Theme (colors) and style (spacing, shape, type, motion) presets |
| `dist/r/theme-<name>.json`, `dist/r/style-<name>.json` | The same presets as registry items; they install to `theme.css` and `style.css` |
| `dist/r/block-<name>.json`, `dist/r/template-<name>.json` | Blocks and templates as registry items: their HTML, with the components they use as dependencies |
| `dist/presets.js` | Theme generator, presets, CSS/JSON export and import, playground share links |
| `dist/cli.js` | `native-base init / add / list / view / theme / skill` |

## Releasing

Merging a pull request that touches `packages/ui` publishes `@digiup/native-base` to npm, then pushes a `Release vX.Y.Z` commit, a tag and a GitHub release ([`release.yml`](.github/workflows/release.yml)). The PR decides the bump:

| PR | Bump |
| --- | --- |
| Label `major`, `minor`, `patch` or `no release` | That, overriding the title |
| Title `feat!: …`, `fix!: …` or containing `BREAKING CHANGE` | major |
| Title `feat: …` or `feat(scope): …` | minor |
| Anything else | patch |

Docs-only merges publish nothing. To release by hand, run the workflow from the Actions tab and pick a level.

## The docs

`apps/docs/site/plugin.js` renders every route to a real HTML document (in dev through middleware, in build as virtual HTML inputs), so navigation uses cross-document view transitions instead of a client router. It also serves the library's registry JSON at `/r/*`, `/llms.txt` and the agent skill. It serves no stylesheets: the CSS is installed from npm or copied by the CLI.

Every component example can be shown as HTML, React, Vue, Svelte or Solid: `site/translate.js` converts the registry's HTML, and the picker in each code bar is one radio group plus CSS, so the whole site follows one choice. `pnpm --filter @native-base/docs check` renders every generated React example and compares it with the HTML it came from, and compiles the Solid, Vue and Svelte versions.

`/blocks/` and `/templates/` show every block and template in an iframe that loads only the kit's own CSS (each also has its own page at `/blocks/<name>/` and `/templates/<name>/`). The Theme and Style pickers above them write to `localStorage`, and every frame restyles through the `storage` event. On a block, the Preview/Code switch is the kit's own tabs, and the width presets are a segmented control.

The four framework guides (`/docs/react/`, `/docs/vue/`, `/docs/svelte/`, `/docs/solid/`) read their demo components off disk and mount them on the page, so the code shown is the code running. They are the only pages that load a framework.

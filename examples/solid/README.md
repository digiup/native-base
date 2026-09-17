# native-base + Solid

native-base used from Solid the way it is meant to be used: as HTML. No wrapper components, no context, no client-side UI runtime.

```sh
pnpm install
pnpm --filter @native-base/example-solid dev
```

## What each file shows

| File | Shows |
| --- | --- |
| `src/index.jsx` | The whole install: one stylesheet import |
| `src/App.jsx` | Theming through a `<select name="color-scheme">` — CSS reacts, Solid does not |
| `src/Team.jsx` | `<For>`, computed variants, an empty state |
| `src/InviteForm.jsx` | Uncontrolled fields, native validation, a server error, a toast |
| `src/Overlays.jsx` | Dialogs (by command and by `ref`), a menu, a tooltip, a hint |
| `src/Invoices.jsx` | Tabs without state, a skeleton, a sorted table |

## How Solid writes it

Solid's JSX keeps HTML's own attribute names, so most of it is copy and paste:

| You want | Write | Why |
| --- | --- | --- |
| `data-card`, `data-variant`, … | `data-card=""` | Bare `data-card` is `{true}` and renders `data-card="true"`, which still matches |
| A variant you compute | `data-variant={tone()}` | `undefined` removes the attribute; `false` would render `"false"` |
| `class`, `for`, `stroke-width` | Unchanged from HTML | Solid has no renames, so SVG icons paste straight in |
| Custom properties | `style="--min: 15rem"` | Solid takes a style string as well as an object |
| The `close` event | `on:close={...}` | `on:` reaches events Solid does not delegate |

## What this app never needed

- A component library: `<button>`, `<dialog>`, `<table>` are the components.
- A portal: dialogs and popovers render in the top layer from wherever they sit in the tree.
- A focus trap or scroll lock: `showModal()` and the popover API do both.
- Tab or accordion state: `<details>` elements sharing a `name` keep one open between them.
- A theme provider: any control named `color-scheme` flips the page through `:has()`.

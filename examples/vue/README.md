# native-base + Vue

native-base used from Vue the way it is meant to be used: as HTML. No wrapper components, no plugin, no client-side UI runtime.

```sh
pnpm install
pnpm --filter @native-base/example-vue dev
```

## What each file shows

| File | Shows |
| --- | --- |
| `src/main.js` | The whole install: one stylesheet import |
| `src/App.vue` | Theming through a `<select name="color-scheme">` — CSS reacts, Vue does not |
| `src/Team.vue` | `v-for`, computed variants, an empty state |
| `src/InviteForm.vue` | Uncontrolled fields, native validation, a server error, a toast |
| `src/Overlays.vue` | Dialogs (by command and by template ref), a menu, a tooltip, a hint |
| `src/Invoices.vue` | Tabs without state, a skeleton, a sorted table |

## How Vue writes it

Everything is spelled exactly as in HTML. Only these are Vue's own:

| You want | Write | Why |
| --- | --- | --- |
| A variant you compute | `:data-variant="tone ?? null"` | `null` removes the attribute; `false` would render `"false"` |
| Custom properties | `style="--min: 15rem"` | A plain string is fine; objects are only for dynamic values |
| Native events | `@close`, `@submit.prevent` | Unknown event names on a native element become `addEventListener` |
| An element reference | `ref="dialog"` + `const dialog = ref(null)` | The variable name has to match the string |

## What this app never needed

- A component library: `<button>`, `<dialog>`, `<table>` are the components.
- A portal: dialogs and popovers render in the top layer from wherever they sit in the tree.
- A focus trap or scroll lock: `showModal()` and the popover API do both.
- Tab or accordion state: `<details>` elements sharing a `name` keep one open between them.
- A theme provider: any control named `color-scheme` flips the page through `:has()`.

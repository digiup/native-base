# native-base + Svelte

native-base used from Svelte the way it is meant to be used: as HTML. No wrapper components, no store, no client-side UI runtime.

```sh
pnpm install
pnpm --filter @native-base/example-svelte dev
```

## What each file shows

| File | Shows |
| --- | --- |
| `src/main.js` | The whole install: one stylesheet import |
| `src/App.svelte` | Theming through a `<select name="color-scheme">` — CSS reacts, Svelte does not |
| `src/Team.svelte` | `{#each}`, computed variants, an empty state |
| `src/InviteForm.svelte` | Uncontrolled fields, native validation, a server error, a toast |
| `src/Overlays.svelte` | Dialogs (by command and by `bind:this`), a menu, a tooltip, a hint |
| `src/Invoices.svelte` | Tabs without state, a skeleton, a sorted table |

## How Svelte writes it

The markup is HTML, unchanged. Only these are Svelte's own:

| You want | Write | Why |
| --- | --- | --- |
| A variant you compute | `data-variant={tone}` | `null` removes the attribute; `false` would render `"false"` |
| Custom properties | `style="--min: 15rem"` | Or `style:--min="15rem"` for a dynamic one |
| Native events | `onclick`, `onclose`, `oninput` | Svelte 5 events are plain attributes, so any DOM event works |
| An element reference | `bind:this={dialog}` | Then call `dialog.showModal()` or `toast.showPopover()` |

## What this app never needed

- A component library: `<button>`, `<dialog>`, `<table>` are the components.
- A portal: dialogs and popovers render in the top layer from wherever they sit in the tree.
- A focus trap or scroll lock: `showModal()` and the popover API do both.
- Tab or accordion state: `<details>` elements sharing a `name` keep one open between them.
- A theme provider: any control named `color-scheme` flips the page through `:has()`.

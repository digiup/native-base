# native-base + React

native-base used from React the way it is meant to be used: as HTML. No wrapper components, no provider, no client-side UI runtime.

```sh
pnpm install
pnpm --filter @native-base/example-react dev
```

## What each file shows

| File | Shows |
| --- | --- |
| `src/main.jsx` | The whole install: one stylesheet import |
| `src/App.jsx` | Theming through a `<select name="color-scheme">` — CSS reacts, React does not |
| `src/Team.jsx` | Lists, conditional variants, an empty state |
| `src/InviteForm.jsx` | Uncontrolled fields, native validation, a server error, a toast |
| `src/Overlays.jsx` | Dialogs (by command and by ref), a menu, a tooltip, a hint |
| `src/Invoices.jsx` | Tabs without state, a skeleton, a sorted table |

## Attribute spellings React changes

Everything not listed here is written exactly as in HTML.

| You want | Write | Why |
| --- | --- | --- |
| `data-card`, `data-variant`, … | `data-card=""` | Bare `data-card` is `{true}` in JSX and renders `data-card="true"`, which still matches |
| A computed variant | `data-variant={tone ?? undefined}` | `false` renders the string `"false"`, so the attribute stays on the element |
| `commandfor`, `command` | lowercase | React passes them through untouched |
| `closedby`, `interestfor` | lowercase | Same |
| `popovertarget` | `popoverTarget` | React knows this one and wants it camelCased; lowercase logs a warning |
| `popover` | `popover=""` | Bare `popover` is `{true}`, which React drops entirely — the popover never opens |
| Custom properties | `style={{ '--min': '15rem' }}` | Tunes `data-grid`, `data-row`, `data-carousel` |

## What this app never needed

- A component library: `<button>`, `<dialog>`, `<table>` are the components.
- A portal: dialogs and popovers render in the top layer from wherever they sit in the tree.
- A focus trap or scroll lock: `showModal()` and the popover API do both.
- Tab or accordion state: `<details>` elements sharing a `name` keep one open between them.
- A theme provider: any control named `color-scheme` flips the page through `:has()`.
- `'use client'`: none of this markup needs to be a client component in Next.js.

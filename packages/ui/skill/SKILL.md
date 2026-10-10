---
name: native-base
description: Builds UI with native-base (@digiup/native-base), the classless CSS kit for plain HTML. Use when writing pages, components, forms or overlays in a project that uses native-base, adding native-base to a project, or theming it.
---

# native-base

native-base styles semantic HTML. The markup is the API: elements are styled as they are, composites take one `data-*` hook, and overlays open with invoker commands. There are no classes and no JavaScript to install.

## Workflow

1. **Find the setup.** Look for `@digiup/native-base` in package.json, a `native-base.json`, or an import of `native-base.css`. If there is none and the user wants it, follow [references/setup.md](references/setup.md). Done when you know where the CSS is imported.
2. **Look up every component before writing it.** Read its `## <Title>` section in [references/components.md](references/components.md), or run `npx native-base view <name>`. Done when every element and `data-*` hook you are about to write appears in a section you read.
3. **Start from a block or template when one fits.** Before building a section or page from scratch (hero, pricing, dashboard, settings, sign-in, checkout…), look for it in [references/patterns.md](references/patterns.md) or `npx native-base list blocks`, and reuse its structure.
4. **Write the markup** by the rules below.
5. **Copy what you used.** When `native-base.json` exists, the project owns the CSS: run `npx native-base add <name...>` for each component you used that is not in its `out` directory yet. Dependencies come along.
6. **Theme on request.** Colors and the non-color style tokens are separate halves: [references/theming.md](references/theming.md).

## Rules

{{rules}}
- Labels wrap their fields: `<label>Email <input type="email" required></label>`. Validate with native attributes (`required`, `type`, `pattern`, `min`). `<small data-hint>` shows until the field is invalid, `<small data-error>` after the user makes it invalid.
- Open/closed state belongs to the browser. Framework state holds data; when a dialog's contents depend on it, call `showModal()` through a ref and read `dialog.returnValue` in its `close` event.
- In JSX, give valueless data attributes and `popover` an empty string (`data-card=""`, `popover=""`) and keep `commandfor` and `command` lowercase. Vue and Svelte take the HTML unchanged. More in [references/setup.md](references/setup.md#frameworks).
- Custom CSS stays unlayered and reads the tokens: `calc(var(--spacing) * 4)`, `var(--radius)`, `var(--border-width)`, `var(--text-sm)`, `var(--weight)`, `var(--primary)`. That way the user's theme and style reach it.

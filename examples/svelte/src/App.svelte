<script>
  import Invoices from './Invoices.svelte';
  import Overlays from './Overlays.svelte';
  import Team from './Team.svelte';
</script>

<header data-row="between">
  <div>
    <h1>native-base + Svelte</h1>
    <p data-lead>Every element below is plain HTML in a component. No wrapper components, no store, no client-side UI runtime.</p>
  </div>
  <!-- Theming is CSS: :root:has([name=color-scheme] …) reacts to this select. No state, no effect. -->
  <label>
    Theme
    <select name="color-scheme">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
</header>

<main data-stack style="--gap: 0">
  <Team />
  <Overlays />
  <Invoices />
</main>

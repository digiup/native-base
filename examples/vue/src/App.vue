<script setup>
import Invoices from './Invoices.vue';
import Overlays from './Overlays.vue';
import Team from './Team.vue';
</script>

<template>
  <header data-row="between">
    <div>
      <h1>native-base + Vue</h1>
      <p data-lead>Every element below is plain HTML in a template. No wrapper components, no plugin, no client-side UI runtime.</p>
    </div>
    <!-- Theming is CSS: :root:has([name=color-scheme] …) reacts to this select. No state, no watcher. -->
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
</template>

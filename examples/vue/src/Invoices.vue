<script setup>
import { computed, onMounted, ref } from 'vue';
import { INVOICES, money } from './data.js';

const COLUMNS = [
  ['id', 'Invoice'],
  ['status', 'Status'],
  ['method', 'Method'],
  ['amount', 'Amount'],
];

const rows = ref(null);
const sort = ref('id');
const selected = ref(null);

// Stands in for a fetch, so the skeleton state is visible on load.
onMounted(() => setTimeout(() => (rows.value = INVOICES), 900));

const sorted = computed(() =>
  rows.value &&
  [...rows.value].sort((a, b) => (typeof a[sort.value] === 'number' ? a[sort.value] - b[sort.value] : String(a[sort.value]).localeCompare(b[sort.value]))),
);
const total = computed(() => (rows.value ?? []).reduce((sum, row) => sum + row.amount, 0));
</script>

<template>
  <section data-stack>
    <h2>Invoices</h2>

    <!-- Tabs are <details> sharing a name: the browser keeps exactly one open. No tab state. -->
    <div data-tabs>
      <details name="invoice-view" open>
        <summary>Table</summary>
        <div data-stack>
          <label>
            Sort by
            <select v-model="sort">
              <option v-for="[key, label] in COLUMNS" :key="key" :value="key">{{ label }}</option>
            </select>
          </label>

          <div v-if="!sorted" data-stack style="--gap: .5rem" aria-busy="true" aria-label="Loading invoices">
            <span data-skeleton style="block-size: 2rem"></span>
            <span data-skeleton style="block-size: 2rem"></span>
            <span data-skeleton style="block-size: 2rem; inline-size: 60%"></span>
          </div>

          <table v-else>
            <caption>Click a row to select it</caption>
            <thead>
              <tr>
                <th v-for="[key, label] in COLUMNS" :key="key" :data-numeric="key === 'amount' ? '' : null">{{ label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in sorted"
                :key="row.id"
                :aria-selected="selected === row.id"
                @click="selected = selected === row.id ? null : row.id"
              >
                <td>{{ row.id }}</td>
                <td>
                  <span data-badge :data-variant="row.status === 'Paid' ? 'success' : row.status === 'Unpaid' ? 'destructive' : 'secondary'">
                    {{ row.status }}
                  </span>
                </td>
                <td>{{ row.method }}</td>
                <td data-numeric>{{ money(row.amount) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total</td>
                <td data-numeric>{{ money(total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>

      <details name="invoice-view">
        <summary>Usage</summary>
        <div data-stack>
          <label>
            Storage used
            <progress :value="total" max="1000"></progress>
          </label>
          <p>{{ money(total) }} of {{ money(1000) }} spent this month.</p>
        </div>
      </details>

      <details name="invoice-view">
        <summary>Danger zone</summary>
        <div data-alert data-variant="destructive">
          <strong>Close account</strong>
          <p>This cannot be undone, so it lives behind a tab nobody opens by accident.</p>
        </div>
      </details>
    </div>
  </section>
</template>

<script>
  import { INVOICES, money } from './data.js';

  const COLUMNS = [
    ['id', 'Invoice'],
    ['status', 'Status'],
    ['method', 'Method'],
    ['amount', 'Amount'],
  ];

  let rows = $state(null);
  let sort = $state('id');
  let selected = $state(null);

  // Stands in for a fetch, so the skeleton state is visible on load.
  $effect(() => {
    const timer = setTimeout(() => (rows = INVOICES), 900);
    return () => clearTimeout(timer);
  });

  const sorted = $derived(
    rows && [...rows].sort((a, b) => (typeof a[sort] === 'number' ? a[sort] - b[sort] : String(a[sort]).localeCompare(b[sort]))),
  );
  const total = $derived((rows ?? []).reduce((sum, row) => sum + row.amount, 0));
</script>

<section data-stack>
  <h2>Invoices</h2>

  <!-- Tabs are <details> sharing a name: the browser keeps exactly one open. No tab state. -->
  <div data-tabs>
    <details name="invoice-view" open>
      <summary>Table</summary>
      <div data-stack>
        <label>
          Sort by
          <select bind:value={sort}>
            {#each COLUMNS as [key, label] (key)}
              <option value={key}>{label}</option>
            {/each}
          </select>
        </label>

        {#if !sorted}
          <div data-stack style="--gap: .5rem" aria-busy="true" aria-label="Loading invoices">
            <span data-skeleton style="block-size: 2rem"></span>
            <span data-skeleton style="block-size: 2rem"></span>
            <span data-skeleton style="block-size: 2rem; inline-size: 60%"></span>
          </div>
        {:else}
          <table>
            <caption>Click a row to select it</caption>
            <thead>
              <tr>
                {#each COLUMNS as [key, label] (key)}
                  <th data-numeric={key === 'amount' ? '' : null}>{label}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each sorted as row (row.id)}
                <tr aria-selected={selected === row.id} onclick={() => (selected = selected === row.id ? null : row.id)}>
                  <td>{row.id}</td>
                  <td>
                    <span data-badge data-variant={row.status === 'Paid' ? 'success' : row.status === 'Unpaid' ? 'destructive' : 'secondary'}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.method}</td>
                  <td data-numeric>{money(row.amount)}</td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total</td>
                <td data-numeric>{money(total)}</td>
              </tr>
            </tfoot>
          </table>
        {/if}
      </div>
    </details>

    <details name="invoice-view">
      <summary>Usage</summary>
      <div data-stack>
        <label>
          Storage used
          <progress value={total} max="1000"></progress>
        </label>
        <p>{money(total)} of {money(1000)} spent this month.</p>
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

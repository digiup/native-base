<script>
  const INVOICES = [
    { id: 'INV001', status: 'Paid', method: 'Card', amount: 250 },
    { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150 },
    { id: 'INV003', status: 'Unpaid', method: 'Transfer', amount: 350 },
  ];

  const TONE = { Paid: 'success', Unpaid: 'destructive', Pending: 'secondary' };
  const money = (amount) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  let sort = $state('id');
  let selected = $state(null);

  const rows = $derived([...INVOICES].sort((a, b) => (sort === 'amount' ? a.amount - b.amount : a[sort].localeCompare(b[sort]))));
</script>

<!-- Tabs are <details> sharing a name: the browser keeps exactly one open, so there is no tab state. -->
<div data-tabs>
  <details name="invoices" open>
    <summary>Invoices</summary>
    <div data-stack>
      <label>
        Sort by
        <select bind:value={sort}>
          <option value="id">Invoice</option>
          <option value="status">Status</option>
          <option value="amount">Amount</option>
        </select>
      </label>

      <table>
        <caption>Click a row to select it</caption>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Status</th>
            <th data-numeric>Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row.id)}
            <tr aria-selected={selected === row.id} onclick={() => (selected = selected === row.id ? null : row.id)}>
              <td>{row.id}</td>
              <td><span data-badge data-variant={TONE[row.status]}>{row.status}</span></td>
              <td data-numeric>{money(row.amount)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </details>

  <details name="invoices">
    <summary>Danger zone</summary>
    <div data-alert data-variant="destructive">
      <strong>Close account</strong>
      <p>This cannot be undone, so it lives behind a tab nobody opens by accident.</p>
    </div>
  </details>
</div>

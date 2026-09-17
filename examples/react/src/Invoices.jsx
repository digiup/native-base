import { useEffect, useState } from 'react';
import { INVOICES, money } from './data.js';

const COLUMNS = [
  ['id', 'Invoice'],
  ['status', 'Status'],
  ['method', 'Method'],
  ['amount', 'Amount'],
];

export default function Invoices() {
  const [rows, setRows] = useState(null);
  const [sort, setSort] = useState('id');
  const [selected, setSelected] = useState(null);

  // Stand-in for a fetch, so the skeleton state is visible on load.
  useEffect(() => {
    const timer = setTimeout(() => setRows(INVOICES), 900);
    return () => clearTimeout(timer);
  }, []);

  const sorted = rows && [...rows].sort((a, b) => (typeof a[sort] === 'number' ? a[sort] - b[sort] : String(a[sort]).localeCompare(b[sort])));
  const total = rows?.reduce((sum, row) => sum + row.amount, 0) ?? 0;

  return (
    <section data-stack>
      <h2>Invoices</h2>

      {/* Tabs are <details> sharing a name: the browser keeps exactly one open. No tab state. */}
      <div data-tabs="">
        <details name="invoice-view" open>
          <summary>Table</summary>
          <div data-stack>
            <label>
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                {COLUMNS.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {!rows ? (
              <div data-stack style={{ '--gap': '.5rem' }} aria-busy="true" aria-label="Loading invoices">
                <span data-skeleton="" style={{ blockSize: '2rem' }} />
                <span data-skeleton="" style={{ blockSize: '2rem' }} />
                <span data-skeleton="" style={{ blockSize: '2rem', inlineSize: '60%' }} />
              </div>
            ) : (
              <table>
                <caption>Click a row to select it</caption>
                <thead>
                  <tr>
                    {COLUMNS.map(([key, label]) => (
                      <th key={key} data-numeric={key === 'amount' ? '' : undefined}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.id} aria-selected={selected === row.id} onClick={() => setSelected(row.id === selected ? null : row.id)}>
                      <td>{row.id}</td>
                      <td>
                        <span data-badge="" data-variant={row.status === 'Paid' ? 'success' : row.status === 'Unpaid' ? 'destructive' : 'secondary'}>
                          {row.status}
                        </span>
                      </td>
                      <td>{row.method}</td>
                      <td data-numeric="">{money(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Total</td>
                    <td data-numeric="">{money(total)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </details>

        <details name="invoice-view">
          <summary>Usage</summary>
          <div data-stack>
            <label>
              Storage used
              <progress value={total} max={1000} />
            </label>
            <p>
              {money(total)} of {money(1000)} spent this month.
            </p>
          </div>
        </details>

        <details name="invoice-view">
          <summary>Danger zone</summary>
          <div data-alert="" data-variant="destructive">
            <strong>Close account</strong>
            <p>This cannot be undone, so it lives behind a tab nobody opens by accident.</p>
          </div>
        </details>
      </div>
    </section>
  );
}

import { createSignal, For, onCleanup, Show } from 'solid-js';
import { INVOICES, money } from './data.js';

const COLUMNS = [
  ['id', 'Invoice'],
  ['status', 'Status'],
  ['method', 'Method'],
  ['amount', 'Amount'],
];

export default function Invoices() {
  const [rows, setRows] = createSignal(null);
  const [sort, setSort] = createSignal('id');
  const [selected, setSelected] = createSignal(null);

  // Stands in for a fetch, so the skeleton state is visible on load.
  const timer = setTimeout(() => setRows(INVOICES), 900);
  onCleanup(() => clearTimeout(timer));

  const sorted = () =>
    rows() && [...rows()].sort((a, b) => (typeof a[sort()] === 'number' ? a[sort()] - b[sort()] : String(a[sort()]).localeCompare(b[sort()])));
  const total = () => (rows() ?? []).reduce((sum, row) => sum + row.amount, 0);

  return (
    <section data-stack="">
      <h2>Invoices</h2>

      {/* Tabs are <details> sharing a name: the browser keeps exactly one open. No tab state. */}
      <div data-tabs="">
        <details name="invoice-view" open>
          <summary>Table</summary>
          <div data-stack="">
            <label>
              Sort by
              <select value={sort()} onInput={(event) => setSort(event.currentTarget.value)}>
                <For each={COLUMNS}>{([key, label]) => <option value={key}>{label}</option>}</For>
              </select>
            </label>

            <Show
              when={sorted()}
              fallback={
                <div data-stack="" style="--gap: .5rem" aria-busy="true" aria-label="Loading invoices">
                  <span data-skeleton="" style="block-size: 2rem" />
                  <span data-skeleton="" style="block-size: 2rem" />
                  <span data-skeleton="" style="block-size: 2rem; inline-size: 60%" />
                </div>
              }
            >
              <table>
                <caption>Click a row to select it</caption>
                <thead>
                  <tr>
                    <For each={COLUMNS}>{([key, label]) => <th data-numeric={key === 'amount' ? '' : undefined}>{label}</th>}</For>
                  </tr>
                </thead>
                <tbody>
                  <For each={sorted()}>
                    {(row) => (
                      <tr
                        aria-selected={selected() === row.id}
                        onClick={() => setSelected(selected() === row.id ? null : row.id)}
                      >
                        <td>{row.id}</td>
                        <td>
                          <span data-badge="" data-variant={row.status === 'Paid' ? 'success' : row.status === 'Unpaid' ? 'destructive' : 'secondary'}>
                            {row.status}
                          </span>
                        </td>
                        <td>{row.method}</td>
                        <td data-numeric="">{money(row.amount)}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">Total</td>
                    <td data-numeric="">{money(total())}</td>
                  </tr>
                </tfoot>
              </table>
            </Show>
          </div>
        </details>

        <details name="invoice-view">
          <summary>Usage</summary>
          <div data-stack="">
            <label>
              Storage used
              <progress value={total()} max="1000" />
            </label>
            <p>{money(total())} of {money(1000)} spent this month.</p>
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

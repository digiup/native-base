import Invoices from './Invoices.jsx';
import Overlays from './Overlays.jsx';
import Team from './Team.jsx';

export default function App() {
  return (
    <>
      <header data-row="between">
        <div>
          <h1>native-base + Solid</h1>
          <p data-lead>Every element below is plain JSX that kept HTML's spelling. No wrapper components, no context, no client-side UI runtime.</p>
        </div>
        {/* Theming is CSS: :root:has([name=color-scheme] …) reacts to this select. No signal, no effect. */}
        <label>
          Theme
          <select name="color-scheme">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </header>

      <main data-stack="" style="--gap: 0">
        <Team />
        <Overlays />
        <Invoices />
      </main>
    </>
  );
}

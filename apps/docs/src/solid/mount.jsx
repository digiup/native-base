// The /docs/solid/ page shows these components' source and runs them, so the two can never drift.
import { render } from 'solid-js/web';
import InviteForm from './InviteForm.jsx';
import Invoices from './Invoices.jsx';
import KeyboardShortcuts from './KeyboardShortcuts.jsx';
import RemoveMember from './RemoveMember.jsx';
import Team from './Team.jsx';

const DEMOS = { Team, KeyboardShortcuts, RemoveMember, InviteForm, Invoices };

for (const [name, Demo] of Object.entries(DEMOS)) {
  const host = document.querySelector(`[data-solid-demo="${name}"]`);
  if (host) render(() => <Demo />, host);
}

// The /docs/react/ page shows these components' source and runs them, so the two can never drift.
import { createRoot } from 'react-dom/client';
import InviteForm from './InviteForm.jsx';
import Invoices from './Invoices.jsx';
import KeyboardShortcuts from './KeyboardShortcuts.jsx';
import RemoveMember from './RemoveMember.jsx';
import Team from './Team.jsx';

const DEMOS = { Team, KeyboardShortcuts, RemoveMember, InviteForm, Invoices };

for (const [name, Demo] of Object.entries(DEMOS)) {
  const host = document.querySelector(`[data-react-demo="${name}"]`);
  if (host) createRoot(host).render(<Demo />);
}

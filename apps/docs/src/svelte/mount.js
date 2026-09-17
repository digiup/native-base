// The /docs/svelte/ page shows these components' source and runs them, so the two can never drift.
import { mount } from 'svelte';
import InviteForm from './InviteForm.svelte';
import Invoices from './Invoices.svelte';
import KeyboardShortcuts from './KeyboardShortcuts.svelte';
import RemoveMember from './RemoveMember.svelte';
import Team from './Team.svelte';

const DEMOS = { Team, KeyboardShortcuts, RemoveMember, InviteForm, Invoices };

for (const [name, Demo] of Object.entries(DEMOS)) {
  const target = document.querySelector(`[data-svelte-demo="${name}"]`);
  if (target) mount(Demo, { target });
}

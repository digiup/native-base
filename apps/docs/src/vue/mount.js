// The /docs/vue/ page shows these components' source and runs them, so the two can never drift.
import { createApp } from 'vue';
import InviteForm from './InviteForm.vue';
import Invoices from './Invoices.vue';
import KeyboardShortcuts from './KeyboardShortcuts.vue';
import RemoveMember from './RemoveMember.vue';
import Team from './Team.vue';

const DEMOS = { Team, KeyboardShortcuts, RemoveMember, InviteForm, Invoices };

for (const [name, Demo] of Object.entries(DEMOS)) {
  const host = document.querySelector(`[data-vue-demo="${name}"]`);
  if (host) createApp(Demo).mount(host);
}

<script setup>
import { ref } from 'vue';
import { TEAM, initials } from './data.js';

const confirm = ref(null);
const target = ref(null);
const removed = ref([]);

// One dialog element, reused. Vue owns the data; the browser owns open and closed.
function askToRemove(member) {
  target.value = member;
  confirm.value.showModal();
}

function onClose(event) {
  if (event.target.returnValue === 'remove') removed.value = [...removed.value, target.value.name];
  target.value = null;
}
</script>

<template>
  <section data-stack>
    <h2>Overlays</h2>

    <div data-row>
      <!-- No state, no handler, no Teleport: the button drives the dialog through invoker commands. -->
      <button commandfor="keyboard-help" command="show-modal" data-variant="outline">Keyboard shortcuts</button>
      <button popovertarget="account-menu" data-variant="outline">My account</button>
      <button data-variant="outline" data-tooltip="Runs on hover and keyboard focus">Tooltip</button>
      <button interestfor="autosave-hint" data-variant="outline">Hint on interest</button>
    </div>

    <dialog id="keyboard-help" closedby="any" aria-labelledby="keyboard-help-title">
      <button commandfor="keyboard-help" command="close" aria-label="Close">✕</button>
      <header>
        <h2 id="keyboard-help-title">Keyboard shortcuts</h2>
        <p>Esc and the backdrop close this, because of closedby.</p>
      </header>
      <table>
        <tbody>
          <tr><td>Command palette</td><td data-numeric><kbd>⌘K</kbd></td></tr>
          <tr><td>New invite</td><td data-numeric><kbd>⌘I</kbd></td></tr>
        </tbody>
      </table>
    </dialog>

    <menu popover id="account-menu">
      <li><small>Signed in as Ada</small></li>
      <li><button>Profile <kbd>⇧⌘P</kbd></button></li>
      <li><button>Billing <kbd>⌘B</kbd></button></li>
      <li><hr /></li>
      <li><button data-variant="destructive">Log out</button></li>
    </menu>

    <div popover="hint" id="autosave-hint">Saved to your library</div>

    <article data-card>
      <header>
        <h3>Confirm with data</h3>
        <p>The dialog is markup; only the row being confirmed is state.</p>
      </header>
      <div data-row>
        <button
          v-for="member in TEAM.filter((person) => !removed.includes(person.name))"
          :key="member.id"
          type="button"
          data-variant="outline"
          data-size="sm"
          @click="askToRemove(member)"
        >
          <span data-avatar data-size="sm">{{ initials(member.name) }}</span>
          Remove {{ member.name.split(' ')[0] }}
        </button>
      </div>
      <footer v-if="removed.length">
        <p>Removed: {{ removed.join(', ') }}</p>
      </footer>
    </article>

    <dialog ref="confirm" closedby="any" aria-labelledby="confirm-title" @close="onClose">
      <header>
        <h2 id="confirm-title">Remove {{ target?.name }}?</h2>
        <p>{{ target?.email }} loses access immediately.</p>
      </header>
      <!-- method="dialog" closes on submit and hands the button's value to the close event. -->
      <form method="dialog">
        <footer>
          <button value="cancel" data-variant="outline">Cancel</button>
          <button value="remove" data-variant="destructive">Remove</button>
        </footer>
      </form>
    </dialog>
  </section>
</template>

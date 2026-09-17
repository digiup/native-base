<script setup>
import { ref } from 'vue';

const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
];

const dialog = ref(null);
const target = ref(null);
const team = ref(TEAM);

// One dialog element, reused. Vue owns the data, the browser owns open and closed.
function askToRemove(member) {
  target.value = member;
  dialog.value.showModal();
}

// method="dialog" closes on submit and hands the button's value to the close event.
function onClose(event) {
  if (event.target.returnValue === 'remove') team.value = team.value.filter((member) => member !== target.value);
  target.value = null;
}
</script>

<template>
  <div data-stack>
    <div data-row>
      <button
        v-for="member in team"
        :key="member.id"
        type="button"
        data-variant="outline"
        data-size="sm"
        @click="askToRemove(member)"
      >
        Remove {{ member.name.split(' ')[0] }}
      </button>
      <button v-if="!team.length" type="button" data-variant="ghost" data-size="sm" @click="team = TEAM">Start over</button>
    </div>

    <dialog ref="dialog" closedby="any" aria-labelledby="remove-title" @close="onClose">
      <header>
        <h2 id="remove-title">Remove {{ target?.name }}?</h2>
        <p>{{ target?.email }} loses access immediately.</p>
      </header>
      <form method="dialog">
        <footer>
          <button value="cancel" data-variant="outline">Cancel</button>
          <button value="remove" data-variant="destructive">Remove</button>
        </footer>
      </form>
    </dialog>
  </div>
</template>

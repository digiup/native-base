<script setup>
import { ref } from 'vue';

// Stands in for a mutation. One address is already taken, so the error path is reachable.
const invite = (email) =>
  new Promise((resolve) => setTimeout(() => resolve(email === 'ada@example.com' ? 'That address is already on the team.' : null), 700));

const email = ref(null);
const toast = ref(null);
const error = ref(null);
const pending = ref(false);

async function submit(event) {
  // @submit.prevent handles the preventDefault; required and type=email have already passed.
  const form = event.target;
  pending.value = true;
  const message = await invite(new FormData(form).get('email'));
  pending.value = false;
  error.value = message;

  // A server rejection becomes a real constraint violation,
  // so :user-invalid reveals <small data-error> with no extra CSS.
  email.value.setCustomValidity(message ?? '');
  if (message) return;

  form.reset();
  toast.value.showPopover();
  setTimeout(() => toast.value?.matches(':popover-open') && toast.value.hidePopover(), 4000);
}

function clearError() {
  email.value.setCustomValidity('');
  error.value = null;
}
</script>

<template>
  <article data-card>
    <header>
      <h3>Invite a teammate</h3>
      <p>No v-model: the form element holds the value, Vue holds the answer.</p>
    </header>

    <form @submit.prevent="submit">
      <label>
        Email
        <input ref="email" type="email" name="email" required placeholder="you@example.com" @input="clearError" />
        <small data-hint>Try ada@example.com to see the rejected path.</small>
        <small data-error>{{ error ?? 'Enter a valid email address.' }}</small>
      </label>

      <footer data-row="end">
        <button :aria-busy="pending" :disabled="pending">{{ pending ? 'Sending…' : 'Send invite' }}</button>
      </footer>
    </form>

    <!-- A popover, so the toast lives in the top layer without a Teleport. -->
    <output ref="toast" popover id="invite-sent" data-toast data-variant="success">
      <strong>Invite sent</strong>
      <p>They will get an email in a moment.</p>
    </output>
  </article>
</template>

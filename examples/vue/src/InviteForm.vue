<script setup>
import { ref } from 'vue';
import { invite, nameFrom } from './data.js';

const emit = defineEmits(['invited']);

const email = ref(null);
const toast = ref(null);
const error = ref(null);
const pending = ref(false);

// The browser has already enforced required and type=email by the time this runs.
async function submit(event) {
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));

  pending.value = true;
  const message = await invite(values.email);
  pending.value = false;
  error.value = message;
  // Turn a server rejection into a real constraint violation, so :user-invalid reveals <small data-error>.
  email.value.setCustomValidity(message ?? '');
  if (message) return;

  emit('invited', { id: crypto.randomUUID(), name: nameFrom(values.email), email: values.email, role: values.role, status: 'invited' });
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
      <p>No v-model on the fields: the form holds the values, native validation checks them.</p>
    </header>

    <form @submit.prevent="submit">
      <label>
        Email
        <input ref="email" type="email" name="email" required placeholder="you@example.com" @input="clearError" />
        <small data-hint>Try ada@example.com to see the rejected path.</small>
        <small data-error>{{ error ?? 'Enter a valid email address.' }}</small>
      </label>

      <label>
        Role
        <select name="role">
          <button><selectedcontent></selectedcontent></button>
          <option>Admin</option>
          <option>Developer</option>
          <option>Billing</option>
        </select>
      </label>

      <footer data-row="end">
        <button type="reset" data-variant="ghost">Reset</button>
        <button :aria-busy="pending" :disabled="pending">{{ pending ? 'Sending…' : 'Send invite' }}</button>
      </footer>
    </form>

    <!-- A popover, so it lives in the top layer without a Teleport. -->
    <output ref="toast" popover id="invite-sent" data-toast data-variant="success">
      <strong>Invite sent</strong>
      <p>They will get an email in a moment.</p>
    </output>
  </article>
</template>

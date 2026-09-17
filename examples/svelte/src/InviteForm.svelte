<script>
  import { invite, nameFrom } from './data.js';

  let { onInvited } = $props();

  let email;
  let toast;
  let error = $state(null);
  let pending = $state(false);

  // The browser has already enforced required and type=email by the time this runs.
  async function onsubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    pending = true;
    const message = await invite(values.email);
    pending = false;
    error = message;
    // Turn a server rejection into a real constraint violation, so :user-invalid reveals <small data-error>.
    email.setCustomValidity(message ?? '');
    if (message) return;

    onInvited({ id: crypto.randomUUID(), name: nameFrom(values.email), email: values.email, role: values.role, status: 'invited' });
    form.reset();
    toast.showPopover();
    setTimeout(() => toast?.matches(':popover-open') && toast.hidePopover(), 4000);
  }

  function clearError() {
    email.setCustomValidity('');
    error = null;
  }
</script>

<article data-card>
  <header>
    <h3>Invite a teammate</h3>
    <p>No bind:value on the fields: the form holds the values, native validation checks them.</p>
  </header>

  <form {onsubmit}>
    <label>
      Email
      <input bind:this={email} type="email" name="email" required placeholder="you@example.com" oninput={clearError} />
      <small data-hint>Try ada@example.com to see the rejected path.</small>
      <small data-error>{error ?? 'Enter a valid email address.'}</small>
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
      <button aria-busy={pending} disabled={pending}>{pending ? 'Sending…' : 'Send invite'}</button>
    </footer>
  </form>

  <!-- A popover, so it lives in the top layer without a portal action. -->
  <output bind:this={toast} popover id="invite-sent" data-toast data-variant="success">
    <strong>Invite sent</strong>
    <p>They will get an email in a moment.</p>
  </output>
</article>

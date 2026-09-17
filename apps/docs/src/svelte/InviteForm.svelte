<script>
  // Stands in for a mutation. One address is already taken, so the error path is reachable.
  const invite = (email) =>
    new Promise((resolve) => setTimeout(() => resolve(email === 'ada@example.com' ? 'That address is already on the team.' : null), 700));

  let email;
  let toast;
  let error = $state(null);
  let pending = $state(false);

  async function onsubmit(event) {
    event.preventDefault(); // required and type=email have already passed
    const form = event.currentTarget;
    pending = true;
    const message = await invite(new FormData(form).get('email'));
    pending = false;
    error = message;

    // A server rejection becomes a real constraint violation,
    // so :user-invalid reveals <small data-error> with no extra CSS.
    email.setCustomValidity(message ?? '');
    if (message) return;

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
    <p>No bind:value: the form element holds the value, Svelte holds the answer.</p>
  </header>

  <form {onsubmit}>
    <label>
      Email
      <input bind:this={email} type="email" name="email" required placeholder="you@example.com" oninput={clearError} />
      <small data-hint>Try ada@example.com to see the rejected path.</small>
      <small data-error>{error ?? 'Enter a valid email address.'}</small>
    </label>

    <footer data-row="end">
      <button aria-busy={pending} disabled={pending}>{pending ? 'Sending…' : 'Send invite'}</button>
    </footer>
  </form>

  <!-- A popover, so the toast lives in the top layer without a portal action. -->
  <output bind:this={toast} popover id="invite-sent" data-toast data-variant="success">
    <strong>Invite sent</strong>
    <p>They will get an email in a moment.</p>
  </output>
</article>

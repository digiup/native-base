import { useRef, useState } from 'react';

// Stands in for a mutation. One address is already taken, so the error path is reachable.
const invite = (email) =>
  new Promise((resolve) => setTimeout(() => resolve(email === 'ada@example.com' ? 'That address is already on the team.' : null), 700));

export default function InviteForm() {
  const email = useRef(null);
  const toast = useRef(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault(); // required and type=email have already passed
    const form = event.currentTarget;
    setPending(true);
    const message = await invite(new FormData(form).get('email'));
    setPending(false);
    setError(message);

    // A server rejection becomes a real constraint violation,
    // so :user-invalid reveals <small data-error> with no extra CSS.
    email.current.setCustomValidity(message ?? '');
    if (message) return;

    form.reset();
    toast.current.showPopover();
    setTimeout(() => toast.current?.matches(':popover-open') && toast.current.hidePopover(), 4000);
  }

  return (
    <article data-card="">
      <header>
        <h3>Invite a teammate</h3>
        <p>Uncontrolled fields: React holds no input state at all.</p>
      </header>

      <form onSubmit={submit}>
        <label>
          Email
          <input
            ref={email}
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            onInput={() => {
              email.current.setCustomValidity('');
              setError(null);
            }}
          />
          <small data-hint="">Try ada@example.com to see the rejected path.</small>
          <small data-error="">{error ?? 'Enter a valid email address.'}</small>
        </label>

        <footer data-row="end">
          <button aria-busy={pending} disabled={pending}>{pending ? 'Sending…' : 'Send invite'}</button>
        </footer>
      </form>

      {/* A popover, so the toast lives in the top layer without a portal. */}
      <output ref={toast} popover="" id="invite-sent" data-toast="" data-variant="success">
        <strong>Invite sent</strong>
        <p>They will get an email in a moment.</p>
      </output>
    </article>
  );
}

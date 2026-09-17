import { useRef, useState } from 'react';
import { invite, nameFrom } from './data.js';

export default function InviteForm({ onInvited }) {
  const email = useRef(null);
  const toast = useRef(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  // The browser has already enforced required/type=email by the time this runs.
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    setPending(true);
    const message = await invite(values.email);
    setPending(false);
    setError(message);
    // Turn a server rejection into a real constraint violation, so :user-invalid reveals <small data-error>.
    email.current.setCustomValidity(message ?? '');
    if (message) return;

    onInvited({ id: crypto.randomUUID(), name: nameFrom(values.email), email: values.email, role: values.role, status: 'invited' });
    form.reset();
    toast.current.showPopover();
    setTimeout(() => toast.current?.matches(':popover-open') && toast.current.hidePopover(), 4000);
  }

  return (
    <article data-card="">
      <header>
        <h3>Invite a teammate</h3>
        <p>Uncontrolled inputs plus native validation: React holds no field state at all.</p>
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

        <label>
          Role
          <select name="role" defaultValue="Developer">
            <button><selectedcontent></selectedcontent></button>
            <option>Admin</option>
            <option>Developer</option>
            <option>Billing</option>
          </select>
        </label>

        <footer data-row="end">
          <button type="reset" data-variant="ghost">
            Reset
          </button>
          <button aria-busy={pending} disabled={pending}>
            {pending ? 'Sending…' : 'Send invite'}
          </button>
        </footer>
      </form>

      {/* A popover, so it lives in the top layer without a portal. */}
      <output ref={toast} popover="" id="invite-sent" data-toast="" data-variant="success">
        <strong>Invite sent</strong>
        <p>They will get an email in a moment.</p>
      </output>
    </article>
  );
}

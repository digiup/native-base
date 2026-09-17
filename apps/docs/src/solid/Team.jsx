import { For } from 'solid-js';

const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'active' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com', role: 'Developer', status: 'invited' },
];

// Map your data to the shared variant vocabulary instead of writing variants.
const TONE = { active: 'success', invited: 'warning', suspended: 'destructive' };

const initials = (name) => name.split(' ').map((part) => part[0]).join('');

export default function Team() {
  return (
    <div data-grid="" style="--min: 13rem">
      <For each={TEAM}>
        {(member) => (
          <article data-card="">
            <header>
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </header>
            <div data-row="">
              <span data-avatar="">{initials(member.name)}</span>
              {/* undefined removes the attribute; false would render data-variant="false". */}
              <span data-badge="" data-variant={member.role === 'Owner' ? undefined : 'secondary'}>{member.role}</span>
              <span data-badge="" data-variant={TONE[member.status]}>{member.status}</span>
            </div>
          </article>
        )}
      </For>
    </div>
  );
}

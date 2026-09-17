import { useState } from 'react';
import InviteForm from './InviteForm.jsx';
import { TEAM, initials } from './data.js';

// Map your data to the shared variant vocabulary instead of writing component variants.
const TONE = { active: 'success', invited: 'warning', suspended: 'destructive' };

export default function Team() {
  const [team, setTeam] = useState(TEAM);
  const [query, setQuery] = useState('');

  const visible = team.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section data-stack>
      <div data-row="between">
        <h2>Team</h2>
        <search data-group>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter people…"
            aria-label="Filter people"
          />
          <button type="button" data-variant="outline" onClick={() => setQuery('')}>
            Clear
          </button>
        </search>
      </div>

      <div data-grid="" style={{ '--min': '15rem' }}>
        {visible.map((member) => (
          <article data-card="" key={member.id}>
            <header>
              <h3>{member.name}</h3>
              <p>{member.email}</p>
            </header>
            <div data-row="">
              <span data-avatar="">{initials(member.name)}</span>
              {/* undefined removes the attribute; false would render data-variant="false" and still match [data-variant]. */}
              <span data-badge="" data-variant={member.role === 'Owner' ? undefined : 'secondary'}>
                {member.role}
              </span>
              <span data-badge="" data-variant={TONE[member.status]}>
                {member.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div data-alert="" data-variant="warning" role="alert">
          <strong>No matches</strong>
          <p>Nobody here is called “{query}”.</p>
        </div>
      )}

      <InviteForm onInvited={(member) => setTeam((current) => [...current, member])} />
    </section>
  );
}

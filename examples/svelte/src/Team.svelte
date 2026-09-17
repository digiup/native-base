<script>
  import InviteForm from './InviteForm.svelte';
  import { TEAM, initials } from './data.js';

  // Map your data to the shared variant vocabulary instead of writing component variants.
  const TONE = { active: 'success', invited: 'warning', suspended: 'destructive' };

  let team = $state(TEAM);
  let query = $state('');

  const visible = $derived(team.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase())));
</script>

<section data-stack>
  <div data-row="between">
    <h2>Team</h2>
    <search data-group>
      <input bind:value={query} type="search" placeholder="Filter people…" aria-label="Filter people" />
      <button type="button" data-variant="outline" onclick={() => (query = '')}>Clear</button>
    </search>
  </div>

  <div data-grid style="--min: 15rem">
    {#each visible as member (member.id)}
      <article data-card>
        <header>
          <h3>{member.name}</h3>
          <p>{member.email}</p>
        </header>
        <div data-row>
          <span data-avatar>{initials(member.name)}</span>
          <!-- null removes the attribute; false would render data-variant="false". -->
          <span data-badge data-variant={member.role === 'Owner' ? null : 'secondary'}>{member.role}</span>
          <span data-badge data-variant={TONE[member.status]}>{member.status}</span>
        </div>
      </article>
    {/each}
  </div>

  {#if visible.length === 0}
    <div data-alert data-variant="warning" role="alert">
      <strong>No matches</strong>
      <p>Nobody here is called “{query}”.</p>
    </div>
  {/if}

  <InviteForm onInvited={(member) => (team = [...team, member])} />
</section>

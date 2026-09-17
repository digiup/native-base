<script>
  const TEAM = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
    { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
  ];

  let dialog;
  let target = $state(null);
  let team = $state(TEAM);

  // One dialog element, reused. Svelte owns the data, the browser owns open and closed.
  function askToRemove(member) {
    target = member;
    dialog.showModal();
  }

  // method="dialog" closes on submit and hands the button's value to the close event.
  function onclose(event) {
    if (event.currentTarget.returnValue === 'remove') team = team.filter((member) => member !== target);
    target = null;
  }
</script>

<div data-stack>
  <div data-row>
    {#each team as member (member.id)}
      <button type="button" data-variant="outline" data-size="sm" onclick={() => askToRemove(member)}>
        Remove {member.name.split(' ')[0]}
      </button>
    {/each}
    {#if team.length === 0}
      <button type="button" data-variant="ghost" data-size="sm" onclick={() => (team = TEAM)}>Start over</button>
    {/if}
  </div>

  <dialog bind:this={dialog} {onclose} closedby="any" aria-labelledby="remove-title">
    <header>
      <h2 id="remove-title">Remove {target?.name}?</h2>
      <p>{target?.email} loses access immediately.</p>
    </header>
    <form method="dialog">
      <footer>
        <button value="cancel" data-variant="outline">Cancel</button>
        <button value="remove" data-variant="destructive">Remove</button>
      </footer>
    </form>
  </dialog>
</div>

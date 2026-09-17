import { createSignal, For, Show } from 'solid-js';

const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
];

export default function RemoveMember() {
  let dialog;
  const [target, setTarget] = createSignal(null);
  const [team, setTeam] = createSignal(TEAM);

  // One dialog element, reused. Solid owns the data, the browser owns open and closed.
  function askToRemove(member) {
    setTarget(member);
    dialog.showModal();
  }

  // method="dialog" closes on submit and hands the button's value to the close event.
  function onClose(event) {
    if (event.currentTarget.returnValue === 'remove') setTeam((current) => current.filter((member) => member !== target()));
    setTarget(null);
  }

  return (
    <div data-stack="">
      <div data-row="">
        <For each={team()}>
          {(member) => (
            <button type="button" data-variant="outline" data-size="sm" onClick={() => askToRemove(member)}>
              Remove {member.name.split(' ')[0]}
            </button>
          )}
        </For>
        <Show when={team().length === 0}>
          <button type="button" data-variant="ghost" data-size="sm" onClick={() => setTeam(TEAM)}>
            Start over
          </button>
        </Show>
      </div>

      <dialog ref={dialog} on:close={onClose} closedby="any" aria-labelledby="remove-title">
        <header>
          <h2 id="remove-title">Remove {target()?.name}?</h2>
          <p>{target()?.email} loses access immediately.</p>
        </header>
        <form method="dialog">
          <footer>
            <button value="cancel" data-variant="outline">Cancel</button>
            <button value="remove" data-variant="destructive">Remove</button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}

import { useRef, useState } from 'react';

const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
];

export default function RemoveMember() {
  const dialog = useRef(null);
  const [target, setTarget] = useState(null);
  const [team, setTeam] = useState(TEAM);

  // One dialog element, reused. React owns the data, the browser owns open and closed.
  function askToRemove(member) {
    setTarget(member);
    dialog.current.showModal();
  }

  // method="dialog" closes on submit and hands the button's value to onClose.
  function onClose(event) {
    if (event.currentTarget.returnValue === 'remove') setTeam((current) => current.filter((member) => member !== target));
    setTarget(null);
  }

  return (
    <div data-stack="">
      <div data-row="">
        {team.map((member) => (
          <button key={member.id} type="button" data-variant="outline" data-size="sm" onClick={() => askToRemove(member)}>
            Remove {member.name.split(' ')[0]}
          </button>
        ))}
        {team.length === 0 && <button type="button" data-variant="ghost" data-size="sm" onClick={() => setTeam(TEAM)}>Start over</button>}
      </div>

      <dialog ref={dialog} onClose={onClose} closedby="any" aria-labelledby="remove-title">
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
  );
}

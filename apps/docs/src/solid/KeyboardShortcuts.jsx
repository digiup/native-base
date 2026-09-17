// No signal, no effect, no portal: this component imports nothing at all.
export default function KeyboardShortcuts() {
  return (
    <>
      <button commandfor="shortcuts" command="show-modal" data-variant="outline">
        Keyboard shortcuts
      </button>

      <dialog id="shortcuts" closedby="any" aria-labelledby="shortcuts-title">
        <button commandfor="shortcuts" command="close" aria-label="Close">
          ✕
        </button>
        <header>
          <h2 id="shortcuts-title">Keyboard shortcuts</h2>
          <p>Esc and the backdrop close this, because of closedby.</p>
        </header>
        <table>
          <tbody>
            <tr>
              <td>Command palette</td>
              <td data-numeric=""><kbd>⌘K</kbd></td>
            </tr>
            <tr>
              <td>New invite</td>
              <td data-numeric=""><kbd>⌘I</kbd></td>
            </tr>
          </tbody>
        </table>
      </dialog>
    </>
  );
}

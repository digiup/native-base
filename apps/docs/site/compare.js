// Tailwind class strings from shadcn/ui (new-york, v4) components, as they render to HTML.
// Conservative: data-slot attributes and Radix ids are left out, which only flatters the Tailwind side.
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

export const primaryButton = `${base} bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3`;
const outlineButton = `${base} border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3`;
const label =
  'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50';
const input =
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive';

export const cases = [
  {
    id: 'buttons',
    title: 'Buttons',
    tailwind: `<button class="${primaryButton}">Save</button>
<button class="${outlineButton}">Cancel</button>`,
    native: `<button>Save</button>
<button data-variant="outline">Cancel</button>`,
  },
  {
    id: 'login',
    title: 'Login card',
    tailwind: `<div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-sm">
  <div class="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
    <div class="leading-none font-semibold">Login to your account</div>
    <div class="text-muted-foreground text-sm">Enter your email below to login.</div>
  </div>
  <div class="px-6">
    <form>
      <div class="flex flex-col gap-6">
        <div class="grid gap-2">
          <label class="${label}" for="email">Email</label>
          <input class="${input}" id="email" type="email" placeholder="m@example.com" required>
        </div>
        <div class="grid gap-2">
          <label class="${label}" for="password">Password</label>
          <input class="${input}" id="password" type="password" required>
        </div>
      </div>
    </form>
  </div>
  <div class="flex items-center px-6 [.border-t]:pt-6">
    <button class="${primaryButton} w-full">Login</button>
  </div>
</div>`,
    native: `<form data-card>
  <header>
    <h3>Login to your account</h3>
    <p>Enter your email below to login.</p>
  </header>
  <label>Email <input type="email" placeholder="m@example.com" required></label>
  <label>Password <input type="password" required></label>
  <button>Login</button>
</form>`,
  },
  {
    id: 'dialog',
    title: 'Dialog',
    note: 'The Tailwind version also needs React, Radix Dialog and open/close state. The native one needs nothing.',
    tailwind: `<button class="${outlineButton}" type="button" aria-haspopup="dialog" data-state="open">Edit profile</button>
<div data-state="open" class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"></div>
<div role="dialog" data-state="open" tabindex="-1" class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg">
  <div class="flex flex-col gap-2 text-center sm:text-left">
    <h2 class="text-lg leading-none font-semibold">Edit profile</h2>
    <p class="text-muted-foreground text-sm">Make changes to your profile here.</p>
  </div>
  <div class="grid gap-3">
    <label class="${label}" for="name">Name</label>
    <input class="${input}" id="name" value="Ada Lovelace">
  </div>
  <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <button class="${outlineButton}">Cancel</button>
    <button class="${primaryButton}">Save changes</button>
  </div>
  <button type="button" class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"><span class="sr-only">Close</span>✕</button>
</div>`,
    native: `<button commandfor="compare-profile" command="show-modal" data-variant="outline">Edit profile</button>
<dialog id="compare-profile" closedby="any">
  <button commandfor="compare-profile" command="close" aria-label="Close">✕</button>
  <header>
    <h2>Edit profile</h2>
    <p>Make changes to your profile here.</p>
  </header>
  <form method="dialog">
    <label>Name <input value="Ada Lovelace"></label>
    <footer>
      <button data-variant="outline">Cancel</button>
      <button>Save changes</button>
    </footer>
  </form>
</dialog>`,
  },
  {
    id: 'field',
    title: 'Validated field',
    note: 'The Tailwind version also needs state to flip aria-invalid and render the message. Here :user-invalid does it.',
    tailwind: `<div class="grid gap-2">
  <label class="${label}" for="work-email">Email</label>
  <input class="${input}" id="work-email" type="email" aria-invalid="true" aria-describedby="work-email-error">
  <p id="work-email-error" class="text-destructive text-sm">Enter a valid email address.</p>
</div>`,
    native: `<label>
  Email
  <input type="email" required>
  <small data-error>Enter a valid email address.</small>
</label>`,
  },
];

export const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'active' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com', role: 'Developer', status: 'invited' },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@example.com', role: 'Billing', status: 'suspended' },
];

export const INVOICES = [
  { id: 'INV001', status: 'Paid', method: 'Card', amount: 250 },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: 150 },
  { id: 'INV003', status: 'Unpaid', method: 'Transfer', amount: 350 },
  { id: 'INV004', status: 'Paid', method: 'Card', amount: 45 },
];

export const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

/** ada.lovelace@example.com → Ada Lovelace, so a new invite has something to show. */
export const nameFrom = (email) =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const money = (amount) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** Stands in for a mutation. Rejects one address so the error path is reachable. */
export function invite(email) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(email === 'ada@example.com' ? 'That address is already on the team.' : null), 700);
  });
}

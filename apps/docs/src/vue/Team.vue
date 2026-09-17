<script setup>
const TEAM = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'Owner', status: 'active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'active' },
  { id: 3, name: 'Alan Turing', email: 'alan@example.com', role: 'Developer', status: 'invited' },
];

// Map your data to the shared variant vocabulary instead of writing variants.
const TONE = { active: 'success', invited: 'warning', suspended: 'destructive' };

const initials = (name) => name.split(' ').map((part) => part[0]).join('');
</script>

<template>
  <div data-grid style="--min: 13rem">
    <article data-card v-for="member in TEAM" :key="member.id">
      <header>
        <h3>{{ member.name }}</h3>
        <p>{{ member.email }}</p>
      </header>
      <div data-row>
        <span data-avatar>{{ initials(member.name) }}</span>
        <!-- A null or undefined binding removes the attribute; false would render data-variant="false". -->
        <span data-badge :data-variant="member.role === 'Owner' ? null : 'secondary'">{{ member.role }}</span>
        <span data-badge :data-variant="TONE[member.status]">{{ member.status }}</span>
      </div>
    </article>
  </div>
</template>

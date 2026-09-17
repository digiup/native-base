<script setup>
import { computed, ref } from 'vue';
import InviteForm from './InviteForm.vue';
import { TEAM, initials } from './data.js';

// Map your data to the shared variant vocabulary instead of writing component variants.
const TONE = { active: 'success', invited: 'warning', suspended: 'destructive' };

const team = ref(TEAM);
const query = ref('');

const visible = computed(() =>
  team.value.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(query.value.toLowerCase())),
);
</script>

<template>
  <section data-stack>
    <div data-row="between">
      <h2>Team</h2>
      <search data-group>
        <input v-model="query" type="search" placeholder="Filter people…" aria-label="Filter people" />
        <button type="button" data-variant="outline" @click="query = ''">Clear</button>
      </search>
    </div>

    <div data-grid style="--min: 15rem">
      <article data-card v-for="member in visible" :key="member.id">
        <header>
          <h3>{{ member.name }}</h3>
          <p>{{ member.email }}</p>
        </header>
        <div data-row>
          <span data-avatar>{{ initials(member.name) }}</span>
          <!-- null removes the attribute; false would render data-variant="false". -->
          <span data-badge :data-variant="member.role === 'Owner' ? null : 'secondary'">{{ member.role }}</span>
          <span data-badge :data-variant="TONE[member.status]">{{ member.status }}</span>
        </div>
      </article>
    </div>

    <div v-if="!visible.length" data-alert data-variant="warning" role="alert">
      <strong>No matches</strong>
      <p>Nobody here is called “{{ query }}”.</p>
    </div>

    <InviteForm @invited="(member) => (team = [...team, member])" />
  </section>
</template>

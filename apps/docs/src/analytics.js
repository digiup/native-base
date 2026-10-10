// PostHog, in its own chunk: main.js imports this only after the visitor accepts the consent banner.
// It keeps its state in localStorage rather than cookies, so declining later can wipe it from here.
import posthog from 'posthog-js';

export function start({ key, host }) {
  if (posthog.__loaded) return posthog.opt_in_capturing();
  posthog.init(key, { api_host: host, persistence: 'localStorage', person_profiles: 'identified_only' });
}

export function stop() {
  posthog.opt_out_capturing();
  for (const store of [localStorage, sessionStorage]) {
    for (const name of Object.keys(store)) if (/^_*ph_/.test(name)) store.removeItem(name);
  }
}

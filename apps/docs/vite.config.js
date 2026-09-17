import { svelte } from '@sveltejs/vite-plugin-svelte';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { nativeBaseSite } from './site/plugin.js';

export default defineConfig({
  plugins: [
    nativeBaseSite(),
    vue(),
    svelte(),
    // Scoped to the Solid guide: React's .jsx files stay on Vite's own JSX transform.
    solid({ include: '**/src/solid/**' }),
  ],
  build: {
    // native-base ships modern CSS on purpose; don't let the minifier down-level it.
    cssTarget: ['chrome135', 'firefox140', 'safari26'],
    outDir:'../../public'
  },
});

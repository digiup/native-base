import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    // native-base ships modern CSS on purpose; don't let the minifier down-level it.
    cssTarget: ['chrome135', 'firefox140', 'safari26'],
  },
});

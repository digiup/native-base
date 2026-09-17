import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    // native-base ships modern CSS on purpose; don't let the minifier down-level it.
    cssTarget: ['chrome135', 'firefox140', 'safari26'],
  },
});

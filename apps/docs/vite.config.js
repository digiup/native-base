import { defineConfig } from 'vite';
import { nativeBaseSite } from './site/plugin.js';

export default defineConfig({
  plugins: [nativeBaseSite()],
  build: {
    // native-base ships modern CSS on purpose; don't let the minifier down-level it.
    cssTarget: ['chrome135', 'firefox140', 'safari26'],
  },
});

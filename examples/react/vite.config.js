import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // native-base ships modern CSS on purpose; don't let the minifier down-level it.
    cssTarget: ['chrome135', 'firefox140', 'safari26'],
  },
});

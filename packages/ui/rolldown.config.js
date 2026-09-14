import { defineConfig } from 'rolldown';
import { nativeBaseRegistry } from './build/registry.js';

export default defineConfig([
  {
    input: { index: 'src/index.js' },
    platform: 'neutral',
    plugins: [nativeBaseRegistry()],
    output: { dir: 'dist', format: 'esm' },
  },
  {
    input: { cli: 'src/cli.js' },
    platform: 'node',
    output: { dir: 'dist', format: 'esm', banner: '#!/usr/bin/env node' },
  },
]);

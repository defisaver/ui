import { defineConfig } from 'vitest/config';
import stylex from '@stylexjs/unplugin';
import react from '@vitejs/plugin-react';

// Internal-only toolchain: Storybook (react-vite) and Vitest both pick this
// config up. The published build is produced by rollup.config.mjs instead.
export default defineConfig({
  plugins: [stylex.vite({ useCSSLayers: true }), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});

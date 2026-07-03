import { defineConfig } from 'eslint/config';
import { reactConfig } from '@defisaver/eslint-config';
import stylexPlugin from '@stylexjs/eslint-plugin';

export default defineConfig([
  {
    ignores: ['dist/**', 'storybook-static/**', 'node_modules/**'],
  },
  {
    extends: reactConfig,
    files: ['src/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}', '*.{ts,mjs}', 'eslint.config.js'],
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      '@stylexjs': stylexPlugin,
    },
    rules: {
      '@stylexjs/valid-styles': 'error',
      '@stylexjs/sort-keys': 'warn',
    },
  },
]);

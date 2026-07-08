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
      // propLimits: color properties in component styles must be tokens.
      // Token references (imports from *.stylex.ts files) bypass value
      // checks entirely, so this bans raw hex/rgb literals while leaving
      // the few non-decisions (transparent, currentColor) usable. A missing
      // color is a signal to add a token, not to inline a value.
      '@stylexjs/valid-styles': ['error', {
        propLimits: {
          color: {
            limit: ['inherit', 'currentColor', 'transparent'],
            reason: 'Colors are design decisions — use a token from src/tokens/colors.stylex.ts (add one if missing).',
          },
          '*Color': {
            limit: ['inherit', 'currentColor', 'transparent'],
            reason: 'Colors are design decisions — use a token from src/tokens/colors.stylex.ts (add one if missing).',
          },
        },
      }],
      '@stylexjs/sort-keys': 'warn',
    },
  },
]);

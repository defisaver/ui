import * as stylex from '@stylexjs/stylex';

// Semantic colors mirroring defisaver-app's theme.scss. Inside the app these
// follow its [data-theme] custom properties automatically; the fallbacks are
// the app's dark-theme values so the library looks right standalone too.
// Only what current components need — grow per migrated component.
export const colors = stylex.defineVars({
  surface: 'var(--surface, #1F272E)',
  surfaceShade: 'var(--surface-shade, #181F25)',
  textSecondary: 'var(--text-color-secondary, #B2C1CC)',
});

import * as stylex from '@stylexjs/stylex';

// Semantic colors. Deliberately minimal: a token is added here the moment a
// component needs it, never speculatively — Figma is the intended source of
// truth for the full set. Each value defers to the app's custom property
// (theme.scss) so components follow the app theme in-app; the fallback is the
// app's dark-theme value for standalone use.
export const colors = stylex.defineVars({
  surface: 'var(--surface, #1F272E)',
  surfaceShade: 'var(--surface-shade, #181F25)',
  // Hairline borders/dividers on surfaces — a step lighter so they read
  // against both the page background and panel interiors
  surfaceBorderSurface: 'var(--surface-border-surface, #252F37)',
  textSecondary: 'var(--text-color-secondary, #B2C1CC)',
  // Translucent overlay for hover states on interactive elements
  white5Hover: 'var(--interaction-white-5-hover, #FFFFFF0D)',
});

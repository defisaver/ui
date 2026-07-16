import * as stylex from '@stylexjs/stylex';

// Semantic colors. Deliberately minimal: a token is added here the moment a
// component needs it, never speculatively — Figma is the source of truth.
// Values are owned by the library (no deferral to app CSS vars), so
// components render Figma-true wherever they're consumed; theming, if ever
// needed, is a stylex.createTheme over these vars.
export const colors = stylex.defineVars({
  surface: '#1F272E',
  surfaceShade: '#181F25',
  surfaceShadeStrong: '#151A1E',
  // Hairline borders/dividers on surfaces — a step lighter so they read
  // against both the page background and panel interiors
  surfaceBorderSurface: '#252F37',
  surfaceBorderSurfaceShade: '#1F272E',
  // Containers: smaller blocks that sit on surfaces
  container: '#3D4E5C',
  containerShade: '#394956',
  containerShadeStrong: '#33414C',
  containerBorder: '#415361',
  textPrimary: '#F9FAFB',
  textSecondary: '#B2C1CC',
  // Translucent overlay for hover states on interactive elements
  white5Hover: '#FFFFFF0D',
});

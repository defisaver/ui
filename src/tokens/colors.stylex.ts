import * as stylex from '@stylexjs/stylex';

// Semantic colors, named element + variant + property (surface,
// surfaceShade, surfaceShadeBorder…). Deliberately minimal: a token is
// added here the moment a component needs it, never speculatively — Figma
// is the source of truth. Values are owned by the library (no deferral to
// app CSS vars), so components render Figma-true wherever they're consumed;
// theming, if ever needed, is a stylex.createTheme over these vars.
export const colors = stylex.defineVars({
  surface: '#1F272E',
  surfaceShade: '#181F25',
  surfaceShadeStrong: '#151A1E',
  // Hairline borders/dividers — a step lighter than the surface they sit on
  // so they read against both the page background and panel interiors
  surfaceBorder: '#252F37',
  surfaceShadeBorder: '#1F272E',
  // Containers: smaller blocks that sit on surfaces. Values match the app's
  // container palette (blue-gray 750/720/820).
  container: '#33414C',
  containerShadeStrong: '#252F37',
  containerBorder: '#394956',
  textPrimary: '#F9FAFB',
  textSecondary: '#B2C1CC',
  // Translucent white overlay for hover states on interactive elements
  hoverOverlay: '#FFFFFF0D',
});

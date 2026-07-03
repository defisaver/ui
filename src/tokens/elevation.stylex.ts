import * as stylex from '@stylexjs/stylex';

// Shadow recipes. The app has no shadow tokens — these are the recurring
// values found across its SCSS, named by role. Canonical here; when a ported
// component's shadow is within a pixel of one of these, snap to the token
// instead of carrying the one-off value over.
export const shadow = stylex.defineConsts({
  // Subtle lift for small floating pieces (tooltips, pills)
  low: '0 0 4px rgba(0, 0, 0, 0.25)',
  // Cards, dropdowns
  medium: '0 4px 12px rgba(0, 0, 0, 0.3)',
  // Modals and large overlays — the app's most common recipe
  high: '0 8px 24px rgba(0, 0, 0, 0.35)',
  // Hairline outline used instead of a border on dark surfaces
  ring: '0 0 0 1px rgba(255, 255, 255, 0.15)',
});

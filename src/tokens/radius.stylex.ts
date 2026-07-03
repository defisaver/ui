import * as stylex from '@stylexjs/stylex';

// Mirrors defisaver-app's --border-radius-* custom properties. Minimal by
// design — add a step when a component needs it.
export const radius = stylex.defineConsts({
  xl: 'var(--border-radius-xl, 12px)',
});

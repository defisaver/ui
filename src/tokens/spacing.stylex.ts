import * as stylex from '@stylexjs/stylex';

// 4px scale mirroring defisaver-app's --space-* custom properties. Minimal by
// design — add a step when a component needs it.
export const space = stylex.defineConsts({
  s2: 'var(--space-2, 8px)',
  s3: 'var(--space-3, 12px)',
  s4: 'var(--space-4, 16px)',
});

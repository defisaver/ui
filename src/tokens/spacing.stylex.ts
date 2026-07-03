import * as stylex from '@stylexjs/stylex';

// 4px scale mirroring defisaver-app's --space-* custom properties. Inside the
// app the var() resolves to the app's value; standalone the fallback applies.
// Grow this map as migrated components need more steps.
export const space = stylex.defineConsts({
  s1: 'var(--space-1, 4px)',
  s2: 'var(--space-2, 8px)',
  s3: 'var(--space-3, 12px)',
  s4: 'var(--space-4, 16px)',
  s5: 'var(--space-5, 20px)',
  s6: 'var(--space-6, 24px)',
  s8: 'var(--space-8, 32px)',
  s10: 'var(--space-10, 40px)',
  s12: 'var(--space-12, 48px)',
  s16: 'var(--space-16, 64px)',
  s20: 'var(--space-20, 80px)',
});

import * as stylex from '@stylexjs/stylex';

// 4px scale mirroring defisaver-app's --space-* custom properties, including
// its half-steps (s0_25 = --space-025 = 1px, s1_5 = --space-1-5 = 6px).
// Inside the app the var() resolves to the app's value; standalone the
// fallback applies.
export const space = stylex.defineConsts({
  s0_25: 'var(--space-025, 1px)',
  s0_5: 'var(--space-05, 2px)',
  s1: 'var(--space-1, 4px)',
  s1_5: 'var(--space-1-5, 6px)',
  s2: 'var(--space-2, 8px)',
  s2_5: 'var(--space-2-5, 10px)',
  s3: 'var(--space-3, 12px)',
  s4: 'var(--space-4, 16px)',
  s5: 'var(--space-5, 20px)',
  s6: 'var(--space-6, 24px)',
  s7: 'var(--space-7, 28px)',
  s8: 'var(--space-8, 32px)',
  s9: 'var(--space-9, 36px)',
  s10: 'var(--space-10, 40px)',
  s11: 'var(--space-11, 44px)',
  s12: 'var(--space-12, 48px)',
  s13: 'var(--space-13, 52px)',
  s14: 'var(--space-14, 56px)',
  s15: 'var(--space-15, 60px)',
  s16: 'var(--space-16, 64px)',
  s17: 'var(--space-17, 68px)',
  s18: 'var(--space-18, 72px)',
  s19: 'var(--space-19, 76px)',
  s20: 'var(--space-20, 80px)',
});

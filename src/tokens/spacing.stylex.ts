import * as stylex from '@stylexjs/stylex';

// 4px spacing scale. Keys name the rendered pixel size (space.px8 = 8px) so
// code reads exactly like the Figma spec — no multiplier math. The var()
// references keep the app's --space-* naming (a 4px-multiplier scheme, e.g.
// --space-2-5 = 10px): inside the app the var resolves to the app's value,
// standalone the fallback applies.
export const space = stylex.defineConsts({
  px1: 'var(--space-025, 1px)',
  px2: 'var(--space-05, 2px)',
  px4: 'var(--space-1, 4px)',
  px6: 'var(--space-1-5, 6px)',
  px8: 'var(--space-2, 8px)',
  px10: 'var(--space-2-5, 10px)',
  px12: 'var(--space-3, 12px)',
  px16: 'var(--space-4, 16px)',
  px20: 'var(--space-5, 20px)',
  px24: 'var(--space-6, 24px)',
  px28: 'var(--space-7, 28px)',
  px32: 'var(--space-8, 32px)',
  px36: 'var(--space-9, 36px)',
  px40: 'var(--space-10, 40px)',
  px44: 'var(--space-11, 44px)',
  px48: 'var(--space-12, 48px)',
  px52: 'var(--space-13, 52px)',
  px56: 'var(--space-14, 56px)',
  px60: 'var(--space-15, 60px)',
  px64: 'var(--space-16, 64px)',
  px68: 'var(--space-17, 68px)',
  px72: 'var(--space-18, 72px)',
  px76: 'var(--space-19, 76px)',
  px80: 'var(--space-20, 80px)',
});

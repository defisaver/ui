import * as stylex from '@stylexjs/stylex';

// Mirrors defisaver-app's --border-radius-* custom properties.
export const radius = stylex.defineConsts({
  small: 'var(--border-radius-small, 4px)',
  medium: 'var(--border-radius-medium, 6px)',
  large: 'var(--border-radius-large, 8px)',
  xl: 'var(--border-radius-xl, 12px)',
  xxl: 'var(--border-radius-xxl, 16px)',
  xxxl: 'var(--border-radius-xxxl, 20px)',
  fullyRounded: 'var(--border-radius-fully-rounded, 50%)',
});

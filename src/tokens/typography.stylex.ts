import * as stylex from '@stylexjs/stylex';

// Mirrors defisaver-app's --text-* custom properties. The app defines sizes in
// rem against a 62.5% html font-size; the px fallbacks give the same rendered
// size when the library is used standalone.
export const text = stylex.defineConsts({
  sizeSmall: 'var(--text-size-small, 12px)',
  sizeRegular: 'var(--text-size-regular, 14px)',
  sizeLarge: 'var(--text-size-large, 18px)',
  weightSemiBold: 'var(--text-weight-semi-bold, 500)',
  weightBold: 'var(--text-weight-bold, 700)',
});

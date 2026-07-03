import * as stylex from '@stylexjs/stylex';

// Mirrors defisaver-app's --text-* custom properties. The app defines sizes
// in rem against a 62.5% html font-size (1rem = 10px); the px fallbacks give
// the same rendered size standalone. Minimal by design — add entries when a
// component needs them.
export const text = stylex.defineConsts({
  sizeSmall: 'var(--text-size-small, 12px)',
  sizeRegular: 'var(--text-size-regular, 14px)',
  weightSemiBold: 'var(--text-weight-semi-bold, 500)',
});

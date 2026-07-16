import * as stylex from '@stylexjs/stylex';

// Type scale. Minimal by design — add entries when a component needs them.
// Word-scale names predate the pixel-name convention; new Figma-driven
// sizes use pixel names (size11).
export const text = stylex.defineConsts({
  size11: '11px',
  sizeSmall: '12px',
  sizeRegular: '14px',
  weightSemiBold: '500',
});

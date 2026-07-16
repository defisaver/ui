import * as stylex from '@stylexjs/stylex';

// Border radii. The word-scale names predate the pixel-name convention;
// new Figma-driven values use pixel names (px2, px10), matching the
// spacing scale.
export const radius = stylex.defineConsts({
  px2: '2px',
  px10: '10px',
  small: '4px',
  medium: '6px',
  large: '8px',
  xl: '12px',
  xxl: '16px',
  xxxl: '20px',
  fullyRounded: '50%',
});

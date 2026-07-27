import * as stylex from '@stylexjs/stylex';

// Border radii, named by rendered pixel value — same convention as the
// spacing scale, so code reads exactly like the Figma spec.
export const radius = stylex.defineConsts({
  px4: '4px',
  px6: '6px',
  px8: '8px',
  px10: '10px',
  px12: '12px',
  // Pill shape (Figma specs 256px, not 50% — 50% would render ellipses)
  px256: '256px',
  // The one non-pixel name: 50% has no pixel value, it renders a circle on
  // square boxes.
  circle: '50%',
});

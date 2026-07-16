import type { CSSProperties } from 'react';
import type * as stylex from '@stylexjs/stylex';

// stylex.props() produces the atomic class list (and sometimes inline vars);
// fold the caller's className/style in after it so external overrides
// survive the merge.
export const mergeExternal = (
  sx: ReturnType<typeof stylex.props>,
  className?: string,
  style?: CSSProperties,
) => ({
  ...sx,
  className: [sx.className, className].filter(Boolean).join(' '),
  ...(sx.style || style ? { style: { ...sx.style, ...style } } : null),
});

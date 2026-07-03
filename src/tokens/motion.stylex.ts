import * as stylex from '@stylexjs/stylex';

// Motion primitives. The app has no motion tokens — durations cluster around
// 0.1/0.15/0.2/0.3s, and its signature hover feel is the hover-transition
// mixin's ease-out curve (variables.scss). Compose as
// `transition: background-color ${duration.base} ${easing.hover}`.
export const duration = stylex.defineConsts({
  fast: '0.1s',
  base: '0.2s',
  slow: '0.3s',
});

export const easing = stylex.defineConsts({
  // The app's hover-transition mixin curve — strong ease-out, settles softly
  hover: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  inOut: 'ease-in-out',
  out: 'ease-out',
});

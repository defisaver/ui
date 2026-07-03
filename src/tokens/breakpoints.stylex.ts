import * as stylex from '@stylexjs/stylex';

// Responsive breakpoints, desktop-first (max-width) like the app's SCSS
// mixins. The app has 11 mixins but usage is concentrated on five widths —
// the sub-480px ones total 8 uses and are intentionally dropped:
//   sm 650px (for-sm-screen, 174 uses) · md 768px (for-ipad, 58)
//   lg 900px (for-md-screen, 30) · xl 1024px (main-header-break, 32)
//   xxl 1130px (manager-break, 36)
// Usable directly as StyleX condition keys:
//   color: { default: x, [breakpoint.sm]: y }
export const breakpoint = stylex.defineConsts({
  sm: '@media only screen and (max-width: 650px)',
  md: '@media only screen and (max-width: 768px)',
  lg: '@media only screen and (max-width: 900px)',
  xl: '@media only screen and (max-width: 1024px)',
  xxl: '@media only screen and (max-width: 1130px)',
});

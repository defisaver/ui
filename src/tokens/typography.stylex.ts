import * as stylex from '@stylexjs/stylex';

// Type scale, named by rendered pixel value — same convention as the
// spacing scale. Minimal by design: add entries when a component needs them.
export const text = stylex.defineConsts({
  size11: '11px',
  size12: '12px',
  size14: '14px',
  size15: '15px',
  size16: '16px',
  size18: '18px',
  size20: '20px',
  size22: '22px',
  size24: '24px',
  size28: '28px',
  size32: '32px',
  size36: '36px',
  size40: '40px',
  size44: '44px',
  size48: '48px',
  size52: '52px',
  // Named by the value that renders: 500 is CSS Medium (SemiBold is 600).
  weight300: '300',
  weight400: '400',
  weight500: '500',
  weight600: '600',
  weight700: '700',
});

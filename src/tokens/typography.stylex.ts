import * as stylex from '@stylexjs/stylex';

// Mirrors defisaver-app's --text-* custom properties. The app defines sizes
// in rem against a 62.5% html font-size (1rem = 10px); the px fallbacks give
// the same rendered size when the library is used standalone, without
// requiring the html hack.

// Montserrat is the app's single family for both text and numerics
// ($main-font and --text-font-family-numeric). Canonical here — the app has
// no CSS var for the main family to defer to.
export const font = stylex.defineConsts({
  family: '\'Montserrat\', sans-serif',
  familyNumeric: 'var(--text-font-family-numeric, \'Montserrat\', sans-serif)',
});

export const text = stylex.defineConsts({
  // Size ramp
  sizeTiny: 'var(--text-size-tiny, 8px)',
  sizeExtraSmall: 'var(--text-size-extra-small, 10px)',
  sizeSmall: 'var(--text-size-small, 12px)',
  sizeSmallRegular: 'var(--text-size-small-regular, 13px)',
  sizeRegular: 'var(--text-size-regular, 14px)',
  sizeMedium: 'var(--text-size-medium, 16px)',
  sizeLarge: 'var(--text-size-large, 18px)',
  sizeExtraLarge: 'var(--text-size-extra-large, 20px)',
  sizeGiant: 'var(--text-size-giant, 22px)',
  sizeTitle: 'var(--text-size-title, 28px)',
  sizeTitleHomePage: 'var(--text-size-title-home-page, 35px)',

  // Numeric display (Portfolio-style highlighted figures)
  sizeNumHighlightStrong: 'var(--text-size-num-highlight-strong, 32px)',
  lineHeightNumHighlightRegular: 'var(--text-line-height-num-highlight-regular, 32px)',

  // Weights
  weightThin: 'var(--text-weight-thin, 300)',
  weightNormal: 'var(--text-weight-normal, 400)',
  weightSemiBold: 'var(--text-weight-semi-bold, 500)',
  weightBold: 'var(--text-weight-bold, 700)',
});

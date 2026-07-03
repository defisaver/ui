import * as stylex from '@stylexjs/stylex';
import {
  blue, blueGray, green, orange, pine, purple, red,
} from './palette.stylex';

// Semantic colors mirroring defisaver-app's theme.scss (camelCased:
// --text-color-primary → textPrimary). Every value defers to the app's custom
// property so inside the app the components follow theme.scss — including its
// [data-theme] switching — with zero migration; the fallback (the app's
// dark-theme palette step) applies when the library runs standalone.
//
// Deliberately excluded from theme.scss: the deprecated --bg-color-* trio,
// external protocol brand colors (own file when a component needs them), and
// --neut-50/--notification-error (marked for renaming in the app, DEV-12048).
export const colors = stylex.defineVars({
  // Surfaces: large panels, page-level backgrounds
  surface: `var(--surface, ${blueGray._850})`,
  surfaceShade: `var(--surface-shade, ${blueGray._880})`,
  surfaceShadeStrong: `var(--surface-shade-strong, ${blueGray._900})`,
  surfaceHighlight: `var(--surface-highlight, ${blueGray._820})`,
  surfaceHighlightStrong: `var(--surface-highlight-strong, ${blueGray._750})`,
  surfaceBorderSurface: `var(--surface-border-surface, ${blueGray._820})`,
  surfaceBorderSurfaceHighlight: `var(--surface-border-surface-highlight, ${blueGray._800})`,
  surfaceBorderSurfaceHighlightStrong: `var(--surface-border-surface-highlight-strong, ${blueGray._750})`,

  // Containers: smaller pieces — headers, buttons, cards
  container: `var(--container, ${blueGray._750})`,
  containerOpacity10: `var(--container-opacity-10, ${blueGray._500a10})`,
  containerOpacity20: `var(--container-opacity-20, ${blueGray._500a20})`,
  containerShade: `var(--container-shade, ${blueGray._820})`,
  containerShadeStrong: `var(--container-shade-strong, ${blueGray._880})`,
  containerHighlight: `var(--container-highlight, ${blueGray._650})`,
  containerHighlightStrong: `var(--container-highlight-strong, ${blueGray._500})`,
  containerBorder: `var(--container-border, ${blueGray._680})`,
  containerBorderHighlightStrong: `var(--container-border-highlight-strong, ${blueGray._600})`,

  // Text
  textPrimary: `var(--text-color-primary, ${blueGray._020})`,
  textSecondary: `var(--text-color-secondary, ${blueGray._250})`,
  textTertiary: `var(--text-color-tertiary, ${blueGray._450})`,
  textSubtle: `var(--text-color-subtle, ${blueGray._650})`,
  textContrast: `var(--text-color-contrast, ${blueGray._900})`,
  textBrand: `var(--text-color-brand, ${pine._500})`,
  textBrandVivid: `var(--text-color-brand-vivid, ${green._500})`,
  textBrandVividOnSurface: `var(--text-color-brand-vivid-on-surface, ${green._100})`,
  textError: `var(--text-color-error, ${red._100})`,
  textWhite: 'var(--text-color-white, #FFFFFF)',
  textTitle: `var(--text-color-title, ${blueGray._020})`,
  textAfterValueRatioUp: `var(--text-color-after-value-ratio-up, ${purple._200})`,
  textAfterValueRatioDown: `var(--text-color-after-value-ratio-down, ${orange._200})`,

  // DeFi position semantics
  collateral: `var(--bg-color-collateral, ${blue._500})`,
  collateral10: `var(--bg-color-collateral-10, ${blue._500a10})`,
  collateral20: `var(--bg-color-collateral-20, ${blue._500a20})`,
  debt: `var(--bg-color-debt, ${orange._500})`,
  debt10: `var(--bg-color-debt-10, ${orange._500a10})`,
  debt20: `var(--bg-color-debt-20, ${orange._500a20})`,

  // Brand
  brand: `var(--bg-color-brand, ${pine._500})`,
  brandVivid: `var(--bg-color-brand-vivid, ${green._500})`,
  brandBorder: `var(--brand-border, ${pine._300})`,
  brandBorderOpacity: `var(--brand-border-opacity, ${pine._300a30})`,
  bgAutomation: 'var(--bg-color-automation, linear-gradient(135deg, #284D42 0%, #253F56 96.83%))',

  // Borders (the hex literals below predate the palette in the app's
  // theme.scss and don't map to named steps — kept verbatim)
  borderPrimary: 'var(--border-color-primary, #5A646C)',
  borderSecondary: 'var(--border-color-secondary, #465059)',
  borderSubtle: 'var(--border-color-subtle, #313D47)',
  borderDiscreet: 'var(--border-color-discreet, #222B32)',
  borderFocus: `var(--border-color-focus, ${blue._500})`,
  borderGreen: `var(--border-color-green, ${pine._300})`,
  borderPurple: 'var(--border-color-purple, #6B6BB3)',
  borderMain: `var(--border-color-main, ${blueGray._720})`,

  // Interaction states: translucent overlays over any background
  white5Hover: 'var(--interaction-white-5-hover, #FFFFFF0D)',
  white10Focus: 'var(--interaction-white-10-focus, #FFFFFF1A)',
  white20: 'var(--interaction-white-20, #FFFFFF33)',
  black5Hover: 'var(--interaction-black-5-hover, #0000000D)',
  black10Focus: 'var(--interaction-black-10-focus, #0000001A)',
  backdropBlack50: 'var(--interaction-backdrop-black-50, #00000080)',
  shadowBlack25: 'var(--interaction-shadow-black-25, #00000040)',
});

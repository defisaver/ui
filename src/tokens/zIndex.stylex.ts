import * as stylex from '@stylexjs/stylex';

// Stacking layers. The app has no z-index scale — raw values (1, 2, 10, 1000,
// 9998–10000) are scattered through its SCSS. The named layers below match
// the app's observed ceiling values so library overlays stack correctly next
// to unmigrated app CSS; local tweaks inside a component should stay in the
// 1–9 range and never reach for these.
export const zIndex = stylex.defineConsts({
  // Local lift above siblings within a component
  raised: '1',
  // Floating attached UI: dropdowns, tooltips, context menus
  dropdown: '100',
  // Sticky page chrome: headers, footers, sidebars
  sticky: '1000',
  // Full-screen dimmer behind modals (app uses 9998)
  backdrop: '9998',
  // Modal dialogs (app uses 9999)
  modal: '9999',
  // Snackbars/toasts — always on top (app uses 10000)
  toast: '10000',
});

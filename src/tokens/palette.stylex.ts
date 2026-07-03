import * as stylex from '@stylexjs/stylex';

// Primitive color ramps — the canonical source of truth (the app's
// color-palette.scss says it should eventually come from a package; this is
// that package). Literal hex values, no var() deferral: primitives are
// theme-independent. Components should not use these directly — go through
// the semantic tokens in colors.stylex.ts; the palette exists so semantic
// tokens (and rare data-viz cases) have named steps to point at.
//
// Keys mirror the app's step numbers (--color-blue-gray-850 → blueGray._850).
// Suffixed steps like _500a10 are the app's baked-in opacity variants
// (--color-blue-gray-500-10 = step 500 at 10% alpha).

export const blueGray = stylex.defineConsts({
  _010: '#FCFDFD',
  _020: '#F9FAFB',
  _050: '#F0F3F5',
  _080: '#E7EBEF',
  _100: '#E0E6EB',
  _120: '#DAE1E7',
  _150: '#D1DAE0',
  _180: '#C8D2DA',
  _200: '#C2CDD6',
  _220: '#BCC8D2',
  _250: '#B2C1CC',
  _280: '#A9B9C6',
  _300: '#A3B4C2',
  _350: '#94A8B8',
  _400: '#859BAD',
  _450: '#758EA3',
  _500: '#668299',
  _500a10: '#6681981A',
  _500a20: '#66819833',
  _550: '#5C758A',
  _600: '#52687A',
  _650: '#475B6B',
  _680: '#415361',
  _700: '#3D4E5C',
  _720: '#394956',
  _750: '#33414C',
  _780: '#2D3943',
  _800: '#29343D',
  _820: '#252F37',
  _850: '#1F272E',
  _880: '#181F25',
  _900: '#151A1E',
  _920: '#101518',
  _950: '#0A0D0F',
  _980: '#040506',
  _990: '#020303',
  _999: '#000000',
});

export const green = stylex.defineConsts({
  _010: '#F5FFFB',
  _050: '#EBF7F1',
  _100: '#AFDFC5',
  _200: '#73C89A',
  _300: '#5FC08C',
  _400: '#4BB87D',
  _500: '#37B06F',
  _600: '#329E64',
  _700: '#277B4E',
  _800: '#216A43',
  _900: '#16462C',
  _999: '#0B2316',
});

export const pine = stylex.defineConsts({
  _010: '#F5FBF9',
  _050: '#EBF1EF',
  _100: '#AEC8BD',
  _200: '#719F8C',
  _300: '#5D917C',
  _300a30: '#34765B4D',
  _400: '#48846B',
  _500: '#34765B',
  _600: '#2F6A52',
  _700: '#245340',
  _800: '#1F4737',
  _900: '#152F24',
  _999: '#0A1812',
});

export const purple = stylex.defineConsts({
  _010: '#FFF8FF',
  _050: '#F5EEFC',
  _100: '#D7B9F3',
  _200: '#B985E9',
  _300: '#AF74E6',
  _400: '#A562E3',
  _500: '#9B51E0',
  _600: '#8C49CA',
  _700: '#6D399D',
  _800: '#5D3186',
  _900: '#3E205A',
  _999: '#1F102D',
});

export const orange = stylex.defineConsts({
  _010: '#FFFBF2',
  _050: '#FCF1E8',
  _100: '#F4C8A4',
  _200: '#EC9F5F',
  _300: '#E99149',
  _400: '#E78432',
  _500: '#E4761B',
  _500a10: '#E4761B1A',
  _500a20: '#E4761B33',
  _600: '#CD6A18',
  _700: '#A05313',
  _800: '#894710',
  _900: '#5B2F0B',
  _999: '#2E1805',
});

export const red = stylex.defineConsts({
  _010: '#FFF8F8',
  _050: '#FDEEEE',
  _100: '#F7BCBC',
  _200: '#F18989',
  _300: '#EF7979',
  _400: '#ED6868',
  _500: '#EB5757',
  _600: '#D44E4E',
  _700: '#A53D3D',
  _800: '#8D3434',
  _900: '#5E2323',
  _999: '#2F1111',
});

export const blue = stylex.defineConsts({
  _010: '#F4F9FF',
  _050: '#E9F3FF',
  _100: '#A8CEFF',
  _200: '#67A9FF',
  _300: '#519DFF',
  _400: '#3C90FF',
  _500: '#2684FF',
  _500a10: '#2684FF1A',
  _500a20: '#2684FF33',
  _600: '#2277E6',
  _700: '#1B5CB3',
  _800: '#174F99',
  _800a20: '#174F9933',
  _900: '#0F3566',
  _999: '#081A33',
});

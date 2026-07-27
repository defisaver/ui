import {
  createContext, forwardRef, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type {
  ComponentPropsWithoutRef, KeyboardEvent, MouseEvent, ReactNode, Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { radius } from '../../tokens/radius.stylex';
import { space } from '../../tokens/spacing.stylex';
import { text } from '../../tokens/typography.stylex';
import { mergeExternal } from '../../internal/mergeExternal';

export type SegmentedControlSize = 's' | 'm' | 'l' | 'xl';
export type SegmentedControlVariant = 'light' | 'dark' | 'darker';

// Set once on <SegmentedControl>; every SegmentedControlItem reads it so
// consumers configure everything (size, variant, selection) in one place —
// same shape as Panel. registerSegment hands each item's element to the
// root, which owns the sliding indicator.
interface SegmentedControlContextValue {
  size: SegmentedControlSize;
  variant: SegmentedControlVariant;
  value: string | undefined;
  // Divider bookkeeping, derived by the root from the DOM order of the
  // registered segments — not from sibling structure, so items wrapped in
  // extra elements (tooltip wrappers) behave like direct children. The
  // first segment has no divider to its left; the segment right after the
  // active one hides its divider along with the active segment's own (the
  // pair flanking the indicator; see the ::before styles).
  firstValue: string | undefined;
  afterActiveValue: string | undefined;
  setValue: (value: string) => void;
  registerSegment: (value: string, el: HTMLButtonElement | null) => void;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue>({
  size: 's',
  variant: 'dark',
  value: undefined,
  firstValue: undefined,
  afterActiveValue: undefined,
  setValue: () => { },
  registerSegment: () => { },
});

// Indicator slide: user-initiated selection → ease-out (quart, shared with
// Panel so the DS moves as one). Segment-sized element, so the middle of the
// 150–250ms UI band.
const slideEase = 'cubic-bezier(0.165, 0.84, 0.44, 1)';
const slideMs = '200ms';

const styles = stylex.create({
  root: {
    padding: space.px4,
    gap: space.px1,
    boxSizing: 'border-box',
    // Block-level, so the control spans its container with equal-width
    // segments — the common case in the app, so it's the default;
    // hugContent opts out. Grid (not flex) because 1fr auto-columns
    // equalize with no min-width fighting.
    display: 'grid',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    // Anchor for the absolutely-positioned indicator.
    position: 'relative',
  },
  rootHug: {
    display: 'inline-grid',
    gridAutoColumns: 'max-content',
  },
  // Radii scale with size — container 6/10/12/pill, segment & indicator
  // 4/6/8/pill, keeping the indicator's corner visually tracking the
  // container's (~2/3 of it at every size; the strict concentric 6-4=2 for
  // S read nearly square). XL is the pill: 6px container padding (vs the
  // shared 4px) and fully-rounded corners.
  rootS: { borderRadius: radius.px6 },
  rootM: { borderRadius: radius.px10 },
  rootL: { borderRadius: radius.px12 },
  rootXl: { padding: space.px6, borderRadius: radius.px256 },
  rootLight: { backgroundColor: colors.containerShadeStrong },
  rootDark: { backgroundColor: colors.surfaceShade },
  rootDarker: { backgroundColor: colors.surfaceShadeStrong },
  segment: {
    borderStyle: 'none',
    gap: space.px4,
    paddingBlock: space.px4,
    paddingInline: space.px12,
    transition: 'color 0.2s ease',
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    color: { default: colors.textSecondary, ':hover': colors.textPrimary },
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: text.weight500,
    justifyContent: 'center',
    // Above the indicator, which slides underneath the labels.
    position: 'relative',
    whiteSpace: 'nowrap',
    zIndex: 1,
    minWidth: '68px',
    // Items may be wrapped in extra elements (tooltip wrappers) — the
    // wrapper then becomes the grid child, so the button fills it to keep
    // the indicator matching the visual cell. Direct children already
    // stretch to their track, and the icon-only widths (applied later) win.
    width: '100%',
    // Divider: a 16px hairline (all sizes) centered in the container's 1px
    // gap. It renders on every segment; which ones hide it — the first in
    // DOM order plus the two flanking the indicator — the root decides via
    // context (segmentNoDivider), so wrapped items behave exactly like
    // direct children. The flanking pair hands off with a fade as the
    // indicator slides between segments.
    '::before': {
      transition: 'opacity 150ms ease',
      backgroundColor: colors.surfaceBorder,
      content: '""',
      display: 'block',
      insetInlineStart: '-1px',
      opacity: 1,
      position: 'absolute',
      transform: 'translateY(-50%)',
      height: '16px',
      top: '50%',
      width: '1px',
    },
  },
  // Per-size type scale (Figma: S 11px, M and L share Body/14 500, XL
  // 15px). Segment heights (20/28/36/40 → totals 28/36/44/52 inside the
  // container padding) are pinned explicitly rather than left to
  // padding + line-height, so an icon taller than the line box can't
  // stretch the control. The letter-spacing is S-only (1% of 11px).
  segmentS: {
    borderRadius: radius.px4,
    fontSize: text.size11,
    lineHeight: '12px',
    height: '20px',
  },
  segmentM: {
    borderRadius: radius.px6,
    fontSize: text.size14,
    lineHeight: '20px',
    height: '28px',
  },
  segmentL: {
    borderRadius: radius.px8,
    fontSize: text.size14,
    lineHeight: '20px',
    height: '36px',
  },
  // XL swaps the shared 4/12 segment padding for 10/32: 10+10 around the
  // 20px line-height makes the 40px segment that lands the pill on its
  // 52px total (Figma's 12px block padding would overshoot to 56).
  segmentXl: {
    borderRadius: radius.px256,
    paddingBlock: space.px10,
    paddingInline: space.px32,
    fontSize: text.size15,
    lineHeight: '20px',
    height: '40px',
  },
  segmentActive: {
    color: colors.textPrimary,
  },
  // The base divider color (surfaceBorder) matches the light variant's
  // background, so light steps its dividers up to the container border —
  // the same divider-equals-indicator-border relationship dark has.
  segmentLight: {
    '::before': {
      backgroundColor: colors.containerBorder,
    },
  },
  // Applied before segmentActive, so a disabled *selected* segment keeps its
  // primary color (dimmed by the opacity) while an idle disabled one stays
  // secondary with the hover highlight pinned off.
  segmentDisabled: {
    color: { default: colors.textSecondary, ':hover': colors.textSecondary },
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  // Icon-only segments (hideLabel) are square — width pinned to the size's
  // segment height, so the sliding indicator reads as a box, not a
  // stretched rectangle. Meant for S/M, where a label won't fit; L/XL
  // accept it but the Figma designs don't use it there.
  segmentIconOnly: {
    paddingInline: 0,
    minWidth: 'unset',
  },
  segmentIconOnlyS: { width: '20px' },
  segmentIconOnlyM: { width: '28px' },
  segmentIconOnlyL: { width: '36px' },
  segmentIconOnlyXl: { width: '40px' },
  // Fixed-size slot so the icon renders at the size's scale regardless of
  // the SVG's intrinsic dimensions; consumers size the SVG to fill (100%).
  iconSlot: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  iconS: { height: '14px', width: '14px' },
  iconM: { height: '16px', width: '16px' },
  iconL: { height: '18px', width: '18px' },
  iconXl: { height: '20px', width: '20px' },
  // Visually-hidden label (standard clip pattern): with hideLabel the text
  // stays in the DOM so the button keeps its accessible name.
  srOnly: {
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    position: 'absolute',
    whiteSpace: 'nowrap',
    height: '1px',
    width: '1px',
  },
  // Applied to the first segment in DOM order (nothing to divide from), the
  // active segment (its own divider), and the one after it (the divider on
  // the indicator's other flank).
  segmentNoDivider: {
    '::before': {
      opacity: 0,
    },
  },
  // Positioned entirely from measurement: `left: 0` plus a translateX of the
  // active segment's offsetLeft (both physical-left values, so RTL stays
  // consistent). Height comes from CSS — the container's 4px padding on both
  // block edges — so only x/width ever animate.
  indicator: {
    borderStyle: 'solid',
    borderWidth: '1px',
    insetBlock: space.px4,
    transition: {
      default: `transform ${slideMs} ${slideEase}, width ${slideMs} ${slideEase}`,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    boxSizing: 'border-box',
    position: 'absolute',
    zIndex: 0,
    left: 0,
  },
  indicatorS: { borderRadius: radius.px4 },
  indicatorM: { borderRadius: radius.px6 },
  indicatorL: { borderRadius: radius.px8 },
  // Tracks the XL container's 6px padding (insetBlock is 4px on the rest).
  indicatorXl: { borderRadius: radius.px256, insetBlock: space.px6 },
  indicatorLight: { borderColor: colors.containerBorder, backgroundColor: colors.container },
  indicatorDark: { borderColor: colors.surfaceBorder, backgroundColor: colors.surface },
  indicatorDarker: { borderColor: colors.surfaceShadeBorder, backgroundColor: colors.surfaceShade },
});

const containerVariantStyle = {
  light: styles.rootLight,
  dark: styles.rootDark,
  darker: styles.rootDarker,
} as const;

const containerSizeStyle = {
  s: styles.rootS,
  m: styles.rootM,
  l: styles.rootL,
  xl: styles.rootXl,
} as const;

const segmentSizeStyle = {
  s: styles.segmentS,
  m: styles.segmentM,
  l: styles.segmentL,
  xl: styles.segmentXl,
} as const;

const iconSizeStyle = {
  s: styles.iconS,
  m: styles.iconM,
  l: styles.iconL,
  xl: styles.iconXl,
} as const;

const iconOnlySizeStyle = {
  s: styles.segmentIconOnlyS,
  m: styles.segmentIconOnlyM,
  l: styles.segmentIconOnlyL,
  xl: styles.segmentIconOnlyXl,
} as const;

const indicatorSizeStyle = {
  s: styles.indicatorS,
  m: styles.indicatorM,
  l: styles.indicatorL,
  xl: styles.indicatorXl,
} as const;

const indicatorVariantStyle = {
  light: styles.indicatorLight,
  dark: styles.indicatorDark,
  darker: styles.indicatorDarker,
} as const;

const assignRef = <T,>(ref: Ref<T> | undefined, node: T | null) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
};

// Selection comes in the two usual flavors:
// - Uncontrolled (the common case): pass `defaultValue` and SegmentedControl
//   owns the state; `onValueChange` still reports switches.
// - Controlled: pass `value` and drive it from `onValueChange`.
type SegmentedControlRootProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  children: ReactNode;
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hugContent?: boolean;
};

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlRootProps>(({
  className,
  style,
  children,
  size = 's',
  variant = 'dark',
  value: controlledValue,
  defaultValue,
  onValueChange,
  hugContent = false,
  ...rest
}, ref) => {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : ownValue;

  const segmentEls = useRef(new Map<string, HTMLButtonElement>());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null);
  const [firstValue, setFirstValue] = useState<string | undefined>(undefined);
  const [afterActiveValue, setAfterActiveValue] = useState<string | undefined>(undefined);

  const setValue = useCallback((next: string) => {
    if (!isControlled) setOwnValue(next);
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const registerSegment = useCallback((segmentValue: string, el: HTMLButtonElement | null) => {
    if (el) segmentEls.current.set(segmentValue, el);
    else segmentEls.current.delete(segmentValue);
  }, []);

  // Divider bookkeeping. Segment order comes from the DOM
  // (compareDocumentPosition over the registered elements), not from sibling
  // relationships, so items wrapped in extra elements (tooltip wrappers)
  // work. No dependency array: membership changes have no render-safe signal
  // (registration happens in ref callbacks), so this recomputes every commit
  // — a sort over a handful of nodes — and bails out via value equality.
  useLayoutEffect(() => {
    const ordered = Array.from(segmentEls.current.entries())

      .sort(([, a], [, b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .map(([segmentValue]) => segmentValue);
    const activeIndex = value === undefined ? -1 : ordered.indexOf(value);
    // When the active segment is last (or there is none), this is undefined.
    const after = activeIndex === -1 ? undefined : ordered[activeIndex + 1];
    setFirstValue((prev) => (prev === ordered[0] ? prev : ordered[0]));
    setAfterActiveValue((prev) => (prev === after ? prev : after));
  });

  // The indicator mirrors the active segment's measured box. A layout effect
  // (before paint) means the first committed frame already has the final
  // position — no slide-in from 0 on mount. The ResizeObserver re-measures
  // on anything the old app's window-resize approach missed: container-only
  // resizes, font loading, label changes.
  useLayoutEffect(() => {
    const el = value !== undefined ? segmentEls.current.get(value) : undefined;
    if (!el) {
      setIndicator(null);
      return undefined;
    }
    const measure = () => setIndicator({ x: el.offsetLeft, width: el.offsetWidth });
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined; // SSR/jsdom
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [value]);

  const context = useMemo(() => ({
    size, variant, value, firstValue, afterActiveValue, setValue, registerSegment,
  }), [size, variant, value, firstValue, afterActiveValue, setValue, registerSegment]);

  const indicatorSx = stylex.props(
    styles.indicator, indicatorSizeStyle[size], indicatorVariantStyle[variant],
  );

  return (
    <SegmentedControlContext.Provider value={context}>
      <div
        // Single-select control, not view-switching tabs — radio semantics,
        // with the matching roving tabindex + arrow keys on each item.
        role="radiogroup"
        ref={(node) => {
          containerRef.current = node;
          assignRef(ref, node);
        }}
        {...rest}
        {...mergeExternal(
          stylex.props(
            styles.root,
            containerSizeStyle[size],
            containerVariantStyle[variant],
            hugContent && styles.rootHug,
          ),
          className,
          style,
        )}
      >
        {children}
        {/* After the segments; z-index keeps it under the labels. */}
        {indicator && (
          <span
            aria-hidden="true"
            {...indicatorSx}
            style={{
              ...indicatorSx.style,
              transform: `translateX(${indicator.x}px)`,
              width: indicator.width,
            }}
          />
        )}
      </div>
    </SegmentedControlContext.Provider>
  );
});
SegmentedControl.displayName = 'SegmentedControl';

type SegmentedControlItemProps = ComponentPropsWithoutRef<'button'> & {
  value: string;
  children: ReactNode;
  // Rendered before the label in a per-size fixed slot (14/16/18/20).
  icon?: ReactNode;
  // Icon-only view: the label is visually hidden but stays in the DOM as
  // the accessible name. Intended for the S and M sizes.
  hideLabel?: boolean;
};

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(({
  className,
  style,
  children,
  value,
  icon,
  hideLabel = false,
  disabled,
  onClick,
  onKeyDown,
  ...rest
}, ref) => {
  const {
    size, variant, value: activeValue, firstValue, afterActiveValue, setValue, registerSegment,
  } = useContext(SegmentedControlContext);
  const active = value === activeValue;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setValue(value);
  };

  // Radio-style arrow navigation: focus moves and selection follows, with
  // wrap-around. The group is read from the DOM, so segment order needs no
  // registration bookkeeping and conditional segments just work.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const group = e.currentTarget.closest('[role="radiogroup"]');
    if (!group) return;
    const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
    const index = radios.indexOf(e.currentTarget);
    const next = radios[(index + dir + radios.length) % radios.length];
    next?.focus();
    next?.click();
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      // Roving tabindex — one tab stop for the whole group. With no
      // selection yet every segment stays reachable.
      tabIndex={active || activeValue === undefined ? 0 : -1}
      ref={(node) => {
        registerSegment(value, node);
        assignRef(ref, node);
      }}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
      {...mergeExternal(
        stylex.props(
          styles.segment,
          segmentSizeStyle[size],
          variant === 'light' && styles.segmentLight,
          disabled && styles.segmentDisabled,
          active && styles.segmentActive,
          (active || value === firstValue || value === afterActiveValue) && styles.segmentNoDivider,
          hideLabel && styles.segmentIconOnly,
          hideLabel && iconOnlySizeStyle[size],
        ),
        className,
        style,
      )}
    >
      {icon && (
        <span aria-hidden="true" {...stylex.props(styles.iconSlot, iconSizeStyle[size])}>
          {icon}
        </span>
      )}
      {hideLabel ? <span {...stylex.props(styles.srOnly)}>{children}</span> : children}
    </button>
  );
});
SegmentedControlItem.displayName = 'SegmentedControlItem';

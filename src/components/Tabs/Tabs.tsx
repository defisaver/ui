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

export type TabsSize = 's' | 'm' | 'l' | 'xl';
export type TabsVariant = 'light' | 'dark' | 'darker';

// Set once on <Tabs>; every Tab reads it so consumers configure everything
// (size, variant, selection) in one place — same shape as Panel. registerTab
// hands each Tab's element to the root, which owns the sliding indicator.
interface TabsContextValue {
  size: TabsSize;
  variant: TabsVariant;
  value: string | undefined;
  // The tab right after the active one — its divider flanks the indicator,
  // so it hides along with the active tab's own (see the ::before styles).
  afterActiveValue: string | undefined;
  setValue: (value: string) => void;
  registerTab: (value: string, el: HTMLButtonElement | null) => void;
}

const TabsContext = createContext<TabsContextValue>({
  size: 's',
  variant: 'dark',
  value: undefined,
  afterActiveValue: undefined,
  setValue: () => { },
  registerTab: () => { },
});

// Indicator slide: user-initiated selection → ease-out (quart, shared with
// Panel so the DS moves as one). Segment-sized element, so the middle of the
// 150–250ms UI band.
const slideEase = 'cubic-bezier(0.165, 0.84, 0.44, 1)';
const slideMs = '200ms';

const styles = stylex.create({
  tabs: {
    padding: space.px4,
    gap: space.px1,
    boxSizing: 'border-box',
    // Equal-width segments sized by the widest label — the common case in
    // the app, so it's the default; hugContent opts out. Grid (not flex)
    // because 1fr auto-columns equalize to the largest content with no
    // min-width fighting.
    display: 'inline-grid',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    // Anchor for the absolutely-positioned indicator.
    position: 'relative',
  },
  tabsHug: {
    gridAutoColumns: 'max-content',
  },
  // Radii scale with size — container 6/10/12/pill, segment & indicator
  // 2/6/8/pill. XL is the pill: 6px container padding (vs the shared 4px)
  // and fully-rounded corners.
  tabsS: { borderRadius: radius.medium },
  tabsM: { borderRadius: radius.px10 },
  tabsL: { borderRadius: radius.xl },
  tabsXl: { padding: space.px6, borderRadius: radius.px256 },
  tabsLight: { backgroundColor: colors.containerShadeStrong },
  tabsDark: { backgroundColor: colors.surfaceShade },
  tabsDarker: { backgroundColor: colors.surfaceShadeStrong },
  tab: {
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
    fontWeight: text.weightSemiBold,
    justifyContent: 'center',
    // Above the indicator, which slides underneath the labels.
    position: 'relative',
    whiteSpace: 'nowrap',
    zIndex: 1,
    minWidth: '68px',
    // Divider: a 16px hairline (all sizes) centered in the container's 1px
    // gap, so it lives on every tab but the first (the indicator span
    // renders after the tabs to keep :first-child pointing at a tab). The
    // two dividers flanking the indicator hide (tabNoDivider) and hand off
    // with a fade as the indicator slides between segments.
    '::before': {
      transition: 'opacity 150ms ease',
      backgroundColor: colors.surfaceBorderSurface,
      content: '""',
      display: { default: 'block', ':first-child': 'none' },
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
  // 15px). Heights (total 28/36/44/52) fall out of the paddings around the
  // line-height everywhere except L, whose type alone would stop at 36
  // total — its min-height supplies the extra room. The letter-spacing is
  // S-only (1% of 11px).
  tabS: {
    borderRadius: radius.px2,
    fontSize: text.size11,
    lineHeight: '12px',
  },
  tabM: {
    borderRadius: radius.medium,
    fontSize: text.sizeRegular,
    lineHeight: '20px',
  },
  tabL: {
    borderRadius: radius.large,
    fontSize: text.sizeRegular,
    lineHeight: '20px',
    minHeight: '36px',
  },
  // XL swaps the shared 4/12 segment padding for 10/32: 10+10 around the
  // 20px line-height makes the 40px segment that lands the pill on its
  // 52px total (Figma's 12px block padding would overshoot to 56).
  tabXl: {
    borderRadius: radius.px256,
    paddingBlock: space.px10,
    paddingInline: space.px32,
    fontSize: text.size15,
    lineHeight: '20px',
  },
  tabActive: {
    color: colors.textPrimary,
  },
  // Applied to the active tab (its own divider) and the one after it (the
  // divider on the indicator's other flank).
  tabNoDivider: {
    '::before': {
      opacity: 0,
    },
  },
  // Positioned entirely from measurement: `left: 0` plus a translateX of the
  // active tab's offsetLeft (both physical-left values, so RTL stays
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
  indicatorS: { borderRadius: radius.px2 },
  indicatorM: { borderRadius: radius.medium },
  indicatorL: { borderRadius: radius.large },
  // Tracks the XL container's 6px padding (insetBlock is 4px on the rest).
  indicatorXl: { borderRadius: radius.px256, insetBlock: space.px6 },
  indicatorLight: { borderColor: colors.containerBorder, backgroundColor: colors.container },
  indicatorDark: { borderColor: colors.surfaceBorderSurface, backgroundColor: colors.surface },
  indicatorDarker: { borderColor: colors.surfaceBorderSurfaceShade, backgroundColor: colors.surfaceShade },
});

const containerVariantStyle = {
  light: styles.tabsLight,
  dark: styles.tabsDark,
  darker: styles.tabsDarker,
} as const;

const containerSizeStyle = {
  s: styles.tabsS,
  m: styles.tabsM,
  l: styles.tabsL,
  xl: styles.tabsXl,
} as const;

const tabSizeStyle = {
  s: styles.tabS,
  m: styles.tabM,
  l: styles.tabL,
  xl: styles.tabXl,
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
// - Uncontrolled (the common case): pass `defaultValue` and Tabs owns the
//   state; `onValueChange` still reports switches.
// - Controlled: pass `value` and drive it from `onValueChange`.
type TabsRootProps = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  children: ReactNode;
  size?: TabsSize;
  variant?: TabsVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  hugContent?: boolean;
};

export const Tabs = forwardRef<HTMLDivElement, TabsRootProps>(({
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

  const tabEls = useRef(new Map<string, HTMLButtonElement>());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<{ x: number; width: number } | null>(null);
  const [afterActiveValue, setAfterActiveValue] = useState<string | undefined>(undefined);

  const setValue = useCallback((next: string) => {
    if (!isControlled) setOwnValue(next);
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const registerTab = useCallback((tabValue: string, el: HTMLButtonElement | null) => {
    if (el) tabEls.current.set(tabValue, el);
    else tabEls.current.delete(tabValue);
  }, []);

  // The indicator mirrors the active tab's measured box. A layout effect
  // (before paint) means the first committed frame already has the final
  // position — no slide-in from 0 on mount. The ResizeObserver re-measures
  // on anything the old app's window-resize approach missed: container-only
  // resizes, font loading, label changes.
  useLayoutEffect(() => {
    const el = value !== undefined ? tabEls.current.get(value) : undefined;
    if (!el) {
      setIndicator(null);
      setAfterActiveValue(undefined);
      return undefined;
    }
    // The DOM neighbor is the tab whose divider sits on the indicator's
    // trailing edge (when the active tab is last, the neighbor is the
    // indicator span — no map entry, so this resolves to undefined).
    const sibling = el.nextElementSibling;
    let next: string | undefined;
    tabEls.current.forEach((node, tabValue) => {
      if (node === sibling) next = tabValue;
    });
    setAfterActiveValue(next);
    const measure = () => setIndicator({ x: el.offsetLeft, width: el.offsetWidth });
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined; // SSR/jsdom
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [value]);

  const context = useMemo(() => ({
    size, variant, value, afterActiveValue, setValue, registerTab,
  }), [size, variant, value, afterActiveValue, setValue, registerTab]);

  const indicatorSx = stylex.props(
    styles.indicator, indicatorSizeStyle[size], indicatorVariantStyle[variant],
  );

  return (
    <TabsContext.Provider value={context}>
      <div
        // Single-select control, not view-switching tabs — radio semantics,
        // with the matching roving tabindex + arrow keys on each Tab.
        role="radiogroup"
        ref={(node) => {
          containerRef.current = node;
          assignRef(ref, node);
        }}
        {...rest}
        {...mergeExternal(
          stylex.props(
            styles.tabs,
            containerSizeStyle[size],
            containerVariantStyle[variant],
            hugContent && styles.tabsHug,
          ),
          className,
          style,
        )}
      >
        {children}
        {/* After the tabs so the first tab stays :first-child (divider
            logic); z-index keeps it under the labels regardless. */}
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
    </TabsContext.Provider>
  );
});
Tabs.displayName = 'Tabs';

type TabProps = ComponentPropsWithoutRef<'button'> & {
  value: string;
  children: ReactNode;
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(({
  className,
  style,
  children,
  value,
  onClick,
  onKeyDown,
  ...rest
}, ref) => {
  const {
    size, value: activeValue, afterActiveValue, setValue, registerTab,
  } = useContext(TabsContext);
  const active = value === activeValue;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    setValue(value);
  };

  // Radio-style arrow navigation: focus moves and selection follows, with
  // wrap-around. The group is read from the DOM, so tab order needs no
  // registration bookkeeping and conditional tabs just work.
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
      // selection yet every tab stays reachable.
      tabIndex={active || activeValue === undefined ? 0 : -1}
      ref={(node) => {
        registerTab(value, node);
        assignRef(ref, node);
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
      {...mergeExternal(
        stylex.props(
          styles.tab,
          tabSizeStyle[size],
          active && styles.tabActive,
          (active || value === afterActiveValue) && styles.tabNoDivider,
        ),
        className,
        style,
      )}
    >
      {children}
    </button>
  );
});
Tab.displayName = 'Tab';

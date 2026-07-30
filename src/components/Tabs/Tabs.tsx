import {
  Children, cloneElement, createContext, forwardRef, isValidElement,
  useCallback, useContext, useMemo, useState,
} from 'react';
import type {
  ComponentPropsWithoutRef, CSSProperties, KeyboardEvent, MouseEvent,
  ReactElement, ReactNode, Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { space } from '../../tokens/spacing.stylex';
import { text } from '../../tokens/typography.stylex';
import { mergeExternal } from '../../internal/mergeExternal';

export type TabsSize = 's' | 'm' | 'l';
// Semantic, closed set on purpose: 'regular' (24px) is page navigation
// (SubNavigation), 'compact' (12px) is dense trading surfaces (the
// Hyperliquid tab bars). Consumers pick a name, not a number, so spacing
// stays consistent and greppable across the app.
export type TabsSpacing = 'regular' | 'compact';

// Set once on <Tabs>; every TabsItem reads it so consumers configure
// everything (size, selection) in one place — same shape as
// SegmentedControl, minus its DOM bookkeeping: with no sliding indicator
// and no dividers, nothing here needs measured elements.
interface TabsContextValue {
  size: TabsSize;
  stretch: boolean;
  value: string | undefined;
  setValue: (value: string) => void;
}

// null outside a provider: TabsItem throws on it rather than silently
// rendering a tab that can't select anything.
const TabsContext = createContext<TabsContextValue | null>(null);

// Selection changes are fades, not movement (the underline is static
// per-tab — deliberately no sliding indicator), so they stay active under
// prefers-reduced-motion, same stance as SegmentedControl's divider fade.
const colorFade = 'color 200ms ease';
const underlineFade = 'opacity 150ms ease';

const styles = stylex.create({
  // Transparent row — the tabs sit directly on whatever surface hosts
  // them, unlike SegmentedControl's contained pill. Block-level flex, but
  // items keep their natural width; the wrapper container dictates overall
  // width (and scrolling, if it wants any). No alignItems: the default
  // stretch lets a taller wrapper (a panel header with its own height)
  // grow the items, so the underline lands flush on the wrapper's bottom
  // edge — the item centers its own label, and a free-standing row is
  // exactly item-height, so the Figma look is unchanged.
  root: {
    gap: space.px24,
    display: 'flex',
  },
  rootCompact: {
    gap: space.px12,
  },
  // Shared item box: works as a <button> reset and as anchor styling for
  // the asChild case (hence textDecoration). The 4px gap is the Figma
  // label ↔ slot spacing (badge, chevron); slots are plain children.
  item: {
    borderStyle: 'none',
    gap: space.px4,
    paddingInline: 0,
    textDecoration: 'none',
    transition: colorFade,
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    color: { default: colors.textSecondary, ':hover': colors.textPrimary },
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: text.weight500,
    position: 'relative',
    whiteSpace: 'nowrap',
    // Underline: always rendered, faded in when active, so activation never
    // reflows the tab. It spans the full item (label + slot) and sits at
    // the bottom edge — inside the block padding, which is what detaches it
    // from the text in the Figma comps. Height (thickness) is per-size.
    '::after': {
      insetInline: 0,
      transition: underlineFade,
      backgroundColor: colors.brandVividBorder,
      content: '""',
      display: 'block',
      opacity: 0,
      position: 'absolute',
      bottom: 0,
    },
  },
  // Per-size type + rhythm from Figma. Line-heights are pinned so
  // padding + line adds up to the comp heights (S 12+12+12 = its 36px
  // max-height; M 10+16+10 = 36; L 14+20+14 = 48) — which is why S's
  // padding is larger than M's despite the smaller text. Underline
  // thickness scales 1 / 1.5 / 2.
  itemS: {
    paddingBlock: space.px12,
    fontSize: text.size12,
    lineHeight: '12px',
    '::after': { height: '1px' },
  },
  itemM: {
    paddingBlock: space.px10,
    fontSize: text.size14,
    lineHeight: '16px',
    '::after': { height: '1.5px' },
  },
  itemL: {
    paddingBlock: space.px14,
    fontSize: text.size16,
    lineHeight: '20px',
    '::after': { height: '2px' },
  },
  // Equal-width items filling the row (zero flex-basis, like the app's
  // mobile trading tabs) — internal layout a wrapper can't reach, hence a
  // prop rather than an override.
  itemStretch: {
    flexBasis: '0%',
    flexGrow: 1,
    justifyContent: 'center',
  },
  itemActive: {
    color: colors.textPrimary,
    '::after': { opacity: 1 },
  },
  // Applied before itemActive, so a disabled *selected* tab keeps its
  // primary color (dimmed by the opacity) while an idle disabled one stays
  // secondary with the hover highlight pinned off.
  itemDisabled: {
    color: { default: colors.textSecondary, ':hover': colors.textSecondary },
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

const itemSizeStyle = {
  s: styles.itemS,
  m: styles.itemM,
  l: styles.itemL,
} as const;

const assignRef = <T,>(ref: Ref<T> | undefined, node: T | null) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
};

// Selection comes in the two usual flavors, made mutually exclusive by the
// trailing union (`never` blocks the prop from the other mode):
// - Uncontrolled (view switching): pass `defaultValue` and Tabs owns the
//   state; `onValueChange` still reports switches.
// - Controlled: pass `value` and drive it from `onValueChange` — or, for
//   the navigation case, from the router's location.
// V narrows value/defaultValue/onValueChange to the consumer's union of tab
// values, same inference rules as SegmentedControl.
type TabsRootProps<V extends string = string> =
  Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
    children: ReactNode;
    size?: TabsSize;
    spacing?: TabsSpacing;
    stretch?: boolean;
    onValueChange?: (value: V) => void;
  } & (
    | { value: V; defaultValue?: never }
    | { value?: never; defaultValue?: V }
  );

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(({
  className,
  style,
  children,
  size = 'm',
  spacing = 'regular',
  stretch = false,
  value: controlledValue,
  defaultValue,
  onValueChange,
  ...rest
}, ref) => {
  const [ownValue, setOwnValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : ownValue;

  const setValue = useCallback((next: string) => {
    if (!isControlled) setOwnValue(next);
    onValueChange?.(next);
  }, [isControlled, onValueChange]);

  const context = useMemo(() => ({
    size, stretch, value, setValue,
  }), [size, stretch, value, setValue]);

  return (
    <TabsContext.Provider value={context}>
      <div
        // View-switching tabs; items are role="tab". With asChild links the
        // items are real navigation: wrap in a <nav> and clear this default
        // by passing role={undefined} — the rest spread below lets it win.
        role="tablist"
        ref={ref}
        {...rest}
        {...mergeExternal(
          stylex.props(styles.root, spacing === 'compact' && styles.rootCompact),
          className,
          style,
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
TabsRoot.displayName = 'Tabs';

// forwardRef erases generics (React 18), so the implementation is typed over
// plain strings and exported behind a generic call signature.
export const Tabs = TabsRoot as (<V extends string = string>(
  props: TabsRootProps<V> & { ref?: Ref<HTMLDivElement> },
) => ReactElement) & { displayName?: string };

// Props the asChild branch reads from and merges onto its child element.
type ChildProps = {
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  'aria-current'?: 'page';
  ref?: Ref<HTMLElement>;
};

type TabsItemProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  value: string;
} & (
  // asChild (Radix-style): the item renders the single child you pass —
  // the app's NavLink, a plain <a> — with the tab's styles and behavior
  // merged on. Keeps the library router-agnostic; the child must accept a
  // ref (DOM element or forwardRef component) for registration to work.
  | { asChild: true; children: ReactElement<ChildProps> }
  | { asChild?: false; children: ReactNode }
);

export const TabsItem = forwardRef<HTMLElement, TabsItemProps>(({
  className,
  style,
  children,
  value,
  asChild = false,
  disabled,
  onClick,
  onKeyDown,
  ...rest
}, ref) => {
  const context = useContext(TabsContext);
  if (context === null) {
    throw new Error('TabsItem must be rendered inside a Tabs');
  }
  const {
    size, stretch, value: activeValue, setValue,
  } = context;
  const active = value === activeValue;

  // preventDefault in a consumer onClick vetoes the switch (unsaved-changes
  // guards); re-clicking the selected tab stays silent.
  const select = (e: MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || active) return;
    setValue(value);
  };

  // Tablist arrow navigation with wrap-around; selection follows focus.
  // The group is read from the DOM, so tab order needs no registration
  // bookkeeping and conditional tabs just work. Button mode only — links
  // navigate, they don't rove.
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const group = e.currentTarget.closest('[role="tablist"]');
    if (!group) return;
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
    const index = tabs.indexOf(e.currentTarget);
    const next = tabs[(index + dir + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  };

  const sx = stylex.props(
    styles.item,
    itemSizeStyle[size],
    stretch && styles.itemStretch,
    disabled && styles.itemDisabled,
    active && styles.itemActive,
  );

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement<ChildProps>(child)) {
      throw new Error('TabsItem with asChild expects a single element child');
    }
    // React 18 keeps the ref on the element, not in props.
    const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;
    return cloneElement(child, {
      ...rest,
      // Real navigation: current-page marker instead of tab roles.
      'aria-current': active ? 'page' : undefined,
      onClick: (e: MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        select(e);
      },
      ref: (node: HTMLElement | null) => {
        assignRef(childRef, node);
        assignRef(ref, node);
      },
      ...mergeExternal(
        sx,
        [child.props.className, className].filter(Boolean).join(' ') || undefined,
        child.props.style || style ? { ...child.props.style, ...style } : undefined,
      ),
    });
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      // Roving tabindex — the active item is the tablist's single tab
      // stop. With no selection yet, every tab stays reachable instead;
      // that costs extra stops only until the first selection, which spares
      // the DOM-order/disabled bookkeeping a first-enabled fallback needs.
      tabIndex={activeValue === undefined || active ? 0 : -1}
      ref={(node) => assignRef(ref, node)}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        select(e);
      }}
      onKeyDown={handleKeyDown}
      {...rest}
      {...mergeExternal(sx, className, style)}
    >
      {children}
    </button>
  );
});
TabsItem.displayName = 'TabsItem';

import {
  createContext, forwardRef, useCallback, useContext, useMemo, useState,
} from 'react';
import type {
  ComponentPropsWithoutRef, CSSProperties, ElementType, KeyboardEvent,
  MouseEvent, ReactElement, ReactNode, Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { space } from '../../tokens/spacing.stylex';
import { text } from '../../tokens/typography.stylex';
import { mergeExternal } from '../../internal/mergeExternal';

export type TabsSize = 's' | 'm' | 'l';
// Semantic, closed set on purpose: 'compact' (12px) is dense trading
// surfaces (the Hyperliquid tab bars) and the default, because that's what
// nearly every tab bar in the app is; 'regular' (24px) is page navigation
// (SubNavigation) and opts in. Consumers pick a name, not a number, so
// spacing stays consistent and greppable across the app.
export type TabsSpacing = 'regular' | 'compact';

// Set once on <Tabs>; every TabsItem reads it so consumers configure
// everything (size, selection) in one place — same shape as
// SegmentedControl, minus its DOM bookkeeping: with no sliding indicator
// and no dividers, nothing here needs measured elements.
interface TabsContextValue {
  size: TabsSize;
  fullWidth: boolean;
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
    gap: space.px12,
    display: 'flex',
  },
  rootRegular: {
    gap: space.px24,
  },
  // fullWidth's half at the root: a flex row is block-level, so it already
  // fills a block wrapper — but as a flex *child* it defaults to
  // flex: 0 1 auto and hugs its items. Growing it here is what makes
  // itemFullWidth's equal-width split actually span the bar, instead of
  // splitting a content-width row and leaving the wrapper to force the
  // rest with `> * { flex: 1 }`.
  rootFullWidth: {
    flexGrow: 1,
  },
  // Shared item box: works as a <button> reset and as anchor styling for
  // the link case (hence textDecoration). The 4px gap is the Figma
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
  // prop rather than an override. Named for the horizontal axis on
  // purpose: items also stretch *vertically* to the wrapper's height (see
  // root), and one word for both was the source of the confusion.
  itemFullWidth: {
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
    // Fills the wrapper and splits it equally between the items — both the
    // row and the items, so no wrapper CSS is needed to finish the job.
    fullWidth?: boolean;
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
  spacing = 'compact',
  fullWidth = false,
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
    size, fullWidth, value, setValue,
  }), [size, fullWidth, value, setValue]);

  return (
    <TabsContext.Provider value={context}>
      <div
        // View-switching tabs; items are role="tab". When the items render
        // as links (`as={NavLink}`) they are real navigation: wrap in a
        // <nav> and clear this default by passing role={undefined} — the
        // rest spread below lets it win.
        role="tablist"
        ref={ref}
        {...rest}
        {...mergeExternal(
          stylex.props(
            styles.root,
            spacing === 'regular' && styles.rootRegular,
            fullWidth && styles.rootFullWidth,
          ),
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

// Kept separate so the polymorphic type below can subtract them from the
// rendered element's own props without collisions. `disabled` lives here
// rather than riding along as the native button attribute, so it means the
// same thing whatever `as` renders — a link gets aria-disabled and a
// blocked click instead of an attribute that anchors don't have.
type TabsItemOwnProps = {
  value: string;
  children?: ReactNode;
  disabled?: boolean;
};

// `as` renders the item as something other than a <button> — the app's
// NavLink, a plain <a> — so the library can style real navigation without
// ever importing a router. The target's props are typed through:
// `as={NavLink}` typechecks `to`, `as="a"` typechecks `href`.
type TabsItemProps<C extends ElementType = 'button'> =
  TabsItemOwnProps
  & { as?: C }
  & Omit<ComponentPropsWithoutRef<C>, keyof TabsItemOwnProps | 'as'>;

// The implementation is typed loosely (forwardRef erases generics, same as
// the root); the exported call signature below restores the inference.
type TabsItemImplProps = TabsItemOwnProps & {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
};

const TabsItemImpl = forwardRef<HTMLElement, TabsItemImplProps>(({
  className,
  style,
  children,
  value,
  as,
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
    size, fullWidth, value: activeValue, setValue,
  } = context;
  const active = value === activeValue;

  const Component = (as ?? 'button') as ElementType;
  const isButton = Component === 'button';

  // preventDefault in a consumer onClick vetoes the switch (unsaved-changes
  // guards); re-clicking the selected tab stays silent.
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    // A <button> drops clicks on its own while disabled; anything else — a
    // link above all — has to be stopped by hand, or a "disabled" tab would
    // still navigate while looking inert.
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
    if (e.defaultPrevented || active) return;
    setValue(value);
  };

  // Tablist arrow navigation with wrap-around; selection follows focus.
  // The group is read from the DOM, so tab order needs no registration
  // bookkeeping and conditional tabs just work. Only tabs rove: a link
  // group has no [role="tablist"] to find, so this exits early there and
  // the consumer's own onKeyDown still runs.
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e);
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const group = e.currentTarget.closest('[role="tablist"]');
    if (!group) return;
    e.preventDefault();
    const tabs = Array.from(group.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'));
    const index = tabs.indexOf(e.currentTarget);
    if (index === -1) return;
    const next = tabs[(index + dir + tabs.length) % tabs.length];
    next?.focus();
    next?.click();
  };

  const sx = stylex.props(
    styles.item,
    itemSizeStyle[size],
    fullWidth && styles.itemFullWidth,
    disabled && styles.itemDisabled,
    active && styles.itemActive,
  );

  // A button is a tab; anything else is real navigation, so it gets the
  // current-page marker instead of the tab pattern. aria-disabled stands in
  // for the disabled attribute, which only exists on form controls.
  const semantics = isButton
    ? {
        type: 'button' as const,
        role: 'tab',
        'aria-selected': active,
        disabled,
        // Roving tabindex — the active item is the tablist's single tab
        // stop. With no selection yet, every tab stays reachable instead;
        // that costs extra stops only until the first selection, which spares
        // the DOM-order/disabled bookkeeping a first-enabled fallback needs.
        tabIndex: activeValue === undefined || active ? 0 : -1,
      }
    : {
        'aria-current': active ? 'page' : undefined,
        'aria-disabled': disabled || undefined,
      };

  return (
    <Component
      {...semantics}
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
      {...mergeExternal(sx, className, style)}
    >
      {children}
    </Component>
  );
});
TabsItemImpl.displayName = 'TabsItem';

// Same generic-erasure dance as the root: implemented over loose props,
// exported behind a call signature that infers the rendered element's type.
export const TabsItem = TabsItemImpl as (<C extends ElementType = 'button'>(
  props: TabsItemProps<C> & { ref?: Ref<HTMLElement> },
) => ReactElement) & { displayName?: string };

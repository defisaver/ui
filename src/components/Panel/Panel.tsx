import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { radius } from '../../tokens/radius.stylex';
import { space } from '../../tokens/spacing.stylex';
import { text } from '../../tokens/typography.stylex';

export type PanelSize = 's' | 'm';

// Set once on <Panel size>; header, title and footer read it so consumers
// never repeat the size on subcomponents.
const PanelSizeContext = createContext<PanelSize>('m');

const styles = stylex.create({
  panel: {
    borderColor: colors.surfaceBorderSurface,
    borderRadius: radius.xl,
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colors.surfaceShade,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    gap: space.s2,
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    paddingInlineEnd: space.s2,
    // 12px; when the title is collapsible its toggle pulls itself back to
    // the 8px edge with a -4px start margin — the header never needs to know
    paddingInlineStart: space.s3,
    borderBottomColor: colors.surfaceBorderSurface,
    borderBottomStyle: 'solid',
    // The divider only separates the header from content below it. When the
    // header is the last child (e.g. a collapsed panel) it would stack against
    // the Panel's own bottom border, reading as a doubled line — so drop it.
    borderBottomWidth: { default: '1px', ':last-child': '0' },
    borderTopLeftRadius: `calc(${radius.xl} - 1px)`,
    borderTopRightRadius: `calc(${radius.xl} - 1px)`,
  },
  // Total heights: s 44 = 8+28+8, m 56 = 10+36+10 (content row 28/36)
  headerS: {
    paddingBlock: space.s2,
    minHeight: '44px',
  },
  headerM: {
    paddingBlock: space.s2_5,
    minHeight: '56px',
  },
  title: {
    gap: space.s1_5,
    alignItems: 'center',
    color: colors.textSecondary,
    display: 'inline-flex',
    fontWeight: text.weightSemiBold,
  },
  titleS: {
    fontSize: text.sizeSmall,
    lineHeight: '12px',
  },
  titleM: {
    fontSize: text.sizeRegular,
    lineHeight: '20px',
  },
  toggle: {
    padding: 0,
    borderRadius: radius.medium,
    borderStyle: 'none',
    transition: 'background-color 0.2s ease, scale 0.15s ease-out',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': colors.white5Hover },
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    // Pulls the button from the header's 12px padding edge to 8px —
    // collapsible headers get their tighter left padding without the header
    // knowing about the title.
    marginInlineStart: '-4px',
    position: 'relative',
    scale: { default: '1', ':active': '0.96' },
    height: '20px',
    width: '20px',
    // The visible button (and hover circle) stays 20×20, but the clickable
    // area extends to 40×40 so the toggle isn't fiddly to hit.
    '::before': {
      inset: '-10px',
      content: '""',
      position: 'absolute',
    },
  },
  chevron: {
    transition: 'transform 0.2s ease',
  },
  chevronCollapsed: {
    transform: 'rotate(-90deg)',
  },
  footer: {
    gap: space.s2,
    paddingBlock: space.s2,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    paddingInlineEnd: space.s2,
    paddingInlineStart: space.s2_5,
    borderTopColor: colors.surfaceBorderSurface,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },
  footerS: {
    minHeight: '28px',
  },
  footerM: {
    minHeight: '36px',
  },
});

interface PanelProps {
  className?: string;
  children: ReactNode;
}

interface PanelRootProps extends PanelProps {
  size?: PanelSize;
}

interface PanelTitleProps extends PanelProps {
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

// stylex.props() produces the atomic class list; append the caller's
// className after it so the external class survives the merge.
const withClassName = (sx: ReturnType<typeof stylex.props>, className?: string) => ({
  ...sx,
  className: [sx.className, className].filter(Boolean).join(' '),
});

// Private to Panel — a visual detail of the component, not a public icon.
// Rendered with currentColor so it follows the title's token color.
// Default (expanded) points down; collapsed rotates to point right.
const Chevron = ({ size, collapsed }: { size: PanelSize; collapsed: boolean }) => {
  const px = size === 'm' ? 16 : 14;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...stylex.props(styles.chevron, collapsed && styles.chevronCollapsed)}
    >
      <path d="M9 5L6.09642 7.90358C6.04317 7.95683 5.95683 7.95683 5.90358 7.90358L3 5" stroke="currentColor" strokeLinecap="round" />
    </svg>

  );
};

export const Panel = ({ className, children, size = 'm' }: PanelRootProps) => (
  <PanelSizeContext.Provider value={size}>
    <div {...withClassName(stylex.props(styles.panel), className)}>{children}</div>
  </PanelSizeContext.Provider>
);

export const PanelHeader = ({ className, children }: PanelProps) => {
  const size = useContext(PanelSizeContext);
  return (
    <div
      {...withClassName(
        stylex.props(styles.header, size === 'm' ? styles.headerM : styles.headerS),
        className,
      )}
    >
      {children}
    </div>
  );
};

export const PanelTitle = ({
  className,
  children,
  collapsible = false,
  collapsed = false,
  onToggle,
}: PanelTitleProps) => {
  const size = useContext(PanelSizeContext);
  return (
    <span
      {...withClassName(
        stylex.props(styles.title, size === 'm' ? styles.titleM : styles.titleS),
        className,
      )}
    >
      {collapsible && (
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label="Toggle section"
          onClick={onToggle}
          {...stylex.props(styles.toggle)}
        >
          <Chevron size={size} collapsed={collapsed} />
        </button>
      )}
      {children}
    </span>
  );
};

export const PanelFooter = ({ className, children }: PanelProps) => {
  const size = useContext(PanelSizeContext);
  return (
    <div
      {...withClassName(
        stylex.props(styles.footer, size === 'm' ? styles.footerM : styles.footerS),
        className,
      )}
    >
      {children}
    </div>
  );
};

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
    borderWidth: '0.5px',
    overflow: 'hidden',
    backgroundColor: colors.surfaceShade,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    gap: space.s2,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottomColor: colors.surfaceBorderSurface,
    borderBottomStyle: 'solid',
    // The divider only separates the header from content below it. When the
    // header is the last child (e.g. a collapsed panel) it would stack against
    // the Panel's own bottom border, reading as a doubled line — so drop it.
    borderBottomWidth: { default: '0.5px', ':last-child': '0' },
    borderTopLeftRadius: `calc(${radius.xl} - 1px)`,
    borderTopRightRadius: `calc(${radius.xl} - 1px)`,
  },
  headerS: {
    paddingInline: space.s3,
    minHeight: '28px',
  },
  headerM: {
    paddingInline: space.s4,
    minHeight: '36px',
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
    lineHeight: '16px',
  },
  titleM: {
    fontSize: text.sizeRegular,
    lineHeight: '20px',
  },
  // Estimates from the Figma screenshots — correct against dev-mode values
  eyebrow: {
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  eyebrowS: {
    fontSize: '10px',
  },
  eyebrowM: {
    fontSize: '11px',
  },
  toggle: {
    padding: 0,
    borderRadius: radius.large,
    borderStyle: 'none',
    transition: 'background-color 0.2s ease',
    alignItems: 'center',
    backgroundColor: { default: 'transparent', ':hover': colors.white5Hover },
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: '20px',
    width: '20px',
  },
  chevron: {
    transition: 'transform 0.2s ease',
  },
  chevronCollapsed: {
    transform: 'rotate(-90deg)',
  },
  footer: {
    gap: space.s2,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderTopColor: colors.surfaceBorderSurface,
    borderTopStyle: 'solid',
    borderTopWidth: '0.5px',
  },
  footerS: {
    paddingInline: space.s3,
    minHeight: '28px',
  },
  footerM: {
    paddingInline: space.s4,
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
  eyebrow?: boolean;
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
  const px = size === 'm' ? 16 : 12;
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
      <path
        d="M9 5.00049L6.09642 7.90406C6.04317 7.95732 5.95683 7.95732 5.90358 7.90406L3 5.00049"
        stroke="currentColor"
        strokeLinecap="round"
      />
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
  eyebrow = false,
  collapsible = false,
  collapsed = false,
  onToggle,
}: PanelTitleProps) => {
  const size = useContext(PanelSizeContext);
  return (
    <span
      {...withClassName(
        stylex.props(
          styles.title,
          size === 'm' ? styles.titleM : styles.titleS,
          eyebrow && styles.eyebrow,
          eyebrow && (size === 'm' ? styles.eyebrowM : styles.eyebrowS),
        ),
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

import type { ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors } from '../../tokens/colors.stylex';
import { radius } from '../../tokens/radius.stylex';
import { space } from '../../tokens/spacing.stylex';
import { text } from '../../tokens/typography.stylex';

const styles = stylex.create({
  panel: {
    borderColor: colors.surface,
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
    paddingInline: space.s4,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottomColor: colors.surface,
    borderBottomStyle: 'solid',
    // The divider only separates the header from content below it. When the
    // header is the last child (e.g. a collapsed panel) it would stack against
    // the Panel's own bottom border, reading as a doubled line — so drop it.
    borderBottomWidth: { default: '0.5px', ':last-child': '0' },
    borderTopLeftRadius: `calc(${radius.xl} - 1px)`,
    borderTopRightRadius: `calc(${radius.xl} - 1px)`,
    minHeight: '55px',
  },
  title: {
    color: colors.textSecondary,
    fontSize: text.sizeRegular,
    fontWeight: text.weightSemiBold,
    lineHeight: '20px',
  },
  footer: {
    gap: space.s2,
    paddingBlock: space.s3,
    paddingInline: space.s4,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
});

interface PanelProps {
  className?: string;
  children: ReactNode;
}

// stylex.props() produces the atomic class list; append the caller's
// className after it so the external class survives the merge.
const withClassName = (sx: ReturnType<typeof stylex.props>, className?: string) => ({
  ...sx,
  className: [sx.className, className].filter(Boolean).join(' '),
});

export const Panel = ({ className, children }: PanelProps) => (
  <div {...withClassName(stylex.props(styles.panel), className)}>{children}</div>
);

export const PanelHeader = ({ className, children }: PanelProps) => (
  <div {...withClassName(stylex.props(styles.header), className)}>{children}</div>
);

export const PanelTitle = ({ className, children }: PanelProps) => (
  <span {...withClassName(stylex.props(styles.title), className)}>{children}</span>
);

export const PanelFooter = ({ className, children }: PanelProps) => (
  <div {...withClassName(stylex.props(styles.footer), className)}>{children}</div>
);

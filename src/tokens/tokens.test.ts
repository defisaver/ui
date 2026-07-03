import * as stylex from '@stylexjs/stylex';
import { blueGray, green } from './palette.stylex';
import { colors } from './colors.stylex';
import { space } from './spacing.stylex';
import { radius } from './radius.stylex';
import { font, text } from './typography.stylex';
import { shadow } from './elevation.stylex';
import { zIndex } from './zIndex.stylex';
import { duration, easing } from './motion.stylex';
import { breakpoint } from './breakpoints.stylex';

// Compile-level guard: every token file must survive the StyleX compiler in a
// real stylex.create() — including the newer features the system relies on
// (defineConsts inlining across files, consts as media-query condition keys,
// template-literal composition). If a token file breaks, this file fails to
// transform and the suite goes red.
const styles = stylex.create({
  all: {
    padding: { default: space.s0_25, [breakpoint.xxl]: space.s20 },
    borderColor: blueGray._720,
    borderRadius: radius.fullyRounded,
    gap: space.s2_5,
    transition: `background-color ${duration.base} ${easing.hover}`,
    backgroundColor: colors.surface,
    boxShadow: shadow.high,
    color: { default: green._500, [breakpoint.sm]: colors.textError },
    fontFamily: font.family,
    fontSize: text.sizeGiant,
    fontWeight: text.weightBold,
    zIndex: zIndex.toast,
  },
});

describe('design tokens', () => {
  it('compile through stylex.create and produce class names', () => {
    const { className } = stylex.props(styles.all);
    expect(className).toBeTruthy();
    expect(className!.split(' ').length).toBeGreaterThan(5);
  });
});

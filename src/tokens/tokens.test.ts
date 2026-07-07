import * as stylex from '@stylexjs/stylex';
import { colors } from './colors.stylex';
import { space } from './spacing.stylex';
import { radius } from './radius.stylex';
import { text } from './typography.stylex';

// Compile-level guard: every token file must survive the StyleX compiler in a
// real stylex.create(). If a token file breaks, this file fails to transform
// and the suite goes red.
const styles = stylex.create({
  all: {
    padding: `${space.px12} ${space.px16}`,
    borderColor: colors.surfaceShade,
    borderRadius: { default: radius.xl, ':hover': radius.fullyRounded },
    gap: { default: space.px8, ':hover': space.px1 },
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    fontSize: text.sizeRegular,
    fontWeight: text.weightSemiBold,
  },
});

describe('design tokens', () => {
  it('compile through stylex.create and produce class names', () => {
    const { className } = stylex.props(styles.all);
    expect(className).toBeTruthy();
    expect(className!.split(' ').length).toBeGreaterThan(5);
  });
});

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
    padding: `${space.s3} ${space.s4}`,
    borderColor: colors.surfaceShade,
    borderRadius: radius.xl,
    gap: space.s2,
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

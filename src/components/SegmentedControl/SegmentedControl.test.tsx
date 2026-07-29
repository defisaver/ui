import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl';

const threeItems = (
  <>
    <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
    <SegmentedControlItem value="borrow">Borrow</SegmentedControlItem>
    <SegmentedControlItem value="repay">Repay</SegmentedControlItem>
  </>
);

describe('SegmentedControl', () => {
  it('renders a radiogroup of radio buttons', () => {
    render(<SegmentedControl aria-label="Action">{threeItems}</SegmentedControl>);

    expect(screen.getByRole('radiogroup', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('owns the selection when uncontrolled: defaultValue starts it, clicking moves it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl defaultValue="supply" onValueChange={onValueChange}>
        {threeItems}
      </SegmentedControl>,
    );

    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(screen.getByRole('radio', { name: 'Borrow' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenCalledWith('borrow');
  });

  it('defers to the consumer when controlled: selection only moves via props', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl value="supply" onValueChange={onValueChange}>
        {threeItems}
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    // Reports intent but does not flip on its own
    expect(onValueChange).toHaveBeenCalledWith('borrow');
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <SegmentedControl value="borrow" onValueChange={onValueChange}>
        {threeItems}
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', { name: 'Borrow' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves selection with arrow keys, wrapping at the edges', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl defaultValue="repay">{threeItems}</SegmentedControl>);

    // Roving tabindex: the active item is the group's single tab stop
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveFocus();

    // Wraps from the last item to the first, selection following focus
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
  });

  it('skips disabled items during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl defaultValue="supply">
        <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
        <SegmentedControlItem value="borrow" disabled>Borrow</SegmentedControlItem>
        <SegmentedControlItem value="repay">Repay</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
  });

  it('applies StyleX classes and merges a custom className', () => {
    const { container } = render(
      <SegmentedControl className="custom" defaultValue="supply">{threeItems}</SegmentedControl>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.classList.contains('custom')).toBe(true);
    // custom class is appended after the generated StyleX classes
    expect(root.classList.length).toBeGreaterThan(1);
  });

  it('forwards refs and rest props to the underlying elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLButtonElement>();
    render(
      <SegmentedControl ref={rootRef} data-testid="root" defaultValue="supply">
        <SegmentedControlItem ref={itemRef} data-testid="item" value="supply">Supply</SegmentedControlItem>
      </SegmentedControl>,
    );

    expect(rootRef.current).toBe(screen.getByTestId('root'));
    expect(itemRef.current).toBe(screen.getByTestId('item'));
  });

  it('renders the icon in a decorative slot', () => {
    render(
      <SegmentedControl defaultValue="grid">
        <SegmentedControlItem value="grid" icon={<svg data-testid="grid-icon" />}>Grid</SegmentedControlItem>
      </SegmentedControl>,
    );

    const icon = screen.getByTestId('grid-icon');
    // aria-hidden wrapper: the icon is decoration, the label is the name
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('radio', { name: 'Grid' })).toContainElement(icon);
  });

  it('keeps the label as the accessible name when hideLabel hides it', async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl defaultValue="grid">
        <SegmentedControlItem value="grid" icon={<svg />} hideLabel>Grid view</SegmentedControlItem>
        <SegmentedControlItem value="list" icon={<svg />} hideLabel>List view</SegmentedControlItem>
      </SegmentedControl>,
    );

    // Icon-only visually, but still fully named and operable
    const list = screen.getByRole('radio', { name: 'List view' });
    await user.click(list);
    expect(list).toHaveAttribute('aria-checked', 'true');
  });

  it('ignores clicks on a disabled item', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl defaultValue="supply" onValueChange={onValueChange}>
        <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
        <SegmentedControlItem value="borrow" disabled>Borrow</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');
  });

  describe('items wrapped in extra elements (tooltip wrappers)', () => {
    const wrappedItems = (
      <>
        <span title="Supply tooltip"><SegmentedControlItem value="supply">Supply</SegmentedControlItem></span>
        <span><SegmentedControlItem value="borrow">Borrow</SegmentedControlItem></span>
        <span><SegmentedControlItem value="repay">Repay</SegmentedControlItem></span>
      </>
    );

    it('keeps selection, indicator and keyboard navigation working', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SegmentedControl defaultValue="supply">{wrappedItems}</SegmentedControl>,
      );

      await user.click(screen.getByRole('radio', { name: 'Borrow' }));
      expect(screen.getByRole('radio', { name: 'Borrow' })).toHaveAttribute('aria-checked', 'true');
      expect(container.querySelector('span[aria-hidden]')).toBeInTheDocument();

      // Focus is on Borrow from the click; arrows keep working across wrappers
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
    });

    it('derives divider state from DOM order, matching unwrapped rendering', () => {
      // Same selection, direct children: the classes each position gets.
      const reference = render(
        <SegmentedControl defaultValue="repay">{threeItems}</SegmentedControl>,
      );
      const firstClasses = screen.getByRole('radio', { name: 'Supply' }).className;
      const middleClasses = screen.getByRole('radio', { name: 'Borrow' }).className;
      expect(firstClasses).not.toBe(middleClasses); // first hides its divider
      reference.unmount();

      render(<SegmentedControl defaultValue="repay">{wrappedItems}</SegmentedControl>);
      expect(screen.getByRole('radio', { name: 'Supply' }).className).toBe(firstClasses);
      expect(screen.getByRole('radio', { name: 'Borrow' }).className).toBe(middleClasses);
    });

    it('recomputes divider state when items are added', () => {
      const reference = render(
        <SegmentedControl defaultValue="repay">{threeItems}</SegmentedControl>,
      );
      const firstClasses = screen.getByRole('radio', { name: 'Supply' }).className;
      const middleClasses = screen.getByRole('radio', { name: 'Borrow' }).className;
      reference.unmount();

      const { rerender } = render(
        <SegmentedControl defaultValue="repay">
          <span><SegmentedControlItem value="borrow">Borrow</SegmentedControlItem></span>
          <span><SegmentedControlItem value="repay">Repay</SegmentedControlItem></span>
        </SegmentedControl>,
      );
      // Borrow is first for now, so it hides its divider.
      expect(screen.getByRole('radio', { name: 'Borrow' }).className).toBe(firstClasses);

      rerender(<SegmentedControl defaultValue="repay">{wrappedItems}</SegmentedControl>);
      // Supply took over as first; Borrow gets its divider back.
      expect(screen.getByRole('radio', { name: 'Supply' }).className).toBe(firstClasses);
      expect(screen.getByRole('radio', { name: 'Borrow' }).className).toBe(middleClasses);
    });
  });

  it('keeps the indicator hidden until an item is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<SegmentedControl>{threeItems}</SegmentedControl>);

    // Always mounted; positionIndicator flips inline visibility on selection.
    const indicator = container.querySelector('span[aria-hidden]') as HTMLElement;
    expect(indicator).toBeInTheDocument();
    expect(indicator.style.visibility).not.toBe('visible');

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(indicator.style.visibility).toBe('visible');
  });

  it('does not re-fire onValueChange when the selected item is clicked again', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl defaultValue="supply" onValueChange={onValueChange}>
        {threeItems}
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'Supply' }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('lets a consumer veto selection via preventDefault in onClick', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SegmentedControl defaultValue="supply" onValueChange={onValueChange}>
        <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
        <SegmentedControlItem value="borrow" onClick={(e) => e.preventDefault()}>Borrow</SegmentedControlItem>
      </SegmentedControl>,
    );

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');
  });

  it('keeps a single tab stop (the first enabled item) when nothing is selected', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl aria-label="Action">{threeItems}</SegmentedControl>);

    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Borrow' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('tabindex', '-1');

    // One stop for the whole group: tabbing again leaves it
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('moves the tab stop to the first enabled item when the selected one is disabled', async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl defaultValue="borrow">
        <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
        <SegmentedControlItem value="borrow" disabled>Borrow</SegmentedControlItem>
        <SegmentedControlItem value="repay">Repay</SegmentedControlItem>
      </SegmentedControl>,
    );

    // The group stays reachable even though the checked radio can't take focus
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
  });

  it('throws a descriptive error when an item is rendered outside a SegmentedControl', () => {
    // Silence React's error-boundary logging for the expected throw.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<SegmentedControlItem value="supply">Supply</SegmentedControlItem>))
      .toThrow('SegmentedControlItem must be rendered inside a SegmentedControl');
    consoleError.mockRestore();
  });

  it('rejects invalid prop combinations at compile time', () => {
    // Never rendered — these exist for tsc, which typechecks the suite.
    type Action = 'supply' | 'borrow';
    const handleAction = (v: Action) => v;
    const cases = {
      // @ts-expect-error value and defaultValue are mutually exclusive
      bothModes: <SegmentedControl value="supply" defaultValue="borrow">{threeItems}</SegmentedControl>,
      // @ts-expect-error hideLabel requires an icon
      hideLabelWithoutIcon: <SegmentedControlItem value="supply" hideLabel>Supply</SegmentedControlItem>,
      // @ts-expect-error 'repay' is not in the annotated value union
      valueOutsideUnion: <SegmentedControl<Action> defaultValue="repay">{threeItems}</SegmentedControl>,
      // The annotated union types the callback and its values
      typedCallback: <SegmentedControl<Action> defaultValue="supply" onValueChange={handleAction}>{threeItems}</SegmentedControl>,
    };
    expect(Object.keys(cases)).toHaveLength(4);
  });
});

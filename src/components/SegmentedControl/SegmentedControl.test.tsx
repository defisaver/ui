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

  it('renders no indicator until an item is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<SegmentedControl>{threeItems}</SegmentedControl>);

    const spanCount = () => container.querySelectorAll('span[aria-hidden]').length;
    expect(spanCount()).toBe(0);

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(spanCount()).toBe(1);
  });
});

import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsItem } from './Tabs';

const threeItems = (
  <>
    <TabsItem value="one">One</TabsItem>
    <TabsItem value="two">Two</TabsItem>
    <TabsItem value="three">Three</TabsItem>
  </>
);

describe('Tabs', () => {
  it('renders a tablist of tabs', () => {
    render(<Tabs aria-label="View">{threeItems}</Tabs>);

    expect(screen.getByRole('tablist', { name: 'View' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('owns the selection when uncontrolled: defaultValue starts it, clicking moves it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="one" onValueChange={onValueChange}>
        {threeItems}
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false');
    expect(onValueChange).toHaveBeenCalledWith('two');
  });

  it('defers to the consumer when controlled: selection only moves via props', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Tabs value="one" onValueChange={onValueChange}>
        {threeItems}
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    // Reports intent but does not flip on its own
    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');

    rerender(
      <Tabs value="two" onValueChange={onValueChange}>
        {threeItems}
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
  });

  it('moves selection with arrow keys, wrapping at the edges', async () => {
    const user = userEvent.setup();
    render(<Tabs defaultValue="three">{threeItems}</Tabs>);

    // Roving tabindex: the active item is the group's single tab stop
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus();

    // Wraps from the last item to the first, selection following focus
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled items during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsItem value="one">One</TabsItem>
        <TabsItem value="two" disabled>Two</TabsItem>
        <TabsItem value="three">Three</TabsItem>
      </Tabs>,
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');
  });

  it('ignores clicks on a disabled item', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="one" onValueChange={onValueChange}>
        <TabsItem value="one">One</TabsItem>
        <TabsItem value="two" disabled>Two</TabsItem>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not re-fire onValueChange when the selected item is clicked again', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="one" onValueChange={onValueChange}>
        {threeItems}
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'One' }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('lets a consumer veto selection via preventDefault in onClick', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="one" onValueChange={onValueChange}>
        <TabsItem value="one">One</TabsItem>
        <TabsItem value="two" onClick={(e) => e.preventDefault()}>Two</TabsItem>
      </Tabs>,
    );

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  });

  it('roves the tab stop with the selection, all tabs reachable before one exists', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Tabs aria-label="View">{threeItems}</Tabs>);

    // No selection yet: every tab keeps its natural stop
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('tabindex', '0');

    rerender(<Tabs aria-label="View" value="two">{threeItems}</Tabs>);
    // With a selection, the active tab is the single stop
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('tabindex', '-1');

    await user.tab();
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('applies StyleX classes and merges a custom className', () => {
    const { container } = render(
      <Tabs className="custom" defaultValue="one">{threeItems}</Tabs>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.classList.contains('custom')).toBe(true);
    // custom class is appended after the generated StyleX classes
    expect(root.classList.length).toBeGreaterThan(1);
  });

  it('forwards refs and rest props to the underlying elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLElement>();
    render(
      <Tabs ref={rootRef} data-testid="root" defaultValue="one">
        <TabsItem ref={itemRef} data-testid="item" value="one">One</TabsItem>
      </Tabs>,
    );

    expect(rootRef.current).toBe(screen.getByTestId('root'));
    expect(itemRef.current).toBe(screen.getByTestId('item'));
  });

  describe('asChild (link mode)', () => {
    const links = (
      <>
        <TabsItem value="/borrow" asChild><a href="#borrow">Borrow</a></TabsItem>
        <TabsItem value="/multiply" asChild><a href="#multiply">Multiply</a></TabsItem>
      </>
    );

    it('renders the child element with the tab styling merged on', () => {
      render(<Tabs value="/borrow">{links}</Tabs>);

      const link = screen.getByRole('link', { name: 'Borrow' });
      expect(link).toHaveAttribute('href', '#borrow');
      // StyleX classes land on the anchor itself
      expect(link.className.length).toBeGreaterThan(0);
    });

    it('marks the active link with aria-current and no tab role', () => {
      const { container } = render(<Tabs value="/borrow" aria-label="Manage">{links}</Tabs>);

      expect(screen.getByRole('link', { name: 'Borrow' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Multiply' })).not.toHaveAttribute('aria-current');
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(container.querySelectorAll('a')).toHaveLength(2);
    });

    it('lets the consumer clear the tablist role for navigation', () => {
      render(<Tabs value="/borrow" role={undefined}>{links}</Tabs>);

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('reports clicks through onValueChange and keeps the child onClick', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const childOnClick = vi.fn((e) => e.preventDefault()); // block jsdom navigation
      render(
        <Tabs value="/borrow" onValueChange={onValueChange}>
          <TabsItem value="/borrow" asChild><a href="#borrow">Borrow</a></TabsItem>
          <TabsItem value="/multiply" asChild>
            <a href="#multiply" onClick={childOnClick}>Multiply</a>
          </TabsItem>
        </Tabs>,
      );

      await user.click(screen.getByRole('link', { name: 'Multiply' }));
      expect(childOnClick).toHaveBeenCalled();
      // The child's preventDefault vetoes selection, like button mode
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('forwards refs to the child element', () => {
      const itemRef = createRef<HTMLElement>();
      render(
        <Tabs value="/borrow">
          <TabsItem value="/borrow" asChild ref={itemRef}>
            <a href="#borrow">Borrow</a>
          </TabsItem>
        </Tabs>,
      );

      expect(itemRef.current).toBe(screen.getByRole('link', { name: 'Borrow' }));
    });
  });

  it('throws a descriptive error when an item is rendered outside a Tabs', () => {
    // Silence React's error-boundary logging for the expected throw.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TabsItem value="one">One</TabsItem>))
      .toThrow('TabsItem must be rendered inside a Tabs');
    consoleError.mockRestore();
  });

  it('rejects invalid prop combinations at compile time', () => {
    // Never rendered — these exist for tsc, which typechecks the suite.
    type View = 'one' | 'two';
    const handleView = (v: View) => v;
    const cases = {
      // @ts-expect-error value and defaultValue are mutually exclusive
      bothModes: <Tabs value="one" defaultValue="two">{threeItems}</Tabs>,
      // @ts-expect-error asChild requires a single element child
      asChildWithText: <TabsItem value="one" asChild>One</TabsItem>,
      // @ts-expect-error 'three' is not in the annotated value union
      valueOutsideUnion: <Tabs<View> defaultValue="three">{threeItems}</Tabs>,
      // The annotated union types the callback and its values
      typedCallback: <Tabs<View> defaultValue="one" onValueChange={handleView}>{threeItems}</Tabs>,
    };
    expect(Object.keys(cases)).toHaveLength(4);
  });
});

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

  // jsdom can't compute StyleX's compiled classes, so these assert that the
  // root *participates* in the prop at all — which is the regression that
  // bit us: fullWidth used to style only the items, leaving every consumer
  // to force the row itself with `> * { flex: 1 }` in their own SCSS.
  it('applies fullWidth to the row itself, not only to the items', () => {
    const { container: plain } = render(<Tabs defaultValue="one">{threeItems}</Tabs>);
    const { container: full } = render(<Tabs defaultValue="one" fullWidth>{threeItems}</Tabs>);

    const plainRoot = plain.firstElementChild as HTMLElement;
    const fullRoot = full.firstElementChild as HTMLElement;

    expect(fullRoot.classList.length).toBeGreaterThan(plainRoot.classList.length);
  });

  it('defaults to compact spacing, with regular as the opt-in', () => {
    const { container: byDefault } = render(<Tabs defaultValue="one">{threeItems}</Tabs>);
    const { container: compact } = render(
      <Tabs defaultValue="one" spacing="compact">{threeItems}</Tabs>,
    );
    const { container: regular } = render(
      <Tabs defaultValue="one" spacing="regular">{threeItems}</Tabs>,
    );

    const classesOf = (c: HTMLElement) => (c.firstElementChild as HTMLElement).className;

    expect(classesOf(byDefault)).toBe(classesOf(compact));
    expect(classesOf(regular)).not.toBe(classesOf(compact));
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

  describe('as (link mode)', () => {
    const links = (
      <>
        <TabsItem value="/borrow" as="a" href="#borrow">Borrow</TabsItem>
        <TabsItem value="/multiply" as="a" href="#multiply">Multiply</TabsItem>
      </>
    );

    it('renders the element named by `as`, with the tab styling on it', () => {
      render(<Tabs value="/borrow">{links}</Tabs>);

      const link = screen.getByRole('link', { name: 'Borrow' });
      expect(link).toHaveAttribute('href', '#borrow');
      // StyleX classes land on the anchor itself
      expect(link.className.length).toBeGreaterThan(0);
      // No button is rendered around it
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
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

    it('reports clicks through onValueChange and keeps the consumer onClick', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onClick = vi.fn((e) => e.preventDefault()); // block jsdom navigation
      render(
        <Tabs value="/borrow" onValueChange={onValueChange}>
          <TabsItem value="/borrow" as="a" href="#borrow">Borrow</TabsItem>
          <TabsItem value="/multiply" as="a" href="#multiply" onClick={onClick}>Multiply</TabsItem>
        </Tabs>,
      );

      await user.click(screen.getByRole('link', { name: 'Multiply' }));
      expect(onClick).toHaveBeenCalled();
      // preventDefault vetoes selection, exactly as in button mode
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('forwards refs to the rendered element', () => {
      const itemRef = createRef<HTMLElement>();
      render(
        <Tabs value="/borrow">
          <TabsItem value="/borrow" as="a" href="#borrow" ref={itemRef}>Borrow</TabsItem>
        </Tabs>,
      );

      expect(itemRef.current).toBe(screen.getByRole('link', { name: 'Borrow' }));
    });

    // The two props that the old asChild branch silently dropped, because it
    // was a second hand-written render path. One path now, so they can't.
    it('honors disabled on a link: no navigation, no selection', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Tabs value="/borrow" onValueChange={onValueChange}>
          <TabsItem value="/borrow" as="a" href="#borrow">Borrow</TabsItem>
          <TabsItem value="/multiply" as="a" href="#multiply" disabled>Multiply</TabsItem>
        </Tabs>,
      );

      const link = screen.getByRole('link', { name: 'Multiply' });
      expect(link).toHaveAttribute('aria-disabled', 'true');

      await user.click(link);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('keeps a consumer onKeyDown on a link', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <Tabs value="/borrow" role={undefined}>
          <TabsItem value="/borrow" as="a" href="#borrow" onKeyDown={onKeyDown}>Borrow</TabsItem>
        </Tabs>,
      );

      screen.getByRole('link', { name: 'Borrow' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onKeyDown).toHaveBeenCalled();
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
      // @ts-expect-error href is not a button prop — `as="a"` is required
      hrefWithoutAs: <TabsItem value="one" href="#one">One</TabsItem>,
      // @ts-expect-error 'three' is not in the annotated value union
      valueOutsideUnion: <Tabs<View> defaultValue="three">{threeItems}</Tabs>,
      // The annotated union types the callback and its values
      typedCallback: <Tabs<View> defaultValue="one" onValueChange={handleView}>{threeItems}</Tabs>,
      // `as` types the target element's own props through
      typedLinkProps: <TabsItem value="one" as="a" href="#one" target="_blank">One</TabsItem>,
    };
    expect(Object.keys(cases)).toHaveLength(5);
  });
});

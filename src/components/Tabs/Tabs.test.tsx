import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, Tab } from './Tabs';

const threeTabs = (
  <>
    <Tab value="supply">Supply</Tab>
    <Tab value="borrow">Borrow</Tab>
    <Tab value="repay">Repay</Tab>
  </>
);

describe('Tabs', () => {
  it('renders a radiogroup of radio buttons', () => {
    render(<Tabs aria-label="Action">{threeTabs}</Tabs>);

    expect(screen.getByRole('radiogroup', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('owns the selection when uncontrolled: defaultValue starts it, clicking moves it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="supply" onValueChange={onValueChange}>
        {threeTabs}
      </Tabs>,
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
      <Tabs value="supply" onValueChange={onValueChange}>
        {threeTabs}
      </Tabs>,
    );

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    // Reports intent but does not flip on its own
    expect(onValueChange).toHaveBeenCalledWith('borrow');
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <Tabs value="borrow" onValueChange={onValueChange}>
        {threeTabs}
      </Tabs>,
    );
    expect(screen.getByRole('radio', { name: 'Borrow' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves selection with arrow keys, wrapping at the edges', async () => {
    const user = userEvent.setup();
    render(<Tabs defaultValue="repay">{threeTabs}</Tabs>);

    // Roving tabindex: the active tab is the group's single tab stop
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveFocus();

    // Wraps from the last tab to the first, selection following focus
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Supply' })).toHaveAttribute('aria-checked', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
  });

  it('skips disabled tabs during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="supply">
        <Tab value="supply">Supply</Tab>
        <Tab value="borrow" disabled>Borrow</Tab>
        <Tab value="repay">Repay</Tab>
      </Tabs>,
    );

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Repay' })).toHaveAttribute('aria-checked', 'true');
  });

  it('applies StyleX classes and merges a custom className', () => {
    const { container } = render(
      <Tabs className="custom" defaultValue="supply">{threeTabs}</Tabs>,
    );
    const tabs = container.firstElementChild as HTMLElement;

    expect(tabs.classList.contains('custom')).toBe(true);
    // custom class is appended after the generated StyleX classes
    expect(tabs.classList.length).toBeGreaterThan(1);
  });

  it('forwards refs and rest props to the underlying elements', () => {
    const tabsRef = createRef<HTMLDivElement>();
    const tabRef = createRef<HTMLButtonElement>();
    render(
      <Tabs ref={tabsRef} data-testid="tabs" defaultValue="supply">
        <Tab ref={tabRef} data-testid="tab" value="supply">Supply</Tab>
      </Tabs>,
    );

    expect(tabsRef.current).toBe(screen.getByTestId('tabs'));
    expect(tabRef.current).toBe(screen.getByTestId('tab'));
  });

  it('renders no indicator until a tab is selected', async () => {
    const user = userEvent.setup();
    const { container } = render(<Tabs>{threeTabs}</Tabs>);

    const spanCount = () => container.querySelectorAll('span[aria-hidden]').length;
    expect(spanCount()).toBe(0);

    await user.click(screen.getByRole('radio', { name: 'Borrow' }));
    expect(spanCount()).toBe(1);
  });
});

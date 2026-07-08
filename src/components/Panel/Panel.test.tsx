import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter,
} from './Panel';

describe('Panel', () => {
  it('renders all sections with their children', () => {
    render(
      <Panel>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
        <PanelFooter>Footer</PanelFooter>
      </Panel>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies StyleX classes and merges a custom className', () => {
    const { container } = render(<Panel className="custom">Content</Panel>);
    const panel = container.firstElementChild as HTMLElement;

    expect(panel.classList.contains('custom')).toBe(true);
    // custom class is appended after the generated StyleX classes
    expect(panel.classList.length).toBeGreaterThan(1);
  });

  it('sizes the collapse chevron from the Panel size', () => {
    const { container: small } = render(
      <Panel size="s" collapsible>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );
    const { container: medium } = render(
      <Panel size="m" collapsible>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );

    expect(small.querySelector('svg')).toHaveAttribute('width', '14');
    expect(medium.querySelector('svg')).toHaveAttribute('width', '16');
  });

  it('owns the collapse state when uncontrolled: clicking the toggle flips it', async () => {
    const user = userEvent.setup();
    render(
      <Panel collapsible>
        <PanelHeader>
          <PanelTitle>Positions</PanelTitle>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
        <PanelFooter>Footer</PanelFooter>
      </Panel>,
    );

    // The toggle takes its accessible name from the title text. Whether the
    // folded content is actually invisible is CSS, asserted in the browser
    // play tests — jsdom only sees the state.
    const toggle = screen.getByRole('button', { name: 'Positions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps collapsed content mounted, so child state survives a collapse', async () => {
    const user = userEvent.setup();
    render(
      <Panel collapsible>
        <PanelHeader>
          <PanelTitle>Positions</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <input aria-label="Amount" />
        </PanelBody>
      </Panel>,
    );

    await user.type(screen.getByLabelText('Amount'), '1.5');

    const toggle = screen.getByRole('button', { name: 'Positions' });
    await user.click(toggle);
    // Folded, not unmounted — the input and its value are still there
    expect(screen.getByLabelText('Amount')).toHaveValue('1.5');

    await user.click(toggle);
    expect(screen.getByLabelText('Amount')).toHaveValue('1.5');
  });

  it('starts collapsed with defaultCollapsed (which implies collapsible)', async () => {
    const user = userEvent.setup();
    render(
      <Panel defaultCollapsed>
        <PanelHeader>
          <PanelTitle>Positions</PanelTitle>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
      </Panel>,
    );

    const toggle = screen.getByRole('button', { name: 'Positions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('defers to the consumer when controlled: state only moves via props', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const ui = (collapsed: boolean) => (
      <Panel collapsed={collapsed} onToggle={onToggle}>
        <PanelHeader>
          <PanelTitle>Positions</PanelTitle>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
      </Panel>
    );
    const { rerender } = render(ui(false));

    const toggle = screen.getByRole('button', { name: 'Positions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Clicking reports intent but does not flip state on its own
    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    rerender(ui(true));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses without a PanelTitle: the toggle lives in the header with a fallback name', async () => {
    const user = userEvent.setup();
    render(
      <Panel collapsible>
        <PanelHeader>
          <span>Tabs go here</span>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
      </Panel>,
    );

    // No title to borrow a name from — the aria-label fallback applies
    const toggle = screen.getByRole('button', { name: 'Toggle panel' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('forwards refs and rest props to the underlying elements', () => {
    const panelRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLDivElement>();
    const titleRef = createRef<HTMLSpanElement>();
    const bodyRef = createRef<HTMLDivElement>();
    const footerRef = createRef<HTMLDivElement>();
    render(
      <Panel ref={panelRef} data-testid="panel">
        <PanelHeader ref={headerRef} data-testid="header">
          <PanelTitle ref={titleRef} data-testid="title">Title</PanelTitle>
        </PanelHeader>
        <PanelBody ref={bodyRef} data-testid="body">Content</PanelBody>
        <PanelFooter ref={footerRef} data-testid="footer">Footer</PanelFooter>
      </Panel>,
    );

    expect(panelRef.current).toBe(screen.getByTestId('panel'));
    expect(headerRef.current).toBe(screen.getByTestId('header'));
    expect(titleRef.current).toBe(screen.getByTestId('title'));
    expect(bodyRef.current).toBe(screen.getByTestId('body'));
    expect(footerRef.current).toBe(screen.getByTestId('footer'));
  });

  it('renders no toggle button when the panel is not collapsible', () => {
    render(
      <Panel>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
        <PanelBody>Content</PanelBody>
      </Panel>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

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

  it('owns the collapse state when uncontrolled: toggle unmounts body and footer', async () => {
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

    // The toggle takes its accessible name from the title text
    const toggle = screen.getByRole('button', { name: 'Positions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content')).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
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
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByText('Content')).toBeInTheDocument();
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
    expect(screen.getByText('Content')).toBeInTheDocument();

    rerender(ui(true));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Panel, PanelHeader, PanelTitle, PanelFooter,
} from './Panel';

describe('Panel', () => {
  it('renders all sections with their children', () => {
    render(
      <Panel>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
        <div>Content</div>
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
      <Panel size="s" onToggle={() => {}}>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );
    const { container: medium } = render(
      <Panel size="m" onToggle={() => {}}>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );

    expect(small.querySelector('svg')).toHaveAttribute('width', '14');
    expect(medium.querySelector('svg')).toHaveAttribute('width', '16');
  });

  it('exposes collapse state and fires onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const ui = (collapsed: boolean) => (
      <Panel collapsed={collapsed} onToggle={onToggle}>
        <PanelHeader>
          <PanelTitle>Positions</PanelTitle>
        </PanelHeader>
      </Panel>
    );
    const { rerender } = render(ui(false));

    // The toggle takes its accessible name from the title text
    const toggle = screen.getByRole('button', { name: 'Positions' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(ui(true));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders no toggle button when the panel is not collapsible', () => {
    render(
      <Panel>
        <PanelHeader>
          <PanelTitle>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

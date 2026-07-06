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

  it('sizes the collapse chevron from the Panel size context', () => {
    const { container: small } = render(
      <Panel size="s">
        <PanelHeader>
          <PanelTitle collapsible>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );
    const { container: medium } = render(
      <Panel size="m">
        <PanelHeader>
          <PanelTitle collapsible>Title</PanelTitle>
        </PanelHeader>
      </Panel>,
    );

    expect(small.querySelector('svg')).toHaveAttribute('width', '14');
    expect(medium.querySelector('svg')).toHaveAttribute('width', '16');
  });

  it('exposes collapse state and fires onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <PanelTitle collapsible collapsed={false} onToggle={onToggle}>Title</PanelTitle>,
    );

    const toggle = screen.getByRole('button', { name: 'Toggle section' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <PanelTitle collapsible collapsed onToggle={onToggle}>Title</PanelTitle>,
    );
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders no toggle button when not collapsible', () => {
    render(<PanelTitle>Title</PanelTitle>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

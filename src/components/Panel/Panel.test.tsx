import { render, screen } from '@testing-library/react';
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
});

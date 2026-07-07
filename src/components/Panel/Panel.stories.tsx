import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Panel, PanelHeader, PanelTitle, PanelBody, PanelFooter,
} from './Panel';
import type { PanelSize } from './Panel';
import './Panel.stories.css';

// Storybook's args typing intersects Panel's controlled/uncontrolled prop
// union into `never`, so stories see a flattened shape. The union still
// guards real consumers — only this file opts out.
type PanelStoryProps = {
  children: ReactNode;
  className?: string;
  size?: PanelSize;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
};
const PanelStory = Panel as (props: PanelStoryProps) => ReactNode;

const meta = {
  title: 'Layout/Panel',
  component: PanelStory,
  argTypes: {
    size: { control: 'radio', options: ['s', 'm'] },
  },
  // Panels are width:100% — constrain stories to a realistic column so
  // proportions match how panels sit in the app.
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = (
  <PanelBody>
    <div style={{ padding: 16, minHeight: 120 }}>Panel content goes here.</div>
  </PanelBody>
);

// Placeholder 28px controls per the Figma footer spec — replaced by a real
// Pagination component when the DS grows one.
const controlStyle: CSSProperties = {
  alignItems: 'center',
  background: 'transparent',
  border: '1px solid #252F37',
  borderRadius: 6,
  color: '#B2C1CC',
  cursor: 'pointer',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  width: 28,
};

export const SizeS: Story = {
  args: {
    size: 's',
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Panel title</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </>
    ),
  },
};

export const SizeM: Story = {
  args: {
    size: 'm',
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </>
    ),
  },
};

// Header as the only child — its bottom divider is dropped via :last-child
// so it doesn't double up with the Panel's own border.
export const HeaderOnly: Story = {
  args: {
    size: 'm',
    children: (
      <PanelHeader>
        <PanelTitle>Section name</PanelTitle>
      </PanelHeader>
    ),
  },
};

// Static fixture of the collapsed state: right-pointing chevron, body and
// footer unmounted, no divider. Deterministic on first render — the
// interactive Collapsible story always *starts* open, so visual baselines
// need this one.
export const Collapsed: Story = {
  args: {
    size: 'm',
    defaultCollapsed: true,
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </>
    ),
  },
};

// Title + secondary info competing for header space (space-between + gap).
export const HeaderWithActions: Story = {
  args: {
    size: 'm',
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
          <span style={{ color: '#71838F', fontSize: 12 }}>Last updated 2m ago</span>
        </PanelHeader>
        {body}
      </>
    ),
  },
};

// The Figma footer example: 28px-tall controls inside the 36px footer
// (4px block / 8px inline padding).
export const FooterWithPagination: Story = {
  args: {
    size: 'm',
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span style={{ color: '#71838F', fontSize: 12 }}>12 items</span>
          <span style={{ display: 'inline-flex', gap: 4 }}>
            <button type="button" style={controlStyle}>‹</button>
            <button type="button" style={controlStyle}>›</button>
          </span>
        </PanelFooter>
      </>
    ),
  },
};

// Edge case: long title in a narrow panel. Documents current behavior —
// the title wraps and the header grows past its min-height (no truncation
// styling yet).
export const LongTitle: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    size: 'm',
    collapsible: true,
    children: (
      <>
        <PanelHeader>
          <PanelTitle>
            Automated strategies for the Maker protocol on Arbitrum
          </PanelTitle>
        </PanelHeader>
        {body}
      </>
    ),
  },
};

// The one-prop collapse path: Panel owns the state, PanelBody and PanelFooter
// unmount themselves while collapsed.
export const Collapsible: Story = {
  args: {
    size: 'm',
    collapsible: true,
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </>
    ),
  },
  // Runs in a real browser (vitest browser mode) with the compiled CSS
  // applied, so it can assert paint-level behavior jsdom can't see — like
  // the header divider dropping via :last-child when the body unmounts.
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Section name' });
    const header = toggle.closest('div') as HTMLElement;

    await expect(canvas.getByText('Panel content goes here.')).toBeInTheDocument();
    await expect(canvas.getByText('Footer left')).toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '1px' });

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Panel content goes here.')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Footer left')).not.toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '0px' });

    await userEvent.click(toggle);
    await expect(canvas.getByText('Panel content goes here.')).toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '1px' });
  },
};

// The controlled escape hatch: consumer owns the state (persistence,
// expand-all…) by passing `collapsed` + `onToggle` together.
const ControlledPanel = () => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        style={{ ...controlStyle, width: 'auto', paddingInline: 12 }}
        onClick={() => setCollapsed((c) => !c)}
      >
        Toggle from outside
      </button>
      <Panel collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)}>
        <PanelHeader>
          <PanelTitle>Section name</PanelTitle>
        </PanelHeader>
        {body}
      </Panel>
    </div>
  );
};

export const Controlled: Story = {
  args: { children: null },
  render: () => <ControlledPanel />,
};

// The styling escape hatch: library styles are emitted inside @layer, so a
// consumer className with plain unlayered CSS overrides them on any declared
// property — media queries included — without specificity tricks. See
// Panel.stories.css for the "app-side" rules this story exercises.
export const CustomizedHeader: Story = {
  args: {
    size: 'm',
    children: (
      <>
        <PanelHeader className="story-chart-header">
          <PanelTitle>Chart</PanelTitle>
          <span style={{ color: '#71838F', fontSize: 12 }}>1D</span>
        </PanelHeader>
        {body}
      </>
    ),
  },
  play: async ({ canvas }) => {
    const header = canvas.getByText('Chart').closest('div') as HTMLElement;

    // Consumer declarations win over the layered library styles…
    await expect(header).toHaveStyle({ minHeight: '44px', justifyContent: 'flex-start' });
    // …while everything they don't declare still comes from the library.
    await expect(header).toHaveStyle({ borderBottomWidth: '1px', paddingInlineStart: '12px' });
  },
};

// Everything side by side for quick human eyeballing against Figma.
export const Gallery: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel size="s">
        <PanelHeader>
          <PanelTitle>Size S</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </Panel>
      <Panel size="m">
        <PanelHeader>
          <PanelTitle>Size M</PanelTitle>
        </PanelHeader>
        {body}
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </Panel>
      <Panel size="m" defaultCollapsed>
        <PanelHeader>
          <PanelTitle>Collapsed</PanelTitle>
        </PanelHeader>
        {body}
      </Panel>
    </div>
  ),
};

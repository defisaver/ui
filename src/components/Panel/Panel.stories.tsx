import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
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
  // The folded body stays mounted, so the header is never :last-child in a
  // collapsible panel — this proves the divider drops from the collapse
  // state (context), not from DOM structure. The width stays 1px by design
  // (animating it would shift the border-box layout); collapse hides the
  // divider by fading its color to transparent. Initial render, no transition.
  play: async ({ canvas }) => {
    const header = canvas.getByText('Section name').closest('div') as HTMLElement;
    await expect(header).toHaveStyle({ borderBottomColor: 'rgba(0, 0, 0, 0)' });
    await expect(canvas.getByText('Panel content goes here.')).not.toBeVisible();
    await expect(canvas.getByText('Footer left')).not.toBeVisible();
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
// fold themselves (grid-row transition) while collapsed — content stays
// mounted but leaves the a11y tree via visibility once the fold finishes.
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
  // applied, so it can assert paint-level behavior jsdom can't see. The fold
  // is a 200/250ms transition, so post-click assertions poll via waitFor
  // until it settles.
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Section name' });
    const header = toggle.closest('div') as HTMLElement;

    // M panels get the larger 28px button around the 16px chevron
    await expect(toggle).toHaveStyle({ height: '28px', width: '28px' });

    await expect(canvas.getByText('Panel content goes here.')).toBeVisible();
    await expect(canvas.getByText('Footer left')).toBeVisible();
    // Divider visibility is a color fade (width would shift layout) — the
    // divider is token-driven (surfaceBorderSurface → #252F37). StyleX's dev
    // runtime injects the :root token vars asynchronously after mount, so the
    // color isn't guaranteed on the very first paint — poll until it resolves.
    await waitFor(async () => {
      await expect(header).toHaveStyle({ borderBottomColor: 'rgb(37, 47, 55)' });
    });

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(async () => {
      // Content is still mounted, but the finished fold hides it (visibility)
      await expect(canvas.getByText('Panel content goes here.')).not.toBeVisible();
      await expect(canvas.getByText('Footer left')).not.toBeVisible();
      await expect(header).toHaveStyle({ borderBottomColor: 'rgba(0, 0, 0, 0)' });
    });

    await userEvent.click(toggle);
    await waitFor(async () => {
      await expect(canvas.getByText('Panel content goes here.')).toBeVisible();
      await expect(header).toHaveStyle({ borderBottomColor: 'rgb(37, 47, 55)' });
    });
  },
};

// The toggle belongs to the header, not the title — so a header holding
// something else entirely (tabs, a token pair…) still collapses. Without a
// title to borrow a name from, the button falls back to its aria-label.
export const CollapsibleWithoutTitle: Story = {
  args: {
    size: 'm',
    collapsible: true,
    children: (
      <>
        <PanelHeader>
          <span style={{
            color: '#B2C1CC', display: 'inline-flex', fontSize: 12, gap: 16,
          }}
          >
            <span>Info</span>
            <span style={{ color: '#71838F' }}>Depth</span>
            <span style={{ color: '#71838F' }}>Trades</span>
          </span>
        </PanelHeader>
        {body}
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Toggle panel' });
    await userEvent.click(toggle);
    await waitFor(async () => {
      await expect(canvas.getByText('Panel content goes here.')).not.toBeVisible();
    });
    await userEvent.click(toggle);
    await waitFor(async () => {
      await expect(canvas.getByText('Panel content goes here.')).toBeVisible();
    });
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

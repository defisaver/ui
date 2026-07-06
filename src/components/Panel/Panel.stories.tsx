import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Panel, PanelHeader, PanelTitle, PanelFooter,
} from './Panel';

const meta = {
  title: 'Layout/Panel',
  component: Panel,
  argTypes: {
    size: { control: 'radio', options: ['s', 'm'] },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = <div style={{ padding: 16, minHeight: 120 }}>Panel content goes here.</div>;

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

// Consumer owns the collapse state: one useState, conditionally render the
// body. When collapsed, the header becomes the Panel's last child and its
// bottom divider is dropped automatically.
const CollapsiblePanel = ({ size }: { size?: 's' | 'm' }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Panel size={size}>
      <PanelHeader>
        <PanelTitle
          collapsible
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        >
          Section name
        </PanelTitle>
      </PanelHeader>
      {!collapsed && body}
    </Panel>
  );
};

export const Collapsible: Story = {
  args: { size: 'm', children: null },
  render: (args) => <CollapsiblePanel size={args.size} />,
  // Runs in a real browser (vitest browser mode) with the compiled CSS
  // applied, so it can assert paint-level behavior jsdom can't see — like
  // the header divider dropping via :last-child when the body unmounts.
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Toggle section' });
    const header = toggle.closest('div') as HTMLElement;

    await expect(canvas.getByText('Panel content goes here.')).toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '1px' });

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('Panel content goes here.')).not.toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '0px' });

    await userEvent.click(toggle);
    await expect(canvas.getByText('Panel content goes here.')).toBeInTheDocument();
    await expect(header).toHaveStyle({ borderBottomWidth: '1px' });
  },
};

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

export const Eyebrow: Story = {
  args: {
    size: 's',
    children: (
      <>
        <PanelHeader>
          <PanelTitle eyebrow>Panel title</PanelTitle>
        </PanelHeader>
        {body}
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
};

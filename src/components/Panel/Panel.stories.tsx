import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Panel, PanelHeader, PanelTitle, PanelFooter,
} from './Panel';

const meta = {
  title: 'Layout/Panel',
  component: Panel,
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <PanelHeader>
          <PanelTitle>Panel title</PanelTitle>
        </PanelHeader>
        <div style={{ padding: 16 }}>Panel content goes here.</div>
        <PanelFooter>
          <span>Footer left</span>
          <span>Footer right</span>
        </PanelFooter>
      </>
    ),
  },
};

// Header as the last child — its bottom divider is dropped so it doesn't
// double up with the Panel's own border.
export const Collapsed: Story = {
  args: {
    children: (
      <PanelHeader>
        <PanelTitle>Collapsed panel</PanelTitle>
      </PanelHeader>
    ),
  },
};

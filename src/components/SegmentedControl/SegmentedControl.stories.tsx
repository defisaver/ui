import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl, SegmentedControlItem } from './SegmentedControl';
import type { SegmentedControlSize, SegmentedControlVariant } from './SegmentedControl';

const meta = {
  title: 'Controls/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: { control: 'radio', options: ['s', 'm', 'l', 'xl'] },
    variant: { control: 'radio', options: ['light', 'dark', 'darker'] },
    hugContent: { control: 'boolean' },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = (
  <>
    <SegmentedControlItem value="supply">Supply</SegmentedControlItem>
    <SegmentedControlItem value="borrow">Borrow</SegmentedControlItem>
    <SegmentedControlItem value="repay">Repay</SegmentedControlItem>
  </>
);

// The galleries below pin their props in render(), so the Controls panel
// only drives this story.
export const Playground: Story = {
  args: {
    defaultValue: 'supply',
    size: 's',
    variant: 'dark',
    hugContent: false,
    children: actions,
  },
};

export const AllVariants: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16,
    }}
    >
      {(['light', 'dark', 'darker'] as SegmentedControlVariant[]).map((variant) => (
        <SegmentedControl key={variant} variant={variant} defaultValue="supply" aria-label={variant}>
          {actions}
        </SegmentedControl>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16,
    }}
    >
      {(['s', 'm', 'l', 'xl'] as SegmentedControlSize[]).map((size) => (
        <SegmentedControl key={size} size={size} defaultValue="supply" aria-label={size}>
          {actions}
        </SegmentedControl>
      ))}
    </div>
  ),
};

// Equal-width is the default: every segment matches the widest label. This
// opts out, letting each segment hug its own label (all still >= the 68px
// Figma min-width).
export const HugContent: Story = {
  args: {
    defaultValue: 'all',
    hugContent: true,
    children: (
      <>
        <SegmentedControlItem value="all">All</SegmentedControlItem>
        <SegmentedControlItem value="collateral">Collateral only</SegmentedControlItem>
        <SegmentedControlItem value="debt">Debt</SegmentedControlItem>
      </>
    ),
  },
};

// currentColor lets the icons follow the segment's text color through
// hover/active states.
const GridIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2h5v5H2V2Zm7 0h5v5H9V2ZM2 9h5v5H2V9Zm7 0h5v5H9V9Z" fill="currentColor" />
  </svg>
);

const ListIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h12v2H2V3Zm0 4h12v2H2V7Zm0 4h12v2H2v-2Z" fill="currentColor" />
  </svg>
);

const ChartIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 9h3v5H2V9Zm4.5-4h3v9h-3V5ZM11 2h3v12h-3V2Z" fill="currentColor" />
  </svg>
);

export const WithIcons: Story = {
  args: {
    defaultValue: 'grid',
    size: 'm',
    children: (
      <>
        <SegmentedControlItem value="grid" icon={<GridIcon />}>Grid</SegmentedControlItem>
        <SegmentedControlItem value="list" icon={<ListIcon />}>List</SegmentedControlItem>
        <SegmentedControlItem value="chart" icon={<ChartIcon />}>Chart</SegmentedControlItem>
      </>
    ),
  },
};

// Icon-only view (hideLabel): the label stays as the accessible name.
// Intended for S and M — at L/XL there's room for a visible label.
export const IconOnly: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16,
    }}
    >
      {(['s', 'm'] as SegmentedControlSize[]).map((size) => (
        <SegmentedControl key={size} size={size} defaultValue="grid" hugContent aria-label={`View (${size})`}>
          <SegmentedControlItem value="grid" icon={<GridIcon />} hideLabel>Grid view</SegmentedControlItem>
          <SegmentedControlItem value="list" icon={<ListIcon />} hideLabel>List view</SegmentedControlItem>
          <SegmentedControlItem value="chart" icon={<ChartIcon />} hideLabel>Chart view</SegmentedControlItem>
        </SegmentedControl>
      ))}
    </div>
  ),
};

const ControlledExample = () => {
  const [value, setValue] = useState('borrow');
  return (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12,
    }}
    >
      <SegmentedControl value={value} onValueChange={setValue}>
        {actions}
      </SegmentedControl>
      <span style={{ color: '#B2C1CC', fontSize: 12 }}>{`Selected: ${value}`}</span>
    </div>
  );
};

export const Controlled: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

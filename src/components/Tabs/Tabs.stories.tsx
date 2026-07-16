import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, Tab } from './Tabs';
import type { TabsSize, TabsVariant } from './Tabs';

const meta = {
  title: 'Controls/Tabs',
  component: Tabs,
  argTypes: {
    size: { control: 'radio', options: ['s', 'm', 'l'] },
    variant: { control: 'radio', options: ['light', 'dark', 'darker'] },
    hugContent: { control: 'boolean' },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const actions = (
  <>
    <Tab value="supply">Supply</Tab>
    <Tab value="borrow">Borrow</Tab>
    <Tab value="repay">Repay</Tab>
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

// Standalone (outside the app) the variants barely differ: the app palette
// fallbacks make light's and dark's container the same hex. Corrected
// Figma-resolved fallbacks are pending — see tokens/colors.stylex.ts.
export const AllVariants: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 16,
    }}
    >
      {(['light', 'dark', 'darker'] as TabsVariant[]).map((variant) => (
        <Tabs key={variant} variant={variant} defaultValue="supply" aria-label={variant}>
          {actions}
        </Tabs>
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
      {(['s', 'm', 'l'] as TabsSize[]).map((size) => (
        <Tabs key={size} size={size} defaultValue="supply" aria-label={size}>
          {actions}
        </Tabs>
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
        <Tab value="all">All</Tab>
        <Tab value="collateral">Collateral only</Tab>
        <Tab value="debt">Debt</Tab>
      </>
    ),
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState('borrow');
  return (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12,
    }}
    >
      <Tabs value={value} onValueChange={setValue}>
        {actions}
      </Tabs>
      <span style={{ color: '#B2C1CC', fontSize: 12 }}>{`Selected: ${value}`}</span>
    </div>
  );
};

export const Controlled: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

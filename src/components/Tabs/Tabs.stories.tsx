import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsItem } from './Tabs';
import type { TabsSize } from './Tabs';

const meta = {
  title: 'Controls/Tabs',
  component: Tabs,
  argTypes: {
    size: { control: 'radio', options: ['s', 'm', 'l'] },
    spacing: { control: 'radio', options: ['regular', 'compact'] },
    fullWidth: { control: 'boolean' },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = (
  <>
    <TabsItem value="one">One</TabsItem>
    <TabsItem value="two">Two</TabsItem>
    <TabsItem value="three">Three</TabsItem>
    <TabsItem value="four">Four</TabsItem>
  </>
);

// The galleries below pin their props in render(), so the Controls panel
// only drives this story.
export const Playground: Story = {
  args: {
    defaultValue: 'one',
    size: 'm',
    spacing: 'compact',
    fullWidth: false,
    children: items,
  },
};

// The two layout knobs. `spacing` is the gap: 'compact' (12px, the default,
// every dense tab bar in the app) vs 'regular' (24px, page navigation).
// `fullWidth` fills the wrapper and splits it equally between the items —
// the row grows too, so the dashed 420px box below needs no CSS of its own.
export const SpacingAndFullWidth: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 24, width: 420,
    }}
    >
      <Tabs size="s" defaultValue="orderbook" aria-label="Compact">
        <TabsItem value="orderbook">Order Book</TabsItem>
        <TabsItem value="trades">Trades</TabsItem>
      </Tabs>
      <Tabs size="s" spacing="regular" defaultValue="orderbook" aria-label="Regular">
        <TabsItem value="orderbook">Order Book</TabsItem>
        <TabsItem value="trades">Trades</TabsItem>
      </Tabs>
      {/* Flex wrapper: the row would hug its items without fullWidth. */}
      <div style={{ border: '1px dashed #394956', display: 'flex' }}>
        <Tabs size="s" fullWidth defaultValue="chart" aria-label="Full width">
          <TabsItem value="chart">Chart</TabsItem>
          <TabsItem value="orderbook">Order Book</TabsItem>
          <TabsItem value="trades">Trades</TabsItem>
        </Tabs>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 24,
    }}
    >
      {(['s', 'm', 'l'] as TabsSize[]).map((size) => (
        <Tabs key={size} size={size} defaultValue="one" aria-label={size}>
          {items}
        </Tabs>
      ))}
    </div>
  ),
};

// Slots are plain children after the label: the Figma "w Slot" tab is a
// badge chip and a chevron, both consumer-supplied. currentColor keeps the
// chevron following the tab's text color through hover/active.
const NewBadge = () => (
  <span style={{
    background: '#252F37',
    borderRadius: 4,
    color: '#F9FAFB',
    fontSize: '0.85em',
    padding: '2px 6px',
  }}
  >
    New
  </span>
);

const ChevronIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WithSlot: Story = {
  args: {
    defaultValue: 'market',
    size: 'm',
    children: (
      <>
        <TabsItem value="market">
          Market
          <NewBadge />
          <ChevronIcon />
        </TabsItem>
        <TabsItem value="limit">Limit</TabsItem>
        <TabsItem value="stop">Stop</TabsItem>
      </>
    ),
  },
};

// `as` renders the item as the element you name (the app's NavLink; plain
// anchors here) with the tab styling and aria-current applied to it — the
// SubNavigation case. Real navigation, not view switching: wrap in <nav>,
// clear the tablist default with role={undefined}, and drive value from
// the current path.
export const AsLinks: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <nav aria-label="Manage">
      {/* spacing="regular" (24px) is the page-navigation gap — the one
          surface that opts out of the compact default. */}
      <Tabs size="m" spacing="regular" value="/borrow" role={undefined}>
        <TabsItem value="/borrow" as="a" href="#borrow">Borrow</TabsItem>
        <TabsItem value="/multiply" as="a" href="#multiply">Multiply</TabsItem>
        <TabsItem value="/savings" as="a" href="#savings">Savings</TabsItem>
      </Tabs>
    </nav>
  ),
};

export const DisabledItems: Story = {
  args: {
    defaultValue: 'one',
    size: 'm',
    children: (
      <>
        <TabsItem value="one">One</TabsItem>
        <TabsItem value="two" disabled>Two</TabsItem>
        <TabsItem value="three">Three</TabsItem>
      </>
    ),
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState('two');
  return (
    <div style={{
      alignItems: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12,
    }}
    >
      <Tabs value={value} onValueChange={setValue}>
        {items}
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

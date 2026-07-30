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
    stretch: { control: 'boolean' },
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
    spacing: 'regular',
    stretch: false,
    children: items,
  },
};

// The two dense-surface knobs, alone and combined: compact halves the gap
// (24 → 12, the Hyperliquid tab bars), stretch makes items share the row
// equally (the mobile info tabs) — the wrapper still dictates row width.
export const CompactAndStretch: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 24, width: 420,
    }}
    >
      <Tabs size="s" spacing="compact" defaultValue="orderbook" aria-label="Compact">
        <TabsItem value="orderbook">Order Book</TabsItem>
        <TabsItem value="trades">Trades</TabsItem>
      </Tabs>
      <Tabs size="s" stretch defaultValue="chart" aria-label="Stretch">
        <TabsItem value="chart">Chart</TabsItem>
        <TabsItem value="orderbook">Order Book</TabsItem>
        <TabsItem value="trades">Trades</TabsItem>
      </Tabs>
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

// asChild: the item renders the element you pass (the app's NavLink; plain
// anchors here) with the tab styling and aria-current merged on — the
// SubNavigation case. Real navigation, not view switching: wrap in <nav>,
// clear the tablist default with role={undefined}, and drive value from
// the current path.
export const AsChildLinks: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <nav aria-label="Manage">
      <Tabs size="m" value="/borrow" role={undefined}>
        <TabsItem value="/borrow" asChild>
          <a href="#borrow">Borrow</a>
        </TabsItem>
        <TabsItem value="/multiply" asChild>
          <a href="#multiply">Multiply</a>
        </TabsItem>
        <TabsItem value="/savings" asChild>
          <a href="#savings">Savings</a>
        </TabsItem>
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

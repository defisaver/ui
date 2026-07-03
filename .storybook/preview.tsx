import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    backgrounds: {
      // App page background (--bg-color-primary in defisaver-app)
      options: {
        app: { name: 'App', value: '#1F272E' },
        light: { name: 'Light', value: '#FFFFFF' },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
  decorators: [
    (Story) => (
      <div style={{ color: '#F0F3F5', fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;

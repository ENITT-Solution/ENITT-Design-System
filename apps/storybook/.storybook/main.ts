import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    // react-docgen 이 props 표를 자동으로 만들어 준다.
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;

import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { LanguageProvider } from '../src/lib/i18n';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#111827' },
        { name: 'arena', value: '#111827' },
      ],
    },
    viewport: {
      viewports: {
        iphoneSE: {
          name: 'iPhone SE',
          styles: { width: '375px', height: '667px' },
        },
        iphone14: {
          name: 'iPhone 14',
          styles: { width: '390px', height: '844px' },
        },
        pixel7: {
          name: 'Pixel 7',
          styles: { width: '412px', height: '915px' },
        },
        ipadMini: {
          name: 'iPad Mini',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
        ultrawide: {
          name: 'Ultrawide',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.classList.add('dark');
      return React.createElement(
        LanguageProvider,
        null,
        React.createElement(Story),
      );
    },
  ],
};

export default preview;

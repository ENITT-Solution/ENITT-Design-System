import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

// 디자인 시스템 스타일 — 소비 앱도 이 세 줄이면 된다.
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/charts/styles.css';
import '@enitt/diagram/styles.css';
import './preview.css';

/** 툴바에서 고른 테마와 토큰 프리셋을 문서 루트에 반영한다. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark';
  const convention = context.globals.powerConvention as string;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // 계통도 도메인 팩이 tokens 에 선언한 프리셋 — 앱에서는 <ThemeProvider presets> 로 준다.
    root.setAttribute('data-enitt-power-convention', convention);
  }, [theme, convention]);

  return (
    <div className="enitt-app sb-canvas">
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: '테마',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: '라이트' },
          { value: 'dark', title: '다크' },
        ],
        dynamicTitle: true,
      },
    },
    powerConvention: {
      description: '계통도 색 관례 (토큰 프리셋)',
      defaultValue: 'modern',
      toolbar: {
        icon: 'lightning',
        items: [
          { value: 'modern', title: '가압=녹색 (기본)' },
          { value: 'ko-legacy', title: '충전=적색 (국내 관행)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: ['시작하기', '기초', ['디자인 토큰', '색상'], '컴포넌트', '차트', '계통도', '패턴'],
      },
    },
  },
};

export default preview;

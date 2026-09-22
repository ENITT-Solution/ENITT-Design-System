/**
 * ENITT Design System — Design Tokens
 *
 * 이 파일은 scripts/build-tokens.mjs 가 생성합니다. 직접 수정하지 마세요.
 * 토큰을 바꾸려면 src/primitives.json / src/semantic.json 을 수정한 뒤
 * `pnpm --filter @enitt/tokens generate` 를 실행하세요.
 */

/** 의미 토큰 → CSS 커스텀 프로퍼티 참조. 컴포넌트는 이것만 사용한다. */
export const tokens = {
  color: {
    bg: {
      canvas: 'var(--enitt-color-bg-canvas)',
      surface: 'var(--enitt-color-bg-surface)',
      raised: 'var(--enitt-color-bg-raised)',
      sunken: 'var(--enitt-color-bg-sunken)',
      muted: 'var(--enitt-color-bg-muted)',
      hover: 'var(--enitt-color-bg-hover)',
      active: 'var(--enitt-color-bg-active)',
      selected: 'var(--enitt-color-bg-selected)',
      overlay: 'var(--enitt-color-bg-overlay)',
      disabled: 'var(--enitt-color-bg-disabled)'
    },
    fg: {
      default: 'var(--enitt-color-fg-default)',
      muted: 'var(--enitt-color-fg-muted)',
      subtle: 'var(--enitt-color-fg-subtle)',
      disabled: 'var(--enitt-color-fg-disabled)',
      'on-accent': 'var(--enitt-color-fg-on-accent)',
      inverse: 'var(--enitt-color-fg-inverse)'
    },
    border: {
      subtle: 'var(--enitt-color-border-subtle)',
      default: 'var(--enitt-color-border-default)',
      strong: 'var(--enitt-color-border-strong)',
      focus: 'var(--enitt-color-border-focus)'
    },
    accent: {
      solid: 'var(--enitt-color-accent-solid)',
      'solid-hover': 'var(--enitt-color-accent-solid-hover)',
      'solid-active': 'var(--enitt-color-accent-solid-active)',
      fg: 'var(--enitt-color-accent-fg)',
      border: 'var(--enitt-color-accent-border)',
      bg: 'var(--enitt-color-accent-bg)'
    },
    status: {
      normal: 'var(--enitt-color-status-normal)',
      info: 'var(--enitt-color-status-info)',
      warning: 'var(--enitt-color-status-warning)',
      serious: 'var(--enitt-color-status-serious)',
      critical: 'var(--enitt-color-status-critical)',
      unknown: 'var(--enitt-color-status-unknown)'
    },
    'status-fg': {
      normal: 'var(--enitt-color-status-fg-normal)',
      info: 'var(--enitt-color-status-fg-info)',
      warning: 'var(--enitt-color-status-fg-warning)',
      serious: 'var(--enitt-color-status-fg-serious)',
      critical: 'var(--enitt-color-status-fg-critical)',
      unknown: 'var(--enitt-color-status-fg-unknown)'
    },
    'status-bg': {
      normal: 'var(--enitt-color-status-bg-normal)',
      info: 'var(--enitt-color-status-bg-info)',
      warning: 'var(--enitt-color-status-bg-warning)',
      serious: 'var(--enitt-color-status-bg-serious)',
      critical: 'var(--enitt-color-status-bg-critical)',
      unknown: 'var(--enitt-color-status-bg-unknown)'
    },
    chart: {
      'series-1': 'var(--enitt-color-chart-series-1)',
      'series-2': 'var(--enitt-color-chart-series-2)',
      'series-3': 'var(--enitt-color-chart-series-3)',
      'series-4': 'var(--enitt-color-chart-series-4)',
      'series-5': 'var(--enitt-color-chart-series-5)',
      'series-6': 'var(--enitt-color-chart-series-6)',
      'series-7': 'var(--enitt-color-chart-series-7)',
      'series-8': 'var(--enitt-color-chart-series-8)',
      grid: 'var(--enitt-color-chart-grid)',
      axis: 'var(--enitt-color-chart-axis)',
      threshold: 'var(--enitt-color-chart-threshold)',
      surface: 'var(--enitt-color-chart-surface)'
    }
  },
  shadow: {
    xs: 'var(--enitt-shadow-xs)',
    sm: 'var(--enitt-shadow-sm)',
    md: 'var(--enitt-shadow-md)',
    lg: 'var(--enitt-shadow-lg)',
    focus: 'var(--enitt-shadow-focus)'
  }
} as const;

/** 간격 · 반경 · 타이포그래피 · 모션 → CSS 커스텀 프로퍼티 참조. */
export const dimensions = {
  space: {
    '0': 'var(--enitt-space-0)',
    '1': 'var(--enitt-space-1)',
    '2': 'var(--enitt-space-2)',
    '3': 'var(--enitt-space-3)',
    '4': 'var(--enitt-space-4)',
    '5': 'var(--enitt-space-5)',
    '6': 'var(--enitt-space-6)',
    '8': 'var(--enitt-space-8)',
    '10': 'var(--enitt-space-10)',
    '12': 'var(--enitt-space-12)',
    '16': 'var(--enitt-space-16)',
    '20': 'var(--enitt-space-20)',
    '24': 'var(--enitt-space-24)',
    px: 'var(--enitt-space-px)',
    '0_5': 'var(--enitt-space-0_5)',
    '1_5': 'var(--enitt-space-1_5)',
    '2_5': 'var(--enitt-space-2_5)'
  },
  radius: {
    none: 'var(--enitt-radius-none)',
    xs: 'var(--enitt-radius-xs)',
    sm: 'var(--enitt-radius-sm)',
    md: 'var(--enitt-radius-md)',
    lg: 'var(--enitt-radius-lg)',
    xl: 'var(--enitt-radius-xl)',
    '2xl': 'var(--enitt-radius-2xl)',
    full: 'var(--enitt-radius-full)'
  },
  'border-width': {
    none: 'var(--enitt-border-width-none)',
    thin: 'var(--enitt-border-width-thin)',
    thick: 'var(--enitt-border-width-thick)',
    heavy: 'var(--enitt-border-width-heavy)'
  },
  'font-family': {
    sans: 'var(--enitt-font-family-sans)',
    mono: 'var(--enitt-font-family-mono)',
    numeric: 'var(--enitt-font-family-numeric)'
  },
  'font-size': {
    '2xs': 'var(--enitt-font-size-2xs)',
    xs: 'var(--enitt-font-size-xs)',
    sm: 'var(--enitt-font-size-sm)',
    md: 'var(--enitt-font-size-md)',
    lg: 'var(--enitt-font-size-lg)',
    xl: 'var(--enitt-font-size-xl)',
    '2xl': 'var(--enitt-font-size-2xl)',
    '3xl': 'var(--enitt-font-size-3xl)',
    '4xl': 'var(--enitt-font-size-4xl)',
    '5xl': 'var(--enitt-font-size-5xl)'
  },
  'font-weight': {
    regular: 'var(--enitt-font-weight-regular)',
    medium: 'var(--enitt-font-weight-medium)',
    semibold: 'var(--enitt-font-weight-semibold)',
    bold: 'var(--enitt-font-weight-bold)'
  },
  'line-height': {
    tight: 'var(--enitt-line-height-tight)',
    snug: 'var(--enitt-line-height-snug)',
    normal: 'var(--enitt-line-height-normal)',
    relaxed: 'var(--enitt-line-height-relaxed)'
  },
  'letter-spacing': {
    tight: 'var(--enitt-letter-spacing-tight)',
    normal: 'var(--enitt-letter-spacing-normal)',
    wide: 'var(--enitt-letter-spacing-wide)',
    wider: 'var(--enitt-letter-spacing-wider)'
  },
  duration: {
    instant: 'var(--enitt-duration-instant)',
    fast: 'var(--enitt-duration-fast)',
    normal: 'var(--enitt-duration-normal)',
    slow: 'var(--enitt-duration-slow)',
    pulse: 'var(--enitt-duration-pulse)'
  },
  easing: {
    standard: 'var(--enitt-easing-standard)',
    enter: 'var(--enitt-easing-enter)',
    exit: 'var(--enitt-easing-exit)'
  },
  'z-index': {
    base: 'var(--enitt-z-index-base)',
    raised: 'var(--enitt-z-index-raised)',
    sticky: 'var(--enitt-z-index-sticky)',
    overlay: 'var(--enitt-z-index-overlay)',
    modal: 'var(--enitt-z-index-modal)',
    toast: 'var(--enitt-z-index-toast)',
    tooltip: 'var(--enitt-z-index-tooltip)'
  },
  size: {
    'control-sm': 'var(--enitt-size-control-sm)',
    'control-md': 'var(--enitt-size-control-md)',
    'control-lg': 'var(--enitt-size-control-lg)',
    'icon-sm': 'var(--enitt-size-icon-sm)',
    'icon-md': 'var(--enitt-size-icon-md)',
    'icon-lg': 'var(--enitt-size-icon-lg)'
  }
} as const;

/** 원시 팔레트의 실제 hex 값. canvas 렌더링처럼 var() 를 못 쓰는 곳에서만 사용한다. */
export const palette = {
  gray: {
    '100': '#f7f8f9',
    '200': '#f3f4f5',
    '300': '#eeeff1',
    '400': '#dcdee3',
    '500': '#d1d3d8',
    '600': '#b0b3ba',
    '700': '#868b94',
    '800': '#555d6d',
    '900': '#2a3038',
    '1000': '#1a1c20',
    '00': '#ffffff'
  },
  red: {
    '100': '#fdf0f0',
    '200': '#fde7e7',
    '300': '#fed4d2',
    '400': '#feb7b3',
    '500': '#fe928d',
    '600': '#fc6a66',
    '700': '#fa342c',
    '800': '#ca1d13',
    '900': '#921708',
    '1000': '#4a1209'
  },
  orange: {
    '100': '#fff2ec',
    '200': '#ffe8db',
    '300': '#ffd5c0',
    '400': '#ffb999',
    '500': '#ff9364',
    '600': '#ff6600',
    '700': '#e14d00',
    '800': '#b93901',
    '900': '#862b00',
    '1000': '#471601'
  },
  yellow: {
    '100': '#fff7de',
    '200': '#fdefb9',
    '300': '#fbdc65',
    '400': '#e9c647',
    '500': '#d4ab28',
    '600': '#c49725',
    '700': '#9b7821',
    '800': '#755b22',
    '900': '#4f3e1f',
    '1000': '#2c2512'
  },
  green: {
    '100': '#edfaf6',
    '200': '#d9f6e9',
    '300': '#b9e9d2',
    '400': '#7ddcb3',
    '500': '#42c593',
    '600': '#10ab7d',
    '700': '#079171',
    '800': '#00745f',
    '900': '#075445',
    '1000': '#0a2b24'
  },
  blue: {
    '100': '#eff6ff',
    '200': '#e2edfc',
    '300': '#cbdffa',
    '400': '#aacefd',
    '500': '#85b8fd',
    '600': '#5e98fe',
    '700': '#217cf9',
    '800': '#135fcd',
    '900': '#0b4596',
    '1000': '#032451'
  },
  indigo: {
    '100': '#eef2ff',
    '200': '#e0e7ff',
    '300': '#c7d2fe',
    '400': '#a5b4fc',
    '500': '#818cf8',
    '600': '#6366f1',
    '700': '#4f46e5',
    '800': '#4338ca',
    '900': '#3730a3',
    '1000': '#1e1b4b'
  },
  violet: {
    '100': '#f5f3fe',
    '200': '#efeafe',
    '300': '#e1d8ff',
    '400': '#d0c0ff',
    '500': '#b8a1ff',
    '600': '#9f84fb',
    '700': '#8969ea',
    '800': '#6d50cb',
    '900': '#50379b',
    '1000': '#29175d'
  }
} as const;

/** 테마별 CSS 변수 실측값. SSR 인라인 스타일이나 이미지 내보내기에 쓴다. */
export const themeValues = {
  light: {
    '--enitt-color-bg-canvas': '#f7f8f9',
    '--enitt-color-bg-surface': '#ffffff',
    '--enitt-color-bg-raised': '#ffffff',
    '--enitt-color-bg-sunken': '#f7f8f9',
    '--enitt-color-bg-muted': '#f3f4f5',
    '--enitt-color-bg-hover': 'rgba(13, 17, 23, 0.04)',
    '--enitt-color-bg-active': 'rgba(13, 17, 23, 0.08)',
    '--enitt-color-bg-selected': '#eff6ff',
    '--enitt-color-bg-overlay': 'rgba(13, 17, 23, 0.45)',
    '--enitt-color-bg-disabled': '#f3f4f5',
    '--enitt-color-fg-default': '#2a3038',
    '--enitt-color-fg-muted': '#555d6d',
    '--enitt-color-fg-subtle': '#868b94',
    '--enitt-color-fg-disabled': '#868b94',
    '--enitt-color-fg-on-accent': '#ffffff',
    '--enitt-color-fg-inverse': '#ffffff',
    '--enitt-color-border-subtle': '#f3f4f5',
    '--enitt-color-border-default': '#eeeff1',
    '--enitt-color-border-strong': '#dcdee3',
    '--enitt-color-border-focus': '#135fcd',
    '--enitt-color-accent-solid': '#135fcd',
    '--enitt-color-accent-solid-hover': '#0b4596',
    '--enitt-color-accent-solid-active': '#032451',
    '--enitt-color-accent-fg': '#0b4596',
    '--enitt-color-accent-border': '#135fcd',
    '--enitt-color-accent-bg': '#eff6ff',
    '--enitt-color-status-normal': '#10ab7d',
    '--enitt-color-status-info': '#135fcd',
    '--enitt-color-status-warning': '#d4ab28',
    '--enitt-color-status-serious': '#ff6600',
    '--enitt-color-status-critical': '#fa342c',
    '--enitt-color-status-unknown': '#868b94',
    '--enitt-color-status-fg-normal': '#079171',
    '--enitt-color-status-fg-info': '#0b4596',
    '--enitt-color-status-fg-warning': '#755b22',
    '--enitt-color-status-fg-serious': '#b93901',
    '--enitt-color-status-fg-critical': '#ca1d13',
    '--enitt-color-status-fg-unknown': '#555d6d',
    '--enitt-color-status-bg-normal': 'rgba(12, 163, 12, 0.10)',
    '--enitt-color-status-bg-info': 'rgba(42, 120, 214, 0.10)',
    '--enitt-color-status-bg-warning': 'rgba(250, 178, 25, 0.16)',
    '--enitt-color-status-bg-serious': 'rgba(236, 131, 90, 0.14)',
    '--enitt-color-status-bg-critical': 'rgba(208, 59, 59, 0.10)',
    '--enitt-color-status-bg-unknown': 'rgba(107, 119, 135, 0.10)',
    '--enitt-color-chart-series-1': '#135fcd',
    '--enitt-color-chart-series-2': '#ff6600',
    '--enitt-color-chart-series-3': '#4f46e5',
    '--enitt-color-chart-series-4': '#c49725',
    '--enitt-color-chart-series-5': '#8969ea',
    '--enitt-color-chart-series-6': '#079171',
    '--enitt-color-chart-series-7': '#fa342c',
    '--enitt-color-chart-series-8': '#555d6d',
    '--enitt-color-chart-grid': '#f3f4f5',
    '--enitt-color-chart-axis': '#dcdee3',
    '--enitt-color-chart-threshold': '#fa342c',
    '--enitt-color-chart-surface': '#ffffff',
    '--enitt-shadow-xs': '0 1px 2px rgba(13, 17, 23, 0.06)',
    '--enitt-shadow-sm': '0 1px 3px rgba(13, 17, 23, 0.10), 0 1px 2px rgba(13, 17, 23, 0.06)',
    '--enitt-shadow-md': '0 4px 12px rgba(13, 17, 23, 0.10)',
    '--enitt-shadow-lg': '0 12px 28px rgba(13, 17, 23, 0.14)',
    '--enitt-shadow-focus': '0 0 0 3px rgba(42, 120, 214, 0.35)'
},
  dark: {
    '--enitt-color-bg-canvas': '#1a1c20',
    '--enitt-color-bg-surface': '#2a3038',
    '--enitt-color-bg-raised': '#555d6d',
    '--enitt-color-bg-sunken': '#1a1c20',
    '--enitt-color-bg-muted': '#2a3038',
    '--enitt-color-bg-hover': 'rgba(255, 255, 255, 0.06)',
    '--enitt-color-bg-active': 'rgba(255, 255, 255, 0.10)',
    '--enitt-color-bg-selected': 'rgba(57, 135, 229, 0.16)',
    '--enitt-color-bg-overlay': 'rgba(5, 8, 13, 0.65)',
    '--enitt-color-bg-disabled': '#2a3038',
    '--enitt-color-fg-default': '#f3f4f5',
    '--enitt-color-fg-muted': '#dcdee3',
    '--enitt-color-fg-subtle': '#d1d3d8',
    '--enitt-color-fg-disabled': '#b0b3ba',
    '--enitt-color-fg-on-accent': '#ffffff',
    '--enitt-color-fg-inverse': '#2a3038',
    '--enitt-color-border-subtle': '#2a3038',
    '--enitt-color-border-default': '#555d6d',
    '--enitt-color-border-strong': '#868b94',
    '--enitt-color-border-focus': '#5e98fe',
    '--enitt-color-accent-solid': '#135fcd',
    '--enitt-color-accent-solid-hover': '#217cf9',
    '--enitt-color-accent-solid-active': '#135fcd',
    '--enitt-color-accent-fg': '#aacefd',
    '--enitt-color-accent-border': '#5e98fe',
    '--enitt-color-accent-bg': 'rgba(57, 135, 229, 0.14)',
    '--enitt-color-status-normal': '#42c593',
    '--enitt-color-status-info': '#5e98fe',
    '--enitt-color-status-warning': '#e9c647',
    '--enitt-color-status-serious': '#ff9364',
    '--enitt-color-status-critical': '#fc6a66',
    '--enitt-color-status-unknown': '#b0b3ba',
    '--enitt-color-status-fg-normal': '#7ddcb3',
    '--enitt-color-status-fg-info': '#aacefd',
    '--enitt-color-status-fg-warning': '#e9c647',
    '--enitt-color-status-fg-serious': '#ff9364',
    '--enitt-color-status-fg-critical': '#feb7b3',
    '--enitt-color-status-fg-unknown': '#b0b3ba',
    '--enitt-color-status-bg-normal': 'rgba(12, 163, 12, 0.18)',
    '--enitt-color-status-bg-info': 'rgba(57, 135, 229, 0.18)',
    '--enitt-color-status-bg-warning': 'rgba(250, 178, 25, 0.18)',
    '--enitt-color-status-bg-serious': 'rgba(236, 131, 90, 0.20)',
    '--enitt-color-status-bg-critical': 'rgba(208, 59, 59, 0.22)',
    '--enitt-color-status-bg-unknown': 'rgba(141, 152, 168, 0.16)',
    '--enitt-color-chart-series-1': '#5e98fe',
    '--enitt-color-chart-series-2': '#ff9364',
    '--enitt-color-chart-series-3': '#818cf8',
    '--enitt-color-chart-series-4': '#e9c647',
    '--enitt-color-chart-series-5': '#b8a1ff',
    '--enitt-color-chart-series-6': '#42c593',
    '--enitt-color-chart-series-7': '#fe928d',
    '--enitt-color-chart-series-8': '#d1d3d8',
    '--enitt-color-chart-grid': '#2a3038',
    '--enitt-color-chart-axis': '#868b94',
    '--enitt-color-chart-threshold': '#fe928d',
    '--enitt-color-chart-surface': '#2a3038',
    '--enitt-shadow-xs': '0 1px 2px rgba(0, 0, 0, 0.40)',
    '--enitt-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.50)',
    '--enitt-shadow-md': '0 4px 12px rgba(0, 0, 0, 0.55)',
    '--enitt-shadow-lg': '0 12px 28px rgba(0, 0, 0, 0.65)',
    '--enitt-shadow-focus': '0 0 0 3px rgba(57, 135, 229, 0.45)'
},
} as const;

/** 차트 시리즈 색상 — 고정 순서. 순환 배정하지 말 것 (9번째 계열은 '기타'로 묶는다). */
export const chartSeriesTokens = [
  tokens.color.chart['series-1'],
  tokens.color.chart['series-2'],
  tokens.color.chart['series-3'],
  tokens.color.chart['series-4'],
  tokens.color.chart['series-5'],
  tokens.color.chart['series-6'],
  tokens.color.chart['series-7'],
  tokens.color.chart['series-8'],
] as const;

export type ThemeName = keyof typeof themeValues;
export type CssVarName = keyof (typeof themeValues)['light'];

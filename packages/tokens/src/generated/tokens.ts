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
    },
    power: {
      energized: 'var(--enitt-color-power-energized)',
      deenergized: 'var(--enitt-color-power-deenergized)',
      fault: 'var(--enitt-color-power-fault)',
      grounded: 'var(--enitt-color-power-grounded)',
      maintenance: 'var(--enitt-color-power-maintenance)',
      unknown: 'var(--enitt-color-power-unknown)'
    },
    'power-ko': {
      energized: 'var(--enitt-color-power-ko-energized)',
      deenergized: 'var(--enitt-color-power-ko-deenergized)'
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
  neutral: {
    '0': '#ffffff',
    '25': '#fafbfc',
    '50': '#f5f7fa',
    '100': '#eaeef3',
    '200': '#d8dee7',
    '300': '#b9c2ce',
    '400': '#a6b0bd',
    '450': '#9aa4b2',
    '500': '#8d98a8',
    '550': '#828d9d',
    '600': '#6b7787',
    '700': '#515c6b',
    '750': '#3b4552',
    '800': '#2a323d',
    '850': '#22282f',
    '870': '#1c2128',
    '900': '#161b22',
    '950': '#0d1117',
    '1000': '#05080d'
  },
  blue: {
    '50': '#eef5fd',
    '100': '#cde2fb',
    '200': '#9ec5f4',
    '300': '#6da7ec',
    '400': '#3987e5',
    '450': '#2a78d6',
    '500': '#256abf',
    '600': '#1c5cab',
    '700': '#184f95',
    '800': '#104281',
    '900': '#0d366b'
  },
  green: {
    '400': '#2fd44f',
    '500': '#0ca30c',
    '600': '#0a7a0a',
    '700': '#006300'
  },
  amber: {
    '400': '#fab219',
    '600': '#8a5a00',
    '700': '#5c3a00'
  },
  orange: {
    '400': '#f0a07a',
    '450': '#ec835a',
    '500': '#eb6834',
    '550': '#d95926',
    '700': '#a34a22'
  },
  red: {
    '300': '#f08585',
    '400': '#e66767',
    '450': '#e34948',
    '500': '#d03b3b',
    '600': '#c02626'
  },
  violet: {
    '300': '#9085e9',
    '600': '#4a3aa7'
  },
  aqua: {
    '400': '#1baf7a',
    '500': '#199e70'
  },
  magenta: {
    '400': '#e87ba4',
    '500': '#d55181'
  },
  yellow: {
    '400': '#eda100',
    '500': '#c98500'
  }
} as const;

/** 테마별 CSS 변수 실측값. SSR 인라인 스타일이나 이미지 내보내기에 쓴다. */
export const themeValues = {
  light: {
    '--enitt-color-bg-canvas': '#f5f7fa',
    '--enitt-color-bg-surface': '#ffffff',
    '--enitt-color-bg-raised': '#ffffff',
    '--enitt-color-bg-sunken': '#f5f7fa',
    '--enitt-color-bg-muted': '#eaeef3',
    '--enitt-color-bg-hover': 'rgba(13, 17, 23, 0.04)',
    '--enitt-color-bg-active': 'rgba(13, 17, 23, 0.08)',
    '--enitt-color-bg-selected': '#eef5fd',
    '--enitt-color-bg-overlay': 'rgba(13, 17, 23, 0.45)',
    '--enitt-color-bg-disabled': '#eaeef3',
    '--enitt-color-fg-default': '#1c2128',
    '--enitt-color-fg-muted': '#515c6b',
    '--enitt-color-fg-subtle': '#6b7787',
    '--enitt-color-fg-disabled': '#8d98a8',
    '--enitt-color-fg-on-accent': '#ffffff',
    '--enitt-color-fg-inverse': '#ffffff',
    '--enitt-color-border-subtle': '#eaeef3',
    '--enitt-color-border-default': '#d8dee7',
    '--enitt-color-border-strong': '#b9c2ce',
    '--enitt-color-border-focus': '#2a78d6',
    '--enitt-color-accent-solid': '#256abf',
    '--enitt-color-accent-solid-hover': '#1c5cab',
    '--enitt-color-accent-solid-active': '#184f95',
    '--enitt-color-accent-fg': '#1c5cab',
    '--enitt-color-accent-border': '#2a78d6',
    '--enitt-color-accent-bg': '#eef5fd',
    '--enitt-color-status-normal': '#0ca30c',
    '--enitt-color-status-info': '#2a78d6',
    '--enitt-color-status-warning': '#fab219',
    '--enitt-color-status-serious': '#ec835a',
    '--enitt-color-status-critical': '#d03b3b',
    '--enitt-color-status-unknown': '#828d9d',
    '--enitt-color-status-fg-normal': '#0a7a0a',
    '--enitt-color-status-fg-info': '#1c5cab',
    '--enitt-color-status-fg-warning': '#8a5a00',
    '--enitt-color-status-fg-serious': '#a34a22',
    '--enitt-color-status-fg-critical': '#c02626',
    '--enitt-color-status-fg-unknown': '#515c6b',
    '--enitt-color-status-bg-normal': 'rgba(12, 163, 12, 0.10)',
    '--enitt-color-status-bg-info': 'rgba(42, 120, 214, 0.10)',
    '--enitt-color-status-bg-warning': 'rgba(250, 178, 25, 0.16)',
    '--enitt-color-status-bg-serious': 'rgba(236, 131, 90, 0.14)',
    '--enitt-color-status-bg-critical': 'rgba(208, 59, 59, 0.10)',
    '--enitt-color-status-bg-unknown': 'rgba(107, 119, 135, 0.10)',
    '--enitt-color-chart-series-1': '#2a78d6',
    '--enitt-color-chart-series-2': '#eb6834',
    '--enitt-color-chart-series-3': '#1baf7a',
    '--enitt-color-chart-series-4': '#eda100',
    '--enitt-color-chart-series-5': '#e87ba4',
    '--enitt-color-chart-series-6': '#006300',
    '--enitt-color-chart-series-7': '#4a3aa7',
    '--enitt-color-chart-series-8': '#e34948',
    '--enitt-color-chart-grid': '#eaeef3',
    '--enitt-color-chart-axis': '#b9c2ce',
    '--enitt-color-chart-threshold': '#d03b3b',
    '--enitt-color-chart-surface': '#ffffff',
    '--enitt-color-power-energized': '#0a7a0a',
    '--enitt-color-power-deenergized': '#6b7787',
    '--enitt-color-power-fault': '#c02626',
    '--enitt-color-power-grounded': '#5c3a00',
    '--enitt-color-power-maintenance': '#4a3aa7',
    '--enitt-color-power-unknown': '#828d9d',
    '--enitt-color-power-ko-energized': '#c02626',
    '--enitt-color-power-ko-deenergized': '#0a7a0a',
    '--enitt-shadow-xs': '0 1px 2px rgba(13, 17, 23, 0.06)',
    '--enitt-shadow-sm': '0 1px 3px rgba(13, 17, 23, 0.10), 0 1px 2px rgba(13, 17, 23, 0.06)',
    '--enitt-shadow-md': '0 4px 12px rgba(13, 17, 23, 0.10)',
    '--enitt-shadow-lg': '0 12px 28px rgba(13, 17, 23, 0.14)',
    '--enitt-shadow-focus': '0 0 0 3px rgba(42, 120, 214, 0.35)'
},
  dark: {
    '--enitt-color-bg-canvas': '#0d1117',
    '--enitt-color-bg-surface': '#161b22',
    '--enitt-color-bg-raised': '#1c2128',
    '--enitt-color-bg-sunken': '#05080d',
    '--enitt-color-bg-muted': '#22282f',
    '--enitt-color-bg-hover': 'rgba(255, 255, 255, 0.06)',
    '--enitt-color-bg-active': 'rgba(255, 255, 255, 0.10)',
    '--enitt-color-bg-selected': 'rgba(57, 135, 229, 0.16)',
    '--enitt-color-bg-overlay': 'rgba(5, 8, 13, 0.65)',
    '--enitt-color-bg-disabled': '#22282f',
    '--enitt-color-fg-default': '#eaeef3',
    '--enitt-color-fg-muted': '#b9c2ce',
    '--enitt-color-fg-subtle': '#8d98a8',
    '--enitt-color-fg-disabled': '#6b7787',
    '--enitt-color-fg-on-accent': '#ffffff',
    '--enitt-color-fg-inverse': '#161b22',
    '--enitt-color-border-subtle': '#22282f',
    '--enitt-color-border-default': '#2a323d',
    '--enitt-color-border-strong': '#3b4552',
    '--enitt-color-border-focus': '#3987e5',
    '--enitt-color-accent-solid': '#256abf',
    '--enitt-color-accent-solid-hover': '#3987e5',
    '--enitt-color-accent-solid-active': '#1c5cab',
    '--enitt-color-accent-fg': '#6da7ec',
    '--enitt-color-accent-border': '#3987e5',
    '--enitt-color-accent-bg': 'rgba(57, 135, 229, 0.14)',
    '--enitt-color-status-normal': '#0ca30c',
    '--enitt-color-status-info': '#3987e5',
    '--enitt-color-status-warning': '#fab219',
    '--enitt-color-status-serious': '#ec835a',
    '--enitt-color-status-critical': '#d03b3b',
    '--enitt-color-status-unknown': '#8d98a8',
    '--enitt-color-status-fg-normal': '#2fd44f',
    '--enitt-color-status-fg-info': '#6da7ec',
    '--enitt-color-status-fg-warning': '#fab219',
    '--enitt-color-status-fg-serious': '#f0a07a',
    '--enitt-color-status-fg-critical': '#f08585',
    '--enitt-color-status-fg-unknown': '#a6b0bd',
    '--enitt-color-status-bg-normal': 'rgba(12, 163, 12, 0.18)',
    '--enitt-color-status-bg-info': 'rgba(57, 135, 229, 0.18)',
    '--enitt-color-status-bg-warning': 'rgba(250, 178, 25, 0.18)',
    '--enitt-color-status-bg-serious': 'rgba(236, 131, 90, 0.20)',
    '--enitt-color-status-bg-critical': 'rgba(208, 59, 59, 0.22)',
    '--enitt-color-status-bg-unknown': 'rgba(141, 152, 168, 0.16)',
    '--enitt-color-chart-series-1': '#3987e5',
    '--enitt-color-chart-series-2': '#d95926',
    '--enitt-color-chart-series-3': '#199e70',
    '--enitt-color-chart-series-4': '#c98500',
    '--enitt-color-chart-series-5': '#d55181',
    '--enitt-color-chart-series-6': '#006300',
    '--enitt-color-chart-series-7': '#9085e9',
    '--enitt-color-chart-series-8': '#e66767',
    '--enitt-color-chart-grid': '#22282f',
    '--enitt-color-chart-axis': '#3b4552',
    '--enitt-color-chart-threshold': '#e66767',
    '--enitt-color-chart-surface': '#161b22',
    '--enitt-color-power-energized': '#2fd44f',
    '--enitt-color-power-deenergized': '#a6b0bd',
    '--enitt-color-power-fault': '#f08585',
    '--enitt-color-power-grounded': '#fab219',
    '--enitt-color-power-maintenance': '#9085e9',
    '--enitt-color-power-unknown': '#8d98a8',
    '--enitt-color-power-ko-energized': '#f08585',
    '--enitt-color-power-ko-deenergized': '#2fd44f',
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

/**
 * @enitt/charts — 모니터링용 SVG 차트
 *
 * 사용법:
 *   import '@enitt/tokens/tokens.css';
 *   import '@enitt/ui/styles.css';
 *   import '@enitt/charts/styles.css';
 *
 * 설계 규칙 (dataviz):
 *   · 계열 색은 고정 순서로 배정하고 절대 순환시키지 않는다 (최대 8계열).
 *   · y축은 하나뿐이다. 단위가 다른 지표는 차트를 나눈다.
 *   · 계열이 2개 이상이면 범례가 항상 붙는다.
 *   · 글자는 언제나 텍스트 색 — 계열 색을 글자에 입히지 않는다.
 */
export { Sparkline, type SparklineProps } from './components/Sparkline/Sparkline.js';
export {
  TimeSeriesChart,
  type TimeSeriesChartProps,
} from './components/TimeSeriesChart/TimeSeriesChart.js';
export {
  GaugeChart,
  type GaugeChartProps,
  type GaugeBand,
} from './components/GaugeChart/GaugeChart.js';

export { seriesColor, MAX_SERIES } from './internal/palette.js';

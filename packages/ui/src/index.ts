/**
 * @enitt/ui — 웹 모니터링 화면을 위한 React 컴포넌트
 *
 * 사용법:
 *   import '@enitt/tokens/tokens.css';
 *   import '@enitt/ui/styles.css';
 */
import './styles/base.css';

// 테마
export {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
  type ThemeContextValue,
  type ThemePreference,
  type ResolvedTheme,
} from './theme/ThemeProvider.js';

// 기본 컴포넌트
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './components/Button/Button.js';
export { Badge, type BadgeProps } from './components/Badge/Badge.js';
export { Spinner, type SpinnerProps } from './components/Spinner/Spinner.js';
export { EmptyState, type EmptyStateProps } from './components/EmptyState/EmptyState.js';
export { Grid, type GridProps } from './components/Grid/Grid.js';

// 모니터링 컴포넌트
export {
  StatusIndicator,
  type StatusIndicatorProps,
} from './components/StatusIndicator/StatusIndicator.js';
export { Panel, type PanelProps } from './components/Panel/Panel.js';
export { StatTile, type StatTileProps, type StatPolarity } from './components/StatTile/StatTile.js';
export { Meter, type MeterProps, type MeterThreshold } from './components/Meter/Meter.js';
export {
  DataTable,
  type DataTableProps,
  type Column,
  type SortState,
  type ColumnAlign,
} from './components/DataTable/DataTable.js';
export { AlarmList, type AlarmListProps } from './components/AlarmList/AlarmList.js';
export { Legend, type LegendProps, type LegendItem } from './components/Legend/Legend.js';

// 훅
export { useElementSize, type ElementSize } from './hooks/useElementSize.js';

// 심각도 메타 — 소비 앱이 같은 라벨/아이콘을 재사용할 수 있도록 공개한다
export { SEVERITY_LABEL, SEVERITY_ICON, SEVERITY_ARIA } from './internal/severity.js';
export * from './internal/icons.js';

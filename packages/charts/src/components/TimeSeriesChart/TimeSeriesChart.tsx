import {
  useCallback,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import {
  cx,
  formatDateTime,
  formatMeasurement,
  makeAxisFormatter,
  niceTicks,
  type Series,
  type Threshold,
  type Unit,
} from '@enitt/core';
import { Legend, useElementSize, type LegendItem } from '@enitt/ui';
import {
  areaPath,
  linePath,
  makeScales,
  nearestTime,
  timeExtent,
  valueExtent,
  valuesAt,
  type Plot,
} from '../../internal/geometry.js';
import { seriesColor } from '../../internal/palette.js';
import './TimeSeriesChart.css';

export interface TimeSeriesChartProps {
  series: readonly Series[];
  /** 그리기 영역 높이(px). 폭은 컨테이너를 따라간다. */
  height?: number;
  variant?: 'line' | 'area';
  /** 수평 임계선. 심각도에 따라 색이 정해진다. */
  thresholds?: readonly Threshold[];
  /** 계측 단위. 주면 값에 SI 접두어(k/M/G)가 자동으로 붙는다. */
  unit?: Unit;
  /** 툴팁·범례의 값 표기. 기본은 unit 기준 SI 승격. */
  formatValue?: (value: number) => string;
  /**
   * y축 눈금 표기. 기본은 **축 전체에 단위 하나를 고정**한 포매터다 —
   * 눈금마다 단위를 따로 승격시키면 `0 W · 500 kW · 1.50 MW` 처럼
   * 한 축에 세 단위가 섞여 값을 비교할 수 없게 된다.
   */
  formatAxisValue?: (value: number) => string;
  /** x축 시각 표기. */
  timeStyle?: 'time' | 'datetime' | 'date';
  /** 범례 표시. 기본은 계열이 2개 이상일 때 자동으로 켜진다. */
  showLegend?: boolean;
  showGrid?: boolean;
  /** y축을 0부터 시작시킨다. 값의 절대 크기가 중요할 때 켠다. */
  zeroBased?: boolean;
  /** 스크린리더용 차트 설명. */
  ariaLabel?: string;
  className?: string;
}

const MARGIN = { top: 12, right: 16, bottom: 26, left: 56 };

/**
 * 다계열 시계열 차트.
 *
 * - y축은 **하나뿐이다**. 단위가 다른 두 지표는 차트를 나눈다 (이중 축 금지).
 * - 커서를 올리면 세로 크로스헤어가 가장 가까운 시각에 붙고, 툴팁이 그 시각의
 *   **모든 계열 값**을 한 번에 보여준다. 선 위를 정확히 짚을 필요가 없다.
 * - 키보드 ←/→ 로도 같은 정보를 읽을 수 있다.
 * - 결측 구간에서는 선이 끊긴다.
 */
export function TimeSeriesChart({
  series,
  height = 240,
  variant = 'line',
  thresholds,
  unit,
  formatValue,
  formatAxisValue,
  timeStyle = 'time',
  showLegend,
  showGrid = true,
  zeroBased = false,
  ariaLabel,
  className,
}: TimeSeriesChartProps) {
  const clipId = useId();
  const [containerRef, size] = useElementSize({ width: 640, height });
  const [cursorTime, setCursorTime] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(() => new Set());

  const visible = useMemo(() => series.filter((s) => !hiddenIds.has(s.id)), [series, hiddenIds]);

  const plot: Plot = {
    left: MARGIN.left,
    top: MARGIN.top,
    width: Math.max(0, size.width - MARGIN.left - MARGIN.right),
    height: Math.max(0, height - MARGIN.top - MARGIN.bottom),
  };

  const geometry = useMemo(() => {
    const xRange = timeExtent(visible);
    const yRange = valueExtent(visible);
    if (!xRange || !yRange) return null;

    const thresholdValues = thresholds?.map((t) => t.value) ?? [];
    const lo = Math.min(yRange[0], ...thresholdValues, zeroBased ? 0 : yRange[0]);
    const hi = Math.max(yRange[1], ...thresholdValues);
    const { ticks, domain } = niceTicks(lo, hi, 5);
    return { xDomain: xRange, yTicks: ticks, yDomain: domain };
  }, [visible, thresholds, zeroBased]);

  const scales = geometry ? makeScales(plot, geometry.xDomain, geometry.yDomain) : null;

  const formatReading = useMemo(
    () =>
      formatValue ??
      ((v: number) => formatMeasurement(v, unit, { separator: unit ? '\u2009' : '' })),
    [formatValue, unit],
  );

  // 축은 도메인 최댓값으로 단위를 한 번만 정한다.
  const formatTick = useMemo(() => {
    if (formatAxisValue) return formatAxisValue;
    if (!geometry) return formatReading;
    const ticks = geometry.yTicks;
    const step = ticks.length > 1 ? Math.abs(ticks[1]! - ticks[0]!) : undefined;
    return makeAxisFormatter(
      Math.max(Math.abs(geometry.yDomain[0]), Math.abs(geometry.yDomain[1])),
      unit,
      {
        step,
        separator: unit ? '\u2009' : '',
      },
    ) as (value: number) => string;
  }, [formatAxisValue, geometry, formatReading, unit]);

  const handlePointer = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (!scales || plot.width <= 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const ratio = (x - plot.left) / plot.width;
      if (ratio < -0.02 || ratio > 1.02) {
        setCursorTime(null);
        return;
      }
      const time = scales.xDomain[0] + ratio * (scales.xDomain[1] - scales.xDomain[0]);
      setCursorTime(nearestTime(visible, time));
    },
    [scales, plot.left, plot.width, visible],
  );

  const stepCursor = useCallback(
    (direction: 1 | -1) => {
      const times = [...new Set(visible.flatMap((s) => s.points.map((p) => p.t)))].sort(
        (a, b) => a - b,
      );
      if (times.length === 0) return;
      const index = cursorTime == null ? times.length - 1 : times.indexOf(cursorTime);
      const next = Math.min(
        times.length - 1,
        Math.max(0, (index === -1 ? times.length - 1 : index) + direction),
      );
      setCursorTime(times[next]!);
    },
    [visible, cursorTime],
  );

  const toggleSeries = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const legendItems: LegendItem[] = series.map((s, index) => {
    const reading =
      cursorTime != null ? (s.points.find((p) => p.t === cursorTime)?.v ?? null) : null;
    return {
      id: s.id,
      label: s.label,
      color: seriesColor(index, s.color),
      hidden: hiddenIds.has(s.id),
      value: reading != null ? formatReading(reading) : undefined,
    };
  });

  const legendVisible = showLegend ?? series.length >= 2;
  const readings = cursorTime != null && scales ? valuesAt(visible, cursorTime) : [];

  return (
    <div className={cx('enitt-tschart', className)} ref={containerRef}>
      <svg
        className="enitt-tschart__svg"
        width="100%"
        height={height}
        viewBox={`0 0 ${Math.max(size.width, 1)} ${height}`}
        role="img"
        aria-label={ariaLabel ?? `시계열 차트, 계열 ${series.length}개`}
        tabIndex={0}
        onPointerMove={handlePointer}
        onPointerLeave={() => setCursorTime(null)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepCursor(1);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepCursor(-1);
          } else if (event.key === 'Escape') {
            setCursorTime(null);
          }
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={plot.left} y={plot.top} width={plot.width} height={plot.height} />
          </clipPath>
        </defs>

        {scales && geometry && (
          <>
            {/* 눈금선 — 데이터보다 뒤로 물러나 있어야 한다 */}
            {showGrid &&
              geometry.yTicks.map((tick) => (
                <line
                  key={tick}
                  className="enitt-tschart__grid"
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={scales.y(tick)}
                  y2={scales.y(tick)}
                />
              ))}

            {/* y축 라벨 — 세로로 자릿수가 맞아야 하므로 tabular-nums */}
            {geometry.yTicks.map((tick) => (
              <text
                key={tick}
                className="enitt-tschart__axis-label enitt-tschart__axis-label--y"
                x={plot.left - 8}
                y={scales.y(tick)}
                dominantBaseline="middle"
                textAnchor="end"
              >
                {formatTick(tick)}
              </text>
            ))}

            {/* x축 라벨 — 양 끝과 가운데만. 촘촘한 눈금은 읽히지 않는다 */}
            {[0, 0.5, 1].map((ratio) => {
              const time = scales.xDomain[0] + ratio * (scales.xDomain[1] - scales.xDomain[0]);
              return (
                <text
                  key={ratio}
                  className="enitt-tschart__axis-label"
                  x={plot.left + ratio * plot.width}
                  y={plot.top + plot.height + 16}
                  textAnchor={ratio === 0 ? 'start' : ratio === 1 ? 'end' : 'middle'}
                >
                  {formatDateTime(time, { style: timeStyle })}
                </text>
              );
            })}

            {/* 임계선 — 점선이라 데이터 선과 혼동되지 않는다 */}
            {thresholds?.map((threshold) => (
              <g key={`${threshold.value}-${threshold.label ?? ''}`}>
                <line
                  className={cx(
                    'enitt-tschart__threshold',
                    `enitt-tschart__threshold--${threshold.severity ?? 'critical'}`,
                  )}
                  x1={plot.left}
                  x2={plot.left + plot.width}
                  y1={scales.y(threshold.value)}
                  y2={scales.y(threshold.value)}
                />
                {threshold.label && (
                  <text
                    className={cx(
                      'enitt-tschart__threshold-label',
                      `enitt-tschart__threshold-label--${threshold.severity ?? 'critical'}`,
                    )}
                    x={plot.left + plot.width}
                    y={scales.y(threshold.value) - 4}
                    textAnchor="end"
                  >
                    {threshold.label}
                  </text>
                )}
              </g>
            ))}

            <g clipPath={`url(#${clipId})`}>
              {variant === 'area' &&
                visible.map((s) => {
                  const index = series.findIndex((item) => item.id === s.id);
                  return (
                    <path
                      key={`area-${s.id}`}
                      className="enitt-tschart__area"
                      d={areaPath(s.points, scales, geometry.yDomain[0])}
                      style={{ '--series-color': seriesColor(index, s.color) } as CSSProperties}
                    />
                  );
                })}

              {visible.map((s) => {
                const index = series.findIndex((item) => item.id === s.id);
                return (
                  <path
                    key={`line-${s.id}`}
                    className="enitt-tschart__line"
                    d={linePath(s.points, scales)}
                    style={{ '--series-color': seriesColor(index, s.color) } as CSSProperties}
                  />
                );
              })}
            </g>

            {/* 크로스헤어 — 커서가 겨누는 건 선이 아니라 '시각'이다 */}
            {cursorTime != null && (
              <g className="enitt-tschart__cursor">
                <line
                  className="enitt-tschart__crosshair"
                  x1={scales.x(cursorTime)}
                  x2={scales.x(cursorTime)}
                  y1={plot.top}
                  y2={plot.top + plot.height}
                />
                {readings.map(({ series: s, value }) => {
                  if (value == null) return null;
                  const index = series.findIndex((item) => item.id === s.id);
                  return (
                    <circle
                      key={s.id}
                      className="enitt-tschart__dot"
                      cx={scales.x(cursorTime)}
                      cy={scales.y(value)}
                      r={4}
                      style={{ '--series-color': seriesColor(index, s.color) } as CSSProperties}
                    />
                  );
                })}
              </g>
            )}
          </>
        )}

        {!geometry && (
          <text className="enitt-tschart__empty" x="50%" y="50%" textAnchor="middle">
            표시할 데이터가 없습니다
          </text>
        )}
      </svg>

      {/* 툴팁 — 값이 먼저, 계열명이 뒤. 독자는 계열을 이미 알고 숫자를 찾는다 */}
      {cursorTime != null && scales && readings.length > 0 && (
        <div
          className="enitt-tschart__tooltip"
          style={{
            insetInlineStart: scales.x(cursorTime),
            // 오른쪽 절반에서는 툴팁을 왼쪽으로 뒤집어 차트 밖으로 나가지 않게 한다
            transform:
              scales.x(cursorTime) > plot.left + plot.width / 2
                ? 'translate(calc(-100% - 12px), 0)'
                : 'translate(12px, 0)',
          }}
          role="status"
        >
          <div className="enitt-tschart__tooltip-time">
            {formatDateTime(cursorTime, { style: 'time-seconds' })}
          </div>
          {readings.map(({ series: s, value }) => {
            const index = series.findIndex((item) => item.id === s.id);
            return (
              <div key={s.id} className="enitt-tschart__tooltip-row">
                <span
                  className="enitt-tschart__tooltip-key"
                  style={{ '--series-color': seriesColor(index, s.color) } as CSSProperties}
                  aria-hidden="true"
                />
                <span className="enitt-tschart__tooltip-value enitt-tnum">
                  {value == null ? '—' : formatReading(value)}
                </span>
                <span className="enitt-tschart__tooltip-label">{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {legendVisible && (
        <Legend className="enitt-tschart__legend" items={legendItems} onToggle={toggleSeries} />
      )}
    </div>
  );
}

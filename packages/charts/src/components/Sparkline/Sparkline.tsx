import { useId, type CSSProperties } from 'react';
import { cx, type DataPoint } from '@enitt/core';
import { areaPath, lastValue, linePath, makeScales, type Plot } from '../../internal/geometry.js';
import { seriesExtent } from '../../internal/palette.js';
import './Sparkline.css';

export interface SparklineProps {
  points: readonly DataPoint[];
  width?: number;
  height?: number;
  /** 선 색. 기본은 차트 팔레트 1번 슬롯. */
  color?: string;
  /** 선 아래를 옅게 채운다. */
  area?: boolean;
  /** 마지막 유효값에 점을 찍는다. 기본 true. */
  showLastPoint?: boolean;
  /**
   * y 범위를 고정한다. 여러 타일의 스파크라인을 비교시킬 때 반드시 맞춰야 한다 —
   * 각자 자동 범위를 쓰면 모양은 비슷한데 크기는 전혀 다른 그래프가 나란히 놓인다.
   */
  domain?: readonly [number, number];
  /** 스크린리더용 설명. 값 자체는 곁의 StatTile 이 읽어 준다. */
  ariaLabel?: string;
  className?: string;
}

/**
 * KPI 타일 옆에 놓는 추세선.
 *
 * 축도 눈금도 없다 — 읽히는 것은 **모양**뿐이고, 현재 숫자는 옆의 StatTile 값이 맡는다.
 * 선은 옅게, 마지막 값만 진하게 찍는 것도 같은 이유다.
 */
export function Sparkline({
  points,
  width = 96,
  height = 28,
  color = 'var(--enitt-color-chart-series-1)',
  area = false,
  showLastPoint = true,
  domain,
  ariaLabel,
  className,
}: SparklineProps) {
  const clipId = useId();
  const padding = showLastPoint ? 3 : 1.5;
  const plot: Plot = {
    left: padding,
    top: padding,
    width: Math.max(0, width - padding * 2),
    height: Math.max(0, height - padding * 2),
  };

  const yDomain: [number, number] | null = domain ? [domain[0], domain[1]] : seriesExtent(points);
  const times = points.map((p) => p.t);
  const xDomain: [number, number] =
    times.length > 1 ? [Math.min(...times), Math.max(...times)] : [0, 1];

  if (points.length < 2 || yDomain == null) {
    return (
      <div
        className={cx('enitt-sparkline', 'enitt-sparkline--empty', className)}
        style={{ inlineSize: width, blockSize: height }}
        role="img"
        aria-label={ariaLabel ?? '추세 데이터 없음'}
      />
    );
  }

  const scales = makeScales(plot, xDomain, yDomain);
  const last = lastValue(points);

  return (
    <svg
      className={cx('enitt-sparkline', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? '추세'}
      style={{ '--spark-color': color } as CSSProperties}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {area && (
          <path className="enitt-sparkline__area" d={areaPath(points, scales, yDomain[0])} />
        )}
        <path className="enitt-sparkline__line" d={linePath(points, scales)} />
        {showLastPoint && last?.v != null && (
          <circle
            className="enitt-sparkline__last"
            cx={scales.x(last.t)}
            cy={scales.y(last.v)}
            r={2.75}
          />
        )}
      </g>
    </svg>
  );
}

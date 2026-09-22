import { extent, scaleLinear, type DataPoint, type Series } from '@enitt/core';

export interface Plot {
  /** 그리기 영역 (여백 안쪽) */
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Scales {
  x: (t: number) => number;
  y: (v: number) => number;
  xDomain: [number, number];
  yDomain: [number, number];
}

/** 여러 시리즈에서 x(시간) 범위를 낸다. */
export function timeExtent(series: readonly Series[]): [number, number] | null {
  return extent(series.flatMap((s) => s.points.map((p) => p.t)));
}

/** 여러 시리즈에서 y(값) 범위를 낸다. null 값은 무시된다. */
export function valueExtent(series: readonly Series[]): [number, number] | null {
  return extent(series.flatMap((s) => s.points.map((p) => p.v)));
}

export function makeScales(
  plot: Plot,
  xDomain: [number, number],
  yDomain: [number, number],
): Scales {
  return {
    x: (t) => scaleLinear(t, xDomain, [plot.left, plot.left + plot.width]),
    // SVG 의 y 는 아래로 자라므로 range 를 뒤집는다.
    y: (v) => scaleLinear(v, yDomain, [plot.top + plot.height, plot.top]),
    xDomain,
    yDomain,
  };
}

/**
 * 시리즈를 선 path 로 바꾼다.
 *
 * null 값에서 선을 **끊는다** — 결측 구간을 직선으로 이으면 없는 데이터를
 * 있다고 말하는 셈이 된다.
 */
export function linePath(points: readonly DataPoint[], scales: Scales): string {
  let d = '';
  let penDown = false;
  for (const point of points) {
    if (point.v == null || !Number.isFinite(point.v)) {
      penDown = false;
      continue;
    }
    const x = scales.x(point.t);
    const y = scales.y(point.v);
    d += `${penDown ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)} `;
    penDown = true;
  }
  return d.trim();
}

/** 선 아래를 채우는 면적 path. 결측 구간마다 별도의 닫힌 조각을 만든다. */
export function areaPath(points: readonly DataPoint[], scales: Scales, baseline: number): string {
  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];

  for (const point of points) {
    if (point.v == null || !Number.isFinite(point.v)) {
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push({ x: scales.x(point.t), y: scales.y(point.v) });
  }
  if (current.length) segments.push(current);

  const baseY = scales.y(baseline);
  return segments
    .filter((segment) => segment.length > 1)
    .map((segment) => {
      const head = segment[0]!;
      const tail = segment[segment.length - 1]!;
      const line = segment.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
      return `M ${head.x.toFixed(2)} ${baseY.toFixed(2)} ${line} L ${tail.x.toFixed(2)} ${baseY.toFixed(2)} Z`;
    })
    .join(' ');
}

/** 마지막 유효값. 스파크라인의 현재값 점과 StatTile 값이 이것을 공유한다. */
export function lastValue(points: readonly DataPoint[]): DataPoint | null {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const point = points[i]!;
    if (point.v != null && Number.isFinite(point.v)) return point;
  }
  return null;
}

/**
 * 커서 x 좌표에 가장 가까운 시각을 찾는다.
 * 독자는 2px 짜리 선이 아니라 '시각'을 겨눈다 — 크로스헤어가 여기에 붙는다.
 */
export function nearestTime(series: readonly Series[], time: number): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const s of series) {
    for (const point of s.points) {
      const distance = Math.abs(point.t - time);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = point.t;
      }
    }
  }
  return best;
}

/** 특정 시각의 각 시리즈 값. 크로스헤어 툴팁이 이걸 읽는다. */
export function valuesAt(
  series: readonly Series[],
  time: number,
): Array<{ series: Series; value: number | null }> {
  return series.map((s) => {
    const hit = s.points.find((p) => p.t === time);
    return { series: s, value: hit?.v ?? null };
  });
}

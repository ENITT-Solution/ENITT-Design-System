/**
 * 차트·도식이 공유하는 기하/스케일 계산.
 * 렌더러가 React 든 아니든 동일하게 쓰이므로 DOM 을 건드리지 않는다.
 */

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** 값을 [0,1] 구간으로 정규화한다. domain 폭이 0이면 0. */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/** 한 구간의 값을 다른 구간으로 선형 사상한다. */
export function scaleLinear(
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
): number {
  return lerp(range[0], range[1], normalize(value, domain[0], domain[1]));
}

/** 숫자 배열의 [최솟값, 최댓값]. null 과 NaN 은 건너뛴다. 유효값이 없으면 null. */
export function extent(values: Iterable<number | null | undefined>): [number, number] | null {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let seen = false;
  for (const v of values) {
    if (v == null || !Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
    seen = true;
  }
  return seen ? [min, max] : null;
}

/** 1·2·5·10 계열의 '보기 좋은' 간격을 고른다. */
export function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const exponent = Math.floor(Math.log10(rough));
  const magnitude = 10 ** exponent;
  const fraction = rough / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
}

/**
 * 축 눈금을 만든다. 요청 개수는 힌트이며, 실제 개수는 간격에 맞춰 조정된다.
 * 반환값은 항상 오름차순이고 domain 을 감싸도록 바깥으로 확장된다.
 */
export function niceTicks(
  min: number,
  max: number,
  count = 5,
): { ticks: number[]; domain: [number, number] } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [], domain: [0, 1] };
  if (min === max) {
    // 평평한 시계열 — 값 주변으로 임의의 폭을 준다.
    const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
    min -= pad;
    max += pad;
  }
  const step = niceStep((max - min) / Math.max(1, count));
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  // 부동소수 누적 오차를 막으려고 인덱스로 곱한다.
  const steps = Math.round((end - start) / step);
  for (let i = 0; i <= steps; i += 1) ticks.push(Number((start + i * step).toPrecision(12)));
  return { ticks, domain: [start, end] };
}

/** 극좌표 → 직교좌표. 12시 방향이 0도, 시계 방향이 양수. */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** 게이지용 원호 path 문자열. 각도는 12시 기준 시계방향 도(degree). */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (Math.abs(sweep) < 1e-6) return '';
  // 360도 원호는 단일 arc 로 그릴 수 없어 아주 조금 줄인다.
  const safeEnd = Math.abs(sweep) >= 360 ? startAngle + 359.99 * Math.sign(sweep) : endAngle;
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, safeEnd);
  const largeArc = Math.abs(safeEnd - startAngle) > 180 ? 1 : 0;
  const sweepFlag = safeEnd > startAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${end.x} ${end.y}`;
}

/** 직교 좌표 배열 → SVG polyline points. null 구간은 호출측에서 끊어 넘긴다. */
export const toPoints = (points: ReadonlyArray<{ x: number; y: number }>): string =>
  points.map((p) => `${p.x},${p.y}`).join(' ');

/**
 * 직교(맨해튼) 경로. 대각선 없이 가로→세로→가로 로 꺾는다.
 * 도식(다이어그램·순서도·배선도)에서 선을 반듯하게 잇는 데 쓴다.
 */
export function orthogonalPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  orientation: 'h' | 'v' = 'v',
): string {
  if (from.x === to.x || from.y === to.y) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const mid = orientation === 'v' ? (from.y + to.y) / 2 : (from.x + to.x) / 2;
  return orientation === 'v'
    ? `M ${from.x} ${from.y} L ${from.x} ${mid} L ${to.x} ${mid} L ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${mid} ${from.y} L ${mid} ${to.y} L ${to.x} ${to.y}`;
}

/** 두 점 사이 거리. */
export const distance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

/** 여러 사각형을 감싸는 최소 경계 상자. 비어 있으면 null. */
export function boundingBox(
  boxes: ReadonlyArray<{ x: number; y: number; width?: number; height?: number }>,
): { x: number; y: number; width: number; height: number } | null {
  if (boxes.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const b of boxes) {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + (b.width ?? 0));
    maxY = Math.max(maxY, b.y + (b.height ?? 0));
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

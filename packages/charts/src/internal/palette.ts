import { extent, type DataPoint } from '@enitt/core';

/**
 * 차트 시리즈 색 — **고정 순서**로 배정한다.
 *
 * 순환 배정은 금지다. 9번째 계열에 1번 색을 다시 쓰면 두 계열이 같은 색이 된다.
 * 8개를 넘는 계열은 '기타'로 묶거나 작은 차트 여러 개(small multiples)로 쪼갠다.
 */
const SERIES_SLOTS = [
  'var(--enitt-color-chart-series-1)',
  'var(--enitt-color-chart-series-2)',
  'var(--enitt-color-chart-series-3)',
  'var(--enitt-color-chart-series-4)',
  'var(--enitt-color-chart-series-5)',
  'var(--enitt-color-chart-series-6)',
  'var(--enitt-color-chart-series-7)',
  'var(--enitt-color-chart-series-8)',
] as const;

/** 시리즈 팔레트에서 쓸 수 있는 최대 계열 수. */
export const MAX_SERIES = SERIES_SLOTS.length;

let warned = false;

/** i 번째 계열의 색. explicit 가 있으면 그것을 쓴다. */
export function seriesColor(index: number, explicit?: string): string {
  if (explicit) return explicit;
  if (index < MAX_SERIES) return SERIES_SLOTS[index]!;

  if (import.meta.env?.DEV && !warned) {
    warned = true;
    console.warn(
      `[@enitt/charts] 계열이 ${MAX_SERIES}개를 넘었습니다. 색을 재사용하면 서로 다른 계열이 ` +
        `같은 색으로 보입니다. 나머지는 '기타'로 묶거나 차트를 여러 개로 나누세요.`,
    );
  }
  // 넘친 계열은 회색 — 잘못된 색을 주느니 '식별 불가'라고 말하는 편이 낫다.
  return 'var(--enitt-color-fg-subtle)';
}

/** 점 배열의 y 범위. 값이 하나뿐이면 위아래로 여유를 준다. */
export function seriesExtent(points: readonly DataPoint[]): [number, number] | null {
  const range = extent(points.map((p) => p.v));
  if (!range) return null;
  const [min, max] = range;
  if (min !== max) return [min, max];
  const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
  return [min - pad, max + pad];
}

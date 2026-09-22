import { describe, expect, it } from 'vitest';
import type { Series } from '@enitt/core';
import { areaPath, lastValue, linePath, makeScales, nearestTime, valuesAt } from './geometry.js';
import { seriesColor, MAX_SERIES } from './palette.js';

const plot = { left: 0, top: 0, width: 100, height: 100 };
const scales = makeScales(plot, [0, 100], [0, 10]);

describe('makeScales', () => {
  it('y 는 SVG 방향으로 뒤집힌다 — 값이 클수록 위로 간다', () => {
    expect(scales.y(0)).toBe(100);
    expect(scales.y(10)).toBe(0);
  });
});

describe('linePath', () => {
  it('결측값에서 선을 끊는다 — 없는 데이터를 이어 그리지 않는다', () => {
    const d = linePath(
      [
        { t: 0, v: 1 },
        { t: 25, v: 2 },
        { t: 50, v: null },
        { t: 75, v: 4 },
        { t: 100, v: 5 },
      ],
      scales,
    );
    // M 이 두 번 나오면 선이 두 조각이라는 뜻
    expect(d.match(/M /g)).toHaveLength(2);
  });

  it('모든 값이 결측이면 빈 path', () => {
    expect(linePath([{ t: 0, v: null }], scales)).toBe('');
  });
});

describe('areaPath', () => {
  it('결측 구간마다 닫힌 조각을 따로 만든다', () => {
    const d = areaPath(
      [
        { t: 0, v: 1 },
        { t: 25, v: 2 },
        { t: 50, v: null },
        { t: 75, v: 4 },
        { t: 100, v: 5 },
      ],
      scales,
      0,
    );
    expect(d.match(/Z/g)).toHaveLength(2);
  });

  it('점이 하나뿐인 조각은 면적이 없으므로 버린다', () => {
    expect(areaPath([{ t: 0, v: 1 }], scales, 0)).toBe('');
  });
});

describe('lastValue', () => {
  it('뒤에서부터 첫 유효값을 찾는다', () => {
    expect(
      lastValue([
        { t: 0, v: 1 },
        { t: 1, v: 5 },
        { t: 2, v: null },
      ]),
    ).toEqual({ t: 1, v: 5 });
    expect(lastValue([{ t: 0, v: null }])).toBeNull();
  });
});

describe('크로스헤어', () => {
  const series: Series[] = [
    {
      id: 'a',
      label: 'A',
      points: [
        { t: 0, v: 1 },
        { t: 100, v: 2 },
      ],
    },
    {
      id: 'b',
      label: 'B',
      points: [
        { t: 0, v: 3 },
        { t: 100, v: null },
      ],
    },
  ];

  it('커서 시각에 가장 가까운 데이터 시각으로 스냅한다', () => {
    expect(nearestTime(series, 40)).toBe(0);
    expect(nearestTime(series, 60)).toBe(100);
    expect(nearestTime([], 0)).toBeNull();
  });

  it('한 시각의 모든 계열 값을 한꺼번에 읽는다 — 선을 짚을 필요가 없다', () => {
    const readings = valuesAt(series, 100);
    expect(readings).toHaveLength(2);
    expect(readings[0]!.value).toBe(2);
    expect(readings[1]!.value).toBeNull();
  });
});

describe('seriesColor', () => {
  it('고정 순서로 배정한다', () => {
    expect(seriesColor(0)).toContain('series-1');
    expect(seriesColor(7)).toContain('series-8');
  });

  it('명시한 색이 우선한다', () => {
    expect(seriesColor(0, '#ff0000')).toBe('#ff0000');
  });

  it('슬롯을 넘으면 색을 재사용하지 않고 회색으로 떨어뜨린다', () => {
    expect(seriesColor(MAX_SERIES)).not.toContain('series-1');
    expect(seriesColor(MAX_SERIES)).toContain('fg-subtle');
  });
});

import { describe, expect, it } from 'vitest';
import {
  arcPath,
  boundingBox,
  clamp,
  extent,
  niceStep,
  niceTicks,
  orthogonalPath,
  scaleLinear,
} from './math.js';
import { maxSeverity, rollupSeverity } from './types.js';

describe('scaleLinear', () => {
  it('구간을 뒤집어도 동작한다 (SVG y축)', () => {
    expect(scaleLinear(50, [0, 100], [200, 0])).toBe(100);
    expect(scaleLinear(0, [0, 100], [200, 0])).toBe(200);
  });

  it('폭이 0인 domain 은 range 시작점으로 떨어진다', () => {
    expect(scaleLinear(5, [5, 5], [0, 100])).toBe(0);
  });
});

describe('extent', () => {
  it('null 과 NaN 을 건너뛴다', () => {
    expect(extent([3, null, 1, Number.NaN, 7])).toEqual([1, 7]);
    expect(extent([null, undefined])).toBeNull();
    expect(extent([])).toBeNull();
  });
});

describe('niceTicks', () => {
  it('domain 을 감싸는 1·2·5 계열 눈금을 만든다', () => {
    const { ticks, domain } = niceTicks(0, 97, 5);
    expect(domain[0]).toBeLessThanOrEqual(0);
    expect(domain[1]).toBeGreaterThanOrEqual(97);
    expect(ticks[0]).toBe(domain[0]);
    expect(ticks.at(-1)).toBe(domain[1]);
    expect(new Set(ticks).size).toBe(ticks.length);
  });

  it('평평한 시계열에도 폭을 만들어 준다', () => {
    const { ticks, domain } = niceTicks(42, 42);
    expect(domain[1]).toBeGreaterThan(domain[0]);
    expect(ticks.length).toBeGreaterThan(1);
  });

  it('부동소수 오차가 눈금에 새지 않는다', () => {
    const { ticks } = niceTicks(0, 1, 10);
    for (const t of ticks) expect(t).toBe(Number(t.toPrecision(12)));
  });

  it('niceStep 은 1·2·5·10 만 돌려준다', () => {
    expect(niceStep(0.3)).toBeCloseTo(0.5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(21)).toBe(50);
  });
});

describe('arcPath', () => {
  it('폭이 0인 원호는 빈 문자열', () => {
    expect(arcPath(50, 50, 40, 90, 90)).toBe('');
  });

  it('완전한 원은 닫히지 않게 살짝 줄인다', () => {
    expect(arcPath(50, 50, 40, 0, 360)).toMatch(/^M /);
  });
});

describe('orthogonalPath', () => {
  it('같은 축이면 직선', () => {
    expect(orthogonalPath({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe('M 0 0 L 0 10');
  });

  it('대각선은 세 번 꺾어 직교로만 잇는다', () => {
    const d = orthogonalPath({ x: 0, y: 0 }, { x: 10, y: 20 });
    expect(d.match(/L/g)).toHaveLength(3);
  });
});

describe('boundingBox', () => {
  it('여러 상자를 감싼다', () => {
    expect(
      boundingBox([
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 5, width: 5, height: 5 },
      ]),
    ).toEqual({
      x: 0,
      y: 0,
      width: 25,
      height: 10,
    });
    expect(boundingBox([])).toBeNull();
  });
});

describe('severity', () => {
  it('더 심각한 쪽을 남긴다', () => {
    expect(maxSeverity('warning', 'critical')).toBe('critical');
    expect(maxSeverity('normal', 'unknown')).toBe('normal');
    expect(rollupSeverity(['normal', 'warning', 'info'])).toBe('warning');
    expect(rollupSeverity([])).toBe('unknown');
  });
});

describe('clamp', () => {
  it('범위를 벗어난 값을 잘라낸다', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import {
  changeRate,
  formatDuration,
  formatMeasurement,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  makeAxisFormatter,
  trendOf,
} from './format.js';

describe('formatMeasurement', () => {
  it('값 크기에 맞춰 SI 접두어를 올린다', () => {
    expect(formatMeasurement(2_450_000, 'B')).toBe('2.45 MB');
    expect(formatMeasurement(1234, 'req/s')).toBe('1.23 kreq/s');
    expect(formatMeasurement(22_900, 'V')).toBe('22.9 kV');
    expect(formatMeasurement(153.24, 'ms')).toBe('153 ms');
  });

  it('음수도 크기 기준으로 승격한다', () => {
    expect(formatMeasurement(-2_450_000, 'B')).toBe('-2.45 MB');
  });

  it('% 와 °C 는 승격하지 않는다', () => {
    expect(formatMeasurement(1500, '%')).toBe('1,500 %');
    expect(formatMeasurement(1200, '°C')).toBe('1,200 °C');
  });

  it('scale: false 면 원 단위를 유지한다', () => {
    expect(formatMeasurement(2_450_000, 'B', { scale: false })).toBe('2,450,000 B');
  });

  it('결측값은 placeholder 로 떨어진다', () => {
    expect(formatMeasurement(null, 'B')).toBe('—');
    expect(formatMeasurement(Number.NaN, 'B')).toBe('—');
    expect(formatMeasurement(undefined, 'B', { placeholder: 'N/A' })).toBe('N/A');
  });

  it('0 은 접두어 없이 표시한다', () => {
    expect(formatMeasurement(0, 'B')).toBe('0 B');
  });

  it('단위가 없어도 접두어는 붙는다', () => {
    expect(formatMeasurement(1_234_000)).toBe('1.23 M');
    expect(formatMeasurement(1_234_000, '', { scale: false })).toBe('1,230,000');
  });
});

describe('formatPercent / formatNumber', () => {
  it('소수 자릿수를 고정한다', () => {
    expect(formatPercent(87.42)).toBe('87.4%');
    expect(formatPercent(87.42, { fractionDigits: 0 })).toBe('87%');
    expect(formatNumber(1234.5, { fractionDigits: 1 })).toBe('1,234.5');
  });
});

describe('formatDuration', () => {
  it('가장 큰 단위 두 개까지만 보여준다', () => {
    expect(formatDuration(3_725_000)).toBe('1시간 2분');
    expect(formatDuration(90_000)).toBe('1분 30초');
    expect(formatDuration(45_000)).toBe('45초');
    expect(formatDuration(0)).toBe('0초');
    expect(formatDuration(272_100_000)).toBe('3일 3시간');
  });

  it('음수와 결측값은 placeholder', () => {
    expect(formatDuration(-1)).toBe('—');
    expect(formatDuration(null)).toBe('—');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.UTC(2026, 0, 1, 12, 0, 0);

  it('가장 가까운 단위로 내린다', () => {
    expect(formatRelativeTime(now - 120_000, { now })).toContain('2');
    expect(formatRelativeTime(now, { now })).toBeTruthy();
  });
});

describe('trendOf / changeRate', () => {
  it('epsilon 이하 변화는 flat', () => {
    expect(trendOf(10, 9)).toBe('up');
    expect(trendOf(9, 10)).toBe('down');
    expect(trendOf(10, 10)).toBe('flat');
    expect(trendOf(10.05, 10, 0.1)).toBe('flat');
  });

  it('이전 값이 0이면 증감률을 낼 수 없다', () => {
    expect(changeRate(10, 0)).toBeNull();
    expect(changeRate(150, 100)).toBeCloseTo(50);
    expect(changeRate(50, -100)).toBeCloseTo(150);
  });
});

describe('makeAxisFormatter', () => {
  it('축 전체에 단위 하나를 고정한다 — 눈금마다 단위가 바뀌지 않는다', () => {
    const format = makeAxisFormatter(2_000_000, 'B', { step: 500_000 });
    expect([0, 500_000, 1_000_000, 1_500_000, 2_000_000].map(format)).toEqual([
      '0.0 MB',
      '0.5 MB',
      '1.0 MB',
      '1.5 MB',
      '2.0 MB',
    ]);
  });

  it('눈금 간격이 단위보다 크면 소수 자리를 버린다', () => {
    const format = makeAxisFormatter(50_000, 'B', { step: 10_000 });
    expect(format(30_000)).toBe('30 kB');
  });

  it('% 는 승격하지 않는다', () => {
    const format = makeAxisFormatter(100, '%', { step: 25 });
    expect(format(50)).toBe('50 %');
  });

  it('결측값은 placeholder', () => {
    expect(makeAxisFormatter(100, 'B')(null)).toBe('—');
  });
});

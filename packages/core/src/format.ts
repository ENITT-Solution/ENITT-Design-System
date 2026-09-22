/**
 * 모니터링 화면용 숫자·시간 포매터. 업무 도메인에 종속되지 않는다.
 *
 * 원칙: 표에 세로로 늘어놓았을 때 자릿수가 흔들리지 않도록
 * 유효숫자를 고정하고(기본 3자리), 단위를 값에 맞춰 승격한다.
 *
 * 도메인별 축약(`formatPower` 같은 것)은 여기 두지 않는다 —
 * `formatMeasurement(value, 'W')` 로 충분하고, 코어가 특정 업종을 알 이유가 없다.
 */
import type { TrendDirection, Unit } from './types.js';

const SI_PREFIXES = [
  { factor: 1e12, symbol: 'T' },
  { factor: 1e9, symbol: 'G' },
  { factor: 1e6, symbol: 'M' },
  { factor: 1e3, symbol: 'k' },
  { factor: 1, symbol: '' },
  { factor: 1e-3, symbol: 'm' },
  { factor: 1e-6, symbol: 'µ' },
] as const;

export interface MeasurementOptions {
  /** 표시할 유효숫자. 기본 3. */
  significantDigits?: number;
  /** SI 접두어 승격을 끄고 원래 단위로만 표시한다. */
  scale?: boolean;
  /** 값과 단위 사이 구분자. 기본 좁은 공백. */
  separator?: string;
  /** 값이 null/NaN 일 때 표시할 문자열. 기본 '—'. */
  placeholder?: string;
  locale?: string;
}

/** SI 접두어를 붙여 계측값을 읽기 좋게 만든다. `formatMeasurement(1_234_000, 'B')` → `'1.23 MB'` */
export function formatMeasurement(
  value: number | null | undefined,
  unit: Unit = '',
  options: MeasurementOptions = {},
): string {
  const {
    significantDigits = 3,
    scale = true,
    separator = ' ',
    placeholder = '—',
    locale = 'ko-KR',
  } = options;

  if (value == null || !Number.isFinite(value)) return placeholder;

  // %, °C 처럼 접두어가 의미 없는 단위는 승격하지 않는다.
  const scalable = scale && unit !== '%' && unit !== '°C';
  const magnitude = Math.abs(value);
  const step =
    scalable && magnitude > 0
      ? (SI_PREFIXES.find((p) => magnitude >= p.factor) ?? SI_PREFIXES[SI_PREFIXES.length - 1]!)
      : { factor: 1, symbol: '' };

  const scaled = value / step.factor;
  const text = new Intl.NumberFormat(locale, {
    maximumSignificantDigits: significantDigits,
    minimumSignificantDigits: Math.abs(scaled) >= 1 ? significantDigits : undefined,
  }).format(scaled);

  const suffix = `${step.symbol}${unit}`;
  return suffix ? `${text}${separator}${suffix}` : text;
}

/** 값 크기에 맞는 SI 단계. 축 전체에 하나의 단위를 고정할 때 쓴다. */
export function siStep(magnitude: number): { factor: number; symbol: string } {
  const abs = Math.abs(magnitude);
  if (!Number.isFinite(abs) || abs === 0) return { factor: 1, symbol: '' };
  const hit = SI_PREFIXES.find((p) => abs >= p.factor);
  return hit ?? SI_PREFIXES[SI_PREFIXES.length - 1]!;
}

/**
 * 축 눈금용 포매터. **도메인 전체에 단위 하나를 고정**한다.
 *
 * 눈금마다 단위를 따로 승격시키면 `0 W · 500 kW · 1.50 MW` 처럼 축 하나에
 * 세 단위가 섞여 값을 비교할 수 없게 된다. 최댓값 기준으로 한 번만 정한다.
 *
 * ```ts
 * const format = makeAxisFormatter(2_000_000, 'W', { step: 500_000 });
 * [0, 500_000, 1_000_000, 2_000_000].map(format);
 * // ['0.0 MW', '0.5 MW', '1.0 MW', '2.0 MW']
 * ```
 */
export function makeAxisFormatter(
  domainMax: number,
  unit: Unit = '',
  {
    step,
    separator = '\u2009',
    locale = 'ko-KR',
    placeholder = '—',
  }: { step?: number; separator?: string; locale?: string; placeholder?: string } = {},
): (value: number | null | undefined) => string {
  const scalable = unit !== '%' && unit !== '°C';
  const { factor, symbol } = scalable ? siStep(domainMax) : { factor: 1, symbol: '' };

  // 눈금 간격이 단위 하나보다 작으면 소수 자리를 늘려야 눈금이 서로 달라 보인다.
  const scaledStep = step != null && step > 0 ? step / factor : 1;
  const fractionDigits = scaledStep >= 1 ? 0 : scaledStep >= 0.1 ? 1 : 2;

  const suffix = `${symbol}${unit}`;
  const numberFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return (value) => {
    if (value == null || !Number.isFinite(value)) return placeholder;
    const text = numberFormat.format(value / factor);
    return suffix ? `${text}${separator}${suffix}` : text;
  };
}

/** 백분율. 입력은 0–100 스케일. `formatPercent(87.42)` → `'87.4%'` */
export function formatPercent(
  value: number | null | undefined,
  { fractionDigits = 1, placeholder = '—', locale = 'ko-KR' } = {},
): string {
  if (value == null || !Number.isFinite(value)) return placeholder;
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)}%`;
}

/** 천단위 구분 정수/소수. */
export function formatNumber(
  value: number | null | undefined,
  {
    fractionDigits,
    placeholder = '—',
    locale = 'ko-KR',
  }: {
    fractionDigits?: number;
    placeholder?: string;
    locale?: string;
  } = {},
): string {
  if (value == null || !Number.isFinite(value)) return placeholder;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** 경과 시간을 사람이 읽는 길이로. `formatDuration(3_725_000)` → `'1시간 2분'` */
export function formatDuration(ms: number | null | undefined, { placeholder = '—' } = {}): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return placeholder;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 가장 큰 단위 두 개까지만 — "3일 4시간" 이 "3일 4시간 12분 5초" 보다 읽기 쉽다.
  const parts: string[] = [];
  if (days) parts.push(`${days}일`);
  if (hours) parts.push(`${hours}시간`);
  if (minutes) parts.push(`${minutes}분`);
  if (seconds || parts.length === 0) parts.push(`${seconds}초`);
  return parts.slice(0, 2).join(' ');
}

/** 절대 시각. 기본은 표에서 정렬이 맞는 24시간제. */
export function formatDateTime(
  time: number | Date | null | undefined,
  {
    style = 'datetime',
    placeholder = '—',
    locale = 'ko-KR',
  }: {
    style?: 'datetime' | 'date' | 'time' | 'time-seconds';
    placeholder?: string;
    locale?: string;
  } = {},
): string {
  if (time == null) return placeholder;
  const date = time instanceof Date ? time : new Date(time);
  if (Number.isNaN(date.getTime())) return placeholder;

  const options: Intl.DateTimeFormatOptions = { hourCycle: 'h23' };
  if (style === 'date' || style === 'datetime') {
    Object.assign(options, { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  if (style !== 'date') {
    Object.assign(options, { hour: '2-digit', minute: '2-digit' });
    if (style === 'time-seconds') options.second = '2-digit';
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** 상대 시각. `formatRelativeTime(Date.now() - 120_000)` → `'2분 전'` */
export function formatRelativeTime(
  time: number | Date | null | undefined,
  { now = Date.now(), placeholder = '—', locale = 'ko-KR' } = {},
): string {
  if (time == null) return placeholder;
  const ms = (time instanceof Date ? time.getTime() : time) - now;
  if (!Number.isFinite(ms)) return placeholder;

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1000],
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(ms) >= size) return formatter.format(Math.round(ms / size), unit);
  }
  return formatter.format(0, 'second');
}

/** 앞뒤 값 비교로 추세를 낸다. `epsilon` 이하 변화는 'flat'. */
export function trendOf(
  current: number | null | undefined,
  previous: number | null | undefined,
  epsilon = 0,
): TrendDirection {
  if (
    current == null ||
    previous == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous)
  ) {
    return 'flat';
  }
  const delta = current - previous;
  if (Math.abs(delta) <= epsilon) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

/** 증감률(%)을 낸다. 이전 값이 0이면 null. */
export function changeRate(
  current: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (current == null || previous == null || previous === 0) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

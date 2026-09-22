/**
 * 모니터링 UI 가 공유하는 도메인 중립 타입.
 *
 * 여기 있는 이름은 CSS 토큰 이름과 1:1로 맞춰져 있다.
 * 예: severity 'critical' ↔ --enitt-color-status-critical
 *
 * 특정 업무 도메인(전력 계통, 공정 제어 등)의 타입은 이 패키지에 두지 않는다.
 * 도메인 패키지가 여기 타입을 재료로 자기 타입을 정의한다.
 */

/** 경보·상태 등급. @enitt/tokens 의 status 토큰과 같은 키를 쓴다. */
export type Severity = 'normal' | 'info' | 'warning' | 'serious' | 'critical' | 'unknown';

/** 심각도 오름차순. 정렬·비교에 쓴다. */
export const SEVERITY_ORDER: readonly Severity[] = [
  'unknown',
  'normal',
  'info',
  'warning',
  'serious',
  'critical',
] as const;

/** 두 심각도 중 더 높은 쪽을 돌려준다. */
export function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b) ? a : b;
}

/** 여러 심각도를 하나로 롤업한다. 비어 있으면 'unknown'. */
export function rollupSeverity(severities: Iterable<Severity>): Severity {
  let result: Severity = 'unknown';
  let seen = false;
  for (const s of severities) {
    result = seen ? maxSeverity(result, s) : s;
    seen = true;
  }
  return result;
}

/** 통신·수집 상태. */
export type ConnectionState = 'online' | 'degraded' | 'offline' | 'unknown';

/** 값의 추세 방향. */
export type TrendDirection = 'up' | 'down' | 'flat';

/** 시계열 한 점. `t` 는 epoch 밀리초, `v` 가 null 이면 결측이다. */
export interface DataPoint {
  t: number;
  v: number | null;
}

/** 이름 붙은 시계열 하나. */
export interface Series {
  id: string;
  label: string;
  points: readonly DataPoint[];
  /** 지정하지 않으면 시리즈 순서대로 차트 팔레트 슬롯이 배정된다. */
  color?: string;
  unit?: string;
}

/** 임계값 선. 모니터링 차트에 수평선으로 그려진다. */
export interface Threshold {
  value: number;
  label?: string;
  severity?: Severity;
}

/** 경보 한 건. */
export interface AlarmRecord {
  id: string;
  severity: Severity;
  /** 발생 시각 (epoch ms). */
  raisedAt: number;
  /** 해소 시각. 없으면 미해소 상태. */
  clearedAt?: number;
  /** 경보가 붙은 대상 (서비스명, 호스트, 설비 ID 등). */
  source: string;
  message: string;
  acknowledged?: boolean;
}

/**
 * 계측 단위. `formatMeasurement` 가 SI 접두어를 붙일 때 쓴다.
 *
 * 나열된 값은 자동완성을 위한 **예시**일 뿐이고, 임의의 문자열을 받는다.
 * '%' 와 '°C' 만 특별 취급한다 (접두어를 붙이지 않는다).
 */
export type Unit =
  // 일반 웹·시스템 모니터링
  | 'B'
  | 'B/s'
  | 'bps'
  | 'req'
  | 'req/s'
  | 'ms'
  | 's'
  | 'count'
  // 물리 계측
  | 'W'
  | 'Wh'
  | 'V'
  | 'A'
  | 'Hz'
  | 'Pa'
  | 'Ω'
  // 접두어를 붙이지 않는 단위
  | '%'
  | '°C'
  | (string & {});

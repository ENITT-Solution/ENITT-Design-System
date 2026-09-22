import type { AlarmRecord, Series } from '@enitt/core';

/** 결정적 난수 — 스토리가 새로고침마다 달라지면 시각 회귀 테스트가 불가능하다. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** 기준 시각 고정 — 상대 시간 표기도 스냅샷이 흔들리지 않는다. */
export const NOW = Date.UTC(2026, 8, 22, 14, 30, 0);

export function makeSeries(
  id: string,
  label: string,
  {
    base = 1000,
    amplitude = 200,
    noise = 60,
    points = 96,
    stepMs = 15 * 60 * 1000,
    seed = 7,
    gapAt,
    unit,
  }: {
    base?: number;
    amplitude?: number;
    noise?: number;
    points?: number;
    stepMs?: number;
    seed?: number;
    /** 이 인덱스 구간을 결측으로 만든다 — 수집 중단 표현. */
    gapAt?: [number, number];
    unit?: string;
  } = {},
): Series {
  const random = seeded(seed);
  const start = NOW - (points - 1) * stepMs;

  return {
    id,
    label,
    unit,
    points: Array.from({ length: points }, (_, index) => {
      const t = start + index * stepMs;
      if (gapAt && index >= gapAt[0] && index <= gapAt[1]) return { t, v: null };
      // 하루 주기 + 잡음
      const phase = (index / points) * Math.PI * 2;
      const v = base + Math.sin(phase - Math.PI / 2) * amplitude + (random() - 0.5) * noise;
      return { t, v: Math.max(0, Math.round(v)) };
    }),
  };
}

export const alarms: AlarmRecord[] = [
  {
    id: 'a1',
    severity: 'critical',
    raisedAt: NOW - 3 * 60 * 1000,
    source: 'payment-api',
    message: '5xx 오류율 12.4% (임계 5%)',
  },
  {
    id: 'a2',
    severity: 'serious',
    raisedAt: NOW - 24 * 60 * 1000,
    source: 'db-primary',
    message: '연결 풀 사용률 95% — 곧 고갈됩니다',
  },
  {
    id: 'a3',
    severity: 'warning',
    raisedAt: NOW - 62 * 60 * 1000,
    source: 'search-worker',
    message: '큐 적체 2,400건, 처리 지연 증가',
    acknowledged: true,
  },
  {
    id: 'a4',
    severity: 'info',
    raisedAt: NOW - 3 * 3600 * 1000,
    source: 'deploy',
    message: 'api-gateway v2.14.0 배포 완료',
  },
  {
    id: 'a5',
    severity: 'warning',
    raisedAt: NOW - 7 * 3600 * 1000,
    clearedAt: NOW - 6 * 3600 * 1000,
    source: 'cdn-edge-ap1',
    message: '헬스체크 응답 없음',
  },
];

export interface ServiceRow {
  id: string;
  name: string;
  requests: number;
  latencyP95: number;
  errorRate: number;
  saturation: number;
  severity: import('@enitt/core').Severity;
}

export const services: ServiceRow[] = [
  {
    id: 'payment',
    name: 'payment-api',
    requests: 18_400,
    latencyP95: 840,
    errorRate: 12.4,
    saturation: 91,
    severity: 'critical',
  },
  {
    id: 'db',
    name: 'db-primary',
    requests: 42_100,
    latencyP95: 96,
    errorRate: 0.2,
    saturation: 95,
    severity: 'serious',
  },
  {
    id: 'gateway',
    name: 'api-gateway',
    requests: 128_700,
    latencyP95: 121,
    errorRate: 0.4,
    saturation: 62,
    severity: 'normal',
  },
  {
    id: 'search',
    name: 'search-worker',
    requests: 7_300,
    latencyP95: 2_140,
    errorRate: 1.1,
    saturation: 78,
    severity: 'warning',
  },
  {
    id: 'cdn',
    name: 'cdn-edge-ap1',
    requests: 0,
    latencyP95: 0,
    errorRate: 0,
    saturation: 0,
    severity: 'unknown',
  },
];

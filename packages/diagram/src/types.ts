import type { ReactNode } from 'react';
import type { Severity } from '@enitt/core';

/**
 * 전력 계통 기기·선로의 전기적 상태.
 *
 * 코어(@enitt/core)는 업무 도메인을 모른다 — 이 타입은 계통도 패키지가 소유하고,
 * 코어의 `Severity` 와는 `powerSeverity()` 로 연결한다.
 * 토큰 이름과 1:1로 맞춰져 있다: 'fault' ↔ --enitt-color-power-fault
 */
export type PowerState =
  | 'energized' // 가압 / 충전
  | 'deenergized' // 정전 / 무전압
  | 'fault' // 고장 / 사고
  | 'grounded' // 접지
  | 'maintenance' // 점검 / 작업중
  | 'unknown'; // 불명 / 통신두절

/** 개폐기(차단기·단로기) 접점 상태. */
export type SwitchState =
  | 'closed' // 투입 (전류가 흐를 수 있음)
  | 'open' // 개방
  | 'intermediate' // 동작 중 / 불일치
  | 'unknown';

/**
 * 전력 상태를 공통 경보 등급으로 옮긴다.
 * 계통도의 상태를 대시보드의 배지·표와 같은 언어로 말하게 하는 접점이다.
 */
export function powerSeverity(state: PowerState): Severity {
  switch (state) {
    case 'fault':
      return 'critical';
    case 'grounded':
      return 'warning';
    case 'maintenance':
      return 'info';
    case 'energized':
      return 'normal';
    default:
      return 'unknown';
  }
}

/** 기본 제공 심볼 종류. registerSymbol 로 새 종류를 추가할 수 있다. */
export type SymbolType =
  | 'source' // 수전점 / 계통 인입
  | 'bus' // 모선
  | 'breaker' // 차단기 (CB)
  | 'disconnector' // 단로기 (DS)
  | 'fuse' // 퓨즈
  | 'transformer' // 변압기 (2권선)
  | 'generator' // 발전기
  | 'motor' // 전동기
  | 'load' // 부하
  | 'capacitor' // 전력용 콘덴서
  | 'pv' // 태양광
  | 'ess' // 에너지저장장치
  | 'ground' // 접지
  | (string & {});

/** 노드 옆에 붙는 실시간 계측값. */
export interface Measurement {
  /** 이미 포맷된 문자열을 넣는다 — `formatPower(x)` 등. */
  text: string;
  /** 값이 임계를 벗어났을 때 강조한다. */
  emphasis?: boolean;
}

export interface DiagramNode {
  id: string;
  type: SymbolType;
  /** 도면 좌표계에서 심볼의 **중심**. */
  x: number;
  y: number;
  /** 심볼 위/옆에 붙는 이름. */
  label?: string;
  /** 라벨 아래 보조 문구 — 정격, 회선 번호 등. */
  sublabel?: string;
  /** 도(degree). 0 / 90 / 180 / 270 만 의미 있다. */
  rotation?: number;
  /** 전기적 상태. 심볼과 연결선 색을 결정한다. */
  state?: PowerState;
  /** 개폐기류(차단기·단로기)의 접점 상태. */
  switchState?: SwitchState;
  /** 모선 길이. type 이 'bus' 일 때만 쓰인다. */
  length?: number;
  /** 모선 방향. 기본 'horizontal'. */
  orientation?: 'horizontal' | 'vertical';
  /** 심볼 크기 배율. 기본 1. */
  scale?: number;
  measurements?: readonly Measurement[];
  /** 라벨을 놓을 방향. 기본은 심볼별 기본값. */
  labelPlacement?: 'top' | 'bottom' | 'left' | 'right';
  /** 앱이 쓰는 임의 데이터. 렌더러는 건드리지 않는다. */
  meta?: Record<string, unknown>;
}

export interface DiagramLink {
  id: string;
  /** 시작 노드 id. `"nodeId:terminal"` 로 단자를 지정할 수 있다. */
  from: string;
  to: string;
  /** 선 상태. 생략하면 양 끝 노드 상태에서 추론한다. */
  state?: PowerState;
  /** 'orthogonal' 은 직교(맨해튼) 경로, 'direct' 는 직선. 기본 'orthogonal'. */
  routing?: 'orthogonal' | 'direct';
  /** 조류 방향 표시. 'none' 이 기본. */
  flow?: 'forward' | 'reverse' | 'none';
  label?: string;
}

export interface Diagram {
  nodes: readonly DiagramNode[];
  links: readonly DiagramLink[];
}

export interface Point {
  x: number;
  y: number;
}

/** 심볼이 자기 로컬 좌표계에서 노출하는 연결 단자. */
export type Terminals = Record<string, Point>;

export interface SymbolRenderProps {
  node: DiagramNode;
  state: PowerState;
  switchState: SwitchState;
}

export interface SymbolDefinition {
  /** 로컬 좌표계 크기. 원점은 중앙(0,0). */
  width: number;
  height: number;
  /** 연결 단자. 키는 링크에서 `"node:top"` 처럼 참조한다. */
  terminals: Terminals;
  /** 라벨 기본 위치. */
  defaultLabelPlacement?: 'top' | 'bottom' | 'left' | 'right';
  /** 심볼 본체. 상태 색은 CSS 변수 `--sld-state` 로 이미 설정돼 있다. */
  render: (props: SymbolRenderProps) => ReactNode;
}

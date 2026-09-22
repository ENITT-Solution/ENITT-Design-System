import type { ReactNode } from 'react';

/** 다이어그램에서 공통으로 사용하는 시각적 상태. 업무 도메인과 무관하다. */
export type DiagramStatus = 'default' | 'active' | 'success' | 'warning' | 'critical' | 'muted';

/** 기본 제공 심볼 종류. registerSymbol 로 새 종류를 추가할 수 있다. */
export type SymbolType =
  | 'process'
  | 'decision'
  | 'database'
  | 'document'
  | 'start'
  | 'end'
  | 'event'
  | 'note'
  | 'circle'
  | 'hexagon'
  | (string & {});

export type LinkRouting = 'orthogonal' | 'direct';
export type LinkDirection = 'forward' | 'reverse' | 'none';
export type LinkStyle = 'solid' | 'dashed' | 'dotted';

export interface DiagramAnnotation {
  text: string;
  emphasis?: boolean;
}

export interface DiagramNode {
  id: string;
  type: SymbolType;
  /** 도면 좌표계에서 심볼의 중심. */
  x: number;
  y: number;
  label?: string;
  sublabel?: string;
  rotation?: number;
  scale?: number;
  status?: DiagramStatus;
  /** 라벨을 놓을 방향. 기본은 심볼별 기본값이다. */
  labelPlacement?: 'top' | 'bottom' | 'left' | 'right';
  annotations?: readonly DiagramAnnotation[];
  /** 앱이 사용하는 임의 데이터. 렌더러는 건드리지 않는다. */
  meta?: Record<string, unknown>;
}

export interface DiagramLink {
  id: string;
  /** 시작 노드 id. `nodeId:terminal` 로 단자를 지정할 수 있다. */
  from: string;
  to: string;
  status?: DiagramStatus;
  routing?: LinkRouting;
  direction?: LinkDirection;
  style?: LinkStyle;
  label?: string;
}

export interface Diagram {
  nodes: readonly DiagramNode[];
  links: readonly DiagramLink[];
}

export interface DiagramLegendItem {
  status: DiagramStatus;
  label: string;
}

export interface Point {
  x: number;
  y: number;
}

/** 심볼이 자기 로컬 좌표계에서 노출하는 연결 단자. */
export type Terminals = Record<string, Point>;

export interface SymbolRenderProps {
  node: DiagramNode;
  status: DiagramStatus;
}

export interface SymbolDefinition {
  /** 로컬 좌표계 크기. 원점은 중앙(0, 0)이다. */
  width: number;
  height: number;
  terminals: Terminals;
  defaultLabelPlacement?: 'top' | 'bottom' | 'left' | 'right';
  render: (props: SymbolRenderProps) => ReactNode;
}

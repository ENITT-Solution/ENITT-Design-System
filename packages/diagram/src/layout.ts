import { clamp } from '@enitt/core';
import { getSymbol } from './symbols/registry.js';
import type { DiagramNode, Point, SymbolDefinition } from './types.js';

/** 모선의 기본 굵기 (도면 좌표 단위). */
export const BUS_THICKNESS = 5;

const DEFAULT_BUS_LENGTH = 120;

/** 심볼 로컬 좌표를 회전시킨다. 0/90/180/270 외의 각도도 그대로 동작한다. */
export function rotatePoint(point: Point, degrees: number): Point {
  if (!degrees) return point;
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

/** 모선의 양 끝점. */
export function busSegment(node: DiagramNode): [Point, Point] {
  const length = node.length ?? DEFAULT_BUS_LENGTH;
  const half = length / 2;
  return node.orientation === 'vertical'
    ? [
        { x: node.x, y: node.y - half },
        { x: node.x, y: node.y + half },
      ]
    : [
        { x: node.x - half, y: node.y },
        { x: node.x + half, y: node.y },
      ];
}

/**
 * 링크가 노드에 붙을 실제 좌표를 구한다.
 *
 * 모선은 특별 취급한다 — 인출선은 모선 위 **자기 위치에서** 내려와야 하므로,
 * 상대 지점을 모선 위로 수직 투영한 점을 쓴다. 이것이 단선결선도가 읽히는 방식이다.
 */
export function resolveEndpoint(node: DiagramNode, towards: Point, terminalName?: string): Point {
  if (node.type === 'bus') {
    const [start, end] = busSegment(node);
    return node.orientation === 'vertical'
      ? { x: node.x, y: clamp(towards.y, start.y, end.y) }
      : { x: clamp(towards.x, start.x, end.x), y: node.y };
  }

  const definition = getSymbol(node.type);
  if (!definition) return { x: node.x, y: node.y };

  const scale = node.scale ?? 1;
  const rotation = node.rotation ?? 0;

  const toWorld = (local: Point): Point => {
    const rotated = rotatePoint(local, rotation);
    return { x: node.x + rotated.x * scale, y: node.y + rotated.y * scale };
  };

  if (terminalName && definition.terminals[terminalName]) {
    return toWorld(definition.terminals[terminalName]);
  }

  // 단자를 지정하지 않았으면 상대 지점에 가장 가까운 단자를 고른다.
  let best: Point = { x: node.x, y: node.y };
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [name, local] of Object.entries(definition.terminals)) {
    if (name.startsWith('_')) continue; // 내부용 보조 좌표
    const world = toWorld(local);
    const distance = (world.x - towards.x) ** 2 + (world.y - towards.y) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = world;
    }
  }
  return best;
}

/** `"tr-1:top"` → `{ nodeId: 'tr-1', terminal: 'top' }` */
export function parseEndpointRef(ref: string): { nodeId: string; terminal?: string } {
  const index = ref.indexOf(':');
  if (index === -1) return { nodeId: ref };
  return { nodeId: ref.slice(0, index), terminal: ref.slice(index + 1) };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 모든 노드를 감싸는 도면 경계. 라벨 여유까지 포함한다. */
export function diagramBounds(nodes: readonly DiagramNode[]): Bounds | null {
  if (nodes.length === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    let halfWidth: number;
    let halfHeight: number;

    if (node.type === 'bus') {
      const length = node.length ?? DEFAULT_BUS_LENGTH;
      halfWidth = node.orientation === 'vertical' ? BUS_THICKNESS : length / 2;
      halfHeight = node.orientation === 'vertical' ? length / 2 : BUS_THICKNESS;
    } else {
      const definition = getSymbol(node.type);
      const scale = node.scale ?? 1;
      const rotated = ((node.rotation ?? 0) / 90) % 2 !== 0;
      const width = (definition?.width ?? 24) * scale;
      const height = (definition?.height ?? 24) * scale;
      halfWidth = (rotated ? height : width) / 2;
      halfHeight = (rotated ? width : height) / 2;
    }

    minX = Math.min(minX, node.x - halfWidth);
    maxX = Math.max(maxX, node.x + halfWidth);
    minY = Math.min(minY, node.y - halfHeight);
    maxY = Math.max(maxY, node.y + halfHeight);
  }

  return { minX, minY, maxX, maxY };
}

/** 노드 종류의 심볼 정의. 없으면 undefined. */
export const symbolOf = (node: DiagramNode): SymbolDefinition | undefined => getSymbol(node.type);

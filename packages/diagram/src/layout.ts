import { getSymbol } from './symbols/registry.js';
import type { DiagramNode, Point, SymbolDefinition } from './types.js';

/** 심볼 로컬 좌표를 회전시킨다. */
export function rotatePoint(point: Point, degrees: number): Point {
  if (!degrees) return point;
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

/** 링크가 노드에 붙을 실제 좌표를 구한다. */
export function resolveEndpoint(node: DiagramNode, towards: Point, terminalName?: string): Point {
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

  let best: Point = { x: node.x, y: node.y };
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [name, local] of Object.entries(definition.terminals)) {
    if (name.startsWith('_')) continue;
    const world = toWorld(local);
    const distance = (world.x - towards.x) ** 2 + (world.y - towards.y) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = world;
    }
  }
  return best;
}

/** `step-1:right` → `{ nodeId: 'step-1', terminal: 'right' }` */
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

/** 모든 노드를 감싸는 도면 경계. */
export function diagramBounds(nodes: readonly DiagramNode[]): Bounds | null {
  if (nodes.length === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const definition = getSymbol(node.type);
    const scale = node.scale ?? 1;
    const angle = ((node.rotation ?? 0) * Math.PI) / 180;
    const width = (definition?.width ?? 24) * scale;
    const height = (definition?.height ?? 24) * scale;
    const halfWidth = (Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle))) / 2;
    const halfHeight = (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) / 2;

    minX = Math.min(minX, node.x - halfWidth);
    maxX = Math.max(maxX, node.x + halfWidth);
    minY = Math.min(minY, node.y - halfHeight);
    maxY = Math.max(maxY, node.y + halfHeight);
  }

  return { minX, minY, maxX, maxY };
}

export const symbolOf = (node: DiagramNode): SymbolDefinition | undefined => getSymbol(node.type);

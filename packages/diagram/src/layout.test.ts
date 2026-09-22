import { describe, expect, it } from 'vitest';
import { diagramBounds, parseEndpointRef, resolveEndpoint, rotatePoint } from './layout.js';
import type { DiagramNode } from './types.js';

const processNode: DiagramNode = { id: 'step-1', type: 'process', x: 120, y: 80 };

describe('parseEndpointRef', () => {
  it('노드 id와 단자를 나눈다', () => {
    expect(parseEndpointRef('step-1:right')).toEqual({ nodeId: 'step-1', terminal: 'right' });
    expect(parseEndpointRef('step-1')).toEqual({ nodeId: 'step-1' });
  });
});

describe('resolveEndpoint', () => {
  it('지정한 단자를 사용한다', () => {
    expect(resolveEndpoint(processNode, { x: 300, y: 80 }, 'right')).toEqual({ x: 148, y: 80 });
  });

  it('단자를 생략하면 상대 지점에 가장 가까운 단자를 고른다', () => {
    expect(resolveEndpoint(processNode, { x: 300, y: 80 })).toEqual({ x: 148, y: 80 });
    expect(resolveEndpoint(processNode, { x: 120, y: 0 })).toEqual({ x: 120, y: 64 });
  });

  it('회전과 배율을 반영한다', () => {
    const rotated = { ...processNode, rotation: 90, scale: 2 };
    const point = resolveEndpoint(rotated, { x: 120, y: 200 }, 'right');
    expect(point.x).toBeCloseTo(120);
    expect(point.y).toBeCloseTo(136);
  });

  it('등록되지 않은 심볼은 중심을 쓴다', () => {
    expect(resolveEndpoint({ id: 'x', type: 'custom', x: 5, y: 7 }, { x: 0, y: 0 })).toEqual({
      x: 5,
      y: 7,
    });
  });
});

describe('rotatePoint', () => {
  it('90도 회전한다', () => {
    const result = rotatePoint({ x: 10, y: 0 }, 90);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(10);
  });
});

describe('diagramBounds', () => {
  it('심볼 크기와 회전을 반영한다', () => {
    const normal = diagramBounds([processNode])!;
    const rotated = diagramBounds([{ ...processNode, rotation: 90 }])!;
    expect(normal.maxX - normal.minX).toBe(56);
    expect(rotated.maxY - rotated.minY).toBeCloseTo(56);
  });

  it('빈 다이어그램은 null이다', () => {
    expect(diagramBounds([])).toBeNull();
  });
});

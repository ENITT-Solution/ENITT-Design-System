import { describe, expect, it } from 'vitest';
import { rollupSeverity } from '@enitt/core';
import {
  busSegment,
  diagramBounds,
  parseEndpointRef,
  resolveEndpoint,
  rotatePoint,
} from './layout.js';
import { powerSeverity } from './types.js';
import type { DiagramNode, PowerState } from './types.js';

const bus: DiagramNode = {
  id: 'bus-1',
  type: 'bus',
  x: 400,
  y: 360,
  length: 600,
  orientation: 'horizontal',
};

const breaker: DiagramNode = { id: 'cb-1', type: 'breaker', x: 120, y: 430 };

describe('parseEndpointRef', () => {
  it('노드 id 와 단자를 나눈다', () => {
    expect(parseEndpointRef('cb-1:top')).toEqual({ nodeId: 'cb-1', terminal: 'top' });
    expect(parseEndpointRef('cb-1')).toEqual({ nodeId: 'cb-1' });
  });

  it('id 에 콜론이 여러 개면 첫 번째만 구분자로 본다', () => {
    expect(parseEndpointRef('plant:a:top')).toEqual({ nodeId: 'plant', terminal: 'a:top' });
  });
});

describe('busSegment', () => {
  it('중심과 길이로 양 끝점을 만든다', () => {
    expect(busSegment(bus)).toEqual([
      { x: 100, y: 360 },
      { x: 700, y: 360 },
    ]);
  });

  it('수직 모선도 같은 규칙', () => {
    expect(busSegment({ ...bus, orientation: 'vertical' })).toEqual([
      { x: 400, y: 60 },
      { x: 400, y: 660 },
    ]);
  });
});

describe('resolveEndpoint', () => {
  it('모선에는 상대 노드의 x 위치로 내려 꽂힌다 — 인출선이 제자리에서 갈라진다', () => {
    expect(resolveEndpoint(bus, { x: 120, y: 430 })).toEqual({ x: 120, y: 360 });
    expect(resolveEndpoint(bus, { x: 660, y: 430 })).toEqual({ x: 660, y: 360 });
  });

  it('모선 밖으로 나가는 인출선은 끝점에 붙는다', () => {
    expect(resolveEndpoint(bus, { x: 1000, y: 430 })).toEqual({ x: 700, y: 360 });
    expect(resolveEndpoint(bus, { x: -50, y: 430 })).toEqual({ x: 100, y: 360 });
  });

  it('이름을 준 단자를 정확히 쓴다', () => {
    expect(resolveEndpoint(breaker, { x: 120, y: 0 }, 'top')).toEqual({ x: 120, y: 414 });
    expect(resolveEndpoint(breaker, { x: 120, y: 0 }, 'bottom')).toEqual({ x: 120, y: 446 });
  });

  it('단자를 안 주면 상대 지점에 가장 가까운 단자를 고른다', () => {
    expect(resolveEndpoint(breaker, { x: 120, y: 0 }).y).toBe(414);
    expect(resolveEndpoint(breaker, { x: 120, y: 900 }).y).toBe(446);
  });

  it('회전과 배율이 단자 위치에 반영된다', () => {
    const rotated = { ...breaker, rotation: 90 };
    // 90도 돌리면 top 단자가 왼쪽에서 오른쪽으로 간다
    expect(resolveEndpoint(rotated, { x: 0, y: 430 }, 'top')).toEqual({ x: 120 + 16, y: 430 });
    const scaled = { ...breaker, scale: 2 };
    expect(resolveEndpoint(scaled, { x: 120, y: 0 }, 'top')).toEqual({ x: 120, y: 430 - 32 });
  });

  it('등록되지 않은 심볼은 중심을 쓴다', () => {
    expect(resolveEndpoint({ id: 'x', type: 'nope', x: 5, y: 7 }, { x: 0, y: 0 })).toEqual({
      x: 5,
      y: 7,
    });
  });
});

describe('rotatePoint', () => {
  it('0도는 그대로 돌려준다', () => {
    const p = { x: 3, y: 4 };
    expect(rotatePoint(p, 0)).toBe(p);
  });

  it('90도 회전', () => {
    const r = rotatePoint({ x: 0, y: -10 }, 90);
    expect(r.x).toBeCloseTo(10);
    expect(r.y).toBeCloseTo(0);
  });
});

describe('diagramBounds', () => {
  it('모선 길이와 심볼 크기를 모두 감싼다', () => {
    const bounds = diagramBounds([bus, breaker])!;
    expect(bounds.minX).toBeLessThanOrEqual(100);
    expect(bounds.maxX).toBeGreaterThanOrEqual(700);
    expect(bounds.maxY).toBeGreaterThan(430);
  });

  it('빈 도면은 null', () => {
    expect(diagramBounds([])).toBeNull();
  });

  it('회전한 심볼은 가로세로가 뒤바뀐 크기로 잡힌다', () => {
    const tall = diagramBounds([{ id: 'a', type: 'transformer', x: 0, y: 0 }])!;
    const wide = diagramBounds([{ id: 'a', type: 'transformer', x: 0, y: 0, rotation: 90 }])!;
    expect(tall.maxY - tall.minY).toBeGreaterThan(tall.maxX - tall.minX);
    expect(wide.maxX - wide.minX).toBeGreaterThan(wide.maxY - wide.minY);
  });
});

describe('powerSeverity', () => {
  it('전력 상태를 공통 경보 등급으로 옮긴다', () => {
    expect(powerSeverity('fault')).toBe('critical');
    expect(powerSeverity('grounded')).toBe('warning');
    expect(powerSeverity('maintenance')).toBe('info');
    expect(powerSeverity('energized')).toBe('normal');
    expect(powerSeverity('deenergized')).toBe('unknown');
    expect(powerSeverity('unknown')).toBe('unknown');
  });

  /**
   * 계통도의 상태와 대시보드의 배지·표가 같은 언어로 말하게 하는 접점이다.
   * 코어는 업무 도메인을 모르므로, 변환은 도메인 팩이 책임진다.
   */
  it('코어의 심각도 롤업과 맞물린다', () => {
    const states: PowerState[] = ['energized', 'maintenance', 'fault'];
    expect(rollupSeverity(states.map(powerSeverity))).toBe('critical');
  });
});

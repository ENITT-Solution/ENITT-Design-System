import { describe, expect, it } from 'vitest';
// 소비자와 같은 경로로 들여온다 — 패키지 진입점만 보고도 심볼이 살아 있어야 한다.
import { BUILTIN_SYMBOLS, getSymbol, listSymbols, registerSymbol, resetSymbols } from '../index.js';

const EXPECTED = [
  'source',
  'bus',
  'breaker',
  'disconnector',
  'fuse',
  'transformer',
  'generator',
  'motor',
  'load',
  'capacitor',
  'pv',
  'ess',
  'ground',
];

describe('심볼 레지스트리', () => {
  /**
   * 회귀 방지: 예전에는 `import './builtin.js'` 부수효과로 등록했는데,
   * package.json 의 `sideEffects: ["*.css"]` 때문에 번들러가 모듈을 통째로
   * 지워 버려 도면의 모든 기기가 '?' 로 렌더링됐다. 값 import 로 바꾼 뒤에도
   * 같은 실수가 재발하지 않도록 진입점 기준으로 확인한다.
   */
  it('기본 심볼이 별도 등록 없이 살아 있다', () => {
    const registered = listSymbols();
    for (const type of EXPECTED) {
      expect(registered, `${type} 심볼이 등록돼 있어야 합니다`).toContain(type);
    }
  });

  it('모든 기본 심볼에 단자와 크기가 있다', () => {
    for (const type of EXPECTED) {
      const definition = getSymbol(type)!;
      expect(definition, type).toBeDefined();
      expect(definition.width, type).toBeGreaterThan(0);
      expect(definition.height, type).toBeGreaterThan(0);
      expect(Object.keys(definition.terminals).length, type).toBeGreaterThan(0);
    }
  });

  it('같은 이름으로 다시 등록하면 덮어쓴다 — 발주처 표준 심볼 교체', () => {
    const custom = { ...BUILTIN_SYMBOLS.breaker!, width: 999 };
    registerSymbol('breaker', custom);
    expect(getSymbol('breaker')!.width).toBe(999);

    resetSymbols();
    expect(getSymbol('breaker')!.width).toBe(BUILTIN_SYMBOLS.breaker!.width);
  });

  it('등록되지 않은 종류는 undefined', () => {
    expect(getSymbol('없는심볼')).toBeUndefined();
  });
});

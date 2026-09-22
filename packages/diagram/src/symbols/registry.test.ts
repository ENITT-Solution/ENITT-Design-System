import { describe, expect, it } from 'vitest';
import { BUILTIN_SYMBOLS, getSymbol, listSymbols, registerSymbol, resetSymbols } from '../index.js';

const EXPECTED = [
  'process',
  'decision',
  'database',
  'document',
  'start',
  'end',
  'event',
  'note',
  'circle',
  'hexagon',
];

describe('심볼 레지스트리', () => {
  it('범용 기본 심볼이 별도 등록 없이 제공된다', () => {
    expect(listSymbols()).toEqual(expect.arrayContaining(EXPECTED));
  });

  it('모든 기본 심볼에 단자와 크기가 있다', () => {
    for (const type of EXPECTED) {
      const definition = getSymbol(type)!;
      expect(definition.width, type).toBeGreaterThan(0);
      expect(definition.height, type).toBeGreaterThan(0);
      expect(Object.keys(definition.terminals).length, type).toBeGreaterThan(0);
    }
  });

  it('같은 이름으로 다시 등록하면 교체된다', () => {
    const custom = { ...BUILTIN_SYMBOLS.process!, width: 999 };
    registerSymbol('process', custom);
    expect(getSymbol('process')!.width).toBe(999);

    resetSymbols();
    expect(getSymbol('process')!.width).toBe(BUILTIN_SYMBOLS.process!.width);
  });
});

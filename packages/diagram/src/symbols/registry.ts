import { BUILTIN_SYMBOLS } from './builtin.js';
import type { SymbolDefinition, SymbolType } from '../types.js';

/**
 * 심볼 레지스트리.
 *
 * 기본 심볼은 **값으로** 주입한다 (`import { BUILTIN_SYMBOLS }`). 부수효과 import 로
 * 등록하면 번들러가 모듈을 지워 버릴 수 있다 — 패키지의 `sideEffects` 필드가
 * "CSS 외에는 부수효과 없음"이라고 선언하고 있기 때문이다.
 */
const registry = new Map<string, SymbolDefinition>(Object.entries(BUILTIN_SYMBOLS));

/**
 * 심볼을 등록한다. 같은 이름으로 다시 등록하면 덮어쓴다 —
 * 발주처 표준 심볼로 기본 제공 심볼을 갈아끼울 때 쓴다.
 */
export function registerSymbol(type: SymbolType, definition: SymbolDefinition): void {
  registry.set(type, definition);
}

export function getSymbol(type: SymbolType): SymbolDefinition | undefined {
  return registry.get(type);
}

/** 등록된 심볼 종류 목록. 팔레트 UI 를 만들 때 쓴다. */
export function listSymbols(): string[] {
  return [...registry.keys()];
}

/** 기본 심볼만 남기고 되돌린다. 테스트에서 등록 상태를 초기화할 때 쓴다. */
export function resetSymbols(): void {
  registry.clear();
  for (const [type, definition] of Object.entries(BUILTIN_SYMBOLS)) registry.set(type, definition);
}

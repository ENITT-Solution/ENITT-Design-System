/**
 * @enitt/diagram — 계통도(단선결선도) 렌더러
 *
 * 사용법:
 *   import '@enitt/tokens/tokens.css';
 *   import '@enitt/ui/styles.css';
 *   import '@enitt/diagram/styles.css';
 *
 *   <SingleLineDiagram diagram={{ nodes, links }} />
 *
 * 설계 원칙:
 *   · 도면은 선언형 데이터다 — 좌표와 상태만 주면 렌더러가 그린다.
 *   · 상태는 색 + 모양 두 채널로 전달한다 (투입/개방은 채움 여부, 불명은 점선).
 *   · 심볼은 registerSymbol 로 갈아끼울 수 있다 — 발주처 표준 도면에 맞춘다.
 */

export {
  SingleLineDiagram,
  POWER_STATE_LABEL,
  type SingleLineDiagramProps,
} from './components/SingleLineDiagram/SingleLineDiagram.js';

export { registerSymbol, getSymbol, listSymbols, resetSymbols } from './symbols/registry.js';
export { BUILTIN_SYMBOLS } from './symbols/builtin.js';

export {
  busSegment,
  diagramBounds,
  parseEndpointRef,
  resolveEndpoint,
  rotatePoint,
  symbolOf,
  BUS_THICKNESS,
  type Bounds,
} from './layout.js';

export {
  usePanZoom,
  type PanZoomApi,
  type PanZoomOptions,
  type Transform,
} from './hooks/usePanZoom.js';

export { powerSeverity } from './types.js';

export type {
  Diagram,
  DiagramLink,
  DiagramNode,
  Measurement,
  Point,
  PowerState,
  SwitchState,
  SymbolDefinition,
  SymbolRenderProps,
  SymbolType,
  Terminals,
} from './types.js';

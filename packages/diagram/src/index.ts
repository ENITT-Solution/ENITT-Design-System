/**
 * @enitt/diagram — 업무 도메인과 무관한 노드·링크 다이어그램 렌더러.
 */

export {
  DiagramCanvas,
  DIAGRAM_STATUS_LABEL,
  type DiagramCanvasProps,
} from './components/DiagramCanvas/DiagramCanvas.js';

export { registerSymbol, getSymbol, listSymbols, resetSymbols } from './symbols/registry.js';
export { BUILTIN_SYMBOLS } from './symbols/builtin.js';

export {
  diagramBounds,
  parseEndpointRef,
  resolveEndpoint,
  rotatePoint,
  symbolOf,
  type Bounds,
} from './layout.js';

export {
  usePanZoom,
  type PanZoomApi,
  type PanZoomOptions,
  type Transform,
} from './hooks/usePanZoom.js';

export type {
  Diagram,
  DiagramAnnotation,
  DiagramLegendItem,
  DiagramLink,
  DiagramNode,
  DiagramStatus,
  LinkDirection,
  LinkRouting,
  LinkStyle,
  Point,
  SymbolDefinition,
  SymbolRenderProps,
  SymbolType,
  Terminals,
} from './types.js';

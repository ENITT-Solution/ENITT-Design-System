import type { SymbolDefinition } from '../types.js';

const terminals = (halfWidth: number, halfHeight: number): SymbolDefinition['terminals'] => ({
  top: { x: 0, y: -halfHeight },
  right: { x: halfWidth, y: 0 },
  bottom: { x: 0, y: halfHeight },
  left: { x: -halfWidth, y: 0 },
});

/** 업무 영역을 가정하지 않는 흐름도·구성도용 기본 심볼. */
export const BUILTIN_SYMBOLS: Record<string, SymbolDefinition> = {
  process: {
    width: 56,
    height: 32,
    terminals: terminals(28, 16),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <rect className="enitt-diagram__body" x={-28} y={-16} width={56} height={32} rx={5} />
    ),
  },
  decision: {
    width: 42,
    height: 42,
    terminals: terminals(21, 21),
    defaultLabelPlacement: 'bottom',
    render: () => <path className="enitt-diagram__body" d="M 0 -21 L 21 0 L 0 21 L -21 0 Z" />,
  },
  database: {
    width: 44,
    height: 42,
    terminals: terminals(22, 21),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <>
        <path
          className="enitt-diagram__body"
          d="M -22 -14 C -22 -23 22 -23 22 -14 L 22 14 C 22 23 -22 23 -22 14 Z"
        />
        <path className="enitt-diagram__glyph" d="M -22 -14 C -22 -5 22 -5 22 -14" />
      </>
    ),
  },
  document: {
    width: 44,
    height: 42,
    terminals: terminals(22, 21),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <path
        className="enitt-diagram__body"
        d="M -22 -21 H 22 V 14 C 12 7 5 21 -5 14 C -12 9 -17 13 -22 17 Z"
      />
    ),
  },
  start: {
    width: 48,
    height: 28,
    terminals: terminals(24, 14),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <rect
        className="enitt-diagram__body enitt-diagram__body--filled"
        x={-24}
        y={-14}
        width={48}
        height={28}
        rx={14}
      />
    ),
  },
  end: {
    width: 48,
    height: 28,
    terminals: terminals(24, 14),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <>
        <rect className="enitt-diagram__body" x={-24} y={-14} width={48} height={28} rx={14} />
        <rect className="enitt-diagram__glyph" x={-20} y={-10} width={40} height={20} rx={10} />
      </>
    ),
  },
  event: {
    width: 32,
    height: 32,
    terminals: terminals(16, 16),
    defaultLabelPlacement: 'bottom',
    render: () => <circle className="enitt-diagram__body" cx={0} cy={0} r={16} />,
  },
  note: {
    width: 44,
    height: 42,
    terminals: terminals(22, 21),
    defaultLabelPlacement: 'right',
    render: () => (
      <>
        <path className="enitt-diagram__body" d="M -22 -21 H 12 L 22 -11 V 21 H -22 Z" />
        <path className="enitt-diagram__glyph" d="M 12 -21 V -11 H 22" />
      </>
    ),
  },
  circle: {
    width: 40,
    height: 40,
    terminals: terminals(20, 20),
    defaultLabelPlacement: 'bottom',
    render: () => <circle className="enitt-diagram__body" cx={0} cy={0} r={20} />,
  },
  hexagon: {
    width: 48,
    height: 40,
    terminals: terminals(24, 20),
    defaultLabelPlacement: 'bottom',
    render: () => (
      <path className="enitt-diagram__body" d="M -14 -20 H 14 L 24 0 L 14 20 H -14 L -24 0 Z" />
    ),
  },
};

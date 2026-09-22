/**
 * 기본 제공 심볼 세트 (단선결선도용).
 *
 * 좌표계: 심볼마다 원점(0,0)이 **중앙**이다. 단자(terminal)는 이 원점 기준
 * 상대 좌표이며, 링크는 여기에 붙는다.
 *
 * 색은 CSS 변수 `--sld-state` 하나로 흐른다 — 심볼은 stroke/fill 에
 * `currentColor` 나 `var(--sld-state)` 만 쓰고, 상태 판단은 하지 않는다.
 *
 * 등록은 **값으로** 한다. `import './builtin.js'` 같은 부수효과 import 로
 * 등록하면, 패키지 package.json 의 `sideEffects` 설정에 따라 번들러가
 * 이 모듈을 통째로 지워 버린다 (심볼이 전부 '?' 로 나오는 사고).
 */
import type { SymbolDefinition } from '../types.js';

/** 단자에서 심볼 몸체까지 이어 주는 짧은 리드선. */
const lead = (x1: number, y1: number, x2: number, y2: number) => (
  <line className="enitt-sld__lead" x1={x1} y1={y1} x2={x2} y2={y2} />
);

/** 세로로 놓인 인라인 기기(차단기·단로기·퓨즈)의 공통 단자. */
const inlineTerminals = (half: number): SymbolDefinition['terminals'] => ({
  top: { x: 0, y: -half },
  bottom: { x: 0, y: half },
});

/** 발전기(G)·전동기(M)는 글자만 다르다. */
const rotatingMachine = (letter: string): SymbolDefinition => ({
  width: 28,
  height: 32,
  terminals: { top: { x: 0, y: -16 }, bottom: { x: 0, y: 16 } },
  defaultLabelPlacement: 'bottom',
  render: () => (
    <>
      {lead(0, -16, 0, -13)}
      <circle className="enitt-sld__body" cx={0} cy={0} r={13} />
      <text
        className="enitt-sld__glyph-text"
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {letter}
      </text>
    </>
  ),
});

export const BUILTIN_SYMBOLS: Record<string, SymbolDefinition> = {
  // ── 수전점 / 계통 인입 ─────────────────────────────────────
  source: {
    width: 30,
    height: 30,
    terminals: { top: { x: 0, y: -15 }, bottom: { x: 0, y: 15 } },
    defaultLabelPlacement: 'top',
    render: () => (
      <>
        <circle className="enitt-sld__body" cx={0} cy={0} r={12} />
        <path className="enitt-sld__glyph" d="M -6 0 a 3 3 0 0 1 6 0 a 3 3 0 0 0 6 0" />
        {lead(0, 12, 0, 15)}
      </>
    ),
  },

  // ── 모선 ───────────────────────────────────────────────────
  // 길이를 갖는 선이라 SingleLineDiagram 이 직접 그린다. 여기서는 크기만 등록한다.
  bus: {
    width: 120,
    height: 8,
    terminals: { center: { x: 0, y: 0 } },
    defaultLabelPlacement: 'left',
    render: () => null,
  },

  // ── 차단기 (CB) ────────────────────────────────────────────
  // 투입 = 채워진 사각형, 개방 = 빈 사각형. 색이 아니라 **채움 여부**가 접점을 말한다.
  breaker: {
    width: 20,
    height: 32,
    terminals: inlineTerminals(16),
    defaultLabelPlacement: 'right',
    render: ({ switchState }) => (
      <>
        {lead(0, -16, 0, -10)}
        {lead(0, 10, 0, 16)}
        <rect
          className={`enitt-sld__body enitt-sld__switch enitt-sld__switch--${switchState}`}
          x={-10}
          y={-10}
          width={20}
          height={20}
          rx={1}
        />
        {switchState === 'intermediate' && (
          <path className="enitt-sld__glyph" d="M -6 -6 L 6 6 M 6 -6 L -6 6" />
        )}
        {switchState === 'unknown' && (
          <text
            className="enitt-sld__glyph-text"
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
          >
            ?
          </text>
        )}
      </>
    ),
  },

  // ── 단로기 (DS) ────────────────────────────────────────────
  // 개방 시 칼날이 실제로 벌어진다 — 모양만 봐도 열린 것을 안다.
  disconnector: {
    width: 24,
    height: 32,
    terminals: inlineTerminals(16),
    defaultLabelPlacement: 'right',
    render: ({ switchState }) => {
      const open = switchState === 'open' || switchState === 'intermediate';
      return (
        <>
          {lead(0, -16, 0, -12)}
          {lead(0, 12, 0, 16)}
          {/*
            고정 접점의 가로 막대 — 투입 상태에서 칼날이 연결선과 겹쳐
            심볼이 통째로 사라져 보이는 것을 막는다.
          */}
          <line className="enitt-sld__contact" x1={-5} y1={-12} x2={5} y2={-12} />
          <circle className="enitt-sld__pivot" cx={0} cy={12} r={2.2} />
          <line
            className="enitt-sld__blade"
            x1={0}
            y1={12}
            x2={open ? 10 : 0}
            y2={open ? -5 : -12}
          />
        </>
      );
    },
  },

  // ── 퓨즈 ───────────────────────────────────────────────────
  fuse: {
    width: 16,
    height: 30,
    terminals: inlineTerminals(15),
    defaultLabelPlacement: 'right',
    render: () => (
      <>
        {lead(0, -15, 0, -9)}
        {lead(0, 9, 0, 15)}
        <rect className="enitt-sld__body" x={-6} y={-9} width={12} height={18} rx={1} />
        <line className="enitt-sld__glyph" x1={0} y1={-9} x2={0} y2={9} />
      </>
    ),
  },

  // ── 변압기 (2권선) ─────────────────────────────────────────
  transformer: {
    width: 26,
    height: 40,
    terminals: { top: { x: 0, y: -20 }, bottom: { x: 0, y: 20 } },
    defaultLabelPlacement: 'right',
    render: () => (
      <>
        {lead(0, -20, 0, -16)}
        {lead(0, 16, 0, 20)}
        <circle className="enitt-sld__body" cx={0} cy={-6} r={10} />
        <circle className="enitt-sld__body" cx={0} cy={6} r={10} />
      </>
    ),
  },

  // ── 회전기 ─────────────────────────────────────────────────
  generator: rotatingMachine('G'),
  motor: rotatingMachine('M'),

  // ── 부하 ───────────────────────────────────────────────────
  load: {
    width: 20,
    height: 24,
    terminals: { top: { x: 0, y: -12 } },
    defaultLabelPlacement: 'bottom',
    render: () => (
      <>
        {lead(0, -12, 0, -4)}
        <path className="enitt-sld__body enitt-sld__body--filled" d="M -8 -4 L 8 -4 L 0 12 Z" />
      </>
    ),
  },

  // ── 전력용 콘덴서 ──────────────────────────────────────────
  capacitor: {
    width: 22,
    height: 26,
    terminals: { top: { x: 0, y: -13 }, bottom: { x: 0, y: 13 } },
    defaultLabelPlacement: 'right',
    render: () => (
      <>
        {lead(0, -13, 0, -3)}
        {lead(0, 3, 0, 13)}
        <line className="enitt-sld__glyph" x1={-9} y1={-3} x2={9} y2={-3} />
        <line className="enitt-sld__glyph" x1={-9} y1={3} x2={9} y2={3} />
      </>
    ),
  },

  // ── 태양광 ─────────────────────────────────────────────────
  pv: {
    width: 28,
    height: 30,
    terminals: { top: { x: 0, y: -15 }, bottom: { x: 0, y: 15 } },
    defaultLabelPlacement: 'bottom',
    render: () => (
      <>
        {lead(0, -15, 0, -11)}
        <rect className="enitt-sld__body" x={-12} y={-11} width={24} height={22} rx={1} />
        <path className="enitt-sld__glyph" d="M -12 0 L 12 0 M -4 -11 L -4 11 M 4 -11 L 4 11" />
      </>
    ),
  },

  // ── 에너지저장장치 (ESS) ───────────────────────────────────
  ess: {
    width: 28,
    height: 30,
    terminals: { top: { x: 0, y: -15 }, bottom: { x: 0, y: 15 } },
    defaultLabelPlacement: 'bottom',
    render: () => (
      <>
        {lead(0, -15, 0, -10)}
        <rect className="enitt-sld__body" x={-11} y={-10} width={22} height={20} rx={2} />
        <line className="enitt-sld__glyph" x1={-6} y1={-4} x2={-6} y2={4} />
        <line className="enitt-sld__glyph" x1={-10} y1={0} x2={-2} y2={0} />
        <line className="enitt-sld__glyph" x1={2} y1={0} x2={10} y2={0} />
      </>
    ),
  },

  // ── 접지 ───────────────────────────────────────────────────
  ground: {
    width: 20,
    height: 16,
    terminals: { top: { x: 0, y: -8 } },
    defaultLabelPlacement: 'right',
    render: () => (
      <>
        {lead(0, -8, 0, 0)}
        <line className="enitt-sld__glyph" x1={-9} y1={0} x2={9} y2={0} />
        <line className="enitt-sld__glyph" x1={-5.5} y1={4} x2={5.5} y2={4} />
        <line className="enitt-sld__glyph" x1={-2} y1={8} x2={2} y2={8} />
      </>
    ),
  },
};

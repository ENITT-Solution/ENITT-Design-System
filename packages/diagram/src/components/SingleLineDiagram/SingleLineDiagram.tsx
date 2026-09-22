import { useEffect, useMemo, type KeyboardEvent, type ReactNode, type SVGProps } from 'react';
import { cx } from '@enitt/core';
import { Button, useElementSize } from '@enitt/ui';
import {
  BUS_THICKNESS,
  busSegment,
  diagramBounds,
  parseEndpointRef,
  resolveEndpoint,
  symbolOf,
} from '../../layout.js';
import { usePanZoom } from '../../hooks/usePanZoom.js';
import type {
  Diagram,
  DiagramLink,
  DiagramNode,
  Point,
  PowerState,
  SwitchState,
} from '../../types.js';
import './SingleLineDiagram.css';

export const POWER_STATE_LABEL: Record<PowerState, string> = {
  energized: '가압',
  deenergized: '정전',
  fault: '고장',
  grounded: '접지',
  maintenance: '점검',
  unknown: '불명',
};

export interface SingleLineDiagramProps {
  diagram: Diagram;
  /** 그리기 영역 높이. 기본 420px. */
  height?: number | string;
  selectedId?: string | null;
  onSelectNode?: (node: DiagramNode) => void;
  onSelectLink?: (link: DiagramLink) => void;
  /** 가압 선로에 조류 방향 애니메이션을 흘린다. */
  showFlow?: boolean;
  /** 확대/축소·전체보기 버튼. */
  showToolbar?: boolean;
  /** 상태 색 범례. 색만으로 상태를 전달하지 않기 위해 기본 true. */
  showLegend?: boolean;
  /** 팬/줌 잠금. 미니맵이나 인쇄용 정적 렌더에 쓴다. */
  interactive?: boolean;
  /** 마운트 시 전체가 보이도록 맞춘다. 기본 true. */
  fitOnMount?: boolean;
  ariaLabel?: string;
  className?: string;
}

/** 링크 상태를 양 끝 노드에서 추론한다. 명시된 state 가 있으면 그것이 우선. */
function inferLinkState(link: DiagramLink, from?: DiagramNode, to?: DiagramNode): PowerState {
  if (link.state) return link.state;
  const a = from?.state ?? 'unknown';
  const b = to?.state ?? 'unknown';
  if (a === 'fault' || b === 'fault') return 'fault';
  if (a === 'grounded' || b === 'grounded') return 'grounded';
  if (a === b) return a;
  // 한쪽만 가압이면 사이의 개폐기 상태에 달렸다 — 단정하지 않는다.
  return 'unknown';
}

function linkPath(start: Point, end: Point, routing: DiagramLink['routing']): string {
  if (routing === 'direct' || start.x === end.x || start.y === end.y) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  // 전기 도면은 대각선을 쓰지 않는다 — 세로로 내린 뒤 가로로 꺾는다.
  return `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
}

/**
 * 단선결선도(SLD) 렌더러.
 *
 * 노드·링크 배열을 받아 SVG 로 그린다. 상태 색은 `--sld-state` 한 변수로 흐르고,
 * 개폐기 접점은 **색이 아니라 모양**(채움·칼날 각도)으로도 드러난다 —
 * 색각 이상 사용자와 흑백 인쇄를 위해서다.
 *
 * 가압/정전 색 관례는 `<ThemeProvider powerConvention>` 에서 바꾼다.
 */
export function SingleLineDiagram({
  diagram,
  height = 420,
  selectedId,
  onSelectNode,
  onSelectLink,
  showFlow = false,
  showToolbar = true,
  showLegend = true,
  interactive = true,
  fitOnMount = true,
  ariaLabel,
  className,
}: SingleLineDiagramProps) {
  const [containerRef, size] = useElementSize({
    width: 800,
    height: typeof height === 'number' ? height : 420,
  });
  const panZoom = usePanZoom({ enabled: interactive });
  const { setViewport, fit } = panZoom;

  const nodeById = useMemo(
    () => new Map(diagram.nodes.map((node) => [node.id, node])),
    [diagram.nodes],
  );

  const bounds = useMemo(() => diagramBounds(diagram.nodes), [diagram.nodes]);

  useEffect(() => {
    setViewport(size);
  }, [setViewport, size]);

  // 도구모음(위)과 범례(아래)가 도면을 가리지 않도록 그만큼 여백을 확보한다.
  const fitPadding = useMemo(
    () => ({
      top: showToolbar && interactive ? 56 : 24,
      right: 24,
      bottom: showLegend ? 72 : 24,
      left: 24,
    }),
    [showToolbar, interactive, showLegend],
  );

  useEffect(() => {
    if (fitOnMount && bounds && size.width > 0) fit(bounds, fitPadding);
    // 도면이 바뀌면 다시 맞춘다. 사용자가 확대해 둔 상태를 유지하고 싶다면 fitOnMount 를 끈다.
  }, [fitOnMount, bounds, size.width, size.height, fit, fitPadding]);

  const resolved = useMemo(
    () =>
      diagram.links.map((link) => {
        const fromRef = parseEndpointRef(link.from);
        const toRef = parseEndpointRef(link.to);
        const fromNode = nodeById.get(fromRef.nodeId);
        const toNode = nodeById.get(toRef.nodeId);
        if (!fromNode || !toNode) return null;

        // 모선 투영을 위해 상대 노드의 중심을 먼저 알려 주고, 그 결과로 다시 보정한다.
        const roughStart = resolveEndpoint(
          fromNode,
          { x: toNode.x, y: toNode.y },
          fromRef.terminal,
        );
        const end = resolveEndpoint(toNode, roughStart, toRef.terminal);
        const start = resolveEndpoint(fromNode, end, fromRef.terminal);

        return { link, start, end, state: inferLinkState(link, fromNode, toNode) };
      }),
    [diagram.links, nodeById],
  );

  return (
    <div className={cx('enitt-sld', className)} ref={containerRef} style={{ blockSize: height }}>
      <svg
        className={cx('enitt-sld__canvas', panZoom.isPanning && 'enitt-sld__canvas--panning')}
        width="100%"
        height="100%"
        role="img"
        aria-label={ariaLabel ?? `계통도, 기기 ${diagram.nodes.length}개`}
        tabIndex={interactive ? 0 : -1}
        {...(interactive ? panZoom.handlers : {})}
      >
        <defs>
          <marker
            id="enitt-sld-flow"
            viewBox="0 0 8 8"
            refX={4}
            refY={4}
            markerWidth={5}
            markerHeight={5}
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="context-stroke" />
          </marker>
        </defs>

        <g
          transform={`translate(${panZoom.transform.x} ${panZoom.transform.y}) scale(${panZoom.transform.k})`}
        >
          {/* ── 선로 ── 노드보다 먼저 그려 뒤로 보낸다 ── */}
          <g className="enitt-sld__links">
            {resolved.map((item) => {
              if (!item) return null;
              const { link, start, end, state } = item;
              return (
                <g
                  key={link.id}
                  className={cx(
                    'enitt-sld__link',
                    `enitt-sld__link--${state}`,
                    selectedId === link.id && 'enitt-sld__link--selected',
                    showFlow && link.flow && link.flow !== 'none' && 'enitt-sld__link--flowing',
                  )}
                  onClick={onSelectLink ? () => onSelectLink(link) : undefined}
                >
                  {/* 넓은 투명 히트 영역 — 2px 선을 정확히 짚게 하지 않는다 */}
                  {onSelectLink && (
                    <path className="enitt-sld__link-hit" d={linkPath(start, end, link.routing)} />
                  )}
                  <path
                    className="enitt-sld__link-line"
                    d={linkPath(start, end, link.routing)}
                    markerEnd={
                      showFlow && link.flow === 'forward' ? 'url(#enitt-sld-flow)' : undefined
                    }
                    markerStart={
                      showFlow && link.flow === 'reverse' ? 'url(#enitt-sld-flow)' : undefined
                    }
                  />
                  {link.label && (
                    <text
                      className="enitt-sld__link-label"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 4}
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* ── 기기 ── */}
          <g className="enitt-sld__nodes">
            {diagram.nodes.map((node) => (
              <DiagramNodeView
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onSelect={onSelectNode}
              />
            ))}
          </g>
        </g>
      </svg>

      {showToolbar && interactive && (
        <div className="enitt-sld__toolbar">
          <Button
            size="sm"
            variant="outline"
            onClick={() => panZoom.zoomBy(1.25)}
            aria-label="확대"
          >
            +
          </Button>
          <Button size="sm" variant="outline" onClick={() => panZoom.zoomBy(0.8)} aria-label="축소">
            −
          </Button>
          <Button size="sm" variant="outline" onClick={() => bounds && fit(bounds, fitPadding)}>
            전체
          </Button>
        </div>
      )}

      {showLegend && <PowerStateLegend states={usedStates(diagram)} />}
    </div>
  );
}

/** 도면에 실제로 등장하는 상태만 범례에 넣는다. */
function usedStates(diagram: Diagram): PowerState[] {
  const set = new Set<PowerState>();
  for (const node of diagram.nodes) if (node.state) set.add(node.state);
  for (const link of diagram.links) if (link.state) set.add(link.state);
  const order: PowerState[] = [
    'energized',
    'deenergized',
    'fault',
    'grounded',
    'maintenance',
    'unknown',
  ];
  return order.filter((state) => set.has(state));
}

/** 상태별 선 패턴. CSS 의 --sld-dash 와 같은 값이어야 한다. */
const LEGEND_DASH: Record<PowerState, string | undefined> = {
  energized: undefined,
  deenergized: undefined,
  fault: '7 3 1.5 3',
  grounded: '3 3',
  maintenance: '10 5',
  unknown: '1.5 3.5',
};

/**
 * 상태 범례.
 *
 * 색 칩이 아니라 **실제 선 패턴**을 그린다. 가압(녹)과 고장(적)은 적록색약에서
 * ΔE 3.6 으로 사실상 같은 색이라, 독자가 도면에서 실제로 의지하는 것은 패턴이다 —
 * 범례가 그 패턴을 가르쳐 주지 않으면 소용이 없다.
 */
function PowerStateLegend({ states }: { states: readonly PowerState[] }) {
  if (states.length === 0) return null;
  return (
    <ul className="enitt-sld__legend">
      {states.map((state) => (
        <li
          key={state}
          className={cx('enitt-sld__legend-item', `enitt-sld__legend-item--${state}`)}
        >
          <svg className="enitt-sld__legend-swatch" viewBox="0 0 24 8" aria-hidden="true">
            <line
              className="enitt-sld__legend-line"
              x1={1}
              y1={4}
              x2={23}
              y2={4}
              strokeDasharray={LEGEND_DASH[state]}
            />
          </svg>
          {POWER_STATE_LABEL[state]}
        </li>
      ))}
    </ul>
  );
}

interface DiagramNodeViewProps {
  node: DiagramNode;
  selected: boolean;
  onSelect?: (node: DiagramNode) => void;
}

function DiagramNodeView({ node, selected, onSelect }: DiagramNodeViewProps): ReactNode {
  const state: PowerState = node.state ?? 'unknown';
  const switchState: SwitchState = node.switchState ?? 'unknown';
  const definition = symbolOf(node);
  const interactive = typeof onSelect === 'function';

  const commonProps = {
    className: cx(
      'enitt-sld__node',
      `enitt-sld__node--${state}`,
      selected && 'enitt-sld__node--selected',
      interactive && 'enitt-sld__node--interactive',
    ),
    onClick: interactive ? () => onSelect(node) : undefined,
    onKeyDown: interactive
      ? (event: KeyboardEvent<SVGGElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(node);
          }
        }
      : undefined,
    tabIndex: interactive ? 0 : undefined,
    role: interactive ? 'button' : undefined,
    'aria-label': interactive ? `${node.label ?? node.id}, ${POWER_STATE_LABEL[state]}` : undefined,
  };

  // ── 모선은 길이를 갖는 선이라 별도로 그린다 ──
  if (node.type === 'bus') {
    const [start, end] = busSegment(node);
    return (
      <g {...commonProps}>
        <title>{`${node.label ?? node.id} · ${POWER_STATE_LABEL[state]}`}</title>
        <line
          className="enitt-sld__bus"
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          strokeWidth={BUS_THICKNESS}
        />
        {node.label && (
          <text
            className="enitt-sld__label"
            x={start.x - 8}
            y={start.y}
            textAnchor="end"
            dominantBaseline="middle"
          >
            {node.label}
          </text>
        )}
        <NodeMeasurements node={node} x={end.x} y={start.y - 10} anchor="end" />
      </g>
    );
  }

  if (!definition) {
    // 등록되지 않은 심볼 — 조용히 사라지면 도면이 틀렸다는 걸 알 수 없다.
    return (
      <g {...commonProps} transform={`translate(${node.x} ${node.y})`}>
        <rect className="enitt-sld__missing" x={-12} y={-12} width={24} height={24} rx={2} />
        <text
          className="enitt-sld__missing-text"
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ?
        </text>
        <title>{`등록되지 않은 심볼: ${node.type}`}</title>
      </g>
    );
  }

  const placement = node.labelPlacement ?? definition.defaultLabelPlacement ?? 'right';
  const halfWidth = (definition.width / 2) * (node.scale ?? 1);
  const halfHeight = (definition.height / 2) * (node.scale ?? 1);

  const label = labelLayout(placement, halfWidth, halfHeight, Boolean(node.sublabel));

  return (
    <g {...commonProps}>
      <title>{`${node.label ?? node.id} · ${POWER_STATE_LABEL[state]}`}</title>

      {/* 심볼 본체만 회전한다 — 글자는 항상 수평이어야 읽힌다 */}
      <g
        className="enitt-sld__symbol"
        transform={`translate(${node.x} ${node.y}) rotate(${node.rotation ?? 0}) scale(${node.scale ?? 1})`}
      >
        {definition.render({ node, state, switchState })}
      </g>

      <g transform={`translate(${node.x} ${node.y})`}>
        {node.label && (
          <text
            className="enitt-sld__label"
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline={label.baseline}
          >
            {node.label}
          </text>
        )}
        {node.sublabel && (
          <text
            className="enitt-sld__sublabel"
            x={label.x}
            y={label.sublabelY}
            textAnchor={label.anchor}
            dominantBaseline={label.baseline}
          >
            {node.sublabel}
          </text>
        )}
        <NodeMeasurements
          node={node}
          x={label.measurementX ?? label.x}
          y={label.measurementY}
          anchor={label.measurementAnchor ?? label.anchor}
        />
      </g>
    </g>
  );
}

function NodeMeasurements({
  node,
  x,
  y,
  anchor,
}: {
  node: DiagramNode;
  x: number;
  y: number;
  anchor: TextAnchor;
}): ReactNode {
  if (!node.measurements?.length) return null;

  return (
    <g className="enitt-sld__measurements">
      {node.measurements.map((measurement, index) => (
        <text
          key={measurement.text}
          className={cx(
            'enitt-sld__measurement',
            measurement.emphasis && 'enitt-sld__measurement--emphasis',
          )}
          x={x}
          y={y + index * 11}
          textAnchor={anchor}
        >
          {measurement.text}
        </text>
      ))}
    </g>
  );
}

type TextAnchor = 'start' | 'end' | 'middle';

interface LabelLayout {
  x: number;
  y: number;
  sublabelY: number;
  /** 라벨·부제 아래(또는 옆)로 밀어 둔 계측값의 첫 줄 위치. */
  measurementY: number;
  /** 계측값을 라벨과 다른 x 에 두어야 할 때만 지정한다. */
  measurementX?: number;
  measurementAnchor?: TextAnchor;
  anchor: TextAnchor;
  baseline: SVGProps<SVGTextElement>['dominantBaseline'];
}

/**
 * 라벨 · 부제 · 계측값의 자리를 한 번에 계산한다.
 *
 * 세 가지를 따로 배치하면 부제가 있는 노드에서 계측값과 겹친다 — 실제로 겹쳤다.
 * 위쪽 배치에서는 **이름이 위, 정격이 아래**가 되도록 순서를 뒤집는다.
 */
function labelLayout(
  placement: string,
  halfWidth: number,
  halfHeight: number,
  hasSublabel: boolean,
): LabelLayout {
  const LINE = 11;

  switch (placement) {
    case 'top': {
      // 위로 쌓을 때는 심볼에 가까운 줄이 아래다 → 부제를 아래, 이름을 위에 둔다.
      const sublabelY = -halfHeight - 6;
      return {
        x: 0,
        y: hasSublabel ? sublabelY - LINE : sublabelY,
        sublabelY,
        // 아래는 인출 도체가 지나가므로 계측값은 옆으로 뺀다.
        measurementX: halfWidth + 6,
        measurementY: 0,
        measurementAnchor: 'start',
        anchor: 'middle',
        baseline: 'auto',
      };
    }
    case 'bottom': {
      const y = halfHeight + 14;
      const sublabelY = y + LINE;
      return {
        x: 0,
        y,
        sublabelY,
        measurementY: (hasSublabel ? sublabelY : y) + LINE,
        anchor: 'middle',
        baseline: 'auto',
      };
    }
    case 'left':
      return {
        x: -halfWidth - 6,
        y: 0,
        sublabelY: LINE,
        measurementY: hasSublabel ? LINE * 2 : LINE,
        anchor: 'end',
        baseline: 'middle',
      };
    default:
      return {
        x: halfWidth + 6,
        y: 0,
        sublabelY: LINE,
        measurementY: hasSublabel ? LINE * 2 : LINE,
        anchor: 'start',
        baseline: 'middle',
      };
  }
}

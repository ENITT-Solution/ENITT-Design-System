import {
  useEffect,
  useId,
  useMemo,
  type KeyboardEvent,
  type ReactNode,
  type SVGProps,
} from 'react';
import { cx } from '@enitt/core';
import { Button, useElementSize } from '@enitt/ui';
import { diagramBounds, parseEndpointRef, resolveEndpoint, symbolOf } from '../../layout.js';
import { usePanZoom } from '../../hooks/usePanZoom.js';
import type {
  Diagram,
  DiagramLegendItem,
  DiagramLink,
  DiagramNode,
  DiagramStatus,
  LinkRouting,
  Point,
} from '../../types.js';
import './DiagramCanvas.css';

export const DIAGRAM_STATUS_LABEL: Record<DiagramStatus, string> = {
  default: '기본',
  active: '진행 중',
  success: '정상',
  warning: '주의',
  critical: '오류',
  muted: '비활성',
};

export interface DiagramCanvasProps {
  diagram: Diagram;
  /** 그리기 영역 높이. 기본 420px. */
  height?: number | string;
  selectedId?: string | null;
  onSelectNode?: (node: DiagramNode) => void;
  onSelectLink?: (link: DiagramLink) => void;
  /** 확대·축소·전체 보기 버튼. */
  showToolbar?: boolean;
  /** 상태 범례. 전달하지 않으면 범례를 렌더링하지 않는다. */
  legend?: readonly DiagramLegendItem[];
  /** 팬·줌 잠금. 인쇄나 캡처용 정적 렌더에 쓴다. */
  interactive?: boolean;
  /** 마운트 시 전체가 보이도록 맞춘다. 기본 true. */
  fitOnMount?: boolean;
  /** 접근성 이름과 범례에 사용할 상태 라벨을 교체한다. */
  statusLabels?: Partial<Record<DiagramStatus, string>>;
  ariaLabel?: string;
  className?: string;
}

function linkPath(start: Point, end: Point, routing: LinkRouting | undefined): string {
  if (routing === 'direct' || start.x === end.x || start.y === end.y) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  const middleX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} H ${middleX} V ${end.y} H ${end.x}`;
}

/** 노드와 링크 데이터를 SVG로 렌더링하는 범용 다이어그램 캔버스. */
export function DiagramCanvas({
  diagram,
  height = 420,
  selectedId,
  onSelectNode,
  onSelectLink,
  showToolbar = true,
  legend,
  interactive = true,
  fitOnMount = true,
  statusLabels,
  ariaLabel,
  className,
}: DiagramCanvasProps) {
  const [containerRef, size] = useElementSize({
    width: 800,
    height: typeof height === 'number' ? height : 420,
  });
  const panZoom = usePanZoom({ enabled: interactive });
  const { setViewport, fit } = panZoom;
  const markerId = `enitt-diagram-arrow-${useId().replace(/:/g, '')}`;
  const labels = useMemo(() => ({ ...DIAGRAM_STATUS_LABEL, ...statusLabels }), [statusLabels]);

  const nodeById = useMemo(
    () => new Map(diagram.nodes.map((node) => [node.id, node])),
    [diagram.nodes],
  );
  const bounds = useMemo(() => diagramBounds(diagram.nodes), [diagram.nodes]);

  useEffect(() => {
    setViewport(size);
  }, [setViewport, size]);

  const fitPadding = useMemo(
    () => ({
      top: showToolbar && interactive ? 56 : 24,
      right: 24,
      bottom: legend?.length ? 64 : 24,
      left: 24,
    }),
    [showToolbar, interactive, legend],
  );

  useEffect(() => {
    if (fitOnMount && bounds && size.width > 0) fit(bounds, fitPadding);
  }, [fitOnMount, bounds, size.width, size.height, fit, fitPadding]);

  const resolvedLinks = useMemo(
    () =>
      diagram.links.map((link) => {
        const fromRef = parseEndpointRef(link.from);
        const toRef = parseEndpointRef(link.to);
        const fromNode = nodeById.get(fromRef.nodeId);
        const toNode = nodeById.get(toRef.nodeId);
        if (!fromNode || !toNode) return null;

        const roughStart = resolveEndpoint(
          fromNode,
          { x: toNode.x, y: toNode.y },
          fromRef.terminal,
        );
        const end = resolveEndpoint(toNode, roughStart, toRef.terminal);
        const start = resolveEndpoint(fromNode, end, fromRef.terminal);
        return { link, start, end };
      }),
    [diagram.links, nodeById],
  );

  return (
    <div
      className={cx('enitt-diagram', className)}
      ref={containerRef}
      style={{ blockSize: height }}
    >
      <svg
        className={cx(
          'enitt-diagram__canvas',
          panZoom.isPanning && 'enitt-diagram__canvas--panning',
        )}
        width="100%"
        height="100%"
        role="img"
        aria-label={ariaLabel ?? `다이어그램, 노드 ${diagram.nodes.length}개`}
        tabIndex={interactive ? 0 : -1}
        {...(interactive ? panZoom.handlers : {})}
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 8 8"
            refX={6}
            refY={4}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" fill="context-stroke" />
          </marker>
        </defs>

        <g
          transform={`translate(${panZoom.transform.x} ${panZoom.transform.y}) scale(${panZoom.transform.k})`}
        >
          <g className="enitt-diagram__links">
            {resolvedLinks.map((resolved) => {
              if (!resolved) return null;
              const { link, start, end } = resolved;
              const status = link.status ?? 'default';
              const path = linkPath(start, end, link.routing);
              return (
                <g
                  key={link.id}
                  className={cx(
                    'enitt-diagram__link',
                    `enitt-diagram__status--${status}`,
                    `enitt-diagram__link--${link.style ?? 'solid'}`,
                    selectedId === link.id && 'enitt-diagram__link--selected',
                  )}
                  onClick={onSelectLink ? () => onSelectLink(link) : undefined}
                >
                  {onSelectLink && <path className="enitt-diagram__link-hit" d={path} />}
                  <path
                    className="enitt-diagram__link-line"
                    d={path}
                    markerEnd={link.direction === 'forward' ? `url(#${markerId})` : undefined}
                    markerStart={link.direction === 'reverse' ? `url(#${markerId})` : undefined}
                  />
                  {link.label && (
                    <text
                      className="enitt-diagram__link-label"
                      x={(start.x + end.x) / 2}
                      y={(start.y + end.y) / 2 - 6}
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          <g className="enitt-diagram__nodes">
            {diagram.nodes.map((node) => (
              <DiagramNodeView
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onSelect={onSelectNode}
                statusLabel={labels[node.status ?? 'default']}
              />
            ))}
          </g>
        </g>
      </svg>

      {showToolbar && interactive && (
        <div className="enitt-diagram__toolbar">
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

      {legend && legend.length > 0 && <DiagramLegend items={legend} />}
    </div>
  );
}

function DiagramLegend({ items }: { items: readonly DiagramLegendItem[] }) {
  return (
    <ul className="enitt-diagram__legend">
      {items.map((item) => (
        <li key={item.status} className={`enitt-diagram__status--${item.status}`}>
          <span className="enitt-diagram__legend-swatch" aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

interface DiagramNodeViewProps {
  node: DiagramNode;
  selected: boolean;
  statusLabel: string;
  onSelect?: (node: DiagramNode) => void;
}

function DiagramNodeView({
  node,
  selected,
  statusLabel,
  onSelect,
}: DiagramNodeViewProps): ReactNode {
  const status = node.status ?? 'default';
  const definition = symbolOf(node);
  const interactive = typeof onSelect === 'function';
  const accessibleName = `${node.label ?? node.id}, ${statusLabel}`;

  const commonProps = {
    className: cx(
      'enitt-diagram__node',
      `enitt-diagram__status--${status}`,
      selected && 'enitt-diagram__node--selected',
      interactive && 'enitt-diagram__node--interactive',
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
    'aria-label': interactive ? accessibleName : undefined,
  };

  if (!definition) {
    return (
      <g {...commonProps} transform={`translate(${node.x} ${node.y})`}>
        <rect className="enitt-diagram__missing" x={-14} y={-14} width={28} height={28} rx={3} />
        <text
          className="enitt-diagram__missing-text"
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
      <title>{accessibleName}</title>
      <g
        className="enitt-diagram__symbol"
        transform={`translate(${node.x} ${node.y}) rotate(${node.rotation ?? 0}) scale(${node.scale ?? 1})`}
      >
        {definition.render({ node, status })}
      </g>

      <g transform={`translate(${node.x} ${node.y})`}>
        {node.label && (
          <text
            className="enitt-diagram__label"
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
            className="enitt-diagram__sublabel"
            x={label.x}
            y={label.sublabelY}
            textAnchor={label.anchor}
            dominantBaseline={label.baseline}
          >
            {node.sublabel}
          </text>
        )}
        <NodeAnnotations
          node={node}
          x={label.annotationX ?? label.x}
          y={label.annotationY}
          anchor={label.annotationAnchor ?? label.anchor}
        />
      </g>
    </g>
  );
}

function NodeAnnotations({
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
  if (!node.annotations?.length) return null;
  return (
    <g className="enitt-diagram__annotations">
      {node.annotations.map((annotation, index) => (
        <text
          key={`${annotation.text}-${index}`}
          className={cx(
            'enitt-diagram__annotation',
            annotation.emphasis && 'enitt-diagram__annotation--emphasis',
          )}
          x={x}
          y={y + index * 12}
          textAnchor={anchor}
        >
          {annotation.text}
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
  annotationY: number;
  annotationX?: number;
  annotationAnchor?: TextAnchor;
  anchor: TextAnchor;
  baseline: SVGProps<SVGTextElement>['dominantBaseline'];
}

function labelLayout(
  placement: DiagramNode['labelPlacement'],
  halfWidth: number,
  halfHeight: number,
  hasSublabel: boolean,
): LabelLayout {
  const line = 12;
  switch (placement) {
    case 'top': {
      const sublabelY = -halfHeight - 8;
      return {
        x: 0,
        y: hasSublabel ? sublabelY - line : sublabelY,
        sublabelY,
        annotationX: halfWidth + 8,
        annotationY: 0,
        annotationAnchor: 'start',
        anchor: 'middle',
        baseline: 'auto',
      };
    }
    case 'bottom': {
      const y = halfHeight + 16;
      const sublabelY = y + line;
      return {
        x: 0,
        y,
        sublabelY,
        annotationY: (hasSublabel ? sublabelY : y) + line,
        anchor: 'middle',
        baseline: 'auto',
      };
    }
    case 'left':
      return {
        x: -halfWidth - 8,
        y: 0,
        sublabelY: line,
        annotationY: hasSublabel ? line * 2 : line,
        anchor: 'end',
        baseline: 'middle',
      };
    default:
      return {
        x: halfWidth + 8,
        y: 0,
        sublabelY: line,
        annotationY: hasSublabel ? line * 2 : line,
        anchor: 'start',
        baseline: 'middle',
      };
  }
}

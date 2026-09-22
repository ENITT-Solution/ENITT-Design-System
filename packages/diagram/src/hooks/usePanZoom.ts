import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from '@enitt/core';

export interface Transform {
  x: number;
  y: number;
  k: number;
}

/** 도면을 맞출 때 확보할 사방 여백. 범례·도구모음이 가리는 만큼 준다. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PanZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  /** 휠 한 칸당 배율. 기본 1.12. */
  zoomStep?: number;
  /** false 면 팬/줌을 잠근다 (읽기 전용 미니맵 등). */
  enabled?: boolean;
}

export interface PanZoomApi {
  transform: Transform;
  /** SVG 에 붙일 이벤트 핸들러. */
  handlers: {
    onWheel: (event: React.WheelEvent<SVGSVGElement>) => void;
    onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
    onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
    onPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<SVGSVGElement>) => void;
  };
  /** 지정한 도면 영역이 화면에 꽉 차도록 맞춘다. */
  fit: (
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    padding?: number | Partial<Insets>,
  ) => void;
  zoomBy: (factor: number) => void;
  reset: () => void;
  isPanning: boolean;
  /** 컨테이너 크기를 알려 준다. fit 계산에 필요하다. */
  setViewport: (size: { width: number; height: number }) => void;
}

const IDENTITY: Transform = { x: 0, y: 0, k: 1 };

/**
 * 계통도용 팬/줌.
 *
 * 줌은 **커서를 중심으로** 확대된다 — 확대할 때마다 보고 있던 지점이 화면 밖으로
 * 달아나면 도면을 읽을 수 없기 때문이다.
 * 키보드(방향키 이동, +/- 확대, 0 초기화)로도 같은 조작이 가능하다.
 */
export function usePanZoom({
  minZoom = 0.2,
  maxZoom = 8,
  zoomStep = 1.12,
  enabled = true,
}: PanZoomOptions = {}): PanZoomApi {
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [isPanning, setIsPanning] = useState(false);
  const panOrigin = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const viewport = useRef({ width: 0, height: 0 });

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setTransform((prev) => {
        const k = clamp(prev.k * factor, minZoom, maxZoom);
        if (k === prev.k) return prev;
        // 커서 아래 도면 좌표가 그대로 유지되도록 평행이동을 보정한다.
        const ratio = k / prev.k;
        return { k, x: cx - (cx - prev.x) * ratio, y: cy - (cy - prev.y) * ratio };
      });
    },
    [minZoom, maxZoom],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent<SVGSVGElement>) => {
      if (!enabled) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const factor = event.deltaY < 0 ? zoomStep : 1 / zoomStep;
      zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
    },
    [enabled, zoomStep, zoomAt],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      // 주 버튼(또는 휠 버튼)으로만 팬한다 — 우클릭 메뉴를 가로채지 않는다.
      if (!enabled || (event.button !== 0 && event.button !== 1)) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      panOrigin.current = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
      setIsPanning(true);
    },
    [enabled, transform.x, transform.y],
  );

  const onPointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const origin = panOrigin.current;
    if (!origin) return;
    setTransform((prev) => ({
      ...prev,
      x: origin.tx + (event.clientX - origin.x),
      y: origin.ty + (event.clientY - origin.y),
    }));
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (!panOrigin.current) return;
    panOrigin.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const zoomBy = useCallback(
    (factor: number) => zoomAt(factor, viewport.current.width / 2, viewport.current.height / 2),
    [zoomAt],
  );

  const reset = useCallback(() => setTransform(IDENTITY), []);

  const fit = useCallback<PanZoomApi['fit']>(
    (bounds, padding = 32) => {
      const { width, height } = viewport.current;
      if (width <= 0 || height <= 0) return;

      const pad =
        typeof padding === 'number'
          ? { top: padding, right: padding, bottom: padding, left: padding }
          : { top: 32, right: 32, bottom: 32, left: 32, ...padding };

      const boxWidth = Math.max(1, width - pad.left - pad.right);
      const boxHeight = Math.max(1, height - pad.top - pad.bottom);
      const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
      const contentHeight = Math.max(1, bounds.maxY - bounds.minY);

      const k = clamp(
        Math.min(boxWidth / contentWidth, boxHeight / contentHeight),
        minZoom,
        maxZoom,
      );

      // 여백을 뺀 영역의 한가운데에 맞춘다 — 범례·도구모음이 가린 쪽으로 밀리지 않는다.
      setTransform({
        k,
        x: pad.left + boxWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * k,
        y: pad.top + boxHeight / 2 - ((bounds.minY + bounds.maxY) / 2) * k,
      });
    },
    [minZoom, maxZoom],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (!enabled) return;
      const step = event.shiftKey ? 80 : 24;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [step, 0],
        ArrowRight: [-step, 0],
        ArrowUp: [0, step],
        ArrowDown: [0, -step],
      };
      const move = moves[event.key];
      if (move) {
        event.preventDefault();
        setTransform((prev) => ({ ...prev, x: prev.x + move[0], y: prev.y + move[1] }));
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomBy(zoomStep);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomBy(1 / zoomStep);
      } else if (event.key === '0') {
        event.preventDefault();
        reset();
      }
    },
    [enabled, zoomStep, zoomBy, reset],
  );

  const setViewport = useCallback((size: { width: number; height: number }) => {
    viewport.current = size;
  }, []);

  // 패닝 중 컴포넌트가 사라져도 상태가 남지 않게 정리한다.
  useEffect(
    () => () => {
      panOrigin.current = null;
    },
    [],
  );

  return {
    transform,
    handlers: { onWheel, onPointerDown, onPointerMove, onPointerUp, onKeyDown },
    fit,
    zoomBy,
    reset,
    isPanning,
    setViewport,
  };
}

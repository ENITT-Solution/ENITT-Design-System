import { useCallback, useEffect, useRef, useState } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * 요소의 실제 픽셀 크기를 추적한다.
 *
 * SVG 를 늘려서 맞추지 않고 실제 크기를 재는 이유: 뷰박스를 늘리면 축 글자와
 * 선 굵기까지 함께 늘어난다. 글자 크기는 언제나 토큰 값 그대로여야 한다.
 *
 * ResizeObserver 가 없는 환경(SSR·구형 브라우저)에서는 fallback 크기로 한 번 그린다.
 */
export function useElementSize(
  fallback: ElementSize,
): [(node: HTMLElement | null) => void, ElementSize] {
  const [size, setSize] = useState<ElementSize>(fallback);
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    if (typeof ResizeObserver === 'undefined') {
      if (node.clientWidth > 0) {
        setSize((prev) => ({ ...prev, width: node.clientWidth }));
      }
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) => {
        const next = { width: Math.round(width), height: Math.round(height) || prev.height };
        return next.width === prev.width && next.height === prev.height ? prev : next;
      });
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  return [ref, size];
}

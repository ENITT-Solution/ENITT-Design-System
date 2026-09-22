import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@enitt/core';
import './Grid.css';

export interface GridProps {
  children: ReactNode;
  /**
   * 각 칸의 최소 폭. 화면이 좁아지면 자동으로 줄 수가 줄어든다.
   * 고정 열 수보다 이쪽이 대시보드에 맞다 — 창 크기가 제각각이기 때문이다.
   */
  minItemWidth?: string;
  /** 열 수를 고정한다. 주면 minItemWidth 는 무시된다. */
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** 대시보드 타일 배치용 그리드. */
export function Grid({
  children,
  minItemWidth = '16rem',
  columns,
  gap = 'md',
  className,
}: GridProps) {
  const style = {
    '--grid-min': minItemWidth,
    '--grid-columns': columns,
  } as CSSProperties;

  return (
    <div
      className={cx(
        'enitt-grid',
        `enitt-grid--gap-${gap}`,
        columns && 'enitt-grid--fixed',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

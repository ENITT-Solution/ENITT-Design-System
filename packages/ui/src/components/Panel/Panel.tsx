import type { ReactNode } from 'react';
import { cx } from '@enitt/core';
import { Spinner } from '../Spinner/Spinner.js';
import './Panel.css';

export interface PanelProps {
  /** 패널 제목. 시각적 제목이자 aria-label 의 근거가 된다. */
  title?: ReactNode;
  /** 제목 아래 보조 문구 — 집계 구간, 마지막 갱신 시각 등. */
  subtitle?: ReactNode;
  /** 헤더 오른쪽 영역 — 기간 선택, 새로고침, 더보기. */
  actions?: ReactNode;
  /** 본문 아래 고정 영역 — 범례, 합계 등. */
  footer?: ReactNode;
  /** 본문을 스피너로 덮는다. 기존 내용의 레이아웃은 유지된다. */
  loading?: boolean;
  /** 본문 안쪽 여백을 없앤다. 표나 차트를 가장자리까지 채울 때. */
  flush?: boolean;
  /** 헤더에 아래 경계선을 긋는다. 기본 true. */
  divided?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/**
 * 모니터링 화면의 기본 구획.
 * 대시보드는 대부분 "제목 + 조작 + 본문" 인 이 형태의 반복이다.
 */
export function Panel({
  title,
  subtitle,
  actions,
  footer,
  loading = false,
  flush = false,
  divided = true,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  const hasHeader = title != null || subtitle != null || actions != null;

  return (
    <section
      className={cx('enitt-panel', divided && hasHeader && 'enitt-panel--divided', className)}
      aria-busy={loading || undefined}
    >
      {hasHeader && (
        <header className="enitt-panel__header">
          <div className="enitt-panel__titles">
            {title != null && <h3 className="enitt-panel__title">{title}</h3>}
            {subtitle != null && <p className="enitt-panel__subtitle">{subtitle}</p>}
          </div>
          {actions != null && <div className="enitt-panel__actions">{actions}</div>}
        </header>
      )}

      <div className={cx('enitt-panel__body', flush && 'enitt-panel__body--flush', bodyClassName)}>
        {children}
        {loading && (
          <div className="enitt-panel__loading">
            <Spinner size="md" />
          </div>
        )}
      </div>

      {footer != null && <footer className="enitt-panel__footer">{footer}</footer>}
    </section>
  );
}

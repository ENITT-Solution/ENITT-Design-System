import type { ReactNode } from 'react';
import { cx } from '@enitt/core';
import { IconEmptyBox } from '../../internal/icons.js';
import './EmptyState.css';

export interface EmptyStateProps {
  /** 무엇이 없는지 한 줄로. "조회 결과가 없습니다" */
  title: ReactNode;
  /** 다음에 무엇을 하면 되는지. */
  description?: ReactNode;
  icon?: ReactNode;
  /** 조치 버튼 — 필터 초기화, 기간 넓히기 등. */
  action?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/** 데이터가 없을 때의 자리. 빈 화면 대신 다음 행동을 제시한다. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  size = 'md',
  className,
}: EmptyStateProps) {
  return (
    <div className={cx('enitt-empty', `enitt-empty--${size}`, className)}>
      <span className="enitt-empty__icon" aria-hidden="true">
        {icon ?? <IconEmptyBox />}
      </span>
      <p className="enitt-empty__title">{title}</p>
      {description != null && <p className="enitt-empty__description">{description}</p>}
      {action != null && <div className="enitt-empty__action">{action}</div>}
    </div>
  );
}

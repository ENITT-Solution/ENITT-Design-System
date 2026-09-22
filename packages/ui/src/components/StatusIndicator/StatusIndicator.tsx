import type { ReactNode } from 'react';
import { cx, type Severity } from '@enitt/core';
import { SEVERITY_ARIA, SEVERITY_LABEL } from '../../internal/severity.js';
import './StatusIndicator.css';

export interface StatusIndicatorProps {
  severity: Severity;
  /** 표시 문구. 비우면 심각도 표시명이 들어간다. */
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /**
   * 점멸로 주의를 끈다. 미확인 위험 경보에만 쓴다 —
   * 화면에 점멸이 둘 이상이면 아무것도 눈에 띄지 않는다.
   * prefers-reduced-motion 에서는 자동으로 정적 링으로 바뀐다.
   */
  pulse?: boolean;
  /** 점만 그리고 라벨은 감춘다. 표의 좁은 열에서 쓴다. */
  dotOnly?: boolean;
  className?: string;
}

/**
 * 상태 표시등.
 *
 * 색을 담당하는 점 옆에 **항상 텍스트가 붙는다**. `dotOnly` 로 텍스트를 감추더라도
 * 스크린리더용 문구는 남는다.
 */
export function StatusIndicator({
  severity,
  children,
  size = 'md',
  pulse = false,
  dotOnly = false,
  className,
}: StatusIndicatorProps) {
  const label = children ?? SEVERITY_LABEL[severity];

  return (
    <span
      className={cx(
        'enitt-status',
        `enitt-status--${severity}`,
        `enitt-status--${size}`,
        pulse && 'enitt-status--pulse',
        className,
      )}
      role="status"
    >
      <span className="enitt-status__dot" aria-hidden="true" />
      {dotOnly ? (
        <span className="enitt-visually-hidden">{SEVERITY_ARIA[severity]}</span>
      ) : (
        <span className="enitt-status__label">{label}</span>
      )}
    </span>
  );
}

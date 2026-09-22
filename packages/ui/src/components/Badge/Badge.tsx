import type { ReactNode } from 'react';
import { cx, type Severity } from '@enitt/core';
import { SEVERITY_ICON, SEVERITY_LABEL } from '../../internal/severity.js';
import './Badge.css';

export interface BadgeProps {
  /** 상태 색을 결정한다. 지정하면 등급 아이콘이 자동으로 붙는다. */
  severity?: Severity;
  /** 배경 채움 여부. 표 안에서는 'subtle' 이 덜 시끄럽다. */
  appearance?: 'subtle' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** 아이콘을 직접 지정한다. severity 의 기본 아이콘을 덮어쓴다. */
  icon?: ReactNode;
  /** 아이콘을 완전히 뺀다. 같은 열에 이미 아이콘이 있을 때만 쓴다. */
  hideIcon?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * 상태 배지.
 *
 * severity 를 주면 **아이콘 + 라벨**이 함께 나간다 — 색만으로 등급을 전달하지 않는다.
 * children 을 비우면 심각도의 한국어 표시명(정상/주의/경고/위험…)이 들어간다.
 */
export function Badge({
  severity,
  appearance = 'subtle',
  size = 'md',
  icon,
  hideIcon = false,
  className,
  children,
}: BadgeProps) {
  const SeverityIcon = severity ? SEVERITY_ICON[severity] : null;
  const content = children ?? (severity ? SEVERITY_LABEL[severity] : null);

  return (
    <span
      className={cx(
        'enitt-badge',
        `enitt-badge--${appearance}`,
        `enitt-badge--${size}`,
        severity && `enitt-badge--${severity}`,
        className,
      )}
    >
      {!hideIcon && (icon ?? (SeverityIcon && <SeverityIcon className="enitt-badge__icon" />))}
      {content != null && <span className="enitt-badge__label">{content}</span>}
    </span>
  );
}

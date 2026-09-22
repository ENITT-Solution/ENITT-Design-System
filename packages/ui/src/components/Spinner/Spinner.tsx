import { cx } from '@enitt/core';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** 스크린리더에 읽힐 설명. 버튼 안처럼 주변 문맥이 충분하면 null 로 끈다. */
  label?: string | null;
}

/** 진행 중 표시. prefers-reduced-motion 에서는 회전 대신 점멸만 남는다. */
export function Spinner({ size = 'md', className, label = '불러오는 중' }: SpinnerProps) {
  return (
    <span className={cx('enitt-spinner', `enitt-spinner--${size}`, className)} role="status">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="enitt-spinner__track" cx="12" cy="12" r="9" />
        <circle className="enitt-spinner__head" cx="12" cy="12" r="9" />
      </svg>
      {label && <span className="enitt-visually-hidden">{label}</span>}
    </span>
  );
}

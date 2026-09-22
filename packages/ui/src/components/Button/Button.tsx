import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@enitt/core';
import { Spinner } from '../Spinner/Spinner.js';
import './Button.css';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 진행 중 표시. 스피너가 뜨고 버튼이 비활성화된다. */
  loading?: boolean;
  /** 라벨 앞 아이콘. */
  startIcon?: ReactNode;
  /** 라벨 뒤 아이콘. */
  endIcon?: ReactNode;
  /** 아이콘만 있는 버튼. 이때 `aria-label` 은 필수다. */
  iconOnly?: boolean;
  /** 가로 폭을 부모에 맞춘다. */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'outline',
    size = 'md',
    loading = false,
    startIcon,
    endIcon,
    iconOnly = false,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'enitt-btn',
        `enitt-btn--${variant}`,
        `enitt-btn--${size}`,
        iconOnly && 'enitt-btn--icon-only',
        fullWidth && 'enitt-btn--full',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} className="enitt-btn__spinner" />
      ) : (
        startIcon && <span className="enitt-btn__icon">{startIcon}</span>
      )}
      {!iconOnly && children != null && <span className="enitt-btn__label">{children}</span>}
      {iconOnly && children}
      {!loading && endIcon && <span className="enitt-btn__icon">{endIcon}</span>}
    </button>
  );
});

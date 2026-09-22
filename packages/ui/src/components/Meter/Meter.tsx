import type { ReactNode } from 'react';
import { clamp, cx, formatPercent, normalize, type Severity } from '@enitt/core';
import './Meter.css';

export interface MeterThreshold {
  /** 이 값 이상이면 아래 severity 로 바뀐다. */
  at: number;
  severity: Severity;
}

export interface MeterProps {
  value: number | null | undefined;
  min?: number;
  max?: number;
  label?: ReactNode;
  /** 오른쪽에 보여줄 문구. 비우면 백분율이 들어간다. */
  valueText?: ReactNode;
  /**
   * 구간별 심각도. 오름차순으로 정렬해 넘기지 않아도 내부에서 정렬한다.
   * 예: `[{ at: 80, severity: 'warning' }, { at: 95, severity: 'critical' }]`
   */
  thresholds?: readonly MeterThreshold[];
  /** 심각도를 직접 고정한다. thresholds 보다 우선한다. */
  severity?: Severity;
  size?: 'sm' | 'md';
  className?: string;
}

function severityFor(
  value: number,
  thresholds: readonly MeterThreshold[] | undefined,
): Severity | undefined {
  if (!thresholds?.length) return undefined;
  let hit: Severity | undefined;
  for (const t of [...thresholds].sort((a, b) => a.at - b.at)) {
    if (value >= t.at) hit = t.severity;
  }
  return hit;
}

/**
 * 한계값 대비 현재 비율을 보여주는 막대.
 *
 * 채움 막대가 심각도를, 빈 트랙은 **같은 색의 옅은 단계**를 쓴다 —
 * 막대 전체에서 상태가 읽히게 하기 위해서다.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  thresholds,
  severity,
  size = 'md',
  className,
}: MeterProps) {
  const known = value != null && Number.isFinite(value);
  const safeValue = known ? clamp(value, min, max) : min;
  const ratio = known ? clamp(normalize(safeValue, min, max), 0, 1) : 0;
  const tone = severity ?? (known ? severityFor(safeValue, thresholds) : 'unknown') ?? 'info';

  return (
    <div className={cx('enitt-meter', `enitt-meter--${size}`, `enitt-meter--${tone}`, className)}>
      {(label != null || valueText != null || known) && (
        <div className="enitt-meter__head">
          {label != null && <span className="enitt-meter__label">{label}</span>}
          <span className="enitt-meter__value enitt-tnum">
            {valueText ?? (known ? formatPercent(ratio * 100, { fractionDigits: 0 }) : '—')}
          </span>
        </div>
      )}

      <div
        className="enitt-meter__track"
        role="meter"
        aria-valuenow={known ? safeValue : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
      >
        <div className="enitt-meter__fill" style={{ inlineSize: `${ratio * 100}%` }} />
        {thresholds?.map((t) => (
          <span
            key={t.at}
            className="enitt-meter__tick"
            style={{ insetInlineStart: `${clamp(normalize(t.at, min, max), 0, 1) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

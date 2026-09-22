import type { ReactNode } from 'react';
import { cx, formatPercent, type TrendDirection } from '@enitt/core';
import { IconArrowDown, IconArrowUp, IconFlat } from '../../internal/icons.js';
import './StatTile.css';

/**
 * 증감의 좋고 나쁨. 같은 '상승'이라도 발전량은 좋고 부하율은 나쁘다.
 * 'neutral' 은 색 없이 방향만 보여준다.
 */
export type StatPolarity = 'up-good' | 'up-bad' | 'neutral';

export interface StatTileProps {
  /** 지표 이름. 문장형 대소문자, 끝에 콜론을 붙이지 않는다. */
  label: ReactNode;
  /** 현재 값. 이미 포맷된 문자열을 넣는다 (`formatPower(x)` 등). */
  value: ReactNode;
  /** 값 뒤에 붙는 단위. value 에 단위가 포함돼 있으면 비운다. */
  unit?: ReactNode;
  /** 증감률(%). 부호가 자동으로 붙는다. */
  deltaPercent?: number | null;
  /** 증감 비교 대상 — "어제 대비", "전월 대비". */
  deltaLabel?: ReactNode;
  /** 방향을 직접 지정한다. 비우면 deltaPercent 의 부호로 정한다. */
  trend?: TrendDirection;
  polarity?: StatPolarity;
  /** 오른쪽 아래 스파크라인 자리. `<Sparkline>` 을 넣는다. */
  chart?: ReactNode;
  /** 값 왼쪽 상태 표시등이나 배지. */
  status?: ReactNode;
  /** 화면을 대표하는 단 하나의 숫자에만 쓴다. */
  emphasis?: 'default' | 'hero';
  className?: string;
}

function directionOf(trend: TrendDirection | undefined, deltaPercent: number | null | undefined) {
  if (trend) return trend;
  if (deltaPercent == null || !Number.isFinite(deltaPercent) || deltaPercent === 0) return 'flat';
  return deltaPercent > 0 ? 'up' : 'down';
}

function toneOf(direction: TrendDirection, polarity: StatPolarity) {
  if (polarity === 'neutral' || direction === 'flat') return 'neutral';
  const good = polarity === 'up-good' ? direction === 'up' : direction === 'down';
  return good ? 'good' : 'bad';
}

const TREND_ICON = { up: IconArrowUp, down: IconArrowDown, flat: IconFlat } as const;
const TREND_ARIA = { up: '상승', down: '하락', flat: '변동 없음' } as const;

/**
 * 단일 값 타일.
 *
 * 값은 비례 숫자(proportional figures)로 그린다 — 큰 숫자에 tabular-nums 를 쓰면
 * 자간이 벌어져 보인다. 자릿수 정렬이 필요한 곳은 표(DataTable)다.
 */
export function StatTile({
  label,
  value,
  unit,
  deltaPercent,
  deltaLabel,
  trend,
  polarity = 'neutral',
  chart,
  status,
  emphasis = 'default',
  className,
}: StatTileProps) {
  const direction = directionOf(trend, deltaPercent);
  const tone = toneOf(direction, polarity);
  const TrendIcon = TREND_ICON[direction];
  const hasDelta = deltaPercent != null && Number.isFinite(deltaPercent);

  return (
    <div className={cx('enitt-stat', emphasis === 'hero' && 'enitt-stat--hero', className)}>
      <div className="enitt-stat__label">{label}</div>

      <div className="enitt-stat__value-row">
        {status && <span className="enitt-stat__status">{status}</span>}
        <span className="enitt-stat__value">{value}</span>
        {unit != null && <span className="enitt-stat__unit">{unit}</span>}
      </div>

      {(hasDelta || deltaLabel != null) && (
        <div className={cx('enitt-stat__delta', `enitt-stat__delta--${tone}`)}>
          <TrendIcon className="enitt-stat__delta-icon" />
          <span className="enitt-visually-hidden">{TREND_ARIA[direction]}</span>
          {hasDelta && (
            <span className="enitt-stat__delta-value">
              {deltaPercent > 0 ? '+' : ''}
              {formatPercent(deltaPercent)}
            </span>
          )}
          {deltaLabel != null && <span className="enitt-stat__delta-label">{deltaLabel}</span>}
        </div>
      )}

      {chart && <div className="enitt-stat__chart">{chart}</div>}
    </div>
  );
}

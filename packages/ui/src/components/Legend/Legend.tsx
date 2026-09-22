import type { CSSProperties } from 'react';
import { cx } from '@enitt/core';
import './Legend.css';

export interface LegendItem {
  id: string;
  label: string;
  /** CSS 색상값. 보통 `var(--enitt-color-chart-series-1)`. */
  color: string;
  /** 현재 값 — 범례에 값을 같이 두면 눈이 차트와 표를 오가지 않아도 된다. */
  value?: string;
  /** 시리즈를 숨긴 상태. 클릭으로 토글할 때 쓴다. */
  hidden?: boolean;
  /** 점선 등 선 모양이 다른 시리즈. 색 외의 두 번째 구분 채널. */
  dashed?: boolean;
}

export interface LegendProps {
  items: readonly LegendItem[];
  /** 항목을 누르면 호출된다. 주면 항목이 버튼이 된다. */
  onToggle?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * 차트 범례.
 *
 * 시리즈가 둘 이상이면 범례는 **항상** 있어야 한다 — 색만으로 계열을 구분시키지 않는다.
 * 계열이 4개 이하라면 차트 위에 직접 라벨을 붙이는 편이 더 낫다.
 */
export function Legend({ items, onToggle, orientation = 'horizontal', className }: LegendProps) {
  const interactive = typeof onToggle === 'function';

  return (
    <ul className={cx('enitt-legend', `enitt-legend--${orientation}`, className)}>
      {items.map((item) => {
        const content = (
          <>
            <span
              className={cx('enitt-legend__swatch', item.dashed && 'enitt-legend__swatch--dashed')}
              style={{ '--legend-color': item.color } as CSSProperties}
              aria-hidden="true"
            />
            <span className="enitt-legend__label">{item.label}</span>
            {item.value != null && (
              <span className="enitt-legend__value enitt-tnum">{item.value}</span>
            )}
          </>
        );

        return (
          <li
            key={item.id}
            className={cx('enitt-legend__item', item.hidden && 'enitt-legend__item--hidden')}
          >
            {interactive ? (
              <button
                type="button"
                className="enitt-legend__button"
                onClick={() => onToggle(item.id)}
                aria-pressed={!item.hidden}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}

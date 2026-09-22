import { arcPath, clamp, cx, formatPercent, normalize, type Severity } from '@enitt/core';
import type { CSSProperties, ReactNode } from 'react';
import './GaugeChart.css';

export interface GaugeBand {
  /** 이 값부터 해당 심각도. 오름차순이 아니어도 내부에서 정렬한다. */
  from: number;
  severity: Severity;
}

export interface GaugeChartProps {
  value: number | null | undefined;
  min?: number;
  max?: number;
  /** 가운데 큰 글씨. 비우면 백분율이 들어간다. */
  valueText?: ReactNode;
  /** 값 아래 작은 설명. */
  label?: ReactNode;
  /** 구간별 심각도. 채움 색과 바깥 띠에 함께 반영된다. */
  bands?: readonly GaugeBand[];
  /** 심각도 고정. bands 보다 우선한다. */
  severity?: Severity;
  size?: number;
  /** 원호가 그려지는 각도 폭(도). 기본 240도 — 아래쪽이 트인 형태. */
  sweep?: number;
  ariaLabel?: string;
  className?: string;
}

function severityAt(value: number, bands: readonly GaugeBand[] | undefined): Severity | undefined {
  if (!bands?.length) return undefined;
  let hit: Severity | undefined;
  for (const band of [...bands].sort((a, b) => a.from - b.from)) {
    if (value >= band.from) hit = band.severity;
  }
  return hit;
}

/**
 * 원형 게이지.
 *
 * "한계값 대비 현재 비율" 하나를 보여줄 때만 쓴다. 여러 값을 비교해야 한다면
 * 게이지를 여러 개 놓지 말고 막대 차트로 바꾸는 편이 읽기 쉽다.
 */
export function GaugeChart({
  value,
  min = 0,
  max = 100,
  valueText,
  label,
  bands,
  severity,
  size = 160,
  sweep = 240,
  ariaLabel,
  className,
}: GaugeChartProps) {
  const known = value != null && Number.isFinite(value);
  const safeValue = known ? clamp(value, min, max) : min;
  const ratio = known ? clamp(normalize(safeValue, min, max), 0, 1) : 0;
  const tone = severity ?? (known ? severityAt(safeValue, bands) : 'unknown') ?? 'info';

  const center = size / 2;
  const stroke = Math.max(8, size * 0.075);
  const radius = center - stroke / 2 - 2;
  const start = -sweep / 2;
  const end = start + sweep;

  return (
    <div
      className={cx('enitt-gauge', `enitt-gauge--${tone}`, className)}
      style={{ inlineSize: size } as CSSProperties}
    >
      <svg
        width={size}
        height={size * 0.78}
        viewBox={`0 0 ${size} ${size * 0.78}`}
        role="img"
        aria-label={ariaLabel ?? (known ? `${formatPercent(ratio * 100)} 사용 중` : '값 없음')}
      >
        <g transform={`translate(0, ${size * 0.06})`}>
          {/* 트랙 — 채움과 같은 색의 옅은 단계 */}
          <path
            className="enitt-gauge__track"
            d={arcPath(center, center, radius, start, end)}
            strokeWidth={stroke}
          />
          {/* 구간 경계 눈금 */}
          {bands?.map((band) => {
            const angle = start + clamp(normalize(band.from, min, max), 0, 1) * sweep;
            return (
              <path
                key={`${band.from}-${band.severity}`}
                className="enitt-gauge__tick"
                d={arcPath(center, center, radius, angle - 0.6, angle + 0.6)}
                strokeWidth={stroke}
              />
            );
          })}
          {known && ratio > 0 && (
            <path
              className="enitt-gauge__fill"
              d={arcPath(center, center, radius, start, start + ratio * sweep)}
              strokeWidth={stroke}
            />
          )}
        </g>
      </svg>

      <div className="enitt-gauge__readout">
        <div className="enitt-gauge__value">
          {valueText ?? (known ? formatPercent(ratio * 100, { fractionDigits: 0 }) : '—')}
        </div>
        {label != null && <div className="enitt-gauge__label">{label}</div>}
      </div>
    </div>
  );
}

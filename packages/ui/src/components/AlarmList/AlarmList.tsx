import type { ReactNode } from 'react';
import {
  cx,
  formatDateTime,
  formatRelativeTime,
  type AlarmRecord,
  type Severity,
} from '@enitt/core';
import { SEVERITY_ICON, SEVERITY_LABEL } from '../../internal/severity.js';
import { Button } from '../Button/Button.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import './AlarmList.css';

export interface AlarmListProps {
  alarms: readonly AlarmRecord[];
  /** 확인(acknowledge) 버튼을 붙인다. */
  onAcknowledge?: (alarm: AlarmRecord) => void;
  /** 항목 클릭 — 보통 해당 설비 상세로 이동한다. */
  onSelect?: (alarm: AlarmRecord) => void;
  selectedId?: string | null;
  /** 시간 표기. 'relative' 는 "3분 전", 'absolute' 는 "2026-09-22 14:03". */
  timeFormat?: 'relative' | 'absolute';
  /** 상대 시각 계산 기준. 테스트에서 고정값을 넣기 위한 것. */
  now?: number;
  /** 미확인 위험 경보의 표시등을 점멸시킨다. */
  pulseCritical?: boolean;
  density?: 'compact' | 'default';
  empty?: ReactNode;
  className?: string;
}

/**
 * 경보 목록.
 *
 * 각 항목은 **등급 아이콘 + 등급 이름 + 색**을 함께 쓴다.
 * 해소된 경보는 흐리게, 미확인 위험 경보는 굵게 — 색 외의 채널로도 구분된다.
 */
export function AlarmList({
  alarms,
  onAcknowledge,
  onSelect,
  selectedId,
  timeFormat = 'relative',
  now,
  pulseCritical = true,
  density = 'default',
  empty,
  className,
}: AlarmListProps) {
  if (alarms.length === 0) {
    return (
      <div className={className}>
        {empty ?? (
          <EmptyState
            title="발생한 경보가 없습니다"
            description="설비가 정상 범위에서 운전 중입니다."
            size="sm"
          />
        )}
      </div>
    );
  }

  return (
    <ul className={cx('enitt-alarms', `enitt-alarms--${density}`, className)}>
      {alarms.map((alarm) => {
        const Icon = SEVERITY_ICON[alarm.severity];
        const cleared = alarm.clearedAt != null;
        const urgent = !cleared && !alarm.acknowledged && isUrgent(alarm.severity);

        return (
          <li
            key={alarm.id}
            className={cx(
              'enitt-alarms__item',
              `enitt-alarms__item--${alarm.severity}`,
              cleared && 'enitt-alarms__item--cleared',
              urgent && pulseCritical && 'enitt-alarms__item--urgent',
              selectedId === alarm.id && 'enitt-alarms__item--selected',
            )}
          >
            <button
              type="button"
              className="enitt-alarms__main"
              onClick={onSelect ? () => onSelect(alarm) : undefined}
              disabled={!onSelect}
            >
              <span className="enitt-alarms__icon">
                <Icon />
              </span>

              <span className="enitt-alarms__body">
                <span className="enitt-alarms__headline">
                  <span className="enitt-alarms__severity">{SEVERITY_LABEL[alarm.severity]}</span>
                  <span className="enitt-alarms__source">{alarm.source}</span>
                </span>
                <span className="enitt-alarms__message">{alarm.message}</span>
              </span>

              <span className="enitt-alarms__meta">
                <time
                  className="enitt-alarms__time enitt-tnum"
                  dateTime={new Date(alarm.raisedAt).toISOString()}
                  title={formatDateTime(alarm.raisedAt, { style: 'time-seconds' })}
                >
                  {timeFormat === 'relative'
                    ? formatRelativeTime(alarm.raisedAt, now != null ? { now } : undefined)
                    : formatDateTime(alarm.raisedAt)}
                </time>
                {cleared && <span className="enitt-alarms__cleared">해소됨</span>}
                {!cleared && alarm.acknowledged && (
                  <span className="enitt-alarms__acked">확인됨</span>
                )}
              </span>
            </button>

            {onAcknowledge && !cleared && !alarm.acknowledged && (
              <div className="enitt-alarms__action">
                <Button size="sm" variant="ghost" onClick={() => onAcknowledge(alarm)}>
                  확인
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const isUrgent = (severity: Severity) => severity === 'critical' || severity === 'serious';

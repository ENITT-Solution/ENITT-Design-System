import type { ReactElement } from 'react';
import type { Severity } from '@enitt/core';
import {
  IconCritical,
  IconInfo,
  IconNormal,
  IconSerious,
  IconUnknown,
  IconWarning,
  type IconProps,
} from './icons.js';

/** 심각도별 한국어 표시명. 색만으로 의미를 전달하지 않기 위한 텍스트 채널. */
export const SEVERITY_LABEL: Record<Severity, string> = {
  normal: '정상',
  info: '안내',
  warning: '주의',
  serious: '경고',
  critical: '위험',
  unknown: '불명',
};

/** 심각도별 아이콘. 윤곽 모양이 서로 달라 색각 이상에서도 구분된다. */
export const SEVERITY_ICON: Record<Severity, (props: IconProps) => ReactElement> = {
  normal: IconNormal,
  info: IconInfo,
  warning: IconWarning,
  serious: IconSerious,
  critical: IconCritical,
  unknown: IconUnknown,
};

/** 스크린리더에 읽히는 접두어. `role="status"` 와 함께 쓴다. */
export const SEVERITY_ARIA: Record<Severity, string> = {
  normal: '정상 상태',
  info: '안내',
  warning: '주의 필요',
  serious: '경고',
  critical: '위험, 즉시 조치 필요',
  unknown: '상태 불명',
};

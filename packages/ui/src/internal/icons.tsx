import type { SVGProps } from 'react';

/**
 * 내부 아이콘 세트.
 *
 * 심각도 아이콘은 **윤곽 모양이 서로 다르다** — 원/삼각형/마름모/팔각형.
 * 색각 이상 사용자에게는 색이 아니라 이 모양이 등급을 전달한다.
 */
export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Icon({ size = '1em', children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** 정상 — 원 + 체크 */
export const IconNormal = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M5.25 8.25 7.2 10.2l3.6-4.2" />
  </Icon>
);

/** 안내 — 원 + i */
export const IconInfo = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 7.25v3.5" />
    <path d="M8 5.1v.1" strokeWidth={2} />
  </Icon>
);

/** 주의 — 삼각형 + ! */
export const IconWarning = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 1.9 15 14H1z" />
    <path d="M8 6.4v3.1" />
    <path d="M8 11.7v.1" strokeWidth={2} />
  </Icon>
);

/** 경고 — 마름모 + ! */
export const IconSerious = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 1.5 14.5 8 8 14.5 1.5 8z" />
    <path d="M8 5.2v3.4" />
    <path d="M8 10.8v.1" strokeWidth={2} />
  </Icon>
);

/** 위험 — 팔각형 + ! */
export const IconCritical = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5.4 1.5h5.2L14.5 5.4v5.2L10.6 14.5H5.4L1.5 10.6V5.4z" />
    <path d="M8 4.9v3.6" />
    <path d="M8 10.9v.1" strokeWidth={2} />
  </Icon>
);

/** 불명 — 점선 원 + ? */
export const IconUnknown = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="8" cy="8" r="6.25" strokeDasharray="2.6 2" />
    <path d="M6.3 6.2a1.75 1.75 0 1 1 2.3 1.66c-.42.15-.6.5-.6.94v.3" />
    <path d="M8 11.6v.1" strokeWidth={2} />
  </Icon>
);

export const IconArrowUp = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 13V3.5" />
    <path d="m4 7.3 4-3.8 4 3.8" />
  </Icon>
);

export const IconArrowDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 3v9.5" />
    <path d="m4 8.7 4 3.8 4-3.8" />
  </Icon>
);

export const IconFlat = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 8h10" />
  </Icon>
);

export const IconClose = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4 4 8 8M12 4l-8 8" />
  </Icon>
);

export const IconChevronDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4 6.2 4 4 4-4" />
  </Icon>
);

export const IconSearch = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7.2" cy="7.2" r="4.7" />
    <path d="m10.7 10.7 3 3" />
  </Icon>
);

export const IconEmptyBox = (props: IconProps) => (
  <Icon {...props}>
    <path d="M1.8 5.2 8 2.2l6.2 3v5.6L8 13.8l-6.2-3z" />
    <path d="M1.8 5.2 8 8.2l6.2-3M8 8.2v5.6" />
  </Icon>
);

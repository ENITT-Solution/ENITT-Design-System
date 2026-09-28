# ENITT Design System

모니터링·관제 웹 화면을 만들 때 사용하는 React 컴포넌트와 SVG 차트 모음입니다.

상태 등급, 값의 단위, 시계열 결측 처리는 공통 패키지에서 다룹니다. 전력·공정·물류·서비스 인프라 등 업무별 타입과 컴포넌트는 도메인 팩으로 확장합니다.

---

## 패키지

| 패키지                  | 역할                                                               | 의존             |
| ----------------------- | ------------------------------------------------------------------ | ---------------- |
| `@enitt/tokens`         | JSON 디자인 토큰, CSS 커스텀 프로퍼티·TS 상수 생성                 | 없음             |
| `@enitt/core`           | 공통 타입, 포매터, 기하·스케일 유틸. React 의존성 없음             | 없음             |
| `@enitt/ui`             | 모니터링 화면용 React 컴포넌트 (패널·KPI 타일·표·경보·상태 표시등) | tokens, core     |
| `@enitt/charts`         | SVG 차트 (스파크라인·시계열·게이지). 외부 차트 라이브러리 없음     | tokens, core, ui |
| `@enitt/storybook` (앱) | 문서·플레이그라운드                                                | 전부             |

패키지 빌드 순서는 `tokens → core → ui → charts`입니다.

---

## 시작하기

```bash
pnpm install
pnpm build          # 의존 순서에 따라 전체 패키지 빌드
pnpm storybook      # http://localhost:6006
```

| 명령                   | 하는 일                   |
| ---------------------- | ------------------------- |
| `pnpm build`           | 전 패키지 빌드            |
| `pnpm dev`             | 감시 모드 빌드            |
| `pnpm test`            | 전 패키지 테스트 (vitest) |
| `pnpm typecheck`       | 전 패키지 타입 검사       |
| `pnpm format`          | prettier 정렬             |
| `pnpm build:storybook` | 정적 문서 사이트 생성     |

요구 사항: Node ≥ 20, pnpm 12.

---

## 앱에서 사용하기

```bash
pnpm add @enitt/tokens @enitt/ui @enitt/charts
```

```tsx
// 앱 진입점에서 스타일 가져오기
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/charts/styles.css';

import { ThemeProvider, Panel, StatTile } from '@enitt/ui';
import { TimeSeriesChart } from '@enitt/charts';
import { formatNumber } from '@enitt/core';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Panel title="분당 요청">
        <StatTile
          label="요청"
          value={formatNumber(128_700)}
          deltaPercent={4.2}
          polarity="up-good"
        />
      </Panel>
    </ThemeProvider>
  );
}
```

React 18.3과 19를 peer dependency로 지원합니다. 앱에서 사용할 React 버전을 설치하세요.

---

## 도메인 확장

업무별 기능은 타입, 토큰 프리셋, 컴포넌트로 확장합니다.

### 타입

`@enitt/core`의 `Severity`에 도메인 상태를 매핑합니다.

```ts
import type { Severity } from '@enitt/core';

export type PumpState = 'running' | 'stopped' | 'fault' | 'unknown';
export const pumpSeverity = (state: PumpState): Severity =>
  state === 'fault' ? 'critical' : state === 'running' ? 'normal' : 'unknown';
```

### 토큰 프리셋

`@enitt/tokens`의 `src/presets.json`에 속성별 토큰 프리셋을 선언합니다.
빌드 시 `[data-enitt-<속성>='<값>']` 선택자에 해당 토큰을 생성합니다. 프리셋 파일은 선택 사항입니다.

```json
{
  "power-convention": {
    "ko-legacy": {
      "color.power.energized": "color.power-ko.energized",
      "color.power.deenergized": "color.power-ko.deenergized"
    }
  }
}
```

앱에서 `ThemeProvider`의 `presets` 속성으로 프리셋을 선택합니다.

```tsx
<ThemeProvider presets={{ 'power-convention': 'ko-legacy' }}>
```

### 컴포넌트

도메인 전용 렌더러는 별도 패키지에 작성합니다.

전력 계통도(단선결선도)는 `feature/diagram` 브랜치에서 도메인 팩으로 개발 중입니다. 코어의 도메인 중립성 유지와 계통도의 정식 패키지 전환 여부는 해당 브랜치에서 검토합니다.

---

## 설계 규칙

- 심각도 배지에는 색상, 등급별 아이콘(원/삼각형/마름모/팔각형), 한국어 라벨을 함께 사용합니다. 색상을 구분하기 어려운 경우에도 아이콘과 라벨로 상태를 확인할 수 있습니다.
- 차트 계열에는 8슬롯 팔레트의 색을 순서대로 배정합니다. 라이트(`#ffffff`)·다크(`#161b22`) 표면에서 인접쌍 CVD ΔE는 각각 9.1 / 8.4입니다. 9번째 계열부터는 회색으로 표시하며 개발 모드에서 경고합니다. 계열이 8개를 넘으면 "기타"로 묶거나 차트를 나누세요.
- 차트는 y축 하나를 사용합니다. 단위가 다른 지표는 별도 차트에 표시하세요.
- 시계열의 `null` 구간은 선으로 연결하지 않습니다.
- 축 눈금에는 단위 하나를 사용합니다. 예를 들어 바이트 값의 눈금을 `0 B · 500 kB · 1.50 MB`처럼 서로 다른 단위로 표시하지 않습니다.
- 큰 숫자에는 비례 숫자 폭을 사용합니다. `tabular-nums`는 자릿수 정렬이 필요한 표와 축 눈금에 적용합니다.
- 시계열 차트에는 크로스헤어와 툴팁을 기본으로 제공합니다. 툴팁에서 같은 시각의 전체 계열 값을 확인할 수 있고, 키보드 ←/→로 시각을 이동할 수 있습니다.
- `prefers-reduced-motion` 설정을 사용하면 점멸 애니메이션 대신 정적 강조를 표시합니다.

---

## 토큰

토큰을 원시 색과 의미 토큰으로 구분하고, 컴포넌트에서 의미 토큰을 참조합니다.

```
팔레트 (원시 색)  →  의미 토큰  →  컴포넌트
--enitt-palette-*    --enitt-color-*    .enitt-btn
```

컴포넌트 스타일에는 의미 토큰을 사용하세요. 원시 색을 참조하면 테마별 색상 매핑을 적용할 수 없습니다.

토큰을 변경하려면 `packages/tokens/src/{primitives,semantic}.json`을 수정한 뒤 생성 명령을 실행하세요.

```bash
pnpm --filter @enitt/tokens generate
```

생성 파일(`src/generated/tokens.css`, `tokens.ts`)도 커밋하세요. 리뷰어가 PR에서 변경한 색상 값을 확인할 수 있습니다.

의미 토큰 계열:

| 계열                     | 용도                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `--enitt-color-bg-*`     | 배경 (canvas / surface / raised / sunken / muted …)                |
| `--enitt-color-fg-*`     | 글자 (default / muted / subtle / disabled …)                       |
| `--enitt-color-border-*` | 경계·포커스 링                                                     |
| `--enitt-color-accent-*` | 브랜드 강조                                                        |
| `--enitt-color-status-*` | 상태 등급 (normal / info / warning / serious / critical / unknown) |
| `--enitt-color-chart-*`  | 차트 계열·눈금·임계선                                              |

### 테마

`tokens.css`에서 다음 선택자로 테마를 적용합니다.

- `:root`: 라이트 (기본값)
- `:root[data-theme='dark']`: 사용자가 다크를 선택한 경우
- `@media (prefers-color-scheme: dark)` + `:root:not([data-theme='light'])`: OS 설정을 따르는 경우

`<ThemeProvider>`로 테마 속성을 관리하고, `tokens.css`로 스타일을 적용합니다.

---

## CSS 레이어

컴포넌트 스타일은 `@layer enitt.base → enitt.components → enitt.utilities` 순서로 선언합니다. 앱에서 레이어 밖에 일반 CSS 규칙을 작성하면 컴포넌트 스타일보다 우선 적용할 수 있습니다.

```css
/* 앱에서 레이어 밖에 작성한 스타일 */
.enitt-btn {
  border-radius: 0;
}
```

---

## 저장소 구조

```
.
├── packages/
│   ├── tokens/     JSON 토큰 + 생성 스크립트
│   ├── core/       타입 · 포매터 · 기하
│   ├── ui/         React 컴포넌트
│   └── charts/     SVG 차트
├── apps/
│   └── storybook/  문서 · 플레이그라운드
├── pnpm-workspace.yaml   워크스페이스 + 버전 카탈로그
├── turbo.json            태스크 그래프 · 캐시
└── tsconfig.base.json    공통 컴파일러 설정
```

의존성 버전은 `pnpm-workspace.yaml`의 `catalog`에서 관리합니다. 각 `package.json`에서 `"react": "catalog:"`처럼 참조하므로, React 버전을 변경할 때는 카탈로그 항목을 수정하세요.

---

## 브랜치

| 브랜치            | 내용                                           |
| ----------------- | ---------------------------------------------- |
| `main`            | 도메인 중립 디자인 시스템                      |
| `feature/diagram` | 전력 계통도(단선결선도) 렌더러, 도메인 팩 실험 |

---

## 라이선스

MIT © ENITT-Solution

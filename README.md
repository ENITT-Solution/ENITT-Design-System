# ENITT Design System

> **`feature/diagram` 브랜치** — `main` 의 도메인 중립 시스템 위에 전력 계통도를
> **도메인 팩**으로 얹어 보는 실험 브랜치입니다. 확장 방식이 옳은지 확인하는 것이 목적이고,
> 결론이 나면 `main` 병합 여부를 정합니다.

에니트 디자인 시스템 — **모니터링·관제 성격의 웹 화면**을 위한 도메인 중립 컴포넌트 모음입니다.

특정 업무 영역(전력, 공정, 물류, 서비스 인프라)에 묶이지 않습니다. 코어가 아는 것은 "상태에는 등급이 있다", "값에는 단위가 있다", "시계열에는 결측이 있다" 정도이고, 업무 개념은 이 위에 얹는 **도메인 팩**의 몫입니다.

---

## 패키지

| 패키지                  | 역할                                                               | 의존             |
| ----------------------- | ------------------------------------------------------------------ | ---------------- |
| `@enitt/tokens`         | 디자인 토큰 단일 소스. JSON → CSS 커스텀 프로퍼티 + TS 상수        | —                |
| `@enitt/core`           | 공통 타입, 포매터, 기하·스케일 유틸. **React 무관**                | —                |
| `@enitt/ui`             | 모니터링 화면용 React 컴포넌트 (패널·KPI 타일·표·경보·상태 표시등) | tokens, core     |
| `@enitt/charts`         | SVG 차트 (스파크라인·시계열·게이지). 외부 차트 라이브러리 없음     | tokens, core, ui |
| `@enitt/storybook` (앱) | 문서·플레이그라운드                                                | 전부             |

의존 방향은 한 방향입니다: `tokens → core → ui → { charts, diagram }`.

---

## 시작하기

```bash
pnpm install
pnpm build          # 전체 패키지 빌드 (turbo 가 위상 순서를 잡는다)
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

## 소비 앱에서 쓰기

```bash
pnpm add @enitt/tokens @enitt/ui @enitt/charts @enitt/diagram
```

```tsx
// 진입점에서 한 번
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/charts/styles.css';
import '@enitt/diagram/styles.css';

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

React 18.3 / 19 둘 다 peer 로 받습니다. 번들에 React 를 넣지 않으므로 앱이 버전을 정합니다.

---

## 도메인 확장

업무 개념은 코어에 넣지 않습니다. 확장 지점이 세 군데 있습니다.

**타입** — `@enitt/core` 의 `Severity` 를 재료로 도메인 상태 타입을 정의합니다.

```ts
import type { Severity } from '@enitt/core';

export type PumpState = 'running' | 'stopped' | 'fault' | 'unknown';
export const pumpSeverity = (state: PumpState): Severity =>
  state === 'fault' ? 'critical' : state === 'running' ? 'normal' : 'unknown';
```

**토큰 프리셋** — `@enitt/tokens` 의 `src/presets.json` 에 속성 프리셋을 선언하면
`[data-enitt-<속성>='<값>']` 으로 켜지는 토큰 묶음이 생깁니다. 파일이 없으면 아무것도 나오지 않으므로 코어는 도메인을 알 필요가 없습니다.

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

앱에서는 속성만 던집니다.

```tsx
<ThemeProvider presets={{ 'power-convention': 'ko-legacy' }}>
```

**컴포넌트** — 도메인 전용 렌더러는 자기 패키지에 둡니다.

### 첫 사례: 전력 계통도

`@enitt/diagram` 이 이 확장 방식의 첫 사례입니다.

- **타입** — `PowerState` `SwitchState` 를 패키지가 소유하고, `powerSeverity()` 로 코어의 `Severity` 에 이어 붙입니다.
- **토큰** — `--enitt-color-power-*` 와 `power-convention` 프리셋을 tokens 패키지에 선언합니다.
- **컴포넌트** — `SingleLineDiagram` 과 심볼 13종을 자기 패키지에 둡니다.

```tsx
import { SingleLineDiagram, powerSeverity } from '@enitt/diagram';

<SingleLineDiagram diagram={{ nodes, links }} showFlow />;
```

도면은 **데이터**입니다. 좌표와 상태만 주면 렌더러가 그리고, 모선에 연결된 인출선은 상대 노드의 x 위치로 수직 투영돼 제자리에서 갈라집니다. 상태는 색과 모양 두 채널로 나갑니다 — 차단기 투입은 채워진 사각형, 개방은 빈 사각형, 단로기 개방은 칼날이 실제로 벌어집니다.

자세한 내용은 [`packages/diagram/README.md`](packages/diagram/README.md).

**아직 정하지 못한 것** — 계통도를 정식 패키지로 승격할지, 별도 저장소로 뺄지. 지금 구조의 마찰점은 도메인 토큰(`color.power.*`)이 코어 tokens 패키지의 `semantic.json` 에 들어간다는 점입니다. 토큰 팩을 패키지 밖에서 주입하는 방법을 더 볼 필요가 있습니다.

---

## 설계 규칙

이 규칙들은 취향이 아니라 **읽히는 화면을 만들기 위한 제약**이고, 코드에 강제돼 있습니다.

**상태를 색으로만 말하지 않는다.**
심각도 배지는 등급마다 윤곽이 다른 아이콘(원/삼각형/마름모/팔각형)과 한국어 라벨을 함께 씁니다. 흑백으로 인쇄해도, 색각 이상이 있어도 읽힙니다.

**차트 계열 색은 고정 순서로 배정하고 순환시키지 않는다.**
8슬롯 팔레트는 라이트(`#ffffff`)·다크(`#161b22`) 표면 기준으로 검증돼 있습니다 — 인접쌍 CVD ΔE 9.1 / 8.4. 9번째 계열은 색을 재사용하는 대신 회색으로 떨어지고 개발 모드에서 경고합니다. "기타"로 묶거나 차트를 쪼개라는 신호입니다.

**y축은 하나뿐이다.** 단위가 다른 두 지표는 차트를 나눕니다. 이중 축은 제공하지 않습니다.

**결측은 결측으로 그린다.** null 구간에서 선이 끊깁니다. 없는 데이터를 직선으로 이으면 있다고 말하는 셈입니다.

**축 눈금은 단위 하나로 고정한다.** `0 B · 500 kB · 1.50 MB` 처럼 한 축에 세 단위가 섞이면 값을 비교할 수 없습니다.

**큰 숫자에는 `tabular-nums` 를 쓰지 않는다.** 모든 자릿수를 `0` 폭에 맞추면 `121` 같은 값이 헐거워 보입니다. 자릿수 정렬이 필요한 곳은 표와 축 눈금입니다.

**호버는 기본 장비다.** 시계열 차트는 크로스헤어 + 툴팁을 기본으로 달고 나옵니다. 툴팁은 그 시각의 **모든 계열**을 보여주므로 선을 정확히 짚을 필요가 없고, 키보드 ←/→ 로도 같은 값을 읽습니다.

**모션은 선택이다.** 점멸 애니메이션은 `prefers-reduced-motion` 에서 정적 강조로 대체됩니다.

---

## 토큰

토큰은 세 층입니다.

```
팔레트 (원시 색)  →  의미 토큰  →  컴포넌트
--enitt-palette-*    --enitt-color-*    .enitt-btn
```

컴포넌트는 **의미 토큰만** 봅니다. 팔레트를 직접 쓰면 테마 전환이 깨집니다.

토큰을 바꾸려면 `packages/tokens/src/{primitives,semantic}.json` 을 고치고 다시 생성합니다:

```bash
pnpm --filter @enitt/tokens generate
```

생성물(`src/generated/tokens.css`, `tokens.ts`)은 저장소에 커밋합니다 — PR 에서 실제로 바뀐 색 값을 눈으로 검토하기 위해서입니다.

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

`tokens.css` 가 세 경로를 모두 처리합니다.

- `:root` — 라이트 (기본값)
- `:root[data-theme='dark']` — 사용자가 다크를 고른 경우
- `@media (prefers-color-scheme: dark)` + `:root:not([data-theme='light'])` — OS 설정을 따르는 경우

`<ThemeProvider>` 는 이 속성만 관리하고 스타일에는 관여하지 않습니다.

---

## CSS 레이어

모든 컴포넌트 스타일은 `@layer enitt.base → enitt.components → enitt.utilities` 안에 있습니다. 소비 앱이 작성한 **레이어 없는 CSS 는 언제나 이보다 우선**하므로, 오버라이드에 `!important` 를 쓸 일이 없습니다.

```css
/* 앱 쪽 — 레이어 밖이라 그냥 이깁니다 */
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
│   ├── charts/     SVG 차트
│   └── diagram/    계통도 렌더러 (도메인 팩)
├── apps/
│   └── storybook/  문서 · 플레이그라운드
├── pnpm-workspace.yaml   워크스페이스 + 버전 카탈로그
├── turbo.json            태스크 그래프 · 캐시
└── tsconfig.base.json    공통 컴파일러 설정
```

버전은 `pnpm-workspace.yaml` 의 **catalog** 한 곳에서 고정합니다. 각 `package.json` 은 `"react": "catalog:"` 처럼 참조하므로, React 버전을 올릴 때 고칠 곳은 한 줄입니다.

---

## 브랜치

| 브랜치            | 내용                                            |
| ----------------- | ----------------------------------------------- |
| `main`            | 도메인 중립 디자인 시스템                       |
| `feature/diagram` | 전력 계통도(단선결선도) 렌더러 — 도메인 팩 실험 |

---

## 라이선스

MIT © ENITT-Solution

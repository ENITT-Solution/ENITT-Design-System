# @enitt/tokens

ENITT 디자인 시스템의 **단일 토큰 소스**. 색·타이포그래피·간격·모션이 여기서만 나옵니다.

```bash
pnpm add @enitt/tokens
```

```tsx
import '@enitt/tokens/tokens.css'; // CSS 커스텀 프로퍼티 주입
import { tokens, dimensions, palette } from '@enitt/tokens';

tokens.color.status.critical; // 'var(--enitt-color-status-critical)'
dimensions.space['4']; // 'var(--enitt-space-4)'
palette.blue[500]; // '#256abf'  (canvas 렌더링처럼 var() 를 못 쓰는 곳에서만)
```

## 구조

```
src/primitives.json   원시 값 (팔레트 · 간격 · 폰트 · 모션). 의미 없음
src/semantic.json     의미 토큰. {color.blue.500} 로 원시 토큰을 참조하고 light/dark 두 벌
src/presets.json      (선택) 속성으로 켜는 토큰 프리셋 — 도메인 팩이 추가한다
      ↓ scripts/build-tokens.mjs
src/generated/tokens.css   CSS 커스텀 프로퍼티 (커밋됨)
src/generated/tokens.ts    TS 상수 + 타입 (커밋됨)
```

## 토큰 프리셋

`src/presets.json` 이 있으면 `[data-enitt-<속성>='<값>']` 블록이 생겨, 지정한 의미 토큰이 다른 의미 토큰을 가리키게 됩니다. 도메인 팩이 코어 토큰을 건드리지 않고 규칙을 바꿔 끼우는 통로입니다. 파일이 없으면 아무것도 나오지 않습니다.

```json
{
  "power-convention": {
    "ko-legacy": {
      "color.power.energized": "color.power-ko.energized"
    }
  }
}
```

존재하지 않는 의미 토큰을 가리키면 빌드가 실패합니다.

토큰을 바꾼 뒤에는 `pnpm --filter @enitt/tokens generate` 를 돌리고 **생성물까지 함께 커밋**합니다. PR 에서 실제로 바뀐 색 값을 눈으로 검토하기 위해서입니다.

## 계층 규칙

컴포넌트는 `--enitt-color-*` 같은 **의미 토큰만** 씁니다. `--enitt-palette-*` 를 직접 쓰면 테마 전환이 깨집니다.

## 차트 팔레트

차트 계열은 `semantic.json`의 8개 고정 슬롯을 사용합니다. 슬롯 순서와 색상 조합은 데이터 시각화의 구분성에 영향을 주므로 임의로 순환 배정하지 말고, 팔레트가 변경되면 라이트·다크 표면 대비와 색각 안전성을 다시 검증하세요.

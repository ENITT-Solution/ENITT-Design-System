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

8슬롯 계열 색은 라이트(`#ffffff`)·다크(`#161b22`) 표면 기준으로 검증돼 있습니다 — 인접쌍 CVD ΔE 9.1 / 8.4, 정상시각 ΔE 19.6 / 19.3. 슬롯 **순서 자체가 색각 안전 장치**이므로 임의로 바꾸지 마세요.

라이트 모드에서 aqua·yellow·magenta 세 슬롯은 표면 대비 3:1 미만입니다. 해당 계열에는 직접 라벨이나 표 보기를 함께 제공해야 합니다.

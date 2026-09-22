# @enitt/ui

웹 모니터링 화면을 위한 React 컴포넌트.

```bash
pnpm add @enitt/ui @enitt/tokens
```

```tsx
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
```

## 컴포넌트

|                                        |                                                                       |
| -------------------------------------- | --------------------------------------------------------------------- |
| `ThemeProvider` / `useTheme`           | `data-theme` 관리. 라이트/다크/시스템 + 계통도 색 관례                |
| `Panel`                                | 모니터링 화면의 기본 구획 (제목 · 조작 · 본문 · 푸터 · 로딩 오버레이) |
| `StatTile`                             | KPI 타일 (값 · 증감 · 스파크라인 자리)                                |
| `Meter`                                | 한계값 대비 비율 막대. 임계 구간별 심각도                             |
| `DataTable`                            | 정렬·선택·심각도 띠를 지원하는 표. 숫자 열은 자동 tabular-nums        |
| `AlarmList`                            | 경보 목록. 등급 아이콘 · 상대 시각 · 확인 처리                        |
| `StatusIndicator`                      | 상태 표시등. `pulse` 는 미확인 위험 경보에만                          |
| `Badge`                                | 등급 배지. 아이콘 + 라벨이 함께 나간다                                |
| `Legend`                               | 차트 범례 (계열 토글 지원)                                            |
| `Button` `Grid` `EmptyState` `Spinner` | 기본 요소                                                             |
| `useElementSize`                       | ResizeObserver 기반 크기 추적                                         |

## 접근성

- 심각도는 **색 + 아이콘 모양 + 글자** 세 채널로 전달됩니다. 아이콘 윤곽이 등급마다 달라(원/삼각형/마름모/팔각형) 색각 이상에서도 구분됩니다.
- `StatusIndicator dotOnly` 처럼 텍스트를 감춰도 스크린리더용 문구는 남습니다.
- 포커스 링은 `:focus-visible` 에만 뜨고 토큰 한 곳(`--enitt-color-border-focus`)에서 관리됩니다.
- `prefers-reduced-motion` 에서 점멸·회전은 정적 강조로 대체됩니다.

## 토큰 프리셋

도메인 팩이 `@enitt/tokens` 에 선언한 프리셋을 속성으로 켭니다. ThemeProvider 는 어떤 프리셋이 있는지 알 필요 없이 속성만 전달합니다.

```tsx
<ThemeProvider presets={{ 'power-convention': 'ko-legacy' }}>
```

## 스타일 오버라이드

모든 스타일은 `@layer enitt.*` 안에 있습니다. 앱이 작성한 레이어 없는 CSS 는 언제나 이깁니다 — `!important` 가 필요 없습니다.

```css
.enitt-btn {
  border-radius: 0;
}
```

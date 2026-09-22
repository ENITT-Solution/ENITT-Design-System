# @enitt/charts

모니터링용 SVG 차트. 외부 차트 라이브러리를 쓰지 않아 번들이 가볍고 토큰과 완전히 같은 색을 씁니다.

```bash
pnpm add @enitt/charts @enitt/ui @enitt/tokens
```

```tsx
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/charts/styles.css';
```

## 컴포넌트

**`TimeSeriesChart`** — 다계열 시계열 (선/영역). 크로스헤어 + 툴팁 · 임계선 · 범례 토글 · 키보드 탐색.

```tsx
<TimeSeriesChart
  series={[요청, 오류]}
  unit="req"
  thresholds={[{ value: 1500, label: '용량 한계', severity: 'critical' }]}
/>
```

`unit` 을 주면 툴팁·범례는 값마다 SI 접두어를 올리고, **y축은 도메인 최댓값 기준으로 단위를 한 번만 고정**합니다 — 한 축에 `0 B · 500 kB · 1.50 MB` 가 섞이지 않습니다.

**`Sparkline`** — KPI 타일 옆 추세선. 축도 눈금도 없이 **모양만** 전달하고, 현재 숫자는 곁의 `StatTile` 값이 맡습니다. 여러 타일을 비교시킬 때는 `domain` 을 맞춰야 합니다 — 각자 자동 범위를 쓰면 모양은 비슷한데 크기는 전혀 다른 그래프가 나란히 놓입니다.

**`GaugeChart`** — "한계값 대비 현재 비율" 하나. 여러 값을 비교해야 하면 게이지를 늘어놓지 말고 막대로 바꾸세요.

## 규칙

- **계열 색은 고정 순서**로 배정하고 순환시키지 않습니다. 9번째 계열은 색을 재사용하는 대신 회색으로 떨어지고 개발 모드에서 경고합니다.
- **y축은 하나뿐**입니다. 단위가 다른 지표는 차트를 나눕니다.
- **결측은 결측으로** 그립니다 — null 구간에서 선이 끊깁니다.
- **계열이 2개 이상이면 범례가 자동으로** 붙습니다.
- **글자에는 계열 색을 입히지 않습니다** — 값·라벨은 언제나 텍스트 색이고, 옆의 색 마크가 정체성을 담당합니다.

# @enitt/core

모니터링 UI 가 공유하는 **프레임워크 무관 · 도메인 중립** 계층. React 에 의존하지 않으므로 서버·워커·테스트 어디서든 씁니다.

```bash
pnpm add @enitt/core
```

## 공통 타입

`Severity` `ConnectionState` `TrendDirection` `DataPoint` `Series` `Threshold` `AlarmRecord` `Unit`

타입의 리터럴 값은 CSS 토큰 이름과 1:1로 맞춰져 있습니다 — `severity: 'critical'` ↔ `--enitt-color-status-critical`.

업무 도메인 타입(전력 상태, 공정 단계 등)은 여기 두지 않습니다. 도메인 패키지가 `Severity` 를 재료로 자기 타입을 정의합니다.

## 포매터

```ts
formatPower(2_450_000); // '2.45 MW'   — 값 크기에 맞춰 SI 접두어 승격
formatVoltage(22_900); // '22.9 kV'
formatDuration(3_725_000); // '1시간 2분'  — 큰 단위 두 개까지만
formatRelativeTime(t); // '2분 전'
formatDateTime(t); // '2026. 09. 22. 14:30'
trendOf(current, previous); // 'up' | 'down' | 'flat'
changeRate(current, previous); // 증감률(%), 이전 값이 0이면 null
```

결측값(`null`/`NaN`)은 예외를 던지지 않고 `'—'` 로 떨어집니다 — 모니터링 화면에서 통신 두절은 정상적인 상태입니다.

## 기하 · 스케일

`scaleLinear` `extent` `niceTicks` `niceStep` `polarToCartesian` `arcPath` `orthogonalPath` `boundingBox` `clamp`

`niceTicks` 는 축 눈금에 부동소수 오차가 새지 않도록 인덱스 곱으로 계산합니다.

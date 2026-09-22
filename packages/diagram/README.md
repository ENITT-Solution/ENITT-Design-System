# @enitt/diagram

계통도(단선결선도, SLD) 렌더러. 선언형 스키마를 받아 SVG 로 그립니다.

> **도메인 팩입니다.** 코어(`@enitt/tokens` `@enitt/core` `@enitt/ui`)는 업무 영역을 모릅니다.
> 전력 도메인 타입(`PowerState` `SwitchState`)과 상태 색 토큰은 이 패키지 쪽에 속하고,
> 코어와는 `powerSeverity()` 한 함수로 이어집니다.

```bash
pnpm add @enitt/diagram @enitt/ui @enitt/tokens
```

```tsx
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/diagram/styles.css';

<SingleLineDiagram diagram={{ nodes, links }} showFlow onSelectNode={setSelected} />;
```

## 스키마

```ts
{ id, type, x, y, label?, sublabel?, state?, switchState?, rotation?, scale?, measurements? }  // 노드
{ id, from, to, state?, routing?, flow?, label? }                                              // 링크
```

`from`/`to` 는 `"cb-1"` 또는 `"cb-1:top"` 형태입니다. 단자를 지정하지 않으면 상대 노드에 가장 가까운 단자가 선택됩니다.

**모선은 특별 취급**합니다. 모선에 연결된 인출선은 상대 노드의 x 위치로 수직 투영돼 제자리에서 갈라집니다 — 단선결선도가 읽히는 방식 그대로입니다.

## 기본 심볼

`source` `bus` `breaker` `disconnector` `fuse` `transformer` `generator` `motor` `load` `capacitor` `pv` `ess` `ground`

발주처 표준에 맞춰 갈아끼울 수 있습니다:

```tsx
registerSymbol('breaker', {
  width: 20,
  height: 32,
  terminals: { top: { x: 0, y: -16 }, bottom: { x: 0, y: 16 } },
  render: ({ switchState }) => /* 커스텀 SVG */,
});
```

등록되지 않은 심볼은 조용히 사라지지 않고 물음표 박스로 표시됩니다 — 도면 데이터가 틀렸다는 사실이 화면에 드러나야 하기 때문입니다.

## 코어와의 접점

계통도의 전기적 상태를 대시보드가 쓰는 공통 등급으로 옮깁니다. 같은 사건을 도면에서는 색으로, 표·배지에서는 등급으로 말하되 서로 어긋나지 않게 하는 지점입니다.

```tsx
import { powerSeverity } from '@enitt/diagram';
import { Badge } from '@enitt/ui';

<Badge severity={powerSeverity(node.state ?? 'unknown')}>
  {POWER_STATE_LABEL[node.state ?? 'unknown']}
</Badge>;
```

| PowerState                | Severity   |
| ------------------------- | ---------- |
| `fault`                   | `critical` |
| `grounded`                | `warning`  |
| `maintenance`             | `info`     |
| `energized`               | `normal`   |
| `deenergized` · `unknown` | `unknown`  |

## 상태 표현

상태는 **색과 패턴** 두 채널로 나갑니다. 여기서 패턴은 보조 수단이 아니라 사실상 1차 채널입니다.

### 왜 색만으로는 안 되는가

도메인 관례상 가압은 녹색, 고장은 적색입니다. 이 두 색은 적록색약(deuteranopia)에서 **ΔE 3.6**(OKLab ×100) — 사실상 같은 색입니다. 관례를 지키는 한 색을 바꿔서는 해결되지 않습니다. 관제실에서 가압과 고장을 헷갈리는 것은 안전 문제이므로, 모든 상태가 고유한 선 패턴을 갖습니다.

| 상태 | 색                     | 선 패턴              | 굵기 |
| ---- | ---------------------- | -------------------- | ---- |
| 가압 | 녹색 (ko-legacy: 적색) | 실선                 | 2    |
| 정전 | 회색 (ko-legacy: 녹색) | 실선                 | 1.5  |
| 고장 | 적색                   | 일점쇄선 `7 3 1.5 3` | 2.75 |
| 접지 | 갈색                   | 짧은 점선 `3 3`      | 2    |
| 점검 | 보라                   | 긴 점선 `10 5`       | 2    |
| 불명 | 회색                   | 촘촘한 점 `1.5 3.5`  | 2    |

**범례는 색 칩이 아니라 실제 선 패턴을 그립니다** — 독자가 도면에서 의지할 것이 패턴인데 범례가 그것을 가르쳐 주지 않으면 소용이 없습니다.

기기 심볼도 같은 원칙을 따릅니다.

| 대상             | 구분 방법                           |
| ---------------- | ----------------------------------- |
| 차단기 투입/개방 | 채워진 사각형 / 빈 사각형           |
| 단로기 개방      | 칼날이 실제로 벌어짐                |
| 단로기 투입      | 고정 접점 가로 막대로 연결선과 구분 |

흑백으로 인쇄해도, 색각 이상이 있어도 상태를 읽을 수 있습니다.

`showFlow` 의 조류 애니메이션은 **가압 선로에만** 겁니다. 다른 상태에서는 선 패턴이 곧 의미이므로 덮어쓰면 안 되고, `prefers-reduced-motion` 에서는 실선으로 되돌아가며 방향은 화살표 마커가 맡습니다.

### 색 관례

기본값은 현대 HMI 관례(가압=녹색, 정전=회색)입니다. 국내 전력 현장 관행(충전=적색, 정전=녹색)은 **토큰 프리셋**으로 바꿉니다:

```tsx
<ThemeProvider presets={{ 'power-convention': 'ko-legacy' }}>
```

프리셋 자체는 `@enitt/tokens` 의 `src/presets.json` 이 선언합니다. `ThemeProvider` 는 어떤 프리셋이 있는지 알 필요 없이 `data-enitt-power-convention` 속성만 붙이고, 나머지는 CSS 가 합니다.

## 조작

드래그로 이동, 휠로 확대(커서 기준). 키보드: 방향키 이동, `+`/`-` 확대·축소, `0` 초기화.

`interactive={false}` 로 잠그면 인쇄·캡처용 정적 렌더가 됩니다.

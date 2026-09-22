# @enitt/diagram

업무 도메인에 묶이지 않은 노드·링크 다이어그램 렌더러입니다. 선언형 데이터를 받아 SVG로 그립니다.

```bash
pnpm add @enitt/diagram @enitt/ui @enitt/tokens
```

```tsx
import '@enitt/tokens/tokens.css';
import '@enitt/ui/styles.css';
import '@enitt/diagram/styles.css';
import { DiagramCanvas, type Diagram } from '@enitt/diagram';

const diagram: Diagram = {
  nodes: [
    { id: 'start', type: 'start', x: 80, y: 120, label: '시작' },
    { id: 'check', type: 'decision', x: 240, y: 120, label: '검토' },
  ],
  links: [{ id: 'next', from: 'start:right', to: 'check:left', direction: 'forward' }],
};

<DiagramCanvas diagram={diagram} onSelectNode={setSelected} />;
```

## 스키마

```ts
{ id, type, x, y, label?, sublabel?, status?, rotation?, scale?, annotations?, meta? } // 노드
{ id, from, to, status?, routing?, direction?, style?, label? }                        // 링크
```

`from`/`to`는 `"step-1"` 또는 `"step-1:right"` 형태입니다. 단자를 생략하면 상대 노드에 가장 가까운 단자를 고릅니다.

상태는 특정 업무 의미가 아니라 `default`, `active`, `success`, `warning`, `critical`, `muted`의 공통 시각 표현만 제공합니다. 실제 업무 상태는 앱에서 이 값으로 매핑합니다.

## 기본 심볼

`process` `decision` `database` `document` `start` `end` `event` `note` `circle` `hexagon`

앱 전용 심볼도 등록할 수 있습니다.

```tsx
registerSymbol('service', {
  width: 48,
  height: 32,
  terminals: {
    left: { x: -24, y: 0 },
    right: { x: 24, y: 0 },
  },
  render: () => <rect className="enitt-diagram__body" x={-24} y={-16} width={48} height={32} />,
});
```

등록되지 않은 심볼은 누락되지 않고 물음표 박스로 표시됩니다.

## 조작

드래그로 이동하고 휠로 확대·축소합니다. 키보드는 방향키 이동, `+`/`-` 확대·축소, `0` 초기화를 지원합니다. `interactive={false}`로 잠그면 인쇄·캡처용 정적 렌더가 됩니다.

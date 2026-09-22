import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from '@enitt/ui';
import { DIAGRAM_STATUS_LABEL, DiagramCanvas, type DiagramNode } from '@enitt/diagram';
import { requestFlow, requestFlowLegend } from './diagram-mock.js';

const meta: Meta = {
  title: '다이어그램/범용 다이어그램',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/**
 * 업무 도메인과 무관한 노드·링크 다이어그램이다.
 * 드래그로 이동하고 휠 또는 툴바로 확대·축소할 수 있다.
 */
export const 기본: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <Panel title="요청 처리 흐름" subtitle="범용 심볼 · 직교/직선 연결 · 상태 표현" flush>
        <DiagramCanvas
          diagram={requestFlow}
          height={560}
          legend={requestFlowLegend}
          ariaLabel="요청 접수부터 완료까지의 처리 흐름"
        />
      </Panel>
    </div>
  ),
};

/** 노드를 선택하면 앱의 상세 영역과 연결할 수 있다. */
export const 선택연동: Story = {
  render: function SelectionStory() {
    const [selected, setSelected] = useState<DiagramNode | null>(null);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 16rem',
          gap: 16,
          padding: 16,
        }}
      >
        <Panel title="요청 처리 흐름" flush>
          <DiagramCanvas
            diagram={requestFlow}
            height={560}
            selectedId={selected?.id ?? null}
            onSelectNode={setSelected}
            legend={requestFlowLegend}
          />
        </Panel>

        <Panel title={selected?.label ?? '노드 선택'}>
          {selected ? (
            <dl
              style={{
                display: 'grid',
                gap: 'var(--enitt-space-3)',
                margin: 0,
                fontSize: 'var(--enitt-font-size-sm)',
              }}
            >
              <Detail label="상태" value={DIAGRAM_STATUS_LABEL[selected.status ?? 'default']} />
              <Detail label="심볼" value={selected.type} />
              {selected.sublabel && <Detail label="설명" value={selected.sublabel} />}
              {selected.annotations?.map((annotation) => (
                <Detail key={annotation.text} label="메모" value={annotation.text} />
              ))}
            </dl>
          ) : (
            <p
              style={{
                margin: 0,
                color: 'var(--enitt-color-fg-subtle)',
                fontSize: 'var(--enitt-font-size-sm)',
              }}
            >
              다이어그램에서 노드를 선택하세요.
            </p>
          )}
        </Panel>
      </div>
    );
  },
};

/** 상호작용을 잠그면 인쇄·캡처용으로 사용할 수 있다. */
export const 정적렌더: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <Panel title="정적 다이어그램" flush>
        <DiagramCanvas diagram={requestFlow} height={520} interactive={false} showToolbar={false} />
      </Panel>
    </div>
  ),
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        style={{
          color: 'var(--enitt-color-fg-subtle)',
          fontSize: 'var(--enitt-font-size-xs)',
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </div>
  );
}

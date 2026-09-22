import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Panel } from '@enitt/ui';
import {
  POWER_STATE_LABEL,
  SingleLineDiagram,
  powerSeverity,
  type DiagramNode,
} from '@enitt/diagram';
import { substation } from './diagram-mock.js';

const meta: Meta = {
  title: '계통도/단선결선도',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/**
 * 수전설비 단선결선도.
 *
 * 노드와 링크 배열만 주면 렌더러가 좌표대로 그린다. 상태는 **색과 모양** 두 채널로
 * 전달된다 — 차단기 투입은 채워진 사각형, 개방은 빈 사각형, 단로기 개방은 칼날이
 * 실제로 벌어진다. 흑백으로 인쇄해도 접점 상태를 읽을 수 있다.
 *
 * 조작: 드래그로 이동, 휠로 확대(커서 기준), 방향키·`+`/`-`/`0` 으로도 가능.
 */
export const 기본: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <Panel title="수전설비 계통도" subtitle="22.9 kV 수전 · 1000 kVA" flush>
        <SingleLineDiagram diagram={substation} height={560} showFlow />
      </Panel>
    </div>
  ),
};

/** 기기를 누르면 상세 패널이 따라 바뀐다. */
export const 선택연동: Story = {
  render: function 선택Story() {
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
        <Panel title="수전설비 계통도" flush>
          <SingleLineDiagram
            diagram={substation}
            height={560}
            selectedId={selected?.id ?? null}
            onSelectNode={setSelected}
            showFlow
          />
        </Panel>

        <Panel title={selected ? (selected.label ?? selected.id) : '기기 선택'}>
          {selected ? (
            <dl
              style={{
                display: 'grid',
                gap: 'var(--enitt-space-2)',
                margin: 0,
                fontSize: 'var(--enitt-font-size-sm)',
              }}
            >
              <div>
                <dt
                  style={{
                    color: 'var(--enitt-color-fg-subtle)',
                    fontSize: 'var(--enitt-font-size-xs)',
                  }}
                >
                  상태
                </dt>
                <dd style={{ margin: 0 }}>
                  <Badge severity={powerSeverity(selected.state ?? 'unknown')}>
                    {POWER_STATE_LABEL[selected.state ?? 'unknown']}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt
                  style={{
                    color: 'var(--enitt-color-fg-subtle)',
                    fontSize: 'var(--enitt-font-size-xs)',
                  }}
                >
                  종류
                </dt>
                <dd style={{ margin: 0 }}>{selected.type}</dd>
              </div>
              {selected.sublabel && (
                <div>
                  <dt
                    style={{
                      color: 'var(--enitt-color-fg-subtle)',
                      fontSize: 'var(--enitt-font-size-xs)',
                    }}
                  >
                    정격
                  </dt>
                  <dd style={{ margin: 0 }}>{selected.sublabel}</dd>
                </div>
              )}
              {selected.measurements?.map((m) => (
                <div key={m.text}>
                  <dt
                    style={{
                      color: 'var(--enitt-color-fg-subtle)',
                      fontSize: 'var(--enitt-font-size-xs)',
                    }}
                  >
                    계측
                  </dt>
                  <dd style={{ margin: 0 }}>{m.text}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p
              style={{
                color: 'var(--enitt-color-fg-subtle)',
                fontSize: 'var(--enitt-font-size-sm)',
              }}
            >
              도면에서 기기를 선택하세요.
            </p>
          )}
        </Panel>
      </div>
    );
  },
};

/**
 * 툴바에서 **계통도 색 관례**를 `충전=적색` 으로 바꾸면, 토큰 프리셋 한 쌍만
 * 교체되고 컴포넌트 코드는 그대로다. 앱에서는
 * `<ThemeProvider presets={{ 'power-convention': 'ko-legacy' }}>` 로 켠다.
 */
export const 정적렌더: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <Panel title="인쇄·캡처용 (팬/줌 잠금)" flush>
        <SingleLineDiagram
          diagram={substation}
          height={520}
          interactive={false}
          showToolbar={false}
        />
      </Panel>
    </div>
  ),
};

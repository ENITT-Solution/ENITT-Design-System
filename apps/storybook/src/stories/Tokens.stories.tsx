import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: '기초/디자인 토큰',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

function Swatch({ name, token }: { name: string; token: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--enitt-space-3)' }}>
      <span
        style={{
          inlineSize: 44,
          blockSize: 28,
          borderRadius: 'var(--enitt-radius-sm)',
          background: `var(${token})`,
          border: '1px solid var(--enitt-color-border-default)',
          flex: 'none',
        }}
      />
      <span style={{ display: 'flex', flexDirection: 'column', minInlineSize: 0 }}>
        <code style={{ fontSize: 'var(--enitt-font-size-xs)' }}>{token}</code>
        <span
          style={{ fontSize: 'var(--enitt-font-size-2xs)', color: 'var(--enitt-color-fg-subtle)' }}
        >
          {name}
        </span>
      </span>
    </div>
  );
}

function Group({ title, items }: { title: string; items: Array<[string, string]> }) {
  return (
    <section style={{ marginBlockEnd: 'var(--enitt-space-8)' }}>
      <h3 style={{ marginBlockEnd: 'var(--enitt-space-3)', fontSize: 'var(--enitt-font-size-md)' }}>
        {title}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--enitt-space-3)',
        }}
      >
        {items.map(([name, token]) => (
          <Swatch key={token} name={name} token={token} />
        ))}
      </div>
    </section>
  );
}

/**
 * 토큰은 세 층으로 나뉜다.
 * **팔레트**(원시 색) → **의미 토큰**(bg/fg/border/accent/status/chart) → 컴포넌트.
 * 컴포넌트는 의미 토큰만 본다 — 팔레트를 직접 쓰면 테마 전환이 깨진다.
 */
export const 색상: Story = {
  render: () => (
    <div>
      <Group
        title="표면 · 글자 · 경계"
        items={[
          ['화면 배경', '--enitt-color-bg-canvas'],
          ['패널 표면', '--enitt-color-bg-surface'],
          ['떠 있는 면', '--enitt-color-bg-raised'],
          ['가라앉은 면', '--enitt-color-bg-sunken'],
          ['기본 글자', '--enitt-color-fg-default'],
          ['보조 글자', '--enitt-color-fg-muted'],
          ['흐린 글자', '--enitt-color-fg-subtle'],
          ['기본 경계', '--enitt-color-border-default'],
          ['강한 경계', '--enitt-color-border-strong'],
          ['포커스 링', '--enitt-color-border-focus'],
        ]}
      />
      <Group
        title="상태"
        items={[
          ['정상', '--enitt-color-status-normal'],
          ['안내', '--enitt-color-status-info'],
          ['주의', '--enitt-color-status-warning'],
          ['경고', '--enitt-color-status-serious'],
          ['위험', '--enitt-color-status-critical'],
          ['불명', '--enitt-color-status-unknown'],
        ]}
      />
      <Group
        title="전력 상태 (계통도 도메인 팩)"
        items={[
          ['가압', '--enitt-color-power-energized'],
          ['정전', '--enitt-color-power-deenergized'],
          ['고장', '--enitt-color-power-fault'],
          ['접지', '--enitt-color-power-grounded'],
          ['점검', '--enitt-color-power-maintenance'],
          ['불명', '--enitt-color-power-unknown'],
        ]}
      />
      <Group
        title="차트 계열 — 고정 순서, 순환 금지"
        items={
          Array.from({ length: 8 }, (_, i) => [
            `계열 ${i + 1}`,
            `--enitt-color-chart-series-${i + 1}`,
          ]) as Array<[string, string]>
        }
      />
    </div>
  ),
};

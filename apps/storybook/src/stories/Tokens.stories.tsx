import type { Meta, StoryObj } from '@storybook/react-vite';
import { palette } from '@enitt/tokens';

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

const paletteGroups = [
  ['gray', palette.gray],
  ['red', palette.red],
  ['orange', palette.orange],
  ['yellow', palette.yellow],
  ['green', palette.green],
  ['blue', palette.blue],
  ['indigo', palette.indigo],
  ['violet', palette.violet],
] as const;

const paletteStepRank: Record<string, number> = {
  '00': 0,
  '100': 1,
  '200': 2,
  '300': 3,
  '400': 4,
  '500': 5,
  '600': 6,
  '700': 7,
  '800': 8,
  '900': 9,
  '1000': 10,
};

function PaletteRamp({
  name,
  values,
}: {
  name: string;
  values: Readonly<Record<string, string>>;
}) {
  const entries = Object.entries(values).sort(
    ([a], [b]) => (paletteStepRank[a] ?? 999) - (paletteStepRank[b] ?? 999),
  );

  return (
    <section style={{ marginBlockEnd: 'var(--enitt-space-8)' }}>
      <h3
        style={{
          marginBlockEnd: 'var(--enitt-space-3)',
          fontSize: 'var(--enitt-font-size-md)',
          textTransform: 'capitalize',
        }}
      >
        {name}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, minmax(4.75rem, 1fr))',
          gap: 'var(--enitt-space-2)',
          minInlineSize: '42rem',
          overflowX: 'auto',
        }}
      >
        {entries.map(([step, value]) => (
          <div key={step} style={{ minInlineSize: 0 }}>
            <div
              title={`--enitt-palette-${name}-${step}: ${value}`}
              style={{
                blockSize: 72,
                borderRadius: 'var(--enitt-radius-sm)',
                backgroundColor: value,
                border: '1px solid var(--enitt-color-border-default)',
                boxShadow: 'var(--enitt-shadow-xs)',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--enitt-space-0_5)',
                marginBlockStart: 'var(--enitt-space-1)',
              }}
            >
              <code style={{ fontSize: 'var(--enitt-font-size-xs)' }}>{step}</code>
              <code style={{ fontSize: 'var(--enitt-font-size-2xs)' }}>{value}</code>
            </div>
          </div>
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

/** 원시 팔레트 — 컴포넌트에서는 직접 사용하지 않고 의미 토큰으로 감싼다. */
export const 팔레트: Story = {
  render: () => (
    <div style={{ overflowX: 'auto' }}>
      <p
        style={{
          marginBlockEnd: 'var(--enitt-space-6)',
          color: 'var(--enitt-color-fg-muted)',
          fontSize: 'var(--enitt-font-size-sm)',
        }}
      >
        Gray는 00부터 1000까지, 유채색은 100부터 1000까지 표시합니다. 각 색상의 CSS 변수는
        <code>--enitt-palette-{'{color}'}-{'{step}'}</code> 형식입니다.
      </p>
      {paletteGroups.map(([name, values]) => (
        <PaletteRamp key={name} name={name} values={values} />
      ))}
    </div>
  ),
};

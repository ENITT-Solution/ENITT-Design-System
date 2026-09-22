import type { Meta, StoryObj } from '@storybook/react-vite';
import { formatNumber } from '@enitt/core';
import { GaugeChart, Sparkline, TimeSeriesChart } from '@enitt/charts';
import { Grid, Panel, StatTile } from '@enitt/ui';
import { makeSeries } from './mock.js';

const 요청 = makeSeries('requests', '요청 수', { base: 1200, amplitude: 350, seed: 11 });
const 오류 = makeSeries('errors', '오류 수', { base: 42, amplitude: 38, noise: 14, seed: 23 });
const 지연 = makeSeries('latency', 'p95 응답시간', {
  base: 420,
  amplitude: 180,
  seed: 41,
  gapAt: [40, 47],
});

const meta: Meta = {
  title: '차트/모니터링 차트',
};
export default meta;
type Story = StoryObj;

/**
 * 시계열 차트.
 *
 * - y축은 **하나뿐**이다. 단위가 다른 지표(요청 수와 응답시간)는 차트를 나눈다.
 *   이중 축은 제공하지 않는다.
 * - 커서를 올리면 세로 크로스헤어가 가장 가까운 시각에 붙고, 툴팁이 그 시각의
 *   모든 계열 값을 한 번에 보여준다. 선을 정확히 짚을 필요가 없다.
 * - 차트에 포커스를 준 뒤 ←/→ 로도 같은 값을 읽을 수 있다.
 */
export const 시계열: Story = {
  render: () => (
    <Panel title="트래픽" subtitle="최근 24시간 · 15분 간격">
      <TimeSeriesChart
        series={[요청, 오류]}
        height={280}
        unit="req"
        thresholds={[{ value: 1500, label: '용량 한계', severity: 'critical' }]}
        ariaLabel="최근 24시간 요청 수와 오류 수"
      />
    </Panel>
  ),
};

/** 결측 구간에서는 선이 **끊긴다** — 없는 데이터를 이어 그리지 않는다. */
export const 결측구간: Story = {
  render: () => (
    <Panel title="p95 응답시간" subtitle="가운데 구간은 수집이 중단됐다">
      <TimeSeriesChart series={[지연]} variant="area" height={200} unit="ms" zeroBased />
    </Panel>
  ),
};

/**
 * 스파크라인은 **모양만** 전달한다. 현재 숫자는 옆의 StatTile 값이 맡는다 —
 * 그래서 축도 눈금도 두지 않는다.
 */
export const 스파크라인: Story = {
  render: () => (
    <Grid minItemWidth="15rem">
      <Panel>
        <StatTile
          label="분당 요청"
          value={formatNumber(1_284)}
          deltaPercent={4.2}
          deltaLabel="어제 대비"
          polarity="up-good"
          chart={<Sparkline points={요청.points} width={180} height={36} area />}
        />
      </Panel>
      <Panel>
        <StatTile
          label="분당 오류"
          value={formatNumber(42)}
          deltaPercent={18.3}
          deltaLabel="1시간 전 대비"
          polarity="up-bad"
          chart={
            <Sparkline
              points={오류.points}
              width={180}
              height={36}
              color="var(--enitt-color-chart-series-8)"
              area
            />
          }
        />
      </Panel>
    </Grid>
  ),
};

/**
 * 게이지는 "한계값 대비 현재 비율" **하나**를 보여줄 때만 쓴다.
 * 여러 값을 비교해야 하면 게이지를 늘어놓지 말고 막대로 바꾼다.
 */
export const 게이지: Story = {
  render: () => (
    <div className="sb-row">
      <Panel title="연결 풀 사용률">
        <GaugeChart
          value={95}
          label="db-primary"
          bands={[
            { from: 0, severity: 'normal' },
            { from: 80, severity: 'warning' },
            { from: 95, severity: 'critical' },
          ]}
        />
      </Panel>
      <Panel title="캐시 적중률">
        <GaugeChart value={87} label="redis" severity="info" />
      </Panel>
      <Panel title="수집 상태">
        <GaugeChart value={null} label="데이터 없음" />
      </Panel>
    </div>
  ),
};

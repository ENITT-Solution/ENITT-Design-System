import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { formatMeasurement, formatNumber } from '@enitt/core';
import { GaugeChart, Sparkline, TimeSeriesChart } from '@enitt/charts';
import {
  AlarmList,
  Badge,
  Button,
  DataTable,
  Grid,
  Meter,
  Panel,
  StatTile,
  StatusIndicator,
  type Column,
} from '@enitt/ui';
import { alarms, makeSeries, NOW, services, type ServiceRow } from './mock.js';

const 요청 = makeSeries('requests', '요청 수', { base: 1200, amplitude: 350, seed: 11 });
const 오류 = makeSeries('errors', '오류 수', { base: 42, amplitude: 38, noise: 14, seed: 23 });

const columns: Column<ServiceRow>[] = [
  { key: 'name', header: '서비스' },
  { key: 'state', header: '상태', render: (row) => <Badge severity={row.severity} size="sm" /> },
  {
    key: 'latencyP95',
    header: 'p95',
    numeric: true,
    render: (row) => `${formatNumber(row.latencyP95)} ms`,
  },
  { key: 'saturation', header: '포화도', numeric: true, render: (row) => `${row.saturation}%` },
];

const meta: Meta = {
  title: '패턴/통합 대시보드',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/**
 * 컴포넌트가 한 화면에서 만나는 모습.
 *
 * 필터는 차트 **위 한 줄**에 모으고, 그 아래 모든 위젯이 같은 구간을 본다 —
 * 패널마다 기간 선택이 달리 붙으면 숫자가 서로 어긋난다.
 */
export const 서비스관제: Story = {
  render: function 대시보드() {
    const [range, setRange] = useState('24h');
    const [selected, setSelected] = useState<string | null>('payment');

    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 필터 — 한 줄, 차트 위. 아래 모든 위젯을 한꺼번에 스코프한다 */}
        <div className="sb-row" style={{ justifyContent: 'space-between' }}>
          <div className="sb-row" style={{ gap: 'var(--enitt-space-2)' }}>
            {(['1h', '24h', '7d', '30d'] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={range === key ? 'solid' : 'outline'}
                onClick={() => setRange(key)}
              >
                {key === '1h' ? '1시간' : key === '24h' ? '24시간' : key === '7d' ? '7일' : '30일'}
              </Button>
            ))}
          </div>
          <StatusIndicator severity="critical" pulse>
            미해소 경보 3건
          </StatusIndicator>
        </div>

        {/* KPI */}
        <Grid minItemWidth="14rem">
          <Panel>
            <StatTile
              label="분당 요청"
              value={formatNumber(1_284)}
              deltaPercent={4.2}
              deltaLabel="어제 대비"
              polarity="up-good"
              chart={<Sparkline points={요청.points} width={200} height={32} area />}
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
                  width={200}
                  height={32}
                  color="var(--enitt-color-chart-series-8)"
                  area
                />
              }
            />
          </Panel>
          <Panel>
            <StatTile
              label="p95 응답시간"
              value={formatMeasurement(841, 'ms', { scale: false })}
              status={<StatusIndicator severity="warning" dotOnly />}
            />
          </Panel>
          <Panel title="연결 풀 사용률" divided={false}>
            <GaugeChart
              value={95}
              size={140}
              bands={[
                { from: 0, severity: 'normal' },
                { from: 80, severity: 'warning' },
                { from: 95, severity: 'critical' },
              ]}
            />
          </Panel>
        </Grid>

        {/* 추이 + 경보 */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}
        >
          <Panel title="트래픽" subtitle={`최근 ${range}`}>
            <TimeSeriesChart
              series={[요청, 오류]}
              height={260}
              unit="req"
              thresholds={[{ value: 1500, label: '용량 한계', severity: 'critical' }]}
            />
          </Panel>

          <Panel title="경보" subtitle="미해소 3건" flush>
            <AlarmList alarms={alarms} now={NOW} density="compact" onSelect={() => {}} />
          </Panel>
        </div>

        {/* 표 + 사용률 */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 }}
        >
          <Panel title="서비스 현황" flush footer={<span>5개 서비스 · 분당 196,500 요청</span>}>
            <DataTable
              columns={columns}
              rows={services}
              rowKey={(row) => row.id}
              severityOf={(row) => row.severity}
              density="compact"
              selectedKey={selected}
              onRowClick={(row) => setSelected(row.id)}
              caption="서비스별 지연과 포화도"
            />
          </Panel>

          <Panel title="리소스 사용률">
            <div className="sb-stack">
              <Meter
                label="db-primary 연결 풀"
                value={95}
                thresholds={[
                  { at: 80, severity: 'warning' },
                  { at: 95, severity: 'critical' },
                ]}
              />
              <Meter
                label="api-gateway CPU"
                value={62}
                thresholds={[
                  { at: 80, severity: 'warning' },
                  { at: 95, severity: 'critical' },
                ]}
              />
              <Meter label="캐시 적중률" value={87} severity="info" />
            </div>
          </Panel>
        </div>
      </div>
    );
  },
};

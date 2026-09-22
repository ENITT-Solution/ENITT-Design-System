import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { formatMeasurement, formatNumber, type Severity } from '@enitt/core';
import {
  AlarmList,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Grid,
  Meter,
  Panel,
  StatTile,
  StatusIndicator,
  type Column,
  type SortState,
} from '@enitt/ui';
import { alarms, NOW, services, type ServiceRow } from './mock.js';

const SEVERITIES: Severity[] = ['normal', 'info', 'warning', 'serious', 'critical', 'unknown'];

const meta: Meta = {
  title: '컴포넌트/모니터링',
};
export default meta;
type Story = StoryObj;

/**
 * 버튼은 네 가지 변형만 둔다. `danger` 는 **되돌릴 수 없는 조작**
 * (배포 롤백, 인스턴스 종료, 설정 삭제)에만 쓴다.
 */
export const 버튼: Story = {
  render: () => (
    <div className="sb-stack">
      <div className="sb-row">
        <Button variant="solid">조회</Button>
        <Button variant="outline">내보내기</Button>
        <Button variant="ghost">취소</Button>
        <Button variant="danger">인스턴스 종료</Button>
      </div>
      <div className="sb-row">
        <Button size="sm">작게</Button>
        <Button size="md">보통</Button>
        <Button size="lg">크게</Button>
      </div>
      <div className="sb-row">
        <Button loading>불러오는 중</Button>
        <Button disabled>비활성</Button>
      </div>
    </div>
  ),
};

/**
 * 심각도는 **색 + 아이콘 모양 + 글자** 세 채널로 전달된다.
 * 아이콘 윤곽이 등급마다 다르므로(원/삼각형/마름모/팔각형) 색각 이상에서도 구분된다.
 */
export const 상태표시: Story = {
  render: () => (
    <div className="sb-stack">
      <div className="sb-row">
        {SEVERITIES.map((severity) => (
          <Badge key={severity} severity={severity} />
        ))}
      </div>
      <div className="sb-row">
        {SEVERITIES.map((severity) => (
          <Badge key={severity} severity={severity} appearance="solid" />
        ))}
      </div>
      <div className="sb-row">
        {SEVERITIES.map((severity) => (
          <StatusIndicator key={severity} severity={severity} />
        ))}
      </div>
      <div className="sb-row">
        <StatusIndicator severity="critical" pulse>
          미확인 위험 경보
        </StatusIndicator>
      </div>
    </div>
  ),
};

export const KPI타일: Story = {
  render: () => (
    <Grid minItemWidth="14rem">
      <Panel>
        <StatTile
          label="분당 요청"
          value={formatNumber(128_700)}
          unit="req/min"
          deltaPercent={4.2}
          deltaLabel="어제 같은 시각 대비"
          polarity="up-good"
        />
      </Panel>
      <Panel>
        <StatTile
          label="p95 응답시간"
          value={formatMeasurement(841, 'ms', { scale: false })}
          deltaPercent={18.3}
          deltaLabel="1시간 전 대비"
          polarity="up-bad"
        />
      </Panel>
      <Panel>
        <StatTile
          label="가용률"
          value="99.94%"
          deltaPercent={0}
          deltaLabel="변동 없음"
          status={<StatusIndicator severity="normal" dotOnly />}
        />
      </Panel>
      <Panel>
        <StatTile
          label="미해소 경보"
          value="3"
          unit="건"
          polarity="up-bad"
          deltaPercent={200}
          deltaLabel="1시간 전 대비"
        />
      </Panel>
    </Grid>
  ),
};

export const 사용률막대: Story = {
  render: () => (
    <div style={{ maxInlineSize: 420 }}>
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
          <Meter label="cdn-edge-ap1" value={null} />
        </div>
      </Panel>
    </div>
  ),
};

export const 표: Story = {
  render: function 표Story() {
    const [sort, setSort] = useState<SortState>({ key: 'saturation', direction: 'desc' });
    const [selected, setSelected] = useState<string | null>('payment');

    const columns: Column<ServiceRow>[] = [
      { key: 'name', header: '서비스', sortable: true },
      {
        key: 'state',
        header: '상태',
        render: (row) => <Badge severity={row.severity} size="sm" />,
      },
      {
        key: 'requests',
        header: '분당 요청',
        numeric: true,
        sortable: true,
        render: (row) => formatNumber(row.requests),
      },
      {
        key: 'latencyP95',
        header: 'p95',
        numeric: true,
        sortable: true,
        render: (row) => `${formatNumber(row.latencyP95)} ms`,
      },
      { key: 'errorRate', header: '오류율', numeric: true, render: (row) => `${row.errorRate}%` },
      {
        key: 'saturation',
        header: '포화도',
        numeric: true,
        sortable: true,
        render: (row) => `${row.saturation}%`,
      },
    ];

    const rows = [...services].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const key = sort.key as keyof ServiceRow;
      return a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0;
    });

    return (
      <Panel title="서비스 현황" subtitle="15초마다 갱신" flush>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          severityOf={(row) => row.severity}
          sort={sort}
          onSortChange={setSort}
          selectedKey={selected}
          onRowClick={(row) => setSelected(row.id)}
          stickyHeader
          caption="서비스별 트래픽·지연·오류율"
        />
      </Panel>
    );
  },
};

export const 경보목록: Story = {
  render: function 경보Story() {
    const [list, setList] = useState(alarms);
    return (
      <Panel
        title="경보"
        subtitle={`미해소 ${list.filter((a) => !a.clearedAt).length}건`}
        actions={
          <Button size="sm" variant="ghost">
            전체 보기
          </Button>
        }
        flush
      >
        <AlarmList
          alarms={list}
          now={NOW}
          onAcknowledge={(alarm) =>
            setList((prev) =>
              prev.map((a) => (a.id === alarm.id ? { ...a, acknowledged: true } : a)),
            )
          }
          onSelect={() => {}}
        />
      </Panel>
    );
  },
};

export const 빈상태: Story = {
  render: () => (
    <Panel title="조회 결과">
      <EmptyState
        title="조회된 데이터가 없습니다"
        description="기간을 넓히거나 필터를 해제해 보세요."
        action={
          <Button size="sm" variant="outline">
            필터 초기화
          </Button>
        }
      />
    </Panel>
  ),
};

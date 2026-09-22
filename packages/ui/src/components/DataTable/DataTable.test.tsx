import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from './DataTable.js';

interface Row {
  id: string;
  name: string;
  power: number;
}

const rows: Row[] = [
  { id: 'a', name: 'ACB-1', power: 520 },
  { id: 'b', name: 'ACB-2', power: 610 },
];

const columns: Column<Row>[] = [
  { key: 'name', header: '회선', sortable: true },
  { key: 'power', header: '전력', numeric: true, sortable: true },
];

describe('DataTable', () => {
  it('행이 없으면 빈 상태를 보여준다', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(row) => row.id} />);
    expect(screen.getByText('조회된 데이터가 없습니다')).toBeInTheDocument();
  });

  it('숫자 열은 tabular-nums 로 자릿수를 맞춘다', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />,
    );
    const numericCells = container.querySelectorAll('td.enitt-tnum');
    expect(numericCells).toHaveLength(2);
  });

  it('정렬 헤더를 누르면 방향이 뒤집힌다', async () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        sort={{ key: 'power', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /전력/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'power', direction: 'desc' });
  });

  it('정렬 상태를 aria-sort 로 알린다', () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        sort={{ key: 'power', direction: 'desc' }}
        onSortChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('columnheader', { name: /전력/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('행 클릭이 키보드로도 동작한다', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} onRowClick={onRowClick} />,
    );
    const firstRow = screen.getAllByRole('row')[1]!;
    firstRow.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0);
  });
});

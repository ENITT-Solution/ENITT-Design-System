import type { ReactNode } from 'react';
import { cx, type Severity } from '@enitt/core';
import { IconChevronDown } from '../../internal/icons.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import './DataTable.css';

export type ColumnAlign = 'start' | 'center' | 'end';

export interface Column<T> {
  /** 열 식별자. 정렬 상태의 키로도 쓰인다. */
  key: string;
  header: ReactNode;
  /** 셀 내용. 없으면 `row[key]` 를 그대로 출력한다. */
  render?: (row: T, rowIndex: number) => ReactNode;
  /**
   * 숫자 열. 오른쪽 정렬 + tabular-nums 가 적용돼 자릿수가 세로로 맞는다.
   * (큰 단일 값에는 쓰지 않는다 — StatTile 참고)
   */
  numeric?: boolean;
  align?: ColumnAlign;
  /** CSS 폭. `'8rem'`, `'20%'` 등. */
  width?: string;
  sortable?: boolean;
  /** 헤더에만 보이고 셀에서는 감출 설명. */
  headerTitle?: string;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
  columns: ReadonlyArray<Column<T>>;
  rows: readonly T[];
  /** 행의 안정적인 키. 인덱스를 쓰면 정렬 시 상태가 어긋난다. */
  rowKey: (row: T, index: number) => string;
  /** 행 왼쪽에 심각도 색 띠를 그린다. */
  severityOf?: (row: T) => Severity | undefined;
  /** 행 클릭. 주면 행이 키보드로도 선택 가능해진다. */
  onRowClick?: (row: T, index: number) => void;
  selectedKey?: string | null;
  density?: 'compact' | 'default';
  /** 헤더를 스크롤 컨테이너 상단에 고정한다. */
  stickyHeader?: boolean;
  /** 제어형 정렬 상태. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** 행이 없을 때 보여줄 내용. */
  empty?: ReactNode;
  /** 스크린리더용 표 설명. 시각적으로는 감춰진다. */
  caption?: string;
  className?: string;
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'enitt-table__cell--start',
  center: 'enitt-table__cell--center',
  end: 'enitt-table__cell--end',
};

/**
 * 모니터링용 표.
 *
 * 숫자 열에는 tabular-nums 를 적용해 자릿수가 세로로 맞는다.
 * 심각도는 왼쪽 색 띠 + 셀 안의 배지가 함께 전달한다 — 행 배경을 물들이지 않는다.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  severityOf,
  onRowClick,
  selectedKey,
  density = 'default',
  stickyHeader = false,
  sort,
  onSortChange,
  empty,
  caption,
  className,
}: DataTableProps<T>) {
  const interactive = typeof onRowClick === 'function';

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;
    const direction = sort?.key === column.key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: column.key, direction });
  };

  if (rows.length === 0) {
    return (
      <div className={cx('enitt-table-wrap', className)}>
        {empty ?? <EmptyState title="조회된 데이터가 없습니다" size="sm" />}
      </div>
    );
  }

  return (
    <div className={cx('enitt-table-wrap', className)}>
      <table
        className={cx(
          'enitt-table',
          `enitt-table--${density}`,
          stickyHeader && 'enitt-table--sticky',
          interactive && 'enitt-table--interactive',
        )}
      >
        {caption && <caption className="enitt-visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {severityOf && (
              <th className="enitt-table__severity-head" scope="col" aria-label="상태" />
            )}
            {columns.map((column) => {
              const align = column.align ?? (column.numeric ? 'end' : 'start');
              const sorted = sort?.key === column.key ? sort.direction : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cx('enitt-table__cell', 'enitt-table__head-cell', ALIGN_CLASS[align])}
                  style={column.width ? { inlineSize: column.width } : undefined}
                  title={column.headerTitle}
                  aria-sort={sorted ? (sorted === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      className="enitt-table__sort"
                      onClick={() => handleSort(column)}
                    >
                      {column.header}
                      <IconChevronDown
                        className={cx(
                          'enitt-table__sort-icon',
                          sorted && `enitt-table__sort-icon--${sorted}`,
                        )}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const key = rowKey(row, rowIndex);
            const severity = severityOf?.(row);
            return (
              <tr
                key={key}
                className={cx(
                  'enitt-table__row',
                  severity && `enitt-table__row--${severity}`,
                  selectedKey === key && 'enitt-table__row--selected',
                )}
                onClick={interactive ? () => onRowClick(row, rowIndex) : undefined}
                onKeyDown={
                  interactive
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row, rowIndex);
                        }
                      }
                    : undefined
                }
                tabIndex={interactive ? 0 : undefined}
                aria-selected={interactive ? selectedKey === key : undefined}
              >
                {severityOf && <td className="enitt-table__severity-cell" aria-hidden="true" />}
                {columns.map((column) => {
                  const align = column.align ?? (column.numeric ? 'end' : 'start');
                  return (
                    <td
                      key={column.key}
                      className={cx(
                        'enitt-table__cell',
                        ALIGN_CLASS[align],
                        column.numeric && 'enitt-tnum',
                      )}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

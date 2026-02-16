import React, { useCallback, useRef, useMemo } from 'react';
import {
  flexRender,
  type ColumnDef,
  type Table,
  type Header,
  type Row,
} from '@tanstack/react-table';
import { useDataTable, type UseDataTableOptions } from '../../hooks/useDataTable';
import { downloadCSV } from '../../utils/csvExport';
import { useVirtualScroll } from './useVirtualScroll';

/* ==========================================================================
   DataTable Component
   Full-featured data table powered by TanStack Table v8 with:
   - Multi-column sorting (click + shift-click)
   - Column-level filters + global search
   - Configurable pagination (10, 25, 50, 100)
   - Row selection with checkbox column
   - CSV export (respects filters/sorting/selection)
   - Virtual scrolling for 1000+ rows
   - Responsive horizontal scroll with priority columns
   - Full WCAG accessibility (ARIA grid pattern, keyboard nav)
   ========================================================================== */

export interface DataTableProps<T> {
  /** Table title */
  title?: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Row data */
  data: T[];
  /** TanStack column definitions */
  columns: ColumnDef<T, any>[];
  /** Enable sorting (default: true) */
  enableSorting?: boolean;
  /** Enable multi-column sort (default: true) */
  enableMultiSort?: boolean;
  /** Enable column filters (default: true) */
  enableColumnFilters?: boolean;
  /** Enable global search (default: true) */
  enableGlobalFilter?: boolean;
  /** Enable row selection checkboxes (default: false) */
  enableRowSelection?: boolean;
  /** Enable CSV export (default: true) */
  enableExport?: boolean;
  /** Enable pagination (default: true) */
  enablePagination?: boolean;
  /** Enable virtual scrolling for large datasets (default: false) */
  enableVirtualScrolling?: boolean;
  /** Height for virtual scrolling container in px (default: 500) */
  virtualScrollHeight?: number;
  /** Initial page size (default: 10) */
  initialPageSize?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Unique row id accessor */
  getRowId?: (row: T) => string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Batch action handler (called with selected rows) */
  onBatchAction?: (action: string, rows: T[]) => void;
  /** Custom batch actions */
  batchActions?: { id: string; label: string; variant?: 'default' | 'danger' }[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Retry handler */
  onRetry?: () => void;
  /** CSS class name */
  className?: string;
  /** Export filename */
  exportFilename?: string;
  /** Columns hidden on mobile (by id) for responsive priority */
  mobileHiddenColumns?: string[];
  /** Striped rows */
  striped?: boolean;
  /** Compact density */
  compact?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

/* --------------------------------------------------------------------------
   Main Component
   -------------------------------------------------------------------------- */

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  enableSorting = true,
  enableMultiSort = true,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  enableRowSelection = false,
  enableExport = true,
  enablePagination = true,
  enableVirtualScrolling = false,
  virtualScrollHeight = 500,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  getRowId,
  onRowClick,
  onBatchAction,
  batchActions = [],
  loading = false,
  error = null,
  onRetry,
  className = '',
  exportFilename = 'table-export',
  mobileHiddenColumns = [],
  striped = false,
  compact = false,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null!);


  // Build selection column if needed
  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<T, any> = {
      id: '_select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="dt-checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="dt-checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
      size: 44,
      enableSorting: false,
      enableColumnFilter: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  // Use the hook
  const {
    table,
    globalFilter,
    setGlobalFilter,
    selectedRows,
    filteredRowCount,
    totalRowCount,
    clearSelection,
    clearAllFilters,
    hasActiveFilters,
    pageSizeOptions: resolvedPageSizeOptions,
  } = useDataTable<T>({
    data,
    columns: tableColumns,
    enableSorting,
    enableMultiSort,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowSelection,
    enablePagination: enablePagination && !enableVirtualScrolling,
    initialPageSize,
    pageSizeOptions,
    getRowId,
  });

  // Virtual scrolling
  const allRows = table.getRowModel().rows;
  const { virtualRows, totalHeight, containerRef, rowHeight } = useVirtualScroll({
    count: enableVirtualScrolling ? allRows.length : 0,
    estimateSize: compact ? 36 : 44,
    overscan: 10,
    containerHeight: virtualScrollHeight,
    enabled: enableVirtualScrolling,
  });

  // CSV Export handler
  const handleCSVExport = useCallback(() => {
    const exportColumns = columns
      .filter((col) => col.id !== '_select')
      .map((col) => ({
        id: String(col.id ?? ''),
        header: typeof col.header === 'string' ? col.header : String(col.id ?? ''),
        accessor: (col as any).accessorKey
          ? (col as any).accessorKey
          : (col as any).accessorFn
            ? (col as any).accessorFn
            : (row: T) => (row as any)[(col as any).accessorKey ?? col.id ?? ''],
      }));

    // Export selected rows if any, otherwise export all visible/filtered rows
    const exportData =
      selectedRows.length > 0
        ? selectedRows
        : table.getFilteredRowModel().rows.map((r) => r.original);

    downloadCSV({
      columns: exportColumns,
      data: exportData,
      filename: exportFilename,
      includeTimestamp: true,
    });
  }, [columns, selectedRows, table, exportFilename]);

  // Batch action handler
  const handleBatchAction = useCallback(
    (actionId: string) => {
      if (onBatchAction && selectedRows.length > 0) {
        onBatchAction(actionId, selectedRows);
      }
    },
    [onBatchAction, selectedRows],
  );

  // ---- Loading State ----
  if (loading) {
    return (
      <div
        className={`dt ${compact ? 'dt--compact' : ''} dt--loading ${className}`}
        aria-busy="true"
        aria-label="Loading table data"
      >
        {title && <div className="dt__header"><h3 className="dt__title">{title}</h3></div>}
        <div className="dt__skeleton">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="dt__skeleton-row">
              {Array.from({ length: Math.min(columns.length, 5) }, (_, j) => (
                <div key={j} className="dt__skeleton-cell" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (error) {
    return (
      <div className={`dt dt--error ${className}`}>
        {title && <div className="dt__header"><h3 className="dt__title">{title}</h3></div>}
        <div className="dt__error" role="alert">
          <p className="dt__error-title">Failed to load data</p>
          <p className="dt__error-detail">{error}</p>
          {onRetry && (
            <button className="dt__error-retry" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- Render ----
  const headerGroups = table.getHeaderGroups();
  const rows = enableVirtualScrolling ? allRows : table.getRowModel().rows;

  return (
    <div
      className={`dt ${compact ? 'dt--compact' : ''} ${striped ? 'dt--striped' : ''} ${className}`}
      role="region"
      aria-label={title || 'Data table'}
    >
      {/* ---- Toolbar ---- */}
      <div className="dt__toolbar">
        <div className="dt__toolbar-left">
          {title && (
            <div className="dt__title-group">
              <h3 className="dt__title">{title}</h3>
              {subtitle && <p className="dt__subtitle">{subtitle}</p>}
            </div>
          )}
        </div>
        <div className="dt__toolbar-right">
          {/* Global Search */}
          {enableGlobalFilter && (
            <div className="dt__search">
              <input
                type="search"
                className="dt__search-input"
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                aria-label="Search table"
              />
              {globalFilter && (
                <button
                  className="dt__search-clear"
                  onClick={() => setGlobalFilter('')}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button className="dt__btn dt__btn--ghost" onClick={clearAllFilters}>
              Clear filters
            </button>
          )}

          {/* CSV Export */}
          {enableExport && (
            <button className="dt__btn dt__btn--secondary" onClick={handleCSVExport}>
              <span className="dt__btn-icon" aria-hidden="true">&#8615;</span>
              Export CSV
              {selectedRows.length > 0 && ` (${selectedRows.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ---- Batch Actions Bar ---- */}
      {enableRowSelection && selectedRows.length > 0 && (
        <div className="dt__batch-bar" role="toolbar" aria-label="Batch actions">
          <span className="dt__batch-count">
            {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="dt__batch-actions">
            {batchActions.map((action) => (
              <button
                key={action.id}
                className={`dt__btn ${action.variant === 'danger' ? 'dt__btn--danger' : 'dt__btn--secondary'}`}
                onClick={() => handleBatchAction(action.id)}
              >
                {action.label}
              </button>
            ))}
            <button className="dt__btn dt__btn--ghost" onClick={clearSelection}>
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* ---- Table ---- */}
      <div
        className="dt__scroll-container"
        ref={(enableVirtualScrolling ? containerRef : scrollContainerRef) as React.RefObject<HTMLDivElement>}
        style={
          enableVirtualScrolling
            ? { height: virtualScrollHeight, overflow: 'auto' }
            : undefined
        }
        tabIndex={0}
      >
        <table
          className="dt__table"
          role="grid"
          aria-rowcount={filteredRowCount}
          aria-colcount={tableColumns.length}
        >
          {/* ---- Head ---- */}
          <thead className="dt__thead">
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => (
                  <HeaderCell
                    key={header.id}
                    header={header}
                    mobileHiddenColumns={mobileHiddenColumns}
                    enableColumnFilters={enableColumnFilters}
                  />
                ))}
              </tr>
            ))}
          </thead>

          {/* ---- Body ---- */}
          <tbody className="dt__tbody">
            {enableVirtualScrolling ? (
              <>
                {/* Spacer for virtual scroll */}
                {totalHeight > 0 && (
                  <tr style={{ height: virtualRows[0]?.start ?? 0 }}>
                    <td colSpan={tableColumns.length} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
                {virtualRows.map((virtualRow) => {
                  const row = allRows[virtualRow.index];
                  if (!row) return null;
                  return (
                    <DataRow
                      key={row.id}
                      row={row}
                      onRowClick={onRowClick}
                      mobileHiddenColumns={mobileHiddenColumns}
                      style={{ height: rowHeight }}
                    />
                  );
                })}
                {/* Bottom spacer */}
                {totalHeight > 0 && (
                  <tr
                    style={{
                      height: Math.max(
                        0,
                        totalHeight -
                          (virtualRows[virtualRows.length - 1]?.end ?? 0),
                      ),
                    }}
                  >
                    <td colSpan={tableColumns.length} style={{ padding: 0, border: 'none' }} />
                  </tr>
                )}
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="dt__empty-cell"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <DataRow
                  key={row.id}
                  row={row}
                  onRowClick={onRowClick}
                  mobileHiddenColumns={mobileHiddenColumns}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Pagination ---- */}
      {enablePagination && !enableVirtualScrolling && (
        <Pagination
          table={table}
          pageSizeOptions={resolvedPageSizeOptions}
          filteredRowCount={filteredRowCount}
          totalRowCount={totalRowCount}
        />
      )}

      {/* ---- Virtual Scroll Info ---- */}
      {enableVirtualScrolling && (
        <div className="dt__virtual-info">
          <span className="dt__page-info">
            Showing {allRows.length.toLocaleString()} of{' '}
            {totalRowCount.toLocaleString()} rows
            {hasActiveFilters ? ' (filtered)' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   HeaderCell Sub-component
   -------------------------------------------------------------------------- */

function HeaderCell<T>({
  header,
  mobileHiddenColumns,
  enableColumnFilters,
}: {
  header: Header<T, unknown>;
  mobileHiddenColumns: string[];
  enableColumnFilters: boolean;
}) {
  const isSortable = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();
  const isHiddenMobile = mobileHiddenColumns.includes(header.column.id);

  return (
    <th
      className={`dt__th ${isSortable ? 'dt__th--sortable' : ''} ${isHiddenMobile ? 'dt__th--mobile-hidden' : ''} ${header.column.id === '_select' ? 'dt__th--checkbox' : ''}`}
      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
      aria-sort={
        sortDirection === 'asc'
          ? 'ascending'
          : sortDirection === 'desc'
            ? 'descending'
            : 'none'
      }
      role="columnheader"
      tabIndex={isSortable ? 0 : undefined}
      onKeyDown={
        isSortable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.column.toggleSorting(undefined, e.shiftKey);
              }
            }
          : undefined
      }
    >
      <div className="dt__th-content">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {isSortable && (
          <span className="dt__sort-indicator" aria-hidden="true">
            {sortDirection === 'asc' ? (
              <span className="dt__sort-icon dt__sort-icon--active">{'\u25B2'}</span>
            ) : sortDirection === 'desc' ? (
              <span className="dt__sort-icon dt__sort-icon--active">{'\u25BC'}</span>
            ) : (
              <span className="dt__sort-icon">{'\u25B2\u25BC'}</span>
            )}
          </span>
        )}
      </div>

      {/* Column filter */}
      {enableColumnFilters && header.column.getCanFilter() && header.column.id !== '_select' && (
        <div className="dt__column-filter" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            className="dt__filter-input"
            placeholder={`Filter...`}
            value={(header.column.getFilterValue() as string) ?? ''}
            onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
            aria-label={`Filter ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.column.id}`}
          />
        </div>
      )}
    </th>
  );
}

/* --------------------------------------------------------------------------
   DataRow Sub-component
   -------------------------------------------------------------------------- */

function DataRow<T>({
  row,
  onRowClick,
  mobileHiddenColumns,
  style,
}: {
  row: Row<T>;
  onRowClick?: (row: T) => void;
  mobileHiddenColumns: string[];
  style?: React.CSSProperties;
}) {
  return (
    <tr
      className={`dt__tr ${row.getIsSelected() ? 'dt__tr--selected' : ''} ${onRowClick ? 'dt__tr--clickable' : ''}`}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      style={style}
      role="row"
      aria-selected={row.getIsSelected() || undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onKeyDown={
        onRowClick
          ? (e) => {
              if (e.key === 'Enter') onRowClick(row.original);
            }
          : undefined
      }
    >
      {row.getVisibleCells().map((cell) => {
        const isHiddenMobile = mobileHiddenColumns.includes(cell.column.id);
        return (
          <td
            key={cell.id}
            className={`dt__td ${isHiddenMobile ? 'dt__td--mobile-hidden' : ''} ${cell.column.id === '_select' ? 'dt__td--checkbox' : ''}`}
            role="gridcell"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

/* --------------------------------------------------------------------------
   Pagination Sub-component
   -------------------------------------------------------------------------- */

function Pagination<T>({
  table,
  pageSizeOptions,
  filteredRowCount,
  totalRowCount,
}: {
  table: Table<T>;
  pageSizeOptions: number[];
  filteredRowCount: number;
  totalRowCount: number;
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredRowCount);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }
    const pages: (number | 'ellipsis')[] = [0];
    if (pageIndex > 2) pages.push('ellipsis');
    for (
      let i = Math.max(1, pageIndex - 1);
      i <= Math.min(pageCount - 2, pageIndex + 1);
      i++
    ) {
      pages.push(i);
    }
    if (pageIndex < pageCount - 3) pages.push('ellipsis');
    pages.push(pageCount - 1);
    return pages;
  };

  return (
    <div className="dt__pagination" role="navigation" aria-label="Table pagination">
      {/* Left: row info */}
      <div className="dt__pagination-info">
        <span className="dt__page-info">
          {filteredRowCount > 0
            ? `${startRow}--${endRow} of ${filteredRowCount.toLocaleString()}`
            : '0 results'}
          {filteredRowCount !== totalRowCount && (
            <span className="dt__page-info-filtered">
              {' '}
              (filtered from {totalRowCount.toLocaleString()})
            </span>
          )}
        </span>
      </div>

      {/* Center: page buttons */}
      <div className="dt__pagination-pages">
        <button
          className="dt__page-btn"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="First page"
        >
          &laquo;
        </button>
        <button
          className="dt__page-btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          &lsaquo;
        </button>

        {getPageNumbers().map((pageNum, i) =>
          pageNum === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="dt__page-ellipsis">
              &hellip;
            </span>
          ) : (
            <button
              key={pageNum}
              className={`dt__page-btn ${pageNum === pageIndex ? 'dt__page-btn--active' : ''}`}
              onClick={() => table.setPageIndex(pageNum)}
              aria-label={`Page ${pageNum + 1}`}
              aria-current={pageNum === pageIndex ? 'page' : undefined}
            >
              {pageNum + 1}
            </button>
          ),
        )}

        <button
          className="dt__page-btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          &rsaquo;
        </button>
        <button
          className="dt__page-btn"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="Last page"
        >
          &raquo;
        </button>
      </div>

      {/* Right: page size selector */}
      <div className="dt__pagination-size">
        <label htmlFor="dt-page-size" className="dt__page-size-label">
          Rows per page:
        </label>
        <select
          id="dt-page-size"
          className="dt__page-size-select"
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DataTable;

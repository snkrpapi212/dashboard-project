import React, { useState, useMemo, useCallback } from 'react';
import type {
  ColumnDef,
  SortState,
  SortDirection,
  PaginationState,
  ExportFormat,
} from '../../types/dashboard';

/* ==========================================================================
   TableWidget Component
   Advanced data table with pagination, sorting, filtering, row selection,
   and export support.  Uses dashboard design tokens.
   ========================================================================== */

export interface TableWidgetProps<T extends Record<string, any>> {
  /** Table title */
  title?: string;
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row data */
  data: T[];
  /** Enable multi-column sorting */
  sortable?: boolean;
  /** Enable column text filtering */
  filterable?: boolean;
  /** Enable row checkbox selection */
  selectable?: boolean;
  /** Enable export actions */
  exportable?: boolean;
  /** Rows per page (0 = no pagination) */
  pageSize?: number;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Retry handler */
  onRetry?: () => void;
  /** Export handler */
  onExport?: (format: ExportFormat, selectedRows?: T[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Unique key accessor */
  rowKey?: keyof T | ((row: T) => string);
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function getRowId<T extends Record<string, any>>(
  row: T,
  rowKey?: keyof T | ((row: T) => string),
  index?: number,
): string {
  if (typeof rowKey === 'function') return rowKey(row);
  if (rowKey) return String(row[rowKey]);
  return String(index);
}

function getCellValue<T>(row: T, accessor: ColumnDef<T>['accessor']): any {
  if (typeof accessor === 'function') return accessor(row);
  return (row as any)[accessor];
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export function TableWidget<T extends Record<string, any>>({
  title,
  columns,
  data,
  sortable = true,
  filterable = true,
  selectable = false,
  exportable = true,
  pageSize = 10,
  loading = false,
  error = null,
  onRetry,
  onExport,
  onRowClick,
  rowKey,
}: TableWidgetProps<T>) {
  // Sort state
  const [sort, setSort] = useState<SortState>({ columnId: '', direction: null });
  // Column filter text
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  // Pagination
  const [page, setPage] = useState(0);
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Export menu
  const [showExport, setShowExport] = useState(false);

  // Apply column filters
  const filteredData = useMemo(() => {
    if (!filterable) return data;
    return data.filter((row) =>
      columns.every((col) => {
        const filterText = columnFilters[col.id];
        if (!filterText) return true;
        const cellVal = String(getCellValue(row, col.accessor) ?? '').toLowerCase();
        return cellVal.includes(filterText.toLowerCase());
      }),
    );
  }, [data, columns, columnFilters, filterable]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sort.direction || !sort.columnId) return filteredData;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, col.accessor);
      const bVal = getCellValue(b, col.accessor);
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sort, columns]);

  // Pagination
  const totalPages = pageSize > 0 ? Math.ceil(sortedData.length / pageSize) : 1;
  const paginatedData =
    pageSize > 0 ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData;

  // Handlers
  const handleSort = useCallback(
    (columnId: string) => {
      if (!sortable) return;
      setSort((prev) => {
        if (prev.columnId !== columnId) return { columnId, direction: 'asc' };
        const next: SortDirection =
          prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
        return { columnId, direction: next };
      });
    },
    [sortable],
  );

  const handleFilter = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [columnId]: value }));
    setPage(0);
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [],
  );

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      const ids = paginatedData.map((row, i) => getRowId(row, rowKey, i));
      setSelectedIds(new Set(ids));
    }
  }, [paginatedData, selectedIds, rowKey]);

  const selectedRows = useMemo(
    () => data.filter((row, i) => selectedIds.has(getRowId(row, rowKey, i))),
    [data, selectedIds, rowKey],
  );

  const handleExport = useCallback(
    (format: ExportFormat) => {
      onExport?.(format, selectedRows.length > 0 ? selectedRows : undefined);
      setShowExport(false);
    },
    [onExport, selectedRows],
  );

  // ---- Render ----

  if (loading) {
    return <TableSkeleton title={title} columnCount={columns.length} />;
  }

  if (error) {
    return (
      <div className="table-widget table-widget--error">
        {title && <h3 className="table-widget__title">{title}</h3>}
        <div className="table-widget__error" role="alert">
          <p>Failed to load table data</p>
          <p className="table-widget__error-detail">{error}</p>
          {onRetry && (
            <button className="table-widget__retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="table-widget">
      {/* Header */}
      {(title || exportable) && (
        <div className="table-widget__header">
          {title && <h3 className="table-widget__title">{title}</h3>}
          <div className="table-widget__header-actions">
            {selectable && selectedIds.size > 0 && (
              <span className="table-widget__selection-count">
                {selectedIds.size} selected
              </span>
            )}
            {exportable && onExport && (
              <div className="table-widget__export-wrapper">
                <button
                  className="table-widget__export-btn"
                  onClick={() => setShowExport(!showExport)}
                  aria-haspopup="menu"
                  aria-expanded={showExport}
                >
                  Export
                </button>
                {showExport && (
                  <div className="table-widget__export-menu" role="menu">
                    <button role="menuitem" onClick={() => handleExport('csv')}>
                      CSV
                    </button>
                    <button role="menuitem" onClick={() => handleExport('pdf')}>
                      PDF
                    </button>
                    <button role="menuitem" onClick={() => handleExport('image')}>
                      Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-widget__scroll-container" role="region" aria-label={title || 'Data table'} tabIndex={0}>
        <table className="table-widget__table">
          <thead>
            <tr>
              {selectable && (
                <th className="table-widget__th table-widget__th--checkbox">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 && selectedIds.size === paginatedData.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`table-widget__th ${col.sortable !== false && sortable ? 'table-widget__th--sortable' : ''}`}
                  style={{ width: col.width, textAlign: col.align }}
                  onClick={
                    col.sortable !== false && sortable
                      ? () => handleSort(col.id)
                      : undefined
                  }
                  aria-sort={
                    sort.columnId === col.id && sort.direction
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span className="table-widget__th-content">
                    {col.header}
                    {sort.columnId === col.id && sort.direction && (
                      <span className="table-widget__sort-icon" aria-hidden="true">
                        {sort.direction === 'asc' ? '\u25B2' : '\u25BC'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>

            {/* Column filters */}
            {filterable && (
              <tr className="table-widget__filter-row">
                {selectable && <th />}
                {columns.map((col) => (
                  <th key={col.id} className="table-widget__filter-cell">
                    {col.filterable !== false ? (
                      <input
                        type="text"
                        className="table-widget__filter-input"
                        placeholder={`Filter ${col.header}...`}
                        value={columnFilters[col.id] || ''}
                        onChange={(e) => handleFilter(col.id, e.target.value)}
                        aria-label={`Filter by ${col.header}`}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="table-widget__empty-cell"
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const id = getRowId(row, rowKey, page * pageSize + rowIdx);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`table-widget__tr ${isSelected ? 'table-widget__tr--selected' : ''} ${onRowClick ? 'table-widget__tr--clickable' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="table-widget__td table-widget__td--checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const raw = getCellValue(row, col.accessor);
                      return (
                        <td
                          key={col.id}
                          className="table-widget__td"
                          style={{ textAlign: col.align }}
                        >
                          {col.render ? col.render(raw, row) : String(raw ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="table-widget__pagination">
          <span className="table-widget__page-info">
            Showing {page * pageSize + 1}&ndash;
            {Math.min((page + 1) * pageSize, sortedData.length)} of{' '}
            {sortedData.length}
          </span>
          <div className="table-widget__page-controls">
            <button
              className="table-widget__page-btn"
              disabled={page === 0}
              onClick={() => setPage(0)}
              aria-label="First page"
            >
              &laquo;
            </button>
            <button
              className="table-widget__page-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={`table-widget__page-btn ${pageNum === page ? 'table-widget__page-btn--active' : ''}`}
                  onClick={() => setPage(pageNum)}
                  aria-label={`Page ${pageNum + 1}`}
                  aria-current={pageNum === page ? 'page' : undefined}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              className="table-widget__page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
            <button
              className="table-widget__page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              aria-label="Last page"
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Skeleton
   -------------------------------------------------------------------------- */

function TableSkeleton({ title, columnCount }: { title?: string; columnCount: number }) {
  return (
    <div className="table-widget table-widget--skeleton" aria-busy="true" aria-label="Loading table">
      {title && <div className="skeleton skeleton--text skeleton--w-30 skeleton--lg" />}
      <div className="table-widget__skeleton-rows">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="table-widget__skeleton-row">
            {Array.from({ length: columnCount }, (_, j) => (
              <div key={j} className="skeleton skeleton--text" style={{ width: `${100 / columnCount}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableWidget;

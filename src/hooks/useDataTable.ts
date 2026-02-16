/* ==========================================================================
   useDataTable Hook
   Encapsulates TanStack Table configuration for advanced data tables
   with sorting, filtering, pagination, selection, and virtual scrolling.
   ========================================================================== */

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
  type FilterFn,
  type Table,
} from '@tanstack/react-table';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface UseDataTableOptions<T> {
  /** Data array */
  data: T[];
  /** TanStack column definitions */
  columns: ColumnDef<T, any>[];
  /** Enable sorting (default: true) */
  enableSorting?: boolean;
  /** Enable multi-column sort with shift-click (default: true) */
  enableMultiSort?: boolean;
  /** Enable column filters (default: true) */
  enableColumnFilters?: boolean;
  /** Enable global filter / search (default: true) */
  enableGlobalFilter?: boolean;
  /** Enable row selection (default: false) */
  enableRowSelection?: boolean;
  /** Enable pagination (default: true) */
  enablePagination?: boolean;
  /** Initial page size (default: 10) */
  initialPageSize?: number;
  /** Page size options (default: [10, 25, 50, 100]) */
  pageSizeOptions?: number[];
  /** Unique row id accessor (default: 'id') */
  getRowId?: (row: T) => string;
}

export interface UseDataTableReturn<T> {
  /** The TanStack table instance */
  table: Table<T>;
  /** Global filter/search value */
  globalFilter: string;
  /** Set global filter/search value */
  setGlobalFilter: (value: string) => void;
  /** Current sorting state */
  sorting: SortingState;
  /** Current column filters state */
  columnFilters: ColumnFiltersState;
  /** Current row selection state */
  rowSelection: RowSelectionState;
  /** Current pagination state */
  pagination: PaginationState;
  /** Available page size options */
  pageSizeOptions: number[];
  /** Selected row data objects */
  selectedRows: T[];
  /** Total number of filtered rows */
  filteredRowCount: number;
  /** Total number of all rows */
  totalRowCount: number;
  /** Clear all selections */
  clearSelection: () => void;
  /** Clear all filters */
  clearAllFilters: () => void;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

/* --------------------------------------------------------------------------
   Global fuzzy/contains filter function
   -------------------------------------------------------------------------- */

const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const search = String(filterValue).toLowerCase();
  if (!search) return true;

  // Search across all column values
  const rowValues = row.getAllCells().map((cell) => {
    const value = cell.getValue();
    return value != null ? String(value).toLowerCase() : '';
  });

  return rowValues.some((val) => val.includes(search));
};

/* --------------------------------------------------------------------------
   Hook Implementation
   -------------------------------------------------------------------------- */

export function useDataTable<T>(options: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const {
    data,
    columns,
    enableSorting = true,
    enableMultiSort = true,
    enableColumnFilters = true,
    enableGlobalFilter = true,
    enableRowSelection = false,
    enablePagination = true,
    initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    getRowId,
  } = options;

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      enableColumnFilters || enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableSorting,
    enableMultiSort,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowSelection,
    globalFilterFn,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });

  // Derived values
  const selectedRows = useMemo(() => {
    if (!enableRowSelection) return [];
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [table, rowSelection, enableRowSelection]);

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const totalRowCount = data.length;

  const hasActiveFilters = globalFilter !== '' || columnFilters.length > 0;

  // Actions
  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const clearAllFilters = useCallback(() => {
    setGlobalFilter('');
    setColumnFilters([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  return {
    table,
    globalFilter,
    setGlobalFilter,
    sorting,
    columnFilters,
    rowSelection,
    pagination,
    pageSizeOptions,
    selectedRows,
    filteredRowCount,
    totalRowCount,
    clearSelection,
    clearAllFilters,
    hasActiveFilters,
  };
}

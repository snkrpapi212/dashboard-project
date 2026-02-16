/* ==========================================================================
   CSV Export Utility
   Exports table data to CSV format respecting active filters, sorting,
   and row selection.
   ========================================================================== */

export interface CSVExportOptions<T> {
  /** Column definitions for header names and value extraction */
  columns: {
    id: string;
    header: string;
    accessor: keyof T | ((row: T) => any);
  }[];
  /** Data rows to export */
  data: T[];
  /** Optional filename (without extension) */
  filename?: string;
  /** Include timestamp in filename */
  includeTimestamp?: boolean;
  /** BOM for Excel UTF-8 support */
  includeBOM?: boolean;
}

/**
 * Extract a cell value from a row using an accessor (key or function).
 */
function getCellValue<T>(row: T, accessor: keyof T | ((row: T) => any)): any {
  if (typeof accessor === 'function') return accessor(row);
  return (row as any)[accessor];
}

/**
 * Escape a CSV cell value (wrap in quotes if it contains commas, quotes, or newlines).
 */
function escapeCSV(value: any): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV string from data and column definitions.
 */
export function generateCSV<T>(options: CSVExportOptions<T>): string {
  const { columns, data } = options;

  // Header row
  const header = columns.map((col) => escapeCSV(col.header)).join(',');

  // Data rows
  const rows = data.map((row) =>
    columns.map((col) => escapeCSV(getCellValue(row, col.accessor))).join(','),
  );

  return [header, ...rows].join('\r\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV<T>(options: CSVExportOptions<T>): void {
  const {
    filename = 'export',
    includeTimestamp = true,
    includeBOM = true,
  } = options;

  const csv = generateCSV(options);

  // Build filename
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`
    : '';
  const fullFilename = `${filename}${timestamp}.csv`;

  // Create blob and download
  const bom = includeBOM ? '\uFEFF' : '';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fullFilename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

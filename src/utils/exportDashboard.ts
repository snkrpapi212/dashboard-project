/* ==========================================================================
   Dashboard Export Utilities
   Export dashboard content to PDF, CSV, and Image formats.
   ========================================================================== */

import type { ExportFormat, ExportOptions, Transaction } from '../types/dashboard';

/* --------------------------------------------------------------------------
   CSV Export
   -------------------------------------------------------------------------- */

/**
 * Export an array of objects to a CSV file and trigger a download.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = { format: 'csv' },
): void {
  if (!data || data.length === 0) {
    console.warn('exportToCSV: No data to export');
    return;
  }

  const filename = options.filename || `dashboard-export-${getTimestamp()}`;

  // Build CSV header from object keys
  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(escapeCSV).join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => escapeCSV(String(row[header] ?? '')));
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  downloadBlob(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/* --------------------------------------------------------------------------
   Image Export
   -------------------------------------------------------------------------- */

/**
 * Export a DOM element as a PNG image using html2canvas-like approach.
 * Falls back to an SVG-based capture if html2canvas is not available.
 */
export async function exportToImage(
  element: HTMLElement | null,
  options: ExportOptions = { format: 'image' },
): Promise<void> {
  if (!element) {
    console.warn('exportToImage: No element provided');
    return;
  }

  const filename = options.filename || `dashboard-export-${getTimestamp()}`;

  try {
    // Attempt to use html2canvas if available
    const html2canvas = (window as any).html2canvas;
    if (typeof html2canvas === 'function') {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      downloadDataUrl(dataUrl, `${filename}.png`);
      return;
    }

    // Fallback: use SVG foreignObject
    const { width, height } = element.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const clone = element.cloneNode(true) as HTMLElement;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          ${serializer.serializeToString(clone)}
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    downloadDataUrl(url, `${filename}.svg`);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('exportToImage failed:', err);
  }
}

/* --------------------------------------------------------------------------
   PDF Export
   -------------------------------------------------------------------------- */

/**
 * Export a DOM element as a PDF.
 * Uses the browser's built-in print functionality as a reliable fallback.
 * For production, integrate with jsPDF or similar.
 */
export async function exportToPDF(
  element: HTMLElement | null,
  options: ExportOptions = { format: 'pdf' },
): Promise<void> {
  if (!element) {
    console.warn('exportToPDF: No element provided');
    return;
  }

  const filename = options.filename || `dashboard-export-${getTimestamp()}`;

  try {
    // Check for jsPDF
    const jsPDF = (window as any).jspdf?.jsPDF;
    if (jsPDF) {
      const doc = new jsPDF('l', 'mm', 'a4');
      const { width, height } = element.getBoundingClientRect();
      const imgData = await elementToDataUrl(element);

      if (imgData) {
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (height / width) * pdfWidth;

        if (options.includeTimestamp) {
          doc.setFontSize(8);
          doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 8);
        }

        doc.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        doc.save(`${filename}.pdf`);
        return;
      }
    }

    // Fallback: use window.print()
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, sans-serif; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${element.outerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  } catch (err) {
    console.error('exportToPDF failed:', err);
  }
}

/* --------------------------------------------------------------------------
   Unified Export Handler
   -------------------------------------------------------------------------- */

/**
 * Route export to the appropriate handler based on format.
 */
export async function exportDashboard(
  format: ExportFormat,
  options: {
    element?: HTMLElement | null;
    data?: Record<string, any>[];
    filename?: string;
    includeTimestamp?: boolean;
  } = {},
): Promise<void> {
  const exportOptions: ExportOptions = {
    format,
    filename: options.filename,
    includeTimestamp: options.includeTimestamp,
  };

  switch (format) {
    case 'csv':
      if (options.data) {
        exportToCSV(options.data, exportOptions);
      }
      break;
    case 'image':
      await exportToImage(options.element ?? null, exportOptions);
      break;
    case 'pdf':
      await exportToPDF(options.element ?? null, exportOptions);
      break;
    default:
      console.warn(`Unsupported export format: ${format}`);
  }
}

/* --------------------------------------------------------------------------
   Internal Helpers
   -------------------------------------------------------------------------- */

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

function downloadDataUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function elementToDataUrl(element: HTMLElement): Promise<string | null> {
  try {
    const html2canvas = (window as any).html2canvas;
    if (typeof html2canvas === 'function') {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      return canvas.toDataURL('image/png');
    }
  } catch {}
  return null;
}

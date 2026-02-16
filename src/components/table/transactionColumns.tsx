/* ==========================================================================
   Transaction Column Definitions for TanStack Table
   Reusable column configs for the sales Transaction type.
   ========================================================================== */

import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { Transaction } from '../../types/dashboard';
import { formatCurrency, formatDate } from '../../utils/formatters';

const columnHelper = createColumnHelper<Transaction>();

/* --------------------------------------------------------------------------
   Status Badge Renderer
   -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: Transaction['status'] }) {
  const variantMap: Record<Transaction['status'], string> = {
    completed: 'success',
    pending: 'warning',
    refunded: 'danger',
    cancelled: 'danger',
  };
  const variant = variantMap[status] || 'default';

  return (
    <span className={`badge badge--${variant}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* --------------------------------------------------------------------------
   Full Column Set (Desktop)
   -------------------------------------------------------------------------- */

export const transactionColumns = [
  columnHelper.accessor('id', {
    header: 'Transaction ID',
    cell: (info) => (
      <span className="dt__cell-mono">{info.getValue()}</span>
    ),
    size: 140,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => formatDate(info.getValue(), 'medium'),
    sortingFn: 'datetime',
    enableColumnFilter: true,
    size: 130,
  }),
  columnHelper.accessor('customer', {
    header: 'Customer',
    enableColumnFilter: true,
    size: 160,
  }),
  columnHelper.accessor('product', {
    header: 'Product',
    enableColumnFilter: true,
    size: 160,
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    enableColumnFilter: true,
    size: 130,
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => (
      <span className="dt__cell-currency">{formatCurrency(info.getValue())}</span>
    ),
    enableColumnFilter: false,
    size: 120,
    meta: { align: 'right' },
  }),
  columnHelper.accessor('quantity', {
    header: 'Qty',
    enableColumnFilter: false,
    size: 70,
    meta: { align: 'right' },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
    enableColumnFilter: true,
    size: 110,
  }),
  columnHelper.accessor('region', {
    header: 'Region',
    enableColumnFilter: true,
    size: 140,
  }),
  columnHelper.accessor('salesRep', {
    header: 'Sales Rep',
    enableColumnFilter: true,
    size: 140,
  }),
];

/* --------------------------------------------------------------------------
   Mobile Priority Columns (hidden on small screens)
   These column IDs will be hidden on mobile viewports.
   -------------------------------------------------------------------------- */

export const transactionColumnsMobile: string[] = [
  'category',
  'quantity',
  'region',
  'salesRep',
];

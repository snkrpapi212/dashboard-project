/**
 * Mock Data Generator for Sales Dashboard
 *
 * Generates realistic mock data for KPIs, charts, and tables.
 * In production, replace these with API calls.
 */

import type { KPIData, ChartDataPoint, Transaction, DashboardFilters, SalesData } from '../types/dashboard';

/* --------------------------------------------------------------------------
   Main Data Generator
   -------------------------------------------------------------------------- */

export async function generateMockSalesData(
  filters: DashboardFilters,
): Promise<SalesData & { regionData: ChartDataPoint[] }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const kpis = generateKPIs();
  const revenueHistory = generateRevenueHistory(filters);
  const productPerformance = generateProductPerformance();
  const categoryBreakdown = generateCategoryBreakdown();
  const transactions = generateTransactions(filters);
  const regionData = generateRegionData();

  return {
    kpis,
    revenueHistory,
    productPerformance,
    categoryBreakdown,
    transactions,
    regionData,
  };
}

/* --------------------------------------------------------------------------
   KPI Data
   -------------------------------------------------------------------------- */

function generateKPIs(): KPIData[] {
  return [
    {
      id: 'revenue',
      label: 'Revenue',
      value: 1_245_832,
      previousValue: 1_080_500,
      trend: 15.3,
      trendDirection: 'up',
      status: 'positive',
      format: 'currency',
      icon: '$',
      comparisonLabel: 'vs last month',
      sparkline: [100, 120, 115, 140, 155, 145, 160, 180, 175, 190, 210, 205],
    },
    {
      id: 'orders',
      label: 'Orders',
      value: 3_421,
      previousValue: 3_148,
      trend: 8.7,
      trendDirection: 'up',
      status: 'positive',
      format: 'number',
      icon: '#',
      comparisonLabel: 'vs last month',
      sparkline: [80, 95, 88, 105, 110, 102, 115, 120, 118, 125, 130, 128],
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: 3.8,
      previousValue: 3.3,
      trend: 0.5,
      trendDirection: 'up',
      status: 'positive',
      format: 'percentage',
      icon: '%',
      comparisonLabel: 'vs last month',
      target: 5.0,
      sparkline: [2.8, 3.0, 3.1, 3.4, 3.2, 3.5, 3.6, 3.4, 3.7, 3.8, 3.9, 3.8],
    },
    {
      id: 'aov',
      label: 'Average Order Value',
      value: 364.27,
      previousValue: 343.14,
      trend: 6.2,
      trendDirection: 'up',
      status: 'positive',
      format: 'currency',
      icon: '\u00F8',
      comparisonLabel: 'vs last month',
      sparkline: [320, 335, 340, 330, 345, 350, 348, 355, 360, 358, 365, 364],
    },
  ];
}

/* --------------------------------------------------------------------------
   Chart Data Generators
   -------------------------------------------------------------------------- */

function generateRevenueHistory(filters: DashboardFilters): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const days = Math.max(
    7,
    Math.ceil(
      (filters.dateRange.end.getTime() - filters.dateRange.start.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  for (let i = 0; i < days; i++) {
    const date = new Date(filters.dateRange.start);
    date.setDate(date.getDate() + i);

    const base = 35000 + Math.sin(i * 0.3) * 8000;
    const noise = (Math.random() - 0.5) * 10000;

    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(base + noise),
      target: 40000,
    });
  }

  return data;
}

function generateProductPerformance(): ChartDataPoint[] {
  return [
    { product: 'Premium Widget', revenue: 234000, units: 1250 },
    { product: 'Standard Widget', revenue: 189000, units: 2100 },
    { product: 'Basic Widget', revenue: 145000, units: 3500 },
    { product: 'Deluxe Widget', revenue: 98000, units: 450 },
    { product: 'Compact Widget', revenue: 87000, units: 1800 },
  ];
}

function generateCategoryBreakdown(): ChartDataPoint[] {
  return [
    { category: 'Electronics', sales: 425000 },
    { category: 'Clothing', sales: 380000 },
    { category: 'Home & Garden', sales: 290000 },
    { category: 'Sports', sales: 150832 },
    { category: 'Books', sales: 95000 },
  ];
}

function generateRegionData(): ChartDataPoint[] {
  return [
    { region: 'North America', revenue: 520000 },
    { region: 'Europe', revenue: 380000 },
    { region: 'Asia Pacific', revenue: 245000 },
    { region: 'Latin America', revenue: 100832 },
  ];
}

/* --------------------------------------------------------------------------
   Transaction Data Generator
   -------------------------------------------------------------------------- */

function generateTransactions(filters: DashboardFilters): Transaction[] {
  const products = ['Premium Widget', 'Standard Widget', 'Basic Widget', 'Deluxe Widget', 'Compact Widget'];
  const customers = ['Acme Corp', 'GlobalTech', 'MegaCorp', 'TechStart', 'Enterprise Inc', 'DataDriven Ltd', 'CloudFirst', 'InnovateCo'];
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const statuses: Transaction['status'][] = ['completed', 'pending', 'completed', 'completed', 'refunded'];
  const reps = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'];

  const transactions: Transaction[] = [];
  const dayRange =
    (filters.dateRange.end.getTime() - filters.dateRange.start.getTime()) /
    (1000 * 60 * 60 * 24);

  for (let i = 0; i < 50; i++) {
    const date = new Date(
      filters.dateRange.start.getTime() + Math.random() * dayRange * 86400000,
    );

    const product = products[Math.floor(Math.random() * products.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Apply category filter if set
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(category.toLowerCase().replace(/\s&\s/g, ''))
    ) {
      continue;
    }

    transactions.push({
      id: `TRX-${(1000 + i).toString()}`,
      date: date.toISOString().split('T')[0],
      customer: customers[Math.floor(Math.random() * customers.length)],
      product,
      category,
      amount: Math.floor(Math.random() * 5000) + 200,
      quantity: Math.floor(Math.random() * 10) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      salesRep: reps[Math.floor(Math.random() * reps.length)],
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

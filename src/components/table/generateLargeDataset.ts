/* ==========================================================================
   Large Dataset Generator
   Generates 1000+ transaction rows for virtual scrolling demos/testing.
   ========================================================================== */

import type { Transaction } from '../../types/dashboard';

const CUSTOMERS = [
  'Acme Corp', 'GlobalTech', 'MegaCorp', 'TechStart', 'Enterprise Inc',
  'DataDriven Ltd', 'CloudFirst', 'InnovateCo', 'FutureVision', 'NexGen Systems',
  'Quantum Analytics', 'BlueSky Inc', 'PrimeLogic', 'AlphaWave', 'CoreSync',
  'VertexAI', 'PulseData', 'StreamLine Co', 'ByteForge', 'ClearPath Labs',
];

const PRODUCTS = [
  'Premium Widget', 'Standard Widget', 'Basic Widget', 'Deluxe Widget',
  'Compact Widget', 'Enterprise Suite', 'Pro Package', 'Starter Kit',
  'Advanced Module', 'Custom Solution',
];

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
const STATUSES: Transaction['status'][] = ['completed', 'pending', 'refunded', 'cancelled'];
const REPS = [
  'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams', 'Tom Brown',
  'Emily Davis', 'Chris Wilson', 'Amanda Taylor', 'David Anderson', 'Lisa Martinez',
];

/**
 * Simple deterministic pseudo-random number generator (mulberry32).
 * Produces consistent data across renders without network calls.
 */
function createRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a large dataset of transactions.
 * @param count Number of rows to generate (default: 1500)
 * @param seed Random seed for deterministic output (default: 42)
 */
export function generateLargeDataset(count = 1500, seed = 42): Transaction[] {
  const rng = createRNG(seed);
  const transactions: Transaction[] = [];

  const baseDate = new Date('2026-01-01').getTime();
  const dayMs = 86400000;

  for (let i = 0; i < count; i++) {
    const daysOffset = Math.floor(rng() * 365);
    const date = new Date(baseDate + daysOffset * dayMs);

    transactions.push({
      id: `TRX-${String(10000 + i).padStart(6, '0')}`,
      date: date.toISOString().split('T')[0],
      customer: CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)],
      product: PRODUCTS[Math.floor(rng() * PRODUCTS.length)],
      category: CATEGORIES[Math.floor(rng() * CATEGORIES.length)],
      amount: Math.round((rng() * 9800 + 200) * 100) / 100,
      quantity: Math.floor(rng() * 20) + 1,
      status: STATUSES[Math.floor(rng() * STATUSES.length)],
      region: REGIONS[Math.floor(rng() * REGIONS.length)],
      salesRep: REPS[Math.floor(rng() * REPS.length)],
    });
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transactions;
}

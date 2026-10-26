/**
 * Pure financial analytics and aggregation utilities.
 */

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  status: 'cleared' | 'pending';
  paymentMethod?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SpecialAllocations {
  sadaqah: number;
  gifts: number;
  discounts: number;
  dailyExpenses: number;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'all';

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number; // percentage (e.g. 25.5 for 25.5%)
  revenueCount: number;
  expenseCount: number;
  pendingAmount: number;
}

export interface GranularBucket {
  key: string;
  label: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  count: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  type: 'revenue' | 'expense';
}

/**
 * Calculate basic financial metrics from a list of transactions.
 */
export function computeFinancialMetrics(transactions: TransactionRecord[]): FinancialSummary {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let revenueCount = 0;
  let expenseCount = 0;
  let pendingAmount = 0;

  for (const t of transactions) {
    const val = Number(t.amount) || 0;
    if (t.type === 'revenue') {
      totalRevenue += val;
      revenueCount++;
    } else if (t.type === 'expense') {
      totalExpenses += val;
      expenseCount++;
    }

    if (t.status === 'pending') {
      pendingAmount += val;
    }
  }

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 10) / 10,
    revenueCount,
    expenseCount,
    pendingAmount: Math.round(pendingAmount * 100) / 100,
  };
}

/**
 * Specifically track Sadaqah, Gifts, Discounts, and Daily Expenses.
 */
export function computeSpecialAllocations(transactions: TransactionRecord[]): SpecialAllocations {
  let sadaqah = 0;
  let gifts = 0;
  let discounts = 0;
  let dailyExpenses = 0;

  for (const t of transactions) {
    const val = Number(t.amount) || 0;
    const cat = (t.category || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();

    if (cat.includes('sadaqah') || cat.includes('charity') || desc.includes('sadaqah')) {
      sadaqah += val;
    } else if (cat.includes('gift') || desc.includes('gift')) {
      gifts += val;
    } else if (cat.includes('discount') || desc.includes('discount')) {
      discounts += val;
    } else if (cat.includes('daily') || cat.includes('petty') || desc.includes('daily')) {
      dailyExpenses += val;
    }
  }

  return {
    sadaqah: Math.round(sadaqah * 100) / 100,
    gifts: Math.round(gifts * 100) / 100,
    discounts: Math.round(discounts * 100) / 100,
    dailyExpenses: Math.round(dailyExpenses * 100) / 100,
  };
}

/**
 * Compute growth percentage between two numerical periods.
 */
export function computeGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  const growth = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(growth * 10) / 10;
}

/**
 * Parse an ISO date string safely to year, month (1-12), and day (1-31).
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const month = parseInt(parts[1], 10) || 1;
  const day = parseInt(parts[2], 10) || 1;
  return { year, month, day };
}

export type SupportedCurrency = 'AED' | 'SAR' | 'USD' | 'QAR' | 'KWD' | 'EUR' | 'BDT';

/**
 * Format a number as currency (default AED for GCC operations, customizable to USD/SAR/etc).
 */
export function formatCurrency(
  amount: number,
  compact: boolean = false,
  currencyCode: SupportedCurrency | string = 'AED'
): string {
  const symbolMap: Record<string, string> = {
    AED: 'AED',
    SAR: 'SAR',
    USD: '$',
    QAR: 'QAR',
    KWD: 'KWD',
    EUR: '€',
    BDT: '৳',
  };

  const symbol = symbolMap[currencyCode] || currencyCode;

  if (compact && Math.abs(amount) >= 1_000_000) {
    return `${symbol} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${symbol} ${(amount / 1_000).toFixed(1)}k`;
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${symbol} ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Filter transactions by timeframe relative to a reference ISO date (defaulting to today).
 */
export function filterTransactionsByPeriod(
  transactions: TransactionRecord[],
  period: TimePeriod,
  refDateStr: string = '2026-10-26'
): { filtered: TransactionRecord[]; previousPeriod: TransactionRecord[] } {
  if (period === 'all') {
    return { filtered: [...transactions], previousPeriod: [] };
  }

  const ref = new Date(`${refDateStr}T00:00:00Z`);

  if (period === 'daily') {
    const todayStr = refDateStr;
    const yesterday = new Date(ref);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const filtered = transactions.filter((t) => t.date === todayStr);
    const previousPeriod = transactions.filter((t) => t.date === yesterdayStr);
    return { filtered, previousPeriod };
  }

  if (period === 'weekly') {
    // Current 7 days vs previous 7 days
    const currentStart = new Date(ref);
    currentStart.setUTCDate(currentStart.getUTCDate() - 6);
    const currentStartStr = currentStart.toISOString().slice(0, 10);

    const prevEnd = new Date(currentStart);
    prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
    const prevEndStr = prevEnd.toISOString().slice(0, 10);

    const prevStart = new Date(prevEnd);
    prevStart.setUTCDate(prevStart.getUTCDate() - 6);
    const prevStartStr = prevStart.toISOString().slice(0, 10);

    const filtered = transactions.filter((t) => t.date >= currentStartStr && t.date <= refDateStr);
    const previousPeriod = transactions.filter((t) => t.date >= prevStartStr && t.date <= prevEndStr);
    return { filtered, previousPeriod };
  }

  if (period === 'monthly') {
    const { year, month } = parseDateComponents(refDateStr);
    const currentPrefix = `${year}-${String(month).padStart(2, '0')}`;

    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    const prevPrefix = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const filtered = transactions.filter((t) => t.date.startsWith(currentPrefix));
    const previousPeriod = transactions.filter((t) => t.date.startsWith(prevPrefix));
    return { filtered, previousPeriod };
  }

  if (period === 'yearly') {
    const { year } = parseDateComponents(refDateStr);
    const currentYearPrefix = `${year}-`;
    const prevYearPrefix = `${year - 1}-`;

    const filtered = transactions.filter((t) => t.date.startsWith(currentYearPrefix));
    const previousPeriod = transactions.filter((t) => t.date.startsWith(prevYearPrefix));
    return { filtered, previousPeriod };
  }

  return { filtered: [...transactions], previousPeriod: [] };
}

/**
 * Group transactions by time granularity for chart rendering.
 */
export function aggregateByGranularity(
  transactions: TransactionRecord[],
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
): GranularBucket[] {
  const bucketsMap = new Map<string, { label: string; revenue: number; expenses: number; count: number }>();

  if (granularity === 'daily') {
    // Generate buckets for the last 14 days or sort distinct transaction dates
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    for (const t of sorted) {
      const key = t.date;
      if (!bucketsMap.has(key)) {
        const parts = t.date.split('-');
        const label = `${parts[1]}/${parts[2]}`;
        bucketsMap.set(key, { label, revenue: 0, expenses: 0, count: 0 });
      }
      const b = bucketsMap.get(key)!;
      b.count++;
      if (t.type === 'revenue') b.revenue += t.amount;
      if (t.type === 'expense') b.expenses += t.amount;
    }
  } else if (granularity === 'weekly') {
    for (const t of transactions) {
      const d = new Date(`${t.date}T00:00:00Z`);
      // Start of week (Sunday or Monday)
      const day = d.getUTCDay();
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d);
      monday.setUTCDate(diff);
      const key = monday.toISOString().slice(0, 10);
      const label = `Wk ${monday.getUTCMonth() + 1}/${monday.getUTCDate()}`;

      if (!bucketsMap.has(key)) {
        bucketsMap.set(key, { label, revenue: 0, expenses: 0, count: 0 });
      }
      const b = bucketsMap.get(key)!;
      b.count++;
      if (t.type === 'revenue') b.revenue += t.amount;
      if (t.type === 'expense') b.expenses += t.amount;
    }
  } else if (granularity === 'monthly') {
    for (const t of transactions) {
      const key = t.date.slice(0, 7); // YYYY-MM
      const parts = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const label = `${monthNames[mIdx] || parts[1]} '${parts[0].slice(2)}`;

      if (!bucketsMap.has(key)) {
        bucketsMap.set(key, { label, revenue: 0, expenses: 0, count: 0 });
      }
      const b = bucketsMap.get(key)!;
      b.count++;
      if (t.type === 'revenue') b.revenue += t.amount;
      if (t.type === 'expense') b.expenses += t.amount;
    }
  } else if (granularity === 'yearly') {
    for (const t of transactions) {
      const key = t.date.slice(0, 4); // YYYY
      const label = key;

      if (!bucketsMap.has(key)) {
        bucketsMap.set(key, { label, revenue: 0, expenses: 0, count: 0 });
      }
      const b = bucketsMap.get(key)!;
      b.count++;
      if (t.type === 'revenue') b.revenue += t.amount;
      if (t.type === 'expense') b.expenses += t.amount;
    }
  }

  const sortedKeys = Array.from(bucketsMap.keys()).sort();
  return sortedKeys.map((key) => {
    const data = bucketsMap.get(key)!;
    return {
      key,
      label: data.label,
      revenue: Math.round(data.revenue * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      netProfit: Math.round((data.revenue - data.expenses) * 100) / 100,
      count: data.count,
    };
  });
}

/**
 * Break down revenue or expenses by category with percentages.
 */
export function aggregateByCategory(
  transactions: TransactionRecord[],
  targetType: 'revenue' | 'expense'
): CategorySummary[] {
  const filtered = transactions.filter((t) => t.type === targetType);
  const total = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const catMap = new Map<string, { amount: number; count: number }>();
  for (const t of filtered) {
    const cat = t.category || 'General';
    const curr = catMap.get(cat) || { amount: 0, count: 0 };
    curr.amount += Number(t.amount) || 0;
    curr.count++;
    catMap.set(cat, curr);
  }

  const result: CategorySummary[] = [];
  for (const [category, data] of catMap.entries()) {
    result.push({
      category,
      amount: Math.round(data.amount * 100) / 100,
      percentage: total > 0 ? Math.round((data.amount / total) * 1000) / 10 : 0,
      count: data.count,
      type: targetType,
    });
  }

  return result.sort((a, b) => b.amount - a.amount);
}

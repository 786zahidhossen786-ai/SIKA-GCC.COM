import { TransactionRecord, FinancialSummary, CategorySummary, GranularBucket, SpecialAllocations } from './analytics';

/**
 * Escape a cell value for RFC 4180 CSV standard.
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generate CSV string from transactions list.
 */
export function generateTransactionsCsv(transactions: TransactionRecord[]): string {
  const headers = ['Date', 'Type', 'Category', 'Amount (USD)', 'Status', 'Payment Method', 'Logged By', 'Description', 'Transaction ID'];
  
  const rows = transactions.map((t) => [
    escapeCsvValue(t.date),
    escapeCsvValue(t.type.toUpperCase()),
    escapeCsvValue(t.category),
    escapeCsvValue(t.amount.toFixed(2)),
    escapeCsvValue(t.status || 'cleared'),
    escapeCsvValue(t.paymentMethod || 'N/A'),
    escapeCsvValue(t.recordedBy || 'Authorized Staff'),
    escapeCsvValue(t.description || ''),
    escapeCsvValue(t.id),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Generate CSV for a summary report over time buckets.
 */
export function generateReportCsv(
  title: string,
  period: string,
  summary: FinancialSummary,
  buckets: GranularBucket[],
  revenueCategories: CategorySummary[],
  expenseCategories: CategorySummary[],
  specialAllocations?: SpecialAllocations
): string {
  const lines: string[] = [];

  // Header
  lines.push(`"${title.replace(/"/g, '""')}"`);
  lines.push(`"Generated Period: ${period}"`);
  lines.push(`"Export Timestamp: ${new Date().toISOString()}"`);
  lines.push('');

  // Key Financial Highlights
  lines.push('"EXECUTIVE FINANCIAL SUMMARY"');
  lines.push('"Metric","Value"');
  lines.push(`"Total Revenue","$${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}"`);
  lines.push(`"Total Expenses","$${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}"`);
  lines.push(`"Net Profit","$${summary.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}"`);
  lines.push(`"Profit Margin","${summary.profitMargin}%"`);
  lines.push(`"Revenue Entries","${summary.revenueCount}"`);
  lines.push(`"Expense Entries","${summary.expenseCount}"`);
  lines.push(`"Pending Settlements","$${summary.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}"`);
  lines.push('');

  // Special Tracking Section (Sadaqah, Gifts, Discounts, Daily Expenses)
  if (specialAllocations) {
    lines.push('"DEDICATED ALLOCATIONS & EXPENSES"');
    lines.push('"Category","Disbursed Amount ($)"');
    lines.push(`"Sadaqah & Community Charity","$${specialAllocations.sadaqah.toFixed(2)}"`);
    lines.push(`"Client & Staff Gifts","$${specialAllocations.gifts.toFixed(2)}"`);
    lines.push(`"Customer Discounts & Rebates","$${specialAllocations.discounts.toFixed(2)}"`);
    lines.push(`"Daily Operational Expenses & Petty Cash","$${specialAllocations.dailyExpenses.toFixed(2)}"`);
    lines.push('');
  }

  // Time Series Breakdown
  lines.push('"PERIODIC TREND BREAKDOWN"');
  lines.push('"Interval","Revenue ($)","Expenses ($)","Net Profit ($)","Transactions"');
  for (const b of buckets) {
    lines.push([
      escapeCsvValue(b.label),
      escapeCsvValue(b.revenue.toFixed(2)),
      escapeCsvValue(b.expenses.toFixed(2)),
      escapeCsvValue(b.netProfit.toFixed(2)),
      escapeCsvValue(b.count),
    ].join(','));
  }
  lines.push('');

  // Revenue Categories
  lines.push('"REVENUE BY CATEGORY"');
  lines.push('"Category","Amount ($)","Share (%)","Entries"');
  for (const r of revenueCategories) {
    lines.push([
      escapeCsvValue(r.category),
      escapeCsvValue(r.amount.toFixed(2)),
      escapeCsvValue(`${r.percentage}%`),
      escapeCsvValue(r.count),
    ].join(','));
  }
  lines.push('');

  // Expense Categories
  lines.push('"EXPENSES BY CATEGORY"');
  lines.push('"Category","Amount ($)","Share (%)","Entries"');
  for (const e of expenseCategories) {
    lines.push([
      escapeCsvValue(e.category),
      escapeCsvValue(e.amount.toFixed(2)),
      escapeCsvValue(`${e.percentage}%`),
      escapeCsvValue(e.count),
    ].join(','));
  }

  return lines.join('\r\n');
}

/**
 * Triggers a browser file download of CSV text.
 */
export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

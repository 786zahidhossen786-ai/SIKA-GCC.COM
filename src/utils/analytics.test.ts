import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFinancialMetrics,
  computeGrowthRate,
  filterTransactionsByPeriod,
  aggregateByGranularity,
  aggregateByCategory,
  computeSpecialAllocations,
  TransactionRecord,
} from './analytics';
import { generateTransactionsCsv, generateReportCsv } from './csv';

const mockTransactions: TransactionRecord[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'revenue',
    category: 'Client Retainer',
    amount: 5000,
    date: '2026-10-26',
    description: 'Enterprise contract installment',
    status: 'cleared',
    createdAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'expense',
    category: 'Cloud Infrastructure',
    amount: 1200,
    date: '2026-10-26',
    description: 'AWS cluster hosting',
    status: 'cleared',
    createdAt: '2026-10-26T01:00:00Z',
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'expense',
    category: 'Software Subscriptions',
    amount: 300,
    date: '2026-10-25',
    description: 'GitHub & Slack seats',
    status: 'pending',
    createdAt: '2026-10-25T01:00:00Z',
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'revenue',
    category: 'SaaS Sales',
    amount: 2500,
    date: '2026-10-20',
    description: 'Annual licenses',
    status: 'cleared',
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'expense',
    category: 'Marketing',
    amount: 800,
    date: '2026-09-15',
    description: 'Google search campaigns',
    status: 'cleared',
    createdAt: '2026-09-15T00:00:00Z',
  },
];

test('computeFinancialMetrics aggregates revenues, expenses, profit and margins accurately', () => {
  const metrics = computeFinancialMetrics(mockTransactions);
  assert.equal(metrics.totalRevenue, 7500);
  assert.equal(metrics.totalExpenses, 2300);
  assert.equal(metrics.netProfit, 5200);
  // Margin: 5200 / 7500 = 69.333% -> 69.3%
  assert.equal(metrics.profitMargin, 69.3);
  assert.equal(metrics.revenueCount, 2);
  assert.equal(metrics.expenseCount, 3);
  assert.equal(metrics.pendingAmount, 300);
});

test('computeGrowthRate handles positive, negative, and zero baseline growth cleanly', () => {
  assert.equal(computeGrowthRate(12000, 10000), 20);
  assert.equal(computeGrowthRate(8000, 10000), -20);
  assert.equal(computeGrowthRate(5000, 0), 100);
  assert.equal(computeGrowthRate(0, 0), 0);
});

test('filterTransactionsByPeriod filters daily, weekly, and monthly periods correctly', () => {
  const daily = filterTransactionsByPeriod(mockTransactions, 'daily', '2026-10-26');
  assert.equal(daily.filtered.length, 2);
  assert.equal(daily.previousPeriod.length, 1);

  const monthly = filterTransactionsByPeriod(mockTransactions, 'monthly', '2026-10-26');
  assert.equal(monthly.filtered.length, 4);
  assert.equal(monthly.previousPeriod.length, 1); // 2026-09 transaction
});

test('aggregateByCategory groups sums and calculates percentages correctly', () => {
  const revCats = aggregateByCategory(mockTransactions, 'revenue');
  assert.equal(revCats.length, 2);
  assert.equal(revCats[0].category, 'Client Retainer');
  assert.equal(revCats[0].amount, 5000);
  assert.equal(revCats[0].percentage, 66.7);
  assert.equal(revCats[1].category, 'SaaS Sales');
  assert.equal(revCats[1].amount, 2500);
  assert.equal(revCats[1].percentage, 33.3);
});

test('aggregateByGranularity groups transactions by day, week, month, and year', () => {
  const dailyBuckets = aggregateByGranularity(mockTransactions, 'daily');
  assert.ok(dailyBuckets.length >= 3);

  const monthlyBuckets = aggregateByGranularity(mockTransactions, 'monthly');
  assert.equal(monthlyBuckets.length, 2); // 2026-09 and 2026-10
  assert.equal(monthlyBuckets[0].key, '2026-09');
  assert.equal(monthlyBuckets[1].key, '2026-10');
  assert.equal(monthlyBuckets[1].revenue, 7500);
  assert.equal(monthlyBuckets[1].expenses, 1500);
  assert.equal(monthlyBuckets[1].netProfit, 6000);
});

test('generateTransactionsCsv creates valid RFC 4180 CSV output with headers', () => {
  const csv = generateTransactionsCsv(mockTransactions);
  assert.ok(csv.includes('Date,Type,Category,Amount (USD)'));
  assert.ok(csv.includes('"Enterprise contract installment"'));
  assert.ok(csv.includes('5000.00'));
});

test('generateReportCsv produces comprehensive financial summary report', () => {
  const summary = computeFinancialMetrics(mockTransactions);
  const buckets = aggregateByGranularity(mockTransactions, 'monthly');
  const revCats = aggregateByCategory(mockTransactions, 'revenue');
  const expCats = aggregateByCategory(mockTransactions, 'expense');

  const report = generateReportCsv('Q4 Executive Growth Report', 'Monthly', summary, buckets, revCats, expCats);
  assert.ok(report.includes('EXECUTIVE FINANCIAL SUMMARY'));
  assert.ok(report.includes('PERIODIC TREND BREAKDOWN'));
  assert.ok(report.includes('REVENUE BY CATEGORY'));
  assert.ok(report.includes('EXPENSES BY CATEGORY'));
});

test('computeSpecialAllocations accurately tracks sadaqah, gifts, discounts, and daily expenses', () => {
  const specialList: TransactionRecord[] = [
    {
      id: 's-1',
      userId: 'u1',
      type: 'expense',
      category: 'Sadaqah & Charity',
      amount: 1000,
      date: '2026-10-26',
      description: 'Monthly Sadaqah community fund',
      status: 'cleared',
      recordedBy: 'Founder',
      createdAt: '2026-10-26T00:00:00Z',
    },
    {
      id: 's-2',
      userId: 'u1',
      type: 'expense',
      category: 'Gifts & Honorariums',
      amount: 400,
      date: '2026-10-26',
      description: 'Client gift basket',
      status: 'cleared',
      recordedBy: 'Salesman',
      createdAt: '2026-10-26T00:00:00Z',
    },
    {
      id: 's-3',
      userId: 'u1',
      type: 'expense',
      category: 'Discounts & Deductions',
      amount: 250,
      date: '2026-10-26',
      description: 'Customer promotional discount',
      status: 'cleared',
      recordedBy: 'Salesman',
      createdAt: '2026-10-26T00:00:00Z',
    },
    {
      id: 's-4',
      userId: 'u1',
      type: 'expense',
      category: 'Daily Expenses & Petty Cash',
      amount: 90,
      date: '2026-10-26',
      description: 'Daily office stationery',
      status: 'cleared',
      recordedBy: 'Worker',
      createdAt: '2026-10-26T00:00:00Z',
    },
  ];

  const allocations = computeSpecialAllocations(specialList);
  assert.equal(allocations.sadaqah, 1000);
  assert.equal(allocations.gifts, 400);
  assert.equal(allocations.discounts, 250);
  assert.equal(allocations.dailyExpenses, 90);
});

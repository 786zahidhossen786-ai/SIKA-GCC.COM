import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterFinancialDataForRole,
  buildRoleSystemInstruction,
  generateOfflineScopedResponse,
  ROLE_CONFIGS,
} from './aiRoleScopingEngine';
import { Transaction, UserProfile } from '../types';

const sampleTransactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'revenue',
    category: 'Commercial Construction Chemicals',
    amount: 150000,
    date: '2026-10-01',
    description: 'Sikaflex-11FC bulk supply to Dubai contractor',
    status: 'cleared',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'expense',
    category: 'Sadaqah & Community Blessings',
    amount: 12000,
    date: '2026-10-05',
    description: 'Sadaqah monthly charitable distribution',
    status: 'cleared',
    createdAt: '2026-10-05T00:00:00Z',
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'expense',
    category: 'Client Hospitality & Gifts',
    amount: 3500,
    date: '2026-10-08',
    description: 'VIP Ramadan gift hampers for contracting consultants',
    status: 'cleared',
    createdAt: '2026-10-08T00:00:00Z',
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'expense',
    category: 'Discounts & Rebates',
    amount: 8000,
    date: '2026-10-10',
    description: 'Volume discount rebate on SikaTop Seal-107 order',
    status: 'cleared',
    createdAt: '2026-10-10T00:00:00Z',
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'expense',
    category: 'Daily Site Expenses & Petty Cash',
    amount: 1400,
    date: '2026-10-12',
    description: 'Site truck diesel fuel cards & Salik toll balance',
    status: 'cleared',
    createdAt: '2026-10-12T00:00:00Z',
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'expense',
    category: 'Salaries & Payroll',
    amount: 45000,
    date: '2026-10-28',
    description: 'Monthly staff salaries and founder dividends',
    status: 'cleared',
    createdAt: '2026-10-28T00:00:00Z',
  },
];

const founderProfile: UserProfile = {
  userId: 'u-founder',
  email: '786zahidhossen786@gmail.com',
  displayName: 'Zahid Hossen',
  role: 'founder',
  businessName: 'SIKA GCC Commercial Solutions',
  createdAt: '2026-01-01T00:00:00Z',
};

const salesmanProfile: UserProfile = {
  userId: 'u-sales',
  email: 'bilal.sales@sika-gcc.com',
  displayName: 'Bilal Karim',
  role: 'salesman',
  businessName: 'SIKA GCC Commercial Solutions',
  createdAt: '2026-04-01T00:00:00Z',
};

const workerProfile: UserProfile = {
  userId: 'u-worker',
  email: 'faisal.worker@sika-gcc.com',
  displayName: 'Faisal Ahmed',
  role: 'worker',
  businessName: 'SIKA GCC Commercial Solutions',
  createdAt: '2026-04-15T00:00:00Z',
};

test('Founder account has full financial visibility including Net Profit and Sadaqah', () => {
  const scoped = filterFinancialDataForRole('founder', sampleTransactions, founderProfile, 'AED');

  assert.strictEqual(scoped.netProfitVisible !== null, true);
  assert.strictEqual(scoped.sadaqahTotal, 12000);
  assert.strictEqual(scoped.giftTotal, 3500);
  assert.strictEqual(scoped.discountTotal, 8000);
  assert.strictEqual(scoped.dailyExpensesTotal, 1400);
  assert.strictEqual(scoped.confidentialMetricsRedacted.length, 0);

  const prompt = buildRoleSystemInstruction(founderProfile, 'founder', scoped);
  assert.match(prompt, /Executive Leadership/i);
});

test('Salesman account is strictly restricted from Net Profit, Payroll, and Sadaqah', () => {
  const scoped = filterFinancialDataForRole('salesman', sampleTransactions, salesmanProfile, 'AED');

  // Salesman cannot see Net Profit or Sadaqah
  assert.strictEqual(scoped.netProfitVisible, null);
  assert.strictEqual(scoped.profitMarginPercent, null);
  assert.strictEqual(scoped.sadaqahTotal, null);

  // But can see discounts and client gifts
  assert.strictEqual(scoped.discountTotal, 8000);
  assert.strictEqual(scoped.giftTotal, 3500);

  // Redacted list contains Net Profit and Payroll
  assert.ok(scoped.confidentialMetricsRedacted.some((m) => m.includes('Net Profit')));
  assert.ok(scoped.confidentialMetricsRedacted.some((m) => m.includes('Payroll')));

  // When salesman asks about profit or salary, response is politely refused
  const response = generateOfflineScopedResponse('What is our company net profit and executive salary?', 'salesman', salesmanProfile, scoped);
  assert.match(response, /Security Access Scoped: Sales Representative/i);
  assert.match(response, /confidential and restricted/i);
});

test('Worker account is strictly restricted from Revenue, Contracts, and Profits', () => {
  const scoped = filterFinancialDataForRole('worker', sampleTransactions, workerProfile, 'AED');

  // Worker cannot see revenues or net profit
  assert.strictEqual(scoped.totalVisibleRevenue, 0);
  assert.strictEqual(scoped.netProfitVisible, null);
  assert.strictEqual(scoped.discountTotal, null);
  assert.strictEqual(scoped.giftTotal, null);

  // Worker CAN see daily site expenses & fuel
  assert.strictEqual(scoped.dailyExpensesTotal, 1400);

  // When worker asks about contract value or company revenue, response is politely refused
  const response = generateOfflineScopedResponse('Show me company revenue and client contract values', 'worker', workerProfile, scoped);
  assert.match(response, /Security Access Scoped: Field Operations/i);
  assert.match(response, /restricted to commercial sales/i);
});

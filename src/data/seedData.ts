import {
  Transaction,
  TeamMember,
  FinancialGoal,
  SalesContract,
  ClientGiftRecord,
  ExpenseApprovalClaim,
  DepartmentBudget,
  DisbursementRecord,
  SadaqahRecord,
  AuditLogEntry,
  WorkerSiteLog,
  SaudiEmployeeRecord,
} from '../types';

// Category taxonomy for real commercial trading operations
export const TRANSACTION_CATEGORIES: Record<'revenue' | 'expense', string[]> = {
  revenue: [
    'Commercial Chemical Contracts',
    'Waterproofing & Mortars',
    'Industrial Flooring Solutions',
    'Concrete Repair & Grouting',
    'Direct Retail Supply',
    'Other Revenue',
  ],
  expense: [
    'Raw Materials & Inventory',
    'Vehicle Fleet & Fuel',
    'Salaries & Workforce Compensation',
    'Sadaqah & Charity',
    'Gifts & Honorariums',
    'Sales Discounts & Rebates',
    'Daily Expenses & Petty Cash',
    'Warehouse & Office Rent',
    'Government & Visa Compliance',
    'Other Expense',
  ],
};

// All fake transactions cleared - ready for real entries
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Zero state targets and budget ceilings
export const INITIAL_GOAL: FinancialGoal = {
  id: 'goal-dcc-zero',
  userId: 'default-owner',
  period: 'monthly',
  targetRevenue: 0,
  maxExpenseBudget: 0,
  year: 2026,
  month: 11,
  createdAt: '2026-11-01T00:00:00Z',
};

// Core leadership and operational accounts for DCC TRADING CO
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    userId: 'default-owner',
    email: '786zahidhossen786@gmail.com',
    name: 'Zahid Hossen',
    role: 'founder',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tm-2',
    userId: 'default-owner',
    email: 'tariq.cofounder@dcctrading.sa',
    name: 'Tariq Rahman',
    role: 'co-founder',
    status: 'active',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'tm-3',
    userId: 'default-owner',
    email: 'hassan.manager@dcctrading.sa',
    name: 'Hassan Reza',
    role: 'manager',
    status: 'active',
    createdAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'tm-4',
    userId: 'default-owner',
    email: 'bilal.sales@dcctrading.sa',
    name: 'Bilal Karim',
    role: 'salesman',
    status: 'active',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'tm-5',
    userId: 'default-owner',
    email: 'faisal.worker@dcctrading.sa',
    name: 'Faisal Ahmed',
    role: 'worker',
    status: 'active',
    createdAt: '2026-04-10T00:00:00Z',
  },
];

// Sales contracts initialized to empty for real commercial contracts
export const INITIAL_SALES_CONTRACTS: SalesContract[] = [];

// Client gifts initialized to empty
export const INITIAL_CLIENT_GIFTS: ClientGiftRecord[] = [];

// Approval claims initialized to empty
export const INITIAL_APPROVAL_CLAIMS: ExpenseApprovalClaim[] = [];

// Department budgets starting at zero caps and zero spend
export const INITIAL_DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  {
    id: 'bgt-01',
    department: 'Raw Materials & Chemical Inventory',
    category: 'Raw Materials & Inventory',
    monthlyCap: 0,
    currentSpent: 0,
    alertThresholdPct: 80,
  },
  {
    id: 'bgt-02',
    department: 'Fleet Transport & Diesel Logistics',
    category: 'Vehicle Fleet & Fuel',
    monthlyCap: 0,
    currentSpent: 0,
    alertThresholdPct: 75,
  },
  {
    id: 'bgt-03',
    department: 'Site Staff Operations & Petty Cash',
    category: 'Daily Expenses & Petty Cash',
    monthlyCap: 0,
    currentSpent: 0,
    alertThresholdPct: 70,
  },
  {
    id: 'bgt-04',
    department: 'Sales Marketing, Gifts & Hospitality',
    category: 'Gifts & Honorariums',
    monthlyCap: 0,
    currentSpent: 0,
    alertThresholdPct: 75,
  },
  {
    id: 'bgt-05',
    department: 'Corporate Sadaqah & Social Welfare',
    category: 'Sadaqah & Charity',
    monthlyCap: 0,
    currentSpent: 0,
    alertThresholdPct: 85,
  },
];

// Disbursements initialized to empty
export const INITIAL_DISBURSEMENTS: DisbursementRecord[] = [];

// Sadaqah records initialized to empty
export const INITIAL_SADAQAH_RECORDS: SadaqahRecord[] = [];

// Audit logs initialized to empty
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Worker logs initialized to empty
export const INITIAL_WORKER_LOGS: WorkerSiteLog[] = [];

// Saudi workforce dossiers initialized to empty
export const INITIAL_SAUDI_EMPLOYEES: SaudiEmployeeRecord[] = [];

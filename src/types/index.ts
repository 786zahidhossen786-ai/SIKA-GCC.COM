export type UserRole =
  | 'founder'
  | 'co-founder'
  | 'ceo'
  | 'director'
  | 'manager'
  | 'salesman'
  | 'worker'
  | 'owner'
  | 'analyst';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  businessName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TransactionType = 'revenue' | 'expense';
export type TransactionStatus = 'cleared' | 'pending';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  status: TransactionStatus;
  paymentMethod?: string;
  recordedBy?: string; // name or role of user who logged it
  createdAt: string;
  updatedAt?: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  targetRevenue: number;
  maxExpenseBudget: number;
  year: number;
  month?: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invited' | 'suspended';
  createdAt: string;
}

export type ViewTab = 'overview' | 'reports' | 'transactions' | 'team';

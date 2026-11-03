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

// ----------------------------------------------------
// 1. SALESMAN SYSTEM TYPES
// ----------------------------------------------------
export type ContractStatus = 'draft' | 'negotiation' | 'approved' | 'signed' | 'delivered';
export type PaymentTerms = '100% Advance' | '50% Advance / 50% on Delivery' | '30 Days Net' | '60 Days PDC';

export interface SalesContract {
  id: string;
  clientName: string;
  clientContact?: string;
  projectTitle: string;
  location: string;
  chemicalProduct: string;
  quantityM2OrTons: string;
  contractValue: number;
  discountAmount: number;
  netValue: number;
  commissionRatePct: number; // e.g. 2.5%
  commissionEarned: number;
  commissionStatus: 'pending' | 'approved' | 'paid';
  status: ContractStatus;
  paymentTerms: PaymentTerms;
  salesmanName: string;
  salesmanEmail: string;
  notes?: string;
  pushedToLedger: boolean;
  createdAt: string;
}

export interface ClientGiftRecord {
  id: string;
  clientName: string;
  recipientName: string;
  giftItem: string;
  cost: number;
  occasion: string;
  salesmanName: string;
  approvedBy?: string;
  createdAt: string;
}

// ----------------------------------------------------
// 2. MANAGER SYSTEM TYPES (Approvals, Budgets, Disbursements)
// ----------------------------------------------------
export type ClaimStatus = 'pending' | 'approved' | 'rejected';
export type ClaimCategory =
  | 'Petty Cash & Consumables'
  | 'Diesel Fuel & Fleet'
  | 'Salik & Toll Charges'
  | 'Emergency Hardware & Tools'
  | 'Client Hospitality & Gift'
  | 'Sales Concession / Discount'
  | 'Site Worker Meals';

export interface ExpenseApprovalClaim {
  id: string;
  submittedBy: string;
  employeeRole: UserRole;
  category: ClaimCategory;
  amount: number;
  description: string;
  projectRef: string;
  receiptNote?: string;
  status: ClaimStatus;
  managerNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  pushedToExpenseLedger: boolean;
}

export interface DepartmentBudget {
  id: string;
  department: string;
  category: string;
  monthlyCap: number;
  currentSpent: number;
  alertThresholdPct: number; // e.g. 80
}

export interface DisbursementRecord {
  id: string;
  recipientName: string;
  recipientRole: UserRole;
  type: 'Salary' | 'Petty Cash' | 'Expense Reimbursement' | 'Field Allowance';
  amount: number;
  paymentMode: 'Cash' | 'Bank Wire' | 'Cheque';
  referenceNote: string;
  processedAt: string;
  processedBy: string;
}

// ----------------------------------------------------
// 3. OWNER / EXECUTIVE SUITE TYPES
// ----------------------------------------------------
export interface ProfitDistributionPlan {
  id: string;
  periodLabel: string;
  netProfit: number;
  retainedEarningsPct: number;
  retainedAmount: number;
  zakatSadaqahPct: number;
  zakatSadaqahAmount: number;
  dividendPoolPct: number;
  dividendAmount: number;
  partnerAllocations: {
    partnerName: string;
    role: string;
    sharePct: number;
    amount: number;
  }[];
  status: 'draft' | 'approved' | 'disbursed';
  createdAt: string;
  approvedBy?: string;
}

export interface SadaqahRecord {
  id: string;
  beneficiary: string;
  category: 'Site Workers Welfare' | 'Medical Support' | 'Community Relief' | 'Orphan Education' | 'Mosque Contribution';
  amount: number;
  approvedBy: string;
  date: string;
  description: string;
  receiptNote?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: 'transaction' | 'contract' | 'claim' | 'budget' | 'disbursement' | 'distribution' | 'auth';
  entityId?: string;
  performedBy: string;
  userRole: UserRole;
  details: string;
  timestamp: string;
}

// ----------------------------------------------------
// 4. WORKER / EMPLOYEE FIELD LOG
// ----------------------------------------------------
export interface WorkerSiteLog {
  id: string;
  workerName: string;
  siteName: string;
  taskType: 'Delivery & Offloading' | 'Waterproofing Application' | 'Joint Sealing' | 'Warehouse Sorting' | 'Site Inspection';
  hoursLogged: number;
  status: 'completed' | 'in-progress';
  date: string;
  notes: string;
  deliveryDocketNo?: string;
  createdAt: string;
}

// ----------------------------------------------------
// 5. SAUDI ARABIA / GCC EMPLOYEE & DOCUMENT COMPLIANCE
// ----------------------------------------------------
export interface SaudiEmployeeRecord {
  id: string;
  employeeName: string;
  employeeIdNumber: string; // Internal employee badge e.g. EMP-101
  role: UserRole;
  designation: string;
  department: string;
  email: string;
  phone: string;
  nationality: string;

  // 1. Iqama (Residence ID / هوية مقيم)
  iqamaNumber: string;
  iqamaExpiryGregorian: string; // YYYY-MM-DD
  iqamaProfession: string; // e.g. Chemical Sales Rep, Waterproofing Tech
  iqamaIssuePlace: string;

  // 2. Passport (جواز السفر)
  passportNumber: string;
  passportExpiryDate: string; // YYYY-MM-DD
  passportIssueCountry: string;

  // 3. Qiwa & Labor Contract (عقد العمل - منصة قوى)
  qiwaContractNumber: string;
  qiwaContractEndDate: string; // YYYY-MM-DD
  qiwaStatus: 'documented' | 'pending_renewal' | 'expired';

  // 4. GOSI (التأمينات الاجتماعية)
  gosiNumber: string;
  gosiBasicSalary: number;
  gosiHousingAllowance: number;

  // 5. Medical Insurance (مجلس الضمان الصحي CCHI)
  insuranceProvider: string; // Tawuniya, Bupa Arabia, Medgulf
  insurancePolicyNumber: string;
  insuranceExpiryDate: string; // YYYY-MM-DD
  insuranceClass: 'VIP' | 'Class A' | 'Class B' | 'Class C';

  // 6. Driving License & Health Certificate
  drivingLicenseNumber?: string;
  drivingLicenseExpiry?: string;
  healthCertExpiry?: string;

  // 7. WPS & Banking (نظام حماية الأجور)
  bankName: string;
  ibanNumber: string;

  joiningDate: string;
  sponsorshipStatus: 'Company Sponsored (على الكفالة)' | 'Transferred' | 'Under Transfer';
  notes?: string;
  createdAt: string;
}

export type ViewTab =
  | 'overview'
  | 'reports'
  | 'transactions'
  | 'sales-hub'
  | 'manager-ops'
  | 'owner-suite'
  | 'field-claims'
  | 'employee-docs'
  | 'team'
  | 'ai-advisor';

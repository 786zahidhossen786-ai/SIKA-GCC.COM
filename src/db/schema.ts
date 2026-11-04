import { pgTable, text, serial, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('owner'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Financial transactions ledger
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'revenue' | 'expense'
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  description: text('description').notNull(),
  status: text('status').notNull().default('cleared'), // 'cleared' | 'pending'
  paymentMethod: text('payment_method'),
  recordedBy: text('recorded_by'),
  createdAt: text('created_at').notNull(),
});

// Saudi Arabia & GCC Employee Records
export const saudiEmployees = pgTable('saudi_employees', {
  id: text('id').primaryKey(),
  employeeName: text('employee_name').notNull(),
  employeeIdNumber: text('employee_id_number').notNull(),
  role: text('role').notNull(),
  designation: text('designation').notNull(),
  department: text('department').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  nationality: text('nationality').notNull(),
  iqamaNumber: text('iqama_number').notNull(),
  iqamaExpiryGregorian: text('iqama_expiry_gregorian').notNull(),
  iqamaProfession: text('iqama_profession').notNull(),
  iqamaIssuePlace: text('iqama_issue_place').notNull(),
  passportNumber: text('passport_number').notNull(),
  passportExpiryDate: text('passport_expiry_date').notNull(),
  passportIssueCountry: text('passport_issue_country').notNull(),
  qiwaContractNumber: text('qiwa_contract_number').notNull(),
  qiwaContractEndDate: text('qiwa_contract_end_date').notNull(),
  qiwaStatus: text('qiwa_status').notNull(),
  gosiNumber: text('gosi_number').notNull(),
  gosiBasicSalary: doublePrecision('gosi_basic_salary').notNull(),
  gosiHousingAllowance: doublePrecision('gosi_housing_allowance').notNull(),
  insuranceProvider: text('insurance_provider').notNull(),
  insurancePolicyNumber: text('insurance_policy_number').notNull(),
  insuranceExpiryDate: text('insurance_expiry_date').notNull(),
  insuranceClass: text('insurance_class').notNull(),
  drivingLicenseNumber: text('driving_license_number'),
  drivingLicenseExpiry: text('driving_license_expiry'),
  healthCertExpiry: text('health_cert_expiry'),
  bankName: text('bank_name').notNull(),
  ibanNumber: text('iban_number').notNull(),
  joiningDate: text('joining_date').notNull(),
  sponsorshipStatus: text('sponsorship_status').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Sales Contracts & Proposals
export const salesContracts = pgTable('sales_contracts', {
  id: text('id').primaryKey(),
  contractCode: text('contract_code').notNull(),
  clientName: text('client_name').notNull(),
  projectName: text('project_name').notNull(),
  siteLocation: text('site_location').notNull(),
  chemicalProducts: text('chemical_products').notNull(), // JSON serialized
  grossAmount: doublePrecision('gross_amount').notNull(),
  discountAmount: doublePrecision('discount_amount').notNull().default(0),
  netAmount: doublePrecision('net_amount').notNull(),
  status: text('status').notNull(), // draft | negotiation | signed | delivered | cancelled
  paymentTerms: text('payment_terms').notNull(),
  salesmanName: text('salesman_name').notNull(),
  commissionRatePct: doublePrecision('commission_rate_pct').notNull().default(2.5),
  commissionEarned: doublePrecision('commission_earned').notNull().default(0),
  pushedToLedger: boolean('pushed_to_ledger').notNull().default(false),
  contractDate: text('contract_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// Expense Approval Claims
export const approvalClaims = pgTable('approval_claims', {
  id: text('id').primaryKey(),
  submittedBy: text('submitted_by').notNull(),
  employeeRole: text('employee_role').notNull(),
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  projectRef: text('project_ref').notNull(),
  receiptNote: text('receipt_note'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  managerNote: text('manager_note'),
  submittedAt: text('submitted_at').notNull(),
  reviewedAt: text('reviewed_at'),
  reviewedBy: text('reviewed_by'),
  pushedToExpenseLedger: boolean('pushed_to_expense_ledger').notNull().default(false),
});

// Worker Site Logs & Waybills
export const workerSiteLogs = pgTable('worker_site_logs', {
  id: text('id').primaryKey(),
  workerName: text('worker_name').notNull(),
  siteName: text('site_name').notNull(),
  taskType: text('task_type').notNull(),
  hoursLogged: doublePrecision('hours_logged').notNull(),
  status: text('status').notNull().default('completed'),
  date: text('date').notNull(),
  notes: text('notes').notNull(),
  deliveryDocketNo: text('delivery_docket_no'),
  createdAt: text('created_at').notNull(),
});

// Corporate Sadaqah Records
export const sadaqahRecords = pgTable('sadaqah_records', {
  id: text('id').primaryKey(),
  beneficiary: text('beneficiary').notNull(),
  category: text('category').notNull(),
  amount: doublePrecision('amount').notNull(),
  approvedBy: text('approved_by').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  receiptNote: text('receipt_note'),
  createdAt: text('created_at').notNull(),
});

// Master Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  performedBy: text('performed_by').notNull(),
  userRole: text('user_role').notNull(),
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(),
});

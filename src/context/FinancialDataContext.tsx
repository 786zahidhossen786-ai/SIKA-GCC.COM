import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  UserRole,
  Transaction,
  FinancialGoal,
  TeamMember,
  ViewTab,
  SalesContract,
  ContractStatus,
  ClientGiftRecord,
  ExpenseApprovalClaim,
  DepartmentBudget,
  DisbursementRecord,
  SadaqahRecord,
  AuditLogEntry,
  WorkerSiteLog,
  SaudiEmployeeRecord,
} from '../types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOAL,
  INITIAL_TEAM_MEMBERS,
  INITIAL_SALES_CONTRACTS,
  INITIAL_CLIENT_GIFTS,
  INITIAL_APPROVAL_CLAIMS,
  INITIAL_DEPARTMENT_BUDGETS,
  INITIAL_DISBURSEMENTS,
  INITIAL_SADAQAH_RECORDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WORKER_LOGS,
  INITIAL_SAUDI_EMPLOYEES,
} from '../data/seedData';
import {
  TimePeriod,
  SupportedCurrency,
  computeFinancialMetrics,
  computeGrowthRate,
  filterTransactionsByPeriod,
  aggregateByGranularity,
  aggregateByCategory,
  computeSpecialAllocations,
  FinancialSummary,
  GranularBucket,
  CategorySummary,
  SpecialAllocations,
} from '../utils/analytics';

interface FinancialDataContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  previousTransactions: Transaction[];
  summary: FinancialSummary;
  previousSummary: FinancialSummary;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  granularBuckets: GranularBucket[];
  revenueCategories: CategorySummary[];
  expenseCategories: CategorySummary[];
  specialAllocations: SpecialAllocations;
  goal: FinancialGoal;
  teamMembers: TeamMember[];
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isLoading: boolean;
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  ledgerMode: 'real' | 'clean';
  setLedgerMode: (mode: 'real' | 'clean') => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  updateGoal: (data: Partial<FinancialGoal>) => Promise<boolean>;
  addTeamMember: (data: Omit<TeamMember, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  updateTeamMemberRole: (id: string, newRole: UserRole) => Promise<boolean>;
  removeTeamMember: (id: string) => Promise<boolean>;
  resetToDemoData: () => void;
  clearTransactions: () => void;
  importTransactionsCsv: (csvContent: string) => Promise<{ count: number; error?: string }>;
  syncToCloudDatabase: () => Promise<{ success: boolean; message: string }>;

  // Salesman Systems
  salesContracts: SalesContract[];
  addSalesContract: (data: Omit<SalesContract, 'id' | 'createdAt' | 'pushedToLedger' | 'commissionEarned'>) => Promise<boolean>;
  updateSalesContractStatus: (id: string, status: ContractStatus) => Promise<boolean>;
  pushContractToRevenueLedger: (contractId: string) => Promise<boolean>;
  clientGifts: ClientGiftRecord[];
  addClientGift: (data: Omit<ClientGiftRecord, 'id' | 'createdAt'>) => Promise<boolean>;

  // Manager Operations & Approvals
  approvalClaims: ExpenseApprovalClaim[];
  submitApprovalClaim: (data: Omit<ExpenseApprovalClaim, 'id' | 'submittedAt' | 'pushedToExpenseLedger' | 'status'>) => Promise<boolean>;
  reviewApprovalClaim: (id: string, status: 'approved' | 'rejected', managerNote?: string) => Promise<boolean>;
  departmentBudgets: DepartmentBudget[];
  updateDepartmentBudgetCap: (id: string, newCap: number) => Promise<boolean>;
  disbursements: DisbursementRecord[];
  recordDisbursement: (data: Omit<DisbursementRecord, 'id' | 'processedAt'>) => Promise<boolean>;

  // Owner Suite (Sadaqah & Audit)
  sadaqahRecords: SadaqahRecord[];
  recordSadaqah: (data: Omit<SadaqahRecord, 'id' | 'createdAt'>) => Promise<boolean>;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, entityType: AuditLogEntry['entityType'], details: string, entityId?: string) => void;

  // Worker & Field Staff
  workerLogs: WorkerSiteLog[];
  addWorkerLog: (data: Omit<WorkerSiteLog, 'id' | 'createdAt'>) => Promise<boolean>;

  // Saudi Arabia & GCC Employee Records & Document Expiry Compliance
  saudiEmployees: SaudiEmployeeRecord[];
  addSaudiEmployee: (data: Omit<SaudiEmployeeRecord, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSaudiEmployee: (id: string, data: Partial<SaudiEmployeeRecord>) => Promise<boolean>;
  removeSaudiEmployee: (id: string) => Promise<boolean>;
  renewEmployeeDocument: (
    employeeId: string,
    docType: 'iqama' | 'passport' | 'qiwa' | 'insurance' | 'drivingLicense' | 'healthCert',
    newExpiryDate: string
  ) => Promise<boolean>;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile, canAddTransaction, canEditTransaction, canDeleteTransaction, canManageTeam, canEditGoals } = useAuth();
  
  // Cache versioning for DCC TRADING CO Real Zero State
  const SIKA_VERSION_KEY = 'dcc_trading_real_zero_v3';
  const hasMigrated = typeof window !== 'undefined' && localStorage.getItem(SIKA_VERSION_KEY) === 'true';

  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (!hasMigrated) {
      localStorage.setItem('vantage_currency', 'AED');
      return 'AED';
    }
    const saved = localStorage.getItem('vantage_currency') as SupportedCurrency;
    return saved || 'AED';
  });

  const [ledgerMode, setLedgerModeState] = useState<'real' | 'clean'>(() => {
    if (!hasMigrated) {
      localStorage.setItem('vantage_ledger_mode', 'clean');
      return 'clean';
    }
    const saved = localStorage.getItem('vantage_ledger_mode') as 'real' | 'clean';
    return saved || 'clean';
  });

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('vantage_currency', c);
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem(SIKA_VERSION_KEY, 'true');
      localStorage.setItem('vantage_transactions', JSON.stringify([]));
      localStorage.setItem('vantage_team', JSON.stringify(INITIAL_TEAM_MEMBERS));
      localStorage.setItem('vantage_goal', JSON.stringify(INITIAL_GOAL));
      localStorage.setItem('vantage_ledger_mode', 'clean');
      localStorage.setItem('sika_sales_contracts', JSON.stringify([]));
      localStorage.setItem('sika_client_gifts', JSON.stringify([]));
      localStorage.setItem('sika_approval_claims', JSON.stringify([]));
      localStorage.setItem('sika_dept_budgets', JSON.stringify(INITIAL_DEPARTMENT_BUDGETS));
      localStorage.setItem('sika_disbursements', JSON.stringify([]));
      localStorage.setItem('sika_sadaqah_records', JSON.stringify([]));
      localStorage.setItem('sika_audit_logs', JSON.stringify([]));
      localStorage.setItem('sika_worker_logs', JSON.stringify([]));
      localStorage.setItem('sika_saudi_employees', JSON.stringify([]));
      return [];
    }

    const savedMode = localStorage.getItem('vantage_ledger_mode');
    if (savedMode === 'clean') return [];

    const cached = localStorage.getItem('vantage_transactions');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [goal, setGoal] = useState<FinancialGoal>(() => {
    if (!hasMigrated) return INITIAL_GOAL;
    const cached = localStorage.getItem('vantage_goal');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return INITIAL_GOAL;
      }
    }
    return INITIAL_GOAL;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (!hasMigrated) return INITIAL_TEAM_MEMBERS;
    const cached = localStorage.getItem('vantage_team');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return INITIAL_TEAM_MEMBERS;
      }
    }
    return INITIAL_TEAM_MEMBERS;
  });

  // Role Systems States
  const [salesContracts, setSalesContracts] = useState<SalesContract[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_sales_contracts', JSON.stringify(INITIAL_SALES_CONTRACTS));
      return INITIAL_SALES_CONTRACTS;
    }
    const cached = localStorage.getItem('sika_sales_contracts');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_SALES_CONTRACTS; }
    }
    return INITIAL_SALES_CONTRACTS;
  });

  const [clientGifts, setClientGifts] = useState<ClientGiftRecord[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_client_gifts', JSON.stringify(INITIAL_CLIENT_GIFTS));
      return INITIAL_CLIENT_GIFTS;
    }
    const cached = localStorage.getItem('sika_client_gifts');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_CLIENT_GIFTS; }
    }
    return INITIAL_CLIENT_GIFTS;
  });

  const [approvalClaims, setApprovalClaims] = useState<ExpenseApprovalClaim[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_approval_claims', JSON.stringify(INITIAL_APPROVAL_CLAIMS));
      return INITIAL_APPROVAL_CLAIMS;
    }
    const cached = localStorage.getItem('sika_approval_claims');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_APPROVAL_CLAIMS; }
    }
    return INITIAL_APPROVAL_CLAIMS;
  });

  const [departmentBudgets, setDepartmentBudgets] = useState<DepartmentBudget[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_dept_budgets', JSON.stringify(INITIAL_DEPARTMENT_BUDGETS));
      return INITIAL_DEPARTMENT_BUDGETS;
    }
    const cached = localStorage.getItem('sika_dept_budgets');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_DEPARTMENT_BUDGETS; }
    }
    return INITIAL_DEPARTMENT_BUDGETS;
  });

  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_disbursements', JSON.stringify(INITIAL_DISBURSEMENTS));
      return INITIAL_DISBURSEMENTS;
    }
    const cached = localStorage.getItem('sika_disbursements');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_DISBURSEMENTS; }
    }
    return INITIAL_DISBURSEMENTS;
  });

  const [sadaqahRecords, setSadaqahRecords] = useState<SadaqahRecord[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_sadaqah_records', JSON.stringify(INITIAL_SADAQAH_RECORDS));
      return INITIAL_SADAQAH_RECORDS;
    }
    const cached = localStorage.getItem('sika_sadaqah_records');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_SADAQAH_RECORDS; }
    }
    return INITIAL_SADAQAH_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    const cached = localStorage.getItem('sika_audit_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_AUDIT_LOGS; }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [workerLogs, setWorkerLogs] = useState<WorkerSiteLog[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_worker_logs', JSON.stringify(INITIAL_WORKER_LOGS));
      return INITIAL_WORKER_LOGS;
    }
    const cached = localStorage.getItem('sika_worker_logs');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_WORKER_LOGS; }
    }
    return INITIAL_WORKER_LOGS;
  });

  const [saudiEmployees, setSaudiEmployees] = useState<SaudiEmployeeRecord[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem('sika_saudi_employees', JSON.stringify(INITIAL_SAUDI_EMPLOYEES));
      return INITIAL_SAUDI_EMPLOYEES;
    }
    const cached = localStorage.getItem('sika_saudi_employees');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_SAUDI_EMPLOYEES; }
    }
    return INITIAL_SAUDI_EMPLOYEES;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('vantage_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('vantage_goal', JSON.stringify(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem('vantage_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('sika_sales_contracts', JSON.stringify(salesContracts));
  }, [salesContracts]);

  useEffect(() => {
    localStorage.setItem('sika_client_gifts', JSON.stringify(clientGifts));
  }, [clientGifts]);

  useEffect(() => {
    localStorage.setItem('sika_approval_claims', JSON.stringify(approvalClaims));
  }, [approvalClaims]);

  useEffect(() => {
    localStorage.setItem('sika_dept_budgets', JSON.stringify(departmentBudgets));
  }, [departmentBudgets]);

  useEffect(() => {
    localStorage.setItem('sika_disbursements', JSON.stringify(disbursements));
  }, [disbursements]);

  useEffect(() => {
    localStorage.setItem('sika_sadaqah_records', JSON.stringify(sadaqahRecords));
  }, [sadaqahRecords]);

  useEffect(() => {
    localStorage.setItem('sika_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('sika_worker_logs', JSON.stringify(workerLogs));
  }, [workerLogs]);

  useEffect(() => {
    localStorage.setItem('sika_saudi_employees', JSON.stringify(saudiEmployees));
  }, [saudiEmployees]);

  // Set Ledger Mode
  const setLedgerMode = (mode: 'real' | 'clean') => {
    setLedgerModeState(mode);
    localStorage.setItem('vantage_ledger_mode', mode);
    if (mode === 'clean') {
      setTransactions([]);
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }
  };

  // Cloud SQL Database Initial Loader
  useEffect(() => {
    const loadFromDatabase = async () => {
      try {
        const txRes = await fetch('/api/transactions');
        if (txRes.ok) {
          const remoteTxs = await txRes.json();
          if (Array.isArray(remoteTxs)) {
            setTransactions(remoteTxs);
          }
        }
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const remoteEmps = await empRes.json();
          if (Array.isArray(remoteEmps)) {
            setSaudiEmployees(remoteEmps);
          }
        }
      } catch (err) {
        console.log('Database fetch notice:', err);
      }
    };
    loadFromDatabase();
  }, []);

  // Firestore Live Listener when authenticated
  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: Transaction[] = [];
          snapshot.forEach((doc) => {
            remoteList.push(doc.data() as Transaction);
          });
          setTransactions(remoteList);
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn('Firestore live listener notice (using local state):', error.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Filtered transactions for the selected period
  const { filtered: filteredTransactions, previousPeriod: previousTransactions } = useMemo(() => {
    return filterTransactionsByPeriod(transactions, selectedPeriod, '2026-10-26');
  }, [transactions, selectedPeriod]);

  // Aggregated summaries
  const summary = useMemo(() => computeFinancialMetrics(filteredTransactions), [filteredTransactions]);
  const previousSummary = useMemo(() => computeFinancialMetrics(previousTransactions), [previousTransactions]);

  const revenueGrowth = useMemo(
    () => computeGrowthRate(summary.totalRevenue, previousSummary.totalRevenue),
    [summary.totalRevenue, previousSummary.totalRevenue]
  );

  const expenseGrowth = useMemo(
    () => computeGrowthRate(summary.totalExpenses, previousSummary.totalExpenses),
    [summary.totalExpenses, previousSummary.totalExpenses]
  );

  const profitGrowth = useMemo(
    () => computeGrowthRate(summary.netProfit, previousSummary.netProfit),
    [summary.netProfit, previousSummary.netProfit]
  );

  // Granular buckets for chart
  const granularBuckets = useMemo(() => {
    const granularity =
      selectedPeriod === 'daily'
        ? 'daily'
        : selectedPeriod === 'weekly'
        ? 'daily'
        : selectedPeriod === 'monthly'
        ? 'weekly'
        : selectedPeriod === 'yearly'
        ? 'monthly'
        : 'monthly';

    const sourceData = selectedPeriod === 'all' || selectedPeriod === 'yearly' || selectedPeriod === 'monthly'
      ? transactions
      : filteredTransactions.length > 0
      ? filteredTransactions
      : transactions;

    return aggregateByGranularity(sourceData, granularity);
  }, [transactions, filteredTransactions, selectedPeriod]);

  // Categories
  const revenueCategories = useMemo(
    () => aggregateByCategory(filteredTransactions, 'revenue'),
    [filteredTransactions]
  );

  const expenseCategories = useMemo(
    () => aggregateByCategory(filteredTransactions, 'expense'),
    [filteredTransactions]
  );

  const specialAllocations = useMemo(
    () => computeSpecialAllocations(filteredTransactions),
    [filteredTransactions]
  );

  // Actions
  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
    if (!canAddTransaction) {
      alert('Access Denied: You do not have permission to record transactions with your current account role.');
      return false;
    }

    const newId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...data,
      id: newId,
      userId: currentUser?.uid || profile.userId,
      recordedBy: data.recordedBy || profile.displayName,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Persist to Cloud SQL PostgreSQL
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch(err => console.warn('Cloud SQL insert notice:', err));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'transactions', newId), newTx);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `transactions/${newId}`);
      }
    }
    return true;
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<boolean> => {
    if (!canEditTransaction) {
      alert('Access Denied: Only Executives and Managers can modify transactions.');
      return false;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
    );

    // Persist to Cloud SQL PostgreSQL
    fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(err => console.warn('Cloud SQL update notice:', err));

    if (currentUser) {
      try {
        await setDoc(doc(db, 'transactions', id), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `transactions/${id}`);
      }
    }
    return true;
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!canDeleteTransaction) {
      alert('Access Denied: Only Founders and Executive Owners have authorization to delete financial records.');
      return false;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Persist to Cloud SQL PostgreSQL
    fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Cloud SQL delete notice:', err));

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
      }
    }
    return true;
  };

  const clearTransactions = () => {
    setTransactions([]);
    setLedgerModeState('clean');
    localStorage.setItem('vantage_ledger_mode', 'clean');
    localStorage.setItem('vantage_transactions', JSON.stringify([]));
  };

  const updateGoal = async (data: Partial<FinancialGoal>): Promise<boolean> => {
    if (!canEditGoals) {
      alert('Access Denied: Only Founders and Executives can modify financial goals and budgets.');
      return false;
    }

    const updated = { ...goal, ...data };
    setGoal(updated);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'financial_goals', updated.id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `financial_goals/${updated.id}`);
      }
    }
    return true;
  };

  const addTeamMember = async (data: Omit<TeamMember, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
    if (!canManageTeam) {
      alert('Access Denied: Only Founders and Executive Owners can invite team members.');
      return false;
    }

    const newId = `tm-${Date.now()}`;
    const newMember: TeamMember = {
      ...data,
      id: newId,
      userId: currentUser?.uid || profile.userId,
      createdAt: new Date().toISOString(),
    };

    setTeamMembers((prev) => [...prev, newMember]);

    if (currentUser) {
      try {
        await setDoc(doc(db, 'team_members', newId), newMember);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `team_members/${newId}`);
      }
    }
    return true;
  };

  const updateTeamMemberRole = async (id: string, newRole: UserRole): Promise<boolean> => {
    if (!canManageTeam) {
      alert('Access Denied: Only Founders and Executive Owners can change team member roles.');
      return false;
    }

    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );

    if (currentUser) {
      try {
        await setDoc(doc(db, 'team_members', id), { role: newRole }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `team_members/${id}`);
      }
    }
    return true;
  };

  const removeTeamMember = async (id: string): Promise<boolean> => {
    if (!canManageTeam) {
      alert('Access Denied: Only Founders and Executive Owners can remove team members.');
      return false;
    }

    setTeamMembers((prev) => prev.filter((m) => m.id !== id));

    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'team_members', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `team_members/${id}`);
      }
    }
    return true;
  };

  // Audit Logging Helper
  const addAuditLog = (
    action: string,
    entityType: AuditLogEntry['entityType'],
    details: string,
    entityId?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action,
      entityType,
      entityId,
      performedBy: profile.displayName,
      userRole: profile.role,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Salesman Systems
  const addSalesContract = async (
    data: Omit<SalesContract, 'id' | 'createdAt' | 'pushedToLedger' | 'commissionEarned'>
  ): Promise<boolean> => {
    const newId = `cnt-${Date.now()}`;
    const commissionEarned = (data.netValue * data.commissionRatePct) / 100;
    const newContract: SalesContract = {
      ...data,
      id: newId,
      commissionEarned,
      pushedToLedger: false,
      createdAt: new Date().toISOString(),
    };

    setSalesContracts((prev) => [newContract, ...prev]);
    addAuditLog(
      'New Contract Drafted',
      'contract',
      `Drafted ${data.projectTitle} for ${data.clientName} (Value: AED ${data.netValue.toLocaleString()})`,
      newId
    );
    return true;
  };

  const updateSalesContractStatus = async (id: string, status: ContractStatus): Promise<boolean> => {
    setSalesContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    addAuditLog('Contract Status Updated', 'contract', `Updated contract ${id} status to ${status.toUpperCase()}`, id);
    return true;
  };

  const pushContractToRevenueLedger = async (contractId: string): Promise<boolean> => {
    const contract = salesContracts.find((c) => c.id === contractId);
    if (!contract) return false;
    if (contract.pushedToLedger) {
      alert('This contract has already been recorded in the company revenue ledger.');
      return false;
    }

    const success = await addTransaction({
      type: 'revenue',
      category: 'Commercial Chemical Contracts',
      amount: contract.netValue,
      date: new Date().toISOString().slice(0, 10),
      description: `${contract.chemicalProduct} - ${contract.clientName} (${contract.projectTitle})`,
      status: 'cleared',
      paymentMethod: contract.paymentTerms.includes('Advance') ? 'Bank Wire' : 'Post-Dated Cheque',
      recordedBy: contract.salesmanName,
    });

    if (success) {
      setSalesContracts((prev) =>
        prev.map((c) => (c.id === contractId ? { ...c, pushedToLedger: true, status: 'signed' } : c))
      );
      addAuditLog(
        'Contract Pushed to Ledger',
        'contract',
        `Contract ${contract.projectTitle} (AED ${contract.netValue.toLocaleString()}) recorded as active revenue`,
        contractId
      );
    }
    return success;
  };

  const addClientGift = async (data: Omit<ClientGiftRecord, 'id' | 'createdAt'>): Promise<boolean> => {
    const newId = `cg-${Date.now()}`;
    const newRecord: ClientGiftRecord = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setClientGifts((prev) => [newRecord, ...prev]);

    // Automatically record an expense in the company ledger under Gifts & Honorariums
    await addTransaction({
      type: 'expense',
      category: 'Gifts & Honorariums',
      amount: data.cost,
      date: new Date().toISOString().slice(0, 10),
      description: `${data.giftItem} for ${data.recipientName} (${data.clientName}) - ${data.occasion}`,
      status: 'cleared',
      paymentMethod: 'Company Card',
      recordedBy: data.salesmanName,
    });

    addAuditLog('Corporate Gift Recorded', 'transaction', `Gift of AED ${data.cost} for ${data.recipientName}`, newId);
    return true;
  };

  // Manager Operations: Claims & Approvals
  const submitApprovalClaim = async (
    data: Omit<ExpenseApprovalClaim, 'id' | 'submittedAt' | 'pushedToExpenseLedger' | 'status'>
  ): Promise<boolean> => {
    const newId = `clm-${Date.now()}`;
    const newClaim: ExpenseApprovalClaim = {
      ...data,
      id: newId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      pushedToExpenseLedger: false,
    };
    setApprovalClaims((prev) => [newClaim, ...prev]);
    addAuditLog('Claim Submitted for Review', 'claim', `Claim of AED ${data.amount} submitted by ${data.submittedBy}`, newId);
    return true;
  };

  const reviewApprovalClaim = async (
    id: string,
    status: 'approved' | 'rejected',
    managerNote?: string
  ): Promise<boolean> => {
    const claim = approvalClaims.find((c) => c.id === id);
    if (!claim) return false;

    setApprovalClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              managerNote: managerNote || c.managerNote,
              reviewedAt: new Date().toISOString(),
              reviewedBy: profile.displayName,
            }
          : c
      )
    );

    // If approved and not yet recorded into company expense ledger, auto-log it
    if (status === 'approved' && !claim.pushedToExpenseLedger) {
      let ledgerCategory = 'Daily Expenses & Petty Cash';
      if (claim.category.includes('Fuel')) ledgerCategory = 'Vehicle Fleet & Fuel';
      else if (claim.category.includes('Hardware')) ledgerCategory = 'Raw Materials & Inventory';
      else if (claim.category.includes('Gift')) ledgerCategory = 'Gifts & Honorariums';
      else if (claim.category.includes('Discount') || claim.category.includes('Concession')) ledgerCategory = 'Discounts & Deductions';

      await addTransaction({
        type: 'expense',
        category: ledgerCategory,
        amount: claim.amount,
        date: new Date().toISOString().slice(0, 10),
        description: `Approved Claim: ${claim.description} [Ref: ${claim.projectRef}]`,
        status: 'cleared',
        paymentMethod: 'Petty Cash',
        recordedBy: claim.submittedBy,
      });

      setApprovalClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pushedToExpenseLedger: true } : c))
      );
    }

    addAuditLog(
      status === 'approved' ? 'Claim Approved' : 'Claim Rejected',
      'claim',
      `Manager ${profile.displayName} marked claim ${id} (AED ${claim.amount}) as ${status.toUpperCase()}`,
      id
    );
    return true;
  };

  const updateDepartmentBudgetCap = async (id: string, newCap: number): Promise<boolean> => {
    setDepartmentBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyCap: newCap } : b))
    );
    addAuditLog('Budget Cap Adjusted', 'budget', `Department budget ${id} ceiling set to AED ${newCap.toLocaleString()}`, id);
    return true;
  };

  const recordDisbursement = async (
    data: Omit<DisbursementRecord, 'id' | 'processedAt'>
  ): Promise<boolean> => {
    const newId = `dsb-${Date.now()}`;
    const newRecord: DisbursementRecord = {
      ...data,
      id: newId,
      processedAt: new Date().toISOString(),
    };
    setDisbursements((prev) => [newRecord, ...prev]);

    // Record corresponding expense transaction
    const cat = data.type === 'Salary' ? 'Salaries & Site Payroll' : 'Daily Expenses & Petty Cash';
    await addTransaction({
      type: 'expense',
      category: cat,
      amount: data.amount,
      date: new Date().toISOString().slice(0, 10),
      description: `Disbursement (${data.type}) to ${data.recipientName} - ${data.referenceNote}`,
      status: 'cleared',
      paymentMethod: data.paymentMode,
      recordedBy: data.processedBy,
    });

    addAuditLog('Staff Disbursement Processed', 'disbursement', `Disbursed AED ${data.amount} to ${data.recipientName} (${data.type})`, newId);
    return true;
  };

  // Owner Suite: Sadaqah & Audit
  const recordSadaqah = async (
    data: Omit<SadaqahRecord, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const newId = `sdq-${Date.now()}`;
    const newRecord: SadaqahRecord = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSadaqahRecords((prev) => [newRecord, ...prev]);

    await addTransaction({
      type: 'expense',
      category: 'Sadaqah & Charity',
      amount: data.amount,
      date: data.date,
      description: `Corporate Sadaqah: ${data.beneficiary} - ${data.description}`,
      status: 'cleared',
      paymentMethod: 'Bank Transfer',
      recordedBy: data.approvedBy,
    });

    addAuditLog('Sadaqah Welfare Granted', 'transaction', `Authorized AED ${data.amount} charity to ${data.beneficiary}`, newId);
    return true;
  };

  // Worker & Field Staff
  const addWorkerLog = async (data: Omit<WorkerSiteLog, 'id' | 'createdAt'>): Promise<boolean> => {
    const newId = `wlog-${Date.now()}`;
    const newLog: WorkerSiteLog = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setWorkerLogs((prev) => [newLog, ...prev]);
    addAuditLog('Site Work Logged', 'transaction', `${data.workerName} logged ${data.hoursLogged}h at ${data.siteName}`, newId);
    return true;
  };

  // Saudi Arabia & GCC Employee Records & Document Expiry Compliance
  const addSaudiEmployee = async (
    data: Omit<SaudiEmployeeRecord, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const newId = `emp-${Date.now()}`;
    const newEmployee: SaudiEmployeeRecord = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setSaudiEmployees((prev) => [newEmployee, ...prev]);

    // Persist to Cloud SQL PostgreSQL
    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee),
    }).catch(err => console.warn('Cloud SQL employee insert notice:', err));

    addAuditLog(
      'Employee Record Added',
      'auth',
      `Registered employee ${data.employeeName} (${data.employeeIdNumber}) with Iqama ${data.iqamaNumber}`,
      newId
    );
    return true;
  };

  const updateSaudiEmployee = async (
    id: string,
    data: Partial<SaudiEmployeeRecord>
  ): Promise<boolean> => {
    setSaudiEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...data } : emp))
    );

    // Persist to Cloud SQL PostgreSQL
    fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(err => console.warn('Cloud SQL employee update notice:', err));

    addAuditLog('Employee Record Updated', 'auth', `Updated official details for employee record ${id}`, id);
    return true;
  };

  const removeSaudiEmployee = async (id: string): Promise<boolean> => {
    setSaudiEmployees((prev) => prev.filter((emp) => emp.id !== id));

    // Persist to Cloud SQL PostgreSQL
    fetch(`/api/employees/${id}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Cloud SQL employee delete notice:', err));

    addAuditLog('Employee Record Removed', 'auth', `Removed employee compliance record ${id}`, id);
    return true;
  };

  const renewEmployeeDocument = async (
    employeeId: string,
    docType: 'iqama' | 'passport' | 'qiwa' | 'insurance' | 'drivingLicense' | 'healthCert',
    newExpiryDate: string
  ): Promise<boolean> => {
    setSaudiEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        if (docType === 'iqama') {
          return { ...emp, iqamaExpiryGregorian: newExpiryDate };
        } else if (docType === 'passport') {
          return { ...emp, passportExpiryDate: newExpiryDate };
        } else if (docType === 'qiwa') {
          return { ...emp, qiwaContractEndDate: newExpiryDate, qiwaStatus: 'documented' };
        } else if (docType === 'insurance') {
          return { ...emp, insuranceExpiryDate: newExpiryDate };
        } else if (docType === 'drivingLicense') {
          return { ...emp, drivingLicenseExpiry: newExpiryDate };
        } else if (docType === 'healthCert') {
          return { ...emp, healthCertExpiry: newExpiryDate };
        }
        return emp;
      })
    );

    const emp = saudiEmployees.find((e) => e.id === employeeId);
    addAuditLog(
      'Document Renewed',
      'auth',
      `Renewed ${docType.toUpperCase()} for ${emp?.employeeName || employeeId} to new date: ${newExpiryDate}`,
      employeeId
    );
    return true;
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setGoal(INITIAL_GOAL);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setSalesContracts(INITIAL_SALES_CONTRACTS);
    setClientGifts(INITIAL_CLIENT_GIFTS);
    setApprovalClaims(INITIAL_APPROVAL_CLAIMS);
    setDepartmentBudgets(INITIAL_DEPARTMENT_BUDGETS);
    setDisbursements(INITIAL_DISBURSEMENTS);
    setSadaqahRecords(INITIAL_SADAQAH_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setWorkerLogs(INITIAL_WORKER_LOGS);
    setSaudiEmployees(INITIAL_SAUDI_EMPLOYEES);
    setLedgerModeState('real');
    localStorage.removeItem('vantage_transactions');
    localStorage.removeItem('vantage_goal');
    localStorage.removeItem('vantage_team');
    localStorage.removeItem('sika_sales_contracts');
    localStorage.removeItem('sika_client_gifts');
    localStorage.removeItem('sika_approval_claims');
    localStorage.removeItem('sika_dept_budgets');
    localStorage.removeItem('sika_disbursements');
    localStorage.removeItem('sika_sadaqah_records');
    localStorage.removeItem('sika_audit_logs');
    localStorage.removeItem('sika_worker_logs');
    localStorage.removeItem('sika_saudi_employees');
    localStorage.setItem('vantage_ledger_mode', 'real');
  };

  // Import Real Transactions from CSV
  const importTransactionsCsv = async (csvContent: string): Promise<{ count: number; error?: string }> => {
    try {
      const lines = csvContent.trim().split(/\r?\n/);
      if (lines.length < 2) {
        return { count: 0, error: 'CSV file is empty or missing headers.' };
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      const dateIdx = headers.findIndex((h) => h.includes('date'));
      const typeIdx = headers.findIndex((h) => h.includes('type'));
      const catIdx = headers.findIndex((h) => h.includes('category'));
      const amtIdx = headers.findIndex((h) => h.includes('amount'));
      const descIdx = headers.findIndex((h) => h.includes('desc'));
      const recIdx = headers.findIndex((h) => h.includes('recorded') || h.includes('by') || h.includes('salesman'));
      const statusIdx = headers.findIndex((h) => h.includes('status'));

      if (amtIdx === -1) {
        return { count: 0, error: 'CSV must contain an "Amount" column.' };
      }

      const parsedRecords: Transaction[] = [];
      const currentUid = currentUser?.uid || profile.userId;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV row accounting for quotes
        const match = line.match(/(?:[^\s,"]+|"[^"]*")+/g) || line.split(',');
        const row = match.map((v) => v.trim().replace(/^["']|["']$/g, ''));

        const rawAmount = parseFloat((row[amtIdx] || '0').replace(/[^0-9.-]/g, ''));
        if (isNaN(rawAmount) || rawAmount <= 0) continue;

        const rawType = (row[typeIdx] || '').toLowerCase();
        const type: 'revenue' | 'expense' = rawType.includes('rev') || rawType.includes('income') ? 'revenue' : 'expense';
        const date = (row[dateIdx] && /^\d{4}-\d{2}-\d{2}$/.test(row[dateIdx])) ? row[dateIdx] : new Date().toISOString().slice(0, 10);
        const category = row[catIdx] || (type === 'revenue' ? 'Commercial Chemical Contracts' : 'Daily Expenses & Petty Cash');
        const description = row[descIdx] || 'Imported Transaction';
        const recordedBy = row[recIdx] || profile.displayName;
        const status = (row[statusIdx] || '').toLowerCase().includes('pend') ? 'pending' : 'cleared';

        parsedRecords.push({
          id: `tx-import-${Date.now()}-${i}`,
          userId: currentUid,
          type,
          category,
          amount: rawAmount,
          date,
          description,
          status,
          recordedBy,
          createdAt: new Date().toISOString(),
        });
      }

      if (parsedRecords.length === 0) {
        return { count: 0, error: 'No valid transaction records could be parsed from the CSV.' };
      }

      setTransactions((prev) => [...parsedRecords, ...prev]);
      setLedgerModeState('real');
      localStorage.setItem('vantage_ledger_mode', 'real');

      return { count: parsedRecords.length };
    } catch (err) {
      return { count: 0, error: err instanceof Error ? err.message : 'Failed to parse CSV file.' };
    }
  };

  // Synchronize to Cloud SQL PostgreSQL & Cloud Storage
  const syncToCloudDatabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      // Trigger Cloud SQL database sync
      await fetch('/api/seed', { method: 'POST' });

      // If signed in, also sync to Firestore
      if (currentUser) {
        const batch = writeBatch(db);
        const toSync = transactions.slice(0, 400);
        for (const t of toSync) {
          const ref = doc(db, 'transactions', t.id);
          batch.set(ref, {
            ...t,
            userId: currentUser.uid,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
        await batch.commit();
      }

      setIsLoading(false);
      return { success: true, message: `Successfully synced ${transactions.length} transactions and workforce records to Cloud SQL database!` };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: err instanceof Error ? err.message : 'Database synchronization notice.' };
    }
  };

  return (
    <FinancialDataContext.Provider
      value={{
        transactions,
        filteredTransactions,
        previousTransactions,
        summary,
        previousSummary,
        revenueGrowth,
        expenseGrowth,
        profitGrowth,
        granularBuckets,
        revenueCategories,
        expenseCategories,
        specialAllocations,
        goal,
        teamMembers,
        selectedPeriod,
        setSelectedPeriod,
        activeTab,
        setActiveTab,
        isLoading,
        currency,
        setCurrency,
        ledgerMode,
        setLedgerMode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateGoal,
        addTeamMember,
        updateTeamMemberRole,
        removeTeamMember,
        resetToDemoData,
        clearTransactions,
        importTransactionsCsv,
        syncToCloudDatabase,

        // Salesman Systems
        salesContracts,
        addSalesContract,
        updateSalesContractStatus,
        pushContractToRevenueLedger,
        clientGifts,
        addClientGift,

        // Manager Operations & Approvals
        approvalClaims,
        submitApprovalClaim,
        reviewApprovalClaim,
        departmentBudgets,
        updateDepartmentBudgetCap,
        disbursements,
        recordDisbursement,

        // Owner Suite
        sadaqahRecords,
        recordSadaqah,
        auditLogs,
        addAuditLog,

        // Worker & Field Staff
        workerLogs,
        addWorkerLog,

        // Saudi Arabia & GCC Employee Records & Document Expiry Compliance
        saudiEmployees,
        addSaudiEmployee,
        updateSaudiEmployee,
        removeSaudiEmployee,
        renewEmployeeDocument,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
};

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}

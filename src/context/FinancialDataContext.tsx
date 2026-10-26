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
import { UserRole, Transaction, FinancialGoal, TeamMember, ViewTab } from '../types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOAL,
  INITIAL_TEAM_MEMBERS,
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
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile, canAddTransaction, canEditTransaction, canDeleteTransaction, canManageTeam, canEditGoals } = useAuth();
  
  // Cache versioning for SIKA GCC Real Business Data
  const SIKA_VERSION_KEY = 'sika_gcc_production_v2';
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
      localStorage.setItem('vantage_ledger_mode', 'real');
      return 'real';
    }
    const saved = localStorage.getItem('vantage_ledger_mode') as 'real' | 'clean';
    return saved || 'real';
  });

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('vantage_currency', c);
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (!hasMigrated) {
      localStorage.setItem(SIKA_VERSION_KEY, 'true');
      localStorage.setItem('vantage_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('vantage_team', JSON.stringify(INITIAL_TEAM_MEMBERS));
      localStorage.setItem('vantage_goal', JSON.stringify(INITIAL_GOAL));
      localStorage.setItem('vantage_ledger_mode', 'real');
      return INITIAL_TRANSACTIONS;
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

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setGoal(INITIAL_GOAL);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setLedgerModeState('real');
    localStorage.removeItem('vantage_transactions');
    localStorage.removeItem('vantage_goal');
    localStorage.removeItem('vantage_team');
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

  // Push to Live Firebase Firestore
  const syncToCloudDatabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in with Google first to sync with Cloud Firestore.' };
    }

    try {
      setIsLoading(true);
      const batch = writeBatch(db);
      // Batch up to 400 transactions
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
      setIsLoading(false);
      return { success: true, message: `Successfully synced ${toSync.length} transactions to Cloud Firestore database!` };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: err instanceof Error ? err.message : 'Failed to write to Cloud Firestore.' };
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

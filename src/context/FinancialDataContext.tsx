import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
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
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  updateGoal: (data: Partial<FinancialGoal>) => Promise<boolean>;
  addTeamMember: (data: Omit<TeamMember, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  updateTeamMemberRole: (id: string, newRole: UserRole) => Promise<boolean>;
  removeTeamMember: (id: string) => Promise<boolean>;
  resetToDemoData: () => void;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile, canAddTransaction, canEditTransaction, canDeleteTransaction, canManageTeam, canEditGoals } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cached = localStorage.getItem('vantage_transactions');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [goal, setGoal] = useState<FinancialGoal>(() => {
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

    // If viewing monthly or yearly, show a meaningful timeline
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
      alert('Access Denied: Only Owners and Managers can modify transactions.');
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
      alert('Access Denied: Only Owners have authorization to delete financial records.');
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

  const updateGoal = async (data: Partial<FinancialGoal>): Promise<boolean> => {
    if (!canEditGoals) {
      alert('Access Denied: Only Owners can modify financial goals and budgets.');
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
      alert('Access Denied: Only Owners can invite team members.');
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
    localStorage.removeItem('vantage_transactions');
    localStorage.removeItem('vantage_goal');
    localStorage.removeItem('vantage_team');
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
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateGoal,
        addTeamMember,
        updateTeamMemberRole,
        removeTeamMember,
        resetToDemoData,
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

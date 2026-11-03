/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialDataProvider, useFinancialData } from './context/FinancialDataContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewView } from './components/dashboard/OverviewView';
import { FinancialReportsView } from './components/reports/FinancialReportsView';
import { TransactionLedger } from './components/transactions/TransactionLedger';
import { TeamManagementView } from './components/team/TeamManagementView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { LoginModal } from './components/auth/LoginModal';
import { LockScreenGate } from './components/auth/LockScreenGate';
import { AccountAIAssistant } from './components/ai/AccountAIAssistant';
import { AIFloatingDrawer } from './components/ai/AIFloatingDrawer';
import { SalesmanHubView } from './components/sales/SalesmanHubView';
import { ManagerOpsView } from './components/manager/ManagerOpsView';
import { OwnerSuiteView } from './components/owner/OwnerSuiteView';
import { FieldClaimsView } from './components/worker/FieldClaimsView';
import { EmployeeComplianceView } from './components/employee/EmployeeComplianceView';
import { Transaction } from './types';
import { CheckCircle2, Bot } from 'lucide-react';

function DashboardApp() {
  const { activeTab, addTransaction, updateTransaction } = useFinancialData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (editingTransaction) {
      const ok = await updateTransaction(editingTransaction.id, data);
      if (ok) showToast('Transaction record updated successfully.');
      return ok;
    } else {
      const ok = await addTransaction(data);
      if (ok) showToast('New transaction recorded into ledger.');
      return ok;
    }
  };

  return (
    <div className="min-h-screen bg-[#090D15] text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenAddModal={handleOpenAdd}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAiAdvisor={() => setIsAiDrawerOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView onOpenAddModal={handleOpenAdd} />
          )}

          {activeTab === 'reports' && (
            <FinancialReportsView />
          )}

          {activeTab === 'transactions' && (
            <TransactionLedger
              onOpenAddModal={handleOpenAdd}
              onEditTransaction={handleOpenEdit}
            />
          )}

          {activeTab === 'sales-hub' && (
            <SalesmanHubView />
          )}

          {activeTab === 'manager-ops' && (
            <ManagerOpsView />
          )}

          {activeTab === 'owner-suite' && (
            <OwnerSuiteView />
          )}

          {activeTab === 'field-claims' && (
            <FieldClaimsView />
          )}

          {activeTab === 'employee-docs' && (
            <EmployeeComplianceView />
          )}

          {activeTab === 'ai-advisor' && (
            <AccountAIAssistant />
          )}

          {activeTab === 'team' && (
            <TeamManagementView />
          )}
        </main>
      </div>

      {/* Floating Quick AI Button (bottom right) */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-2xl shadow-amber-950/60 flex items-center gap-2 border border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        title="Open Account AI Financial Advisor"
        aria-label="Open Account AI Financial Advisor"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform text-stone-950" />
        <span className="text-xs font-black hidden sm:inline text-stone-950">AI Advisor</span>
      </button>

      {/* AI Floating Drawer */}
      <AIFloatingDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />

      {/* Login & Authentication System Modal */}
      <LoginModal />

      {/* Screen Lock Security Gate */}
      <LockScreenGate />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-amber-500/50 text-white text-xs rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinancialDataProvider>
        <DashboardApp />
      </FinancialDataProvider>
    </AuthProvider>
  );
}

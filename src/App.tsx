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
import { Transaction } from './types';
import { CheckCircle2 } from 'lucide-react';

function DashboardApp() {
  const { activeTab, addTransaction, updateTransaction } = useFinancialData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

          {activeTab === 'team' && (
            <TeamManagementView />
          )}
        </main>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-emerald-500/50 text-white text-xs rounded-xl shadow-2xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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

import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { Transaction, TransactionType, TransactionStatus } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import { generateTransactionsCsv, downloadCsvFile } from '../../utils/csv';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Receipt,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

interface TransactionLedgerProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction } = useFinancialData();
  const { canAddTransaction, canEditTransaction, canDeleteTransaction, role } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | TransactionStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesCat = t.category?.toLowerCase().includes(query);
        const matchesPay = t.paymentMethod?.toLowerCase().includes(query);
        const matchesActor = t.recordedBy?.toLowerCase().includes(query);
        const matchesDate = t.date?.includes(query);
        if (!matchesDesc && !matchesCat && !matchesPay && !matchesActor && !matchesDate) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterStatus, filterCategory, searchTerm]);

  // Export filtered
  const handleExportFilteredCsv = () => {
    const csv = generateTransactionsCsv(filtered);
    downloadCsvFile(csv, `vantage-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Financial Transaction Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit-grade double-entry ledger with RBAC editing and instant CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFilteredCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export ({filtered.length}) CSV</span>
          </button>

          {canAddTransaction ? (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Record Transaction</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Analyst Read-Only</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search memo, category, instrument..."
              className="w-full bg-slate-900 border border-slate-750 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Flow Types (Rev & Exp)</option>
              <option value="revenue">Revenue Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="all">All Settlement States</option>
              <option value="cleared">Cleared (Settled)</option>
              <option value="pending">Pending (Unsettled)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="font-mono-numbers">
            Showing <strong className="text-white">{filtered.length}</strong> of {transactions.length} records
          </span>
          {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
                setFilterStatus('all');
              }}
              className="text-emerald-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Quick Item Category Presets (Sadaqah, Gifts, Discounts, Daily Expenses) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mr-1">
            Focus:
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setFilterCategory('Sadaqah & Charity')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterCategory === 'Sadaqah & Charity'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-850'
            }`}
          >
            Sadaqah & Charity
          </button>
          <button
            onClick={() => setFilterCategory('Gifts & Honorariums')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterCategory === 'Gifts & Honorariums'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/80'
                : 'text-slate-400 hover:text-purple-400 hover:bg-slate-850'
            }`}
          >
            Client / Staff Gifts
          </button>
          <button
            onClick={() => setFilterCategory('Discounts & Deductions')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterCategory === 'Discounts & Deductions'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-850'
            }`}
          >
            Sales Discounts
          </button>
          <button
            onClick={() => setFilterCategory('Daily Expenses & Petty Cash')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              filterCategory === 'Daily Expenses & Petty Cash'
                ? 'bg-sky-950/80 text-sky-300 border border-sky-700/80'
                : 'text-slate-400 hover:text-sky-400 hover:bg-slate-850'
            }`}
          >
            Daily Expenses & Petty Cash
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description / Memo</th>
                <th className="py-3 px-3 font-semibold">Payment Instrument</th>
                <th className="py-3 px-3 font-semibold">Logged By</th>
                <th className="py-3 px-3 text-right font-semibold">Amount (USD)</th>
                <th className="py-3 px-3 text-center font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition-colors group">
                    <td className="py-3 px-4 font-mono-numbers text-slate-300 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          t.type === 'revenue' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200 whitespace-nowrap font-medium">
                      {t.category}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate font-medium">
                      {t.description}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {t.paymentMethod || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {t.recordedBy || 'Staff'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers font-semibold whitespace-nowrap">
                      <span className={t.type === 'revenue' ? 'text-emerald-400' : 'text-slate-200'}>
                        {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                          t.status === 'cleared'
                            ? 'text-slate-400 bg-slate-900 border border-slate-800'
                            : 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canEditTransaction ? (
                          <button
                            onClick={() => onEditTransaction(t)}
                            title="Edit transaction"
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span title="Edit locked for Analysts" className="p-1 text-slate-600">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {canDeleteTransaction && (
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            title="Delete transaction (Owner only)"
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0F1624] border border-rose-900/60 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Permanently Delete Record?</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              This financial ledger entry will be irrevocably deleted from database and reports.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

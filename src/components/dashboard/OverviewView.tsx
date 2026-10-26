import React from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { TimePeriod, formatCurrency } from '../../utils/analytics';
import { MetricCards } from './MetricCards';
import { InteractiveChart } from './InteractiveChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { BudgetGoalCard } from './BudgetGoalCard';
import {
  ArrowRight,
  Receipt,
  Calendar,
  Heart,
  Gift,
  Tag,
  Coffee,
  Sparkles,
} from 'lucide-react';

interface OverviewViewProps {
  onOpenAddModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenAddModal }) => {
  const { selectedPeriod, setSelectedPeriod, filteredTransactions, setActiveTab, specialAllocations, currency } = useFinancialData();

  const periods: { id: TimePeriod; label: string }[] = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'all', label: 'All Records' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Period Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111726]/60 border border-slate-800/80 rounded-xl p-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Report Cadence:
          </span>
        </div>

        {/* Segmented Period Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                selectedPeriod === p.id
                  ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Financial Key Performance Cards */}
      <MetricCards />

      {/* Special Allocations & Expenses Strip: Sadaqah, Gifts, Discounts, Daily Expenses */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Allocations: Sadaqah, Gifts, Discounts & Daily Expenses
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Current {selectedPeriod} cycle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Sadaqah */}
          <div className="p-3 bg-slate-900/80 border border-emerald-950/60 rounded-lg hover:border-emerald-700/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-emerald-400">Sadaqah (Charity)</span>
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.sadaqah, false, currency)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Corporate & community welfare</p>
          </div>

          {/* Gifts */}
          <div className="p-3 bg-slate-900/80 border border-purple-950/60 rounded-lg hover:border-purple-700/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-purple-400">Client & Staff Gifts</span>
              <Gift className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.gifts, false, currency)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Appreciation & honorariums</p>
          </div>

          {/* Discounts */}
          <div className="p-3 bg-slate-900/80 border border-amber-950/60 rounded-lg hover:border-amber-700/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-amber-400">Sales Discounts</span>
              <Tag className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.discounts, false, currency)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Salesman concessions & rebates</p>
          </div>

          {/* Daily Expenses */}
          <div className="p-3 bg-slate-900/80 border border-sky-950/60 rounded-lg hover:border-sky-700/60 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-sky-400">Daily Expenses</span>
              <Coffee className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.dailyExpenses, false, currency)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Workers daily petty cash & supplies</p>
          </div>
        </div>
      </div>

      {/* Main Cash Flow Chart */}
      <InteractiveChart />

      {/* 2-Column Split: Category Distribution & Financial Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown />
        <BudgetGoalCard />
      </div>

      {/* Recent Ledger Strip */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recent Financial Transactions
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Logged By</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono-numbers text-slate-300">{t.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold uppercase text-[10px] tracking-wider ${
                        t.type === 'revenue' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{t.category}</td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{t.description}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{t.recordedBy || 'Staff'}</td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers font-semibold">
                    <span className={t.type === 'revenue' ? 'text-emerald-400' : 'text-slate-200'}>
                      {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount, false, currency)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                        t.status === 'cleared'
                          ? 'text-slate-400 bg-slate-800/80'
                          : 'text-amber-400 bg-amber-950/40 border border-amber-800/60'
                      }`}
                    >
                      {t.status || 'cleared'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

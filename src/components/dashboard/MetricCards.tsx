import React from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency } from '../../utils/analytics';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { summary, revenueGrowth, expenseGrowth, profitGrowth, selectedPeriod, previousSummary } = useFinancialData();

  const periodLabels: Record<string, string> = {
    daily: 'vs yesterday',
    weekly: 'vs previous 7d',
    monthly: 'vs previous month',
    yearly: 'vs previous year',
    all: 'all-time record',
  };

  const periodLabel = periodLabels[selectedPeriod] || 'vs previous';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {revenueGrowth >= 0 ? (
              <span className="inline-flex items-center text-emerald-400 font-semibold font-mono-numbers">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{revenueGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-semibold font-mono-numbers">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {revenueGrowth}%
              </span>
            )}
            <span className="text-slate-500 ml-1">{periodLabel}</span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono-numbers">
            {summary.revenueCount} entries
          </span>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Expenses
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {formatCurrency(summary.totalExpenses)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {expenseGrowth <= 0 ? (
              <span className="inline-flex items-center text-emerald-400 font-semibold font-mono-numbers">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {expenseGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-semibold font-mono-numbers">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{expenseGrowth}%
              </span>
            )}
            <span className="text-slate-500 ml-1">{periodLabel}</span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono-numbers">
            {summary.expenseCount} entries
          </span>
        </div>
      </div>

      {/* 3. Net Profit */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Profit
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            summary.netProfit >= 0
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {summary.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-3">
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono-numbers ${
            summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(summary.netProfit)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className={`font-semibold font-mono-numbers ${
              profitGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {profitGrowth >= 0 ? `+${profitGrowth}%` : `${profitGrowth}%`}
            </span>
            <span className="text-slate-500 ml-1">{periodLabel}</span>
          </div>
          <span className="text-slate-400 font-medium font-mono-numbers">
            Prev: {formatCurrency(previousSummary.netProfit, true)}
          </span>
        </div>
      </div>

      {/* 4. Profit Margin & Pending */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Profit Margin
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono-numbers">
            {summary.profitMargin}%
          </div>
          <span className="text-xs text-slate-500 font-medium">of revenue</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Unsettled / Pending:</span>
          <span className="text-amber-400 font-semibold font-mono-numbers">
            {formatCurrency(summary.pendingAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import {
  filterTransactionsByPeriod,
  computeFinancialMetrics,
  computeGrowthRate,
  aggregateByGranularity,
  aggregateByCategory,
  computeSpecialAllocations,
  formatCurrency,
  TimePeriod,
} from '../../utils/analytics';
import { generateReportCsv, downloadCsvFile } from '../../utils/csv';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Gift,
  Tag,
  Coffee,
} from 'lucide-react';

export const FinancialReportsView: React.FC = () => {
  const { transactions } = useFinancialData();
  const [reportCadence, setReportCadence] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [copied, setCopied] = useState(false);

  // Compute reports based on chosen cadence
  const { currentData, previousData, buckets, specialAllocations } = useMemo(() => {
    const { filtered, previousPeriod } = filterTransactionsByPeriod(transactions, reportCadence, '2026-10-26');
    const summary = computeFinancialMetrics(filtered);
    const prevSummary = computeFinancialMetrics(previousPeriod);
    const allocations = computeSpecialAllocations(filtered);

    const b = aggregateByGranularity(
      filtered.length > 0 ? filtered : transactions,
      reportCadence === 'daily'
        ? 'daily'
        : reportCadence === 'weekly'
        ? 'daily'
        : reportCadence === 'monthly'
        ? 'weekly'
        : 'monthly'
    );

    return {
      currentData: { transactions: filtered, summary },
      previousData: { transactions: previousPeriod, summary: prevSummary },
      buckets: b,
      specialAllocations: allocations,
    };
  }, [transactions, reportCadence]);

  const revCategories = useMemo(
    () => aggregateByCategory(currentData.transactions, 'revenue'),
    [currentData.transactions]
  );

  const expCategories = useMemo(
    () => aggregateByCategory(currentData.transactions, 'expense'),
    [currentData.transactions]
  );

  const revGrowth = computeGrowthRate(currentData.summary.totalRevenue, previousData.summary.totalRevenue);
  const expGrowth = computeGrowthRate(currentData.summary.totalExpenses, previousData.summary.totalExpenses);
  const netGrowth = computeGrowthRate(currentData.summary.netProfit, previousData.summary.netProfit);

  const cadenceTitles: Record<string, string> = {
    daily: 'Daily Financial Flash Report (October 26, 2026)',
    weekly: 'Weekly Trailing Performance Report (Past 7 Days)',
    monthly: 'Monthly Executive P&L Statement (October 2026)',
    yearly: 'Yearly Comprehensive Business Financial Report (Fiscal 2026)',
  };

  const handleExportReportCsv = () => {
    const csv = generateReportCsv(
      cadenceTitles[reportCadence],
      reportCadence.toUpperCase(),
      currentData.summary,
      buckets,
      revCategories,
      expCategories,
      specialAllocations
    );
    downloadCsvFile(csv, `vantage-${reportCadence}-financial-report-2026.csv`);
  };

  const handleCopySummary = () => {
    const text = `📊 Vantage Financial Report (${reportCadence.toUpperCase()} - 2026)
Total Revenue: ${formatCurrency(currentData.summary.totalRevenue)} (${revGrowth >= 0 ? '+' : ''}${revGrowth}% vs prev)
Total Expenses: ${formatCurrency(currentData.summary.totalExpenses)} (${expGrowth >= 0 ? '+' : ''}${expGrowth}% vs prev)
Net Profit: ${formatCurrency(currentData.summary.netProfit)} (Margin: ${currentData.summary.profitMargin}%)
Transactions: ${currentData.summary.revenueCount} Revenue / ${currentData.summary.expenseCount} Expenses
Unsettled Settlements: ${formatCurrency(currentData.summary.pendingAmount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Cadence Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Executive Financial Reports & Statements
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated P&L accounting schedules, margin analytics, and exportable ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportReportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Cadence Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setReportCadence(c)}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all capitalize text-center whitespace-nowrap shrink-0 ${
              reportCadence === c
                ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            {c} Report
          </button>
        ))}
      </div>

      {/* Current Report Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111726] border border-slate-850 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Period Gross Revenue
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
            {formatCurrency(currentData.summary.totalRevenue)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1">
            {revGrowth >= 0 ? (
              <span className="text-emerald-400 font-semibold font-mono-numbers inline-flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +{revGrowth}%
              </span>
            ) : (
              <span className="text-rose-400 font-semibold font-mono-numbers inline-flex items-center">
                <ArrowDownRight className="w-3 h-3" /> {revGrowth}%
              </span>
            )}
            <span className="text-slate-500">vs previous {reportCadence}</span>
          </div>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-850 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operating Expenses
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
            {formatCurrency(currentData.summary.totalExpenses)}
          </div>
          <div className="mt-2 text-xs flex items-center gap-1">
            <span className="text-slate-400 font-mono-numbers">
              {expGrowth >= 0 ? `+${expGrowth}%` : `${expGrowth}%`}
            </span>
            <span className="text-slate-500">cost delta</span>
          </div>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-850 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Net Operating Income
          </span>
          <div className={`text-2xl font-bold mt-1 font-mono-numbers ${
            currentData.summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatCurrency(currentData.summary.netProfit)}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono-numbers">
            Margin: <strong className="text-white">{currentData.summary.profitMargin}%</strong>
          </div>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-850 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Settlement Status
          </span>
          <div className="text-2xl font-bold text-slate-200 mt-1 font-mono-numbers">
            {currentData.transactions.length}
          </div>
          <div className="mt-2 text-xs text-amber-400 font-mono-numbers">
            Pending: {formatCurrency(currentData.summary.pendingAmount)}
          </div>
        </div>
      </div>

      {/* Dedicated Allocations Summary: Sadaqah, Gifts, Discounts & Daily Expenses */}
      <div className="p-4 sm:p-5 bg-[#111726] border border-slate-850 rounded-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Special Expense & Allocation Schedule ({reportCadence})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-emerald-400">Sadaqah & Charity</span>
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.sadaqah)}
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-purple-400">Client / Staff Gifts</span>
              <Gift className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.gifts)}
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-amber-400">Sales Discounts</span>
              <Tag className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.discounts)}
            </div>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-semibold text-sky-400">Daily Expenses</span>
              <Coffee className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-bold text-white font-mono-numbers">
              {formatCurrency(specialAllocations.dailyExpenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Formal P&L Statement Table */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Statement of Profit & Loss (P&L)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {cadenceTitles[reportCadence]}
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            USD Currency Standard
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800/80">
                <th className="py-2.5 px-3">Financial Line Item</th>
                <th className="py-2.5 px-3 text-center">Entries</th>
                <th className="py-2.5 px-3 text-right">Share (%)</th>
                <th className="py-2.5 px-3 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {/* Revenue Header */}
              <tr className="bg-emerald-950/20 text-emerald-300 font-semibold">
                <td colSpan={4} className="py-2 px-3 tracking-wider uppercase text-[11px]">
                  1. Operating Revenues
                </td>
              </tr>
              {revCategories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-850/40 text-slate-300">
                  <td className="py-2 px-4 font-sans pl-6">{c.category}</td>
                  <td className="py-2 px-3 text-center text-slate-400">{c.count}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{c.percentage}%</td>
                  <td className="py-2 px-3 text-right font-medium text-emerald-400">
                    +{formatCurrency(c.amount)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold text-white border-t border-slate-700 bg-slate-900/60">
                <td className="py-2.5 px-4 font-sans">Total Operating Revenue</td>
                <td className="py-2.5 px-3 text-center">{currentData.summary.revenueCount}</td>
                <td className="py-2.5 px-3 text-right">100.0%</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">
                  {formatCurrency(currentData.summary.totalRevenue)}
                </td>
              </tr>

              {/* Expense Header */}
              <tr className="bg-rose-950/20 text-rose-300 font-semibold">
                <td colSpan={4} className="py-2 px-3 tracking-wider uppercase text-[11px] pt-4">
                  2. Operating Expenses
                </td>
              </tr>
              {expCategories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-850/40 text-slate-300">
                  <td className="py-2 px-4 font-sans pl-6">{c.category}</td>
                  <td className="py-2 px-3 text-center text-slate-400">{c.count}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{c.percentage}%</td>
                  <td className="py-2 px-3 text-right font-medium text-rose-400">
                    -{formatCurrency(c.amount)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold text-white border-t border-slate-700 bg-slate-900/60">
                <td className="py-2.5 px-4 font-sans">Total Operating Expenses</td>
                <td className="py-2.5 px-3 text-center">{currentData.summary.expenseCount}</td>
                <td className="py-2.5 px-3 text-right">100.0%</td>
                <td className="py-2.5 px-3 text-right text-rose-400">
                  {formatCurrency(currentData.summary.totalExpenses)}
                </td>
              </tr>

              {/* Net Profit Summary */}
              <tr className="text-sm font-bold bg-[#0D1424] border-t-2 border-slate-600">
                <td className="py-3 px-4 font-sans text-white">
                  Net Operating Profit / (Loss)
                </td>
                <td className="py-3 px-3 text-center text-slate-400">
                  {currentData.transactions.length}
                </td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {currentData.summary.profitMargin}% margin
                </td>
                <td className={`py-3 px-3 text-right ${
                  currentData.summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatCurrency(currentData.summary.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

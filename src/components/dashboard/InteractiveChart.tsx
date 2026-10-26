import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency, GranularBucket } from '../../utils/analytics';
import { BarChart3, TrendingUp } from 'lucide-react';

export const InteractiveChart: React.FC = () => {
  const { granularBuckets, selectedPeriod, currency } = useFinancialData();
  const [activeBucket, setActiveBucket] = useState<GranularBucket | null>(null);
  const [chartMode, setChartMode] = useState<'bars' | 'net'>('bars');

  if (granularBuckets.length === 0) {
    return (
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-8 text-center text-slate-500">
        No financial transaction history available for this timeframe.
      </div>
    );
  }

  // Calculate scales
  const maxRevenueOrExpense = Math.max(
    ...granularBuckets.map((b) => Math.max(b.revenue, b.expenses)),
    1000
  );

  const maxNet = Math.max(...granularBuckets.map((b) => Math.abs(b.netProfit)), 1000);

  const chartHeight = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const availableHeight = chartHeight - paddingBottom - paddingTop;

  return (
    <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Revenue & Expense Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Periodic cash flow trajectory ({selectedPeriod} view)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setChartMode('bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              chartMode === 'bars'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dual Stream</span>
          </button>
          <button
            onClick={() => setChartMode('net')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              chartMode === 'net'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Net Growth</span>
          </button>
        </div>
      </div>

      {/* Legend & Active Details */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-slate-300 font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-slate-300 font-medium">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-400 rounded-full" />
            <span className="text-slate-300 font-medium">Net Margin</span>
          </div>
        </div>

        {/* Dynamic Hover Status */}
        {activeBucket ? (
          <div className="flex items-center gap-4 text-xs font-mono-numbers">
            <span className="text-slate-400">
              Interval: <strong className="text-white">{activeBucket.label}</strong>
            </span>
            <span className="text-emerald-400">
              Rev: {formatCurrency(activeBucket.revenue, false, currency)}
            </span>
            <span className="text-rose-400">
              Exp: {formatCurrency(activeBucket.expenses, false, currency)}
            </span>
            <span className={activeBucket.netProfit >= 0 ? 'text-sky-400' : 'text-amber-400'}>
              Net: {formatCurrency(activeBucket.netProfit, false, currency)}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Hover or tap any bar for detailed breakdown
          </span>
        )}
      </div>

      {/* Interactive Responsive SVG / HTML Bar Chart */}
      <div className="relative w-full overflow-x-auto pb-2">
        <div className="min-w-[580px] h-[220px] flex items-end justify-between gap-2 pt-6 pb-6 px-2 border-b border-slate-800">
          {granularBuckets.map((bucket, idx) => {
            const revHeight = Math.max((bucket.revenue / maxRevenueOrExpense) * availableHeight, 4);
            const expHeight = Math.max((bucket.expenses / maxRevenueOrExpense) * availableHeight, 4);
            const isHovered = activeBucket?.key === bucket.key;

            return (
              <div
                key={bucket.key}
                onMouseEnter={() => setActiveBucket(bucket)}
                onMouseLeave={() => setActiveBucket(null)}
                onClick={() => setActiveBucket(bucket)}
                className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all ${
                  isHovered ? 'scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {chartMode === 'bars' ? (
                  // Dual Stream: Side by side Revenue & Expense bars
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}px` }}
                      className={`w-3 sm:w-4 rounded-t-sm transition-all ${
                        isHovered ? 'bg-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-emerald-500/80 hover:bg-emerald-400'
                      }`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}px` }}
                      className={`w-3 sm:w-4 rounded-t-sm transition-all ${
                        isHovered ? 'bg-rose-400 shadow-md shadow-rose-500/20' : 'bg-rose-500/80 hover:bg-rose-400'
                      }`}
                    />
                  </div>
                ) : (
                  // Net Profit Growth Bar
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${Math.max((Math.abs(bucket.netProfit) / maxNet) * availableHeight, 6)}px` }}
                      className={`w-5 sm:w-6 rounded-t-sm transition-all ${
                        bucket.netProfit >= 0
                          ? isHovered
                            ? 'bg-sky-400 shadow-md shadow-sky-500/20'
                            : 'bg-sky-500/85 hover:bg-sky-400'
                          : isHovered
                          ? 'bg-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-amber-500/85 hover:bg-amber-400'
                      }`}
                    />
                  </div>
                )}

                {/* X-axis Label */}
                <span className={`mt-2 text-[10px] font-mono whitespace-nowrap transition-colors ${
                  isHovered ? 'text-white font-bold' : 'text-slate-500'
                }`}>
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

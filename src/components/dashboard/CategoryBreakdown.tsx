import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { formatCurrency } from '../../utils/analytics';
import { PieChart, ArrowUpRight } from 'lucide-react';

export const CategoryBreakdown: React.FC = () => {
  const { revenueCategories, expenseCategories, selectedPeriod } = useFinancialData();
  const [activeType, setActiveType] = useState<'revenue' | 'expense'>('revenue');

  const categories = activeType === 'revenue' ? revenueCategories : expenseCategories;
  const isRevenue = activeType === 'revenue';

  return (
    <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Category Distribution
            </h3>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveType('revenue')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                isRevenue
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveType('expense')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                !isRevenue
                  ? 'bg-slate-800 text-rose-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Top {isRevenue ? 'revenue streams' : 'cost drivers'} for the active {selectedPeriod} period.
        </p>

        {/* Categories List */}
        {categories.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No {activeType} records recorded in this timeframe.
          </p>
        ) : (
          <div className="space-y-3.5">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.category} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {cat.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono-numbers">
                    <span className="font-semibold text-slate-300">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRevenue ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Active Categories: {categories.length}</span>
        <span className="font-mono-numbers">
          Top share: {categories[0] ? `${categories[0].percentage}%` : '0%'}
        </span>
      </div>
    </div>
  );
};

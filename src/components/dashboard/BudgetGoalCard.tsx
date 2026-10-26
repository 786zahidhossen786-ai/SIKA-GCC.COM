import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/analytics';
import { Target, AlertCircle, CheckCircle2, Edit3, X } from 'lucide-react';

export const BudgetGoalCard: React.FC = () => {
  const { goal, updateGoal, summary, currency } = useFinancialData();
  const { canEditGoals } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [targetRevInput, setTargetRevInput] = useState(goal.targetRevenue.toString());
  const [maxExpInput, setMaxExpInput] = useState(goal.maxExpenseBudget.toString());

  const revProgress = goal.targetRevenue > 0
    ? Math.min(Math.round((summary.totalRevenue / goal.targetRevenue) * 100), 100)
    : 0;

  const expBurnPercentage = goal.maxExpenseBudget > 0
    ? Math.round((summary.totalExpenses / goal.maxExpenseBudget) * 100)
    : 0;

  const isOverBudget = summary.totalExpenses > goal.maxExpenseBudget;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rev = parseFloat(targetRevInput);
    const exp = parseFloat(maxExpInput);
    if (!isNaN(rev) && !isNaN(exp)) {
      await updateGoal({
        targetRevenue: rev,
        maxExpenseBudget: exp,
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Targets & Budget Ceilings
            </h3>
          </div>

          {canEditGoals ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              aria-label="Edit targets"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel' : 'Configure'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-500">Owner Configured</span>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 my-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Target Revenue ($)
              </label>
              <input
                type="number"
                value={targetRevInput}
                onChange={(e) => setTargetRevInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono-numbers"
                min="0"
                step="500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Max Expense Budget ($)
              </label>
              <input
                type="number"
                value={maxExpInput}
                onChange={(e) => setMaxExpInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-400 font-mono-numbers"
                min="0"
                step="500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors"
            >
              Update Financial Limits
            </button>
          </form>
        ) : (
          <div className="space-y-5 my-2">
            {/* Revenue Goal */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Revenue Target</span>
                <span className="font-mono-numbers text-slate-400">
                  <strong className="text-white">{formatCurrency(summary.totalRevenue, true, currency)}</strong> / {formatCurrency(goal.targetRevenue, true, currency)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                <div
                  style={{ width: `${revProgress}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
                <span>{revProgress}% achieved</span>
                <span>Remaining: {formatCurrency(Math.max(goal.targetRevenue - summary.totalRevenue, 0), true, currency)}</span>
              </div>
            </div>

            {/* Expense Budget Ceiling */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Expense Budget Ceiling</span>
                <span className="font-mono-numbers text-slate-400">
                  <strong className={isOverBudget ? 'text-rose-400' : 'text-slate-200'}>
                    {formatCurrency(summary.totalExpenses, true, currency)}
                  </strong> / {formatCurrency(goal.maxExpenseBudget, true, currency)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(expBurnPercentage, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : expBurnPercentage > 85 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className={`font-mono-numbers ${isOverBudget ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
                  {expBurnPercentage}% utilized
                </span>
                <span className="text-slate-500">
                  {isOverBudget ? 'Over Budget' : `Buffer: ${formatCurrency(goal.maxExpenseBudget - summary.totalExpenses, true, currency)}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Budget Health:</span>
        <div className="flex items-center gap-1.5">
          {isOverBudget ? (
            <span className="inline-flex items-center gap-1 text-rose-400 font-medium text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              Ceiling Exceeded
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Within Operating Budget
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

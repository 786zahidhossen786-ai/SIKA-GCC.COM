import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { ExpenseApprovalClaim, ClaimStatus, DepartmentBudget, DisbursementRecord } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingDown,
  PieChart,
  Users,
  CreditCard,
  Plus,
  AlertTriangle,
  FileCheck,
  Building,
  Check,
  X,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';

export const ManagerOpsView: React.FC = () => {
  const {
    approvalClaims,
    reviewApprovalClaim,
    departmentBudgets,
    updateDepartmentBudgetCap,
    disbursements,
    recordDisbursement,
    currency,
  } = useFinancialData();

  const { profile, role } = useAuth();

  const [claimFilter, setClaimFilter] = useState<'all' | ClaimStatus>('pending');
  const [selectedClaim, setSelectedClaim] = useState<ExpenseApprovalClaim | null>(null);
  const [managerReviewNote, setManagerReviewNote] = useState('');
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [targetBudget, setTargetBudget] = useState<DepartmentBudget | null>(null);
  const [newBudgetCap, setNewBudgetCap] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Disbursement Form
  const [disbRecipient, setDisbRecipient] = useState('Faisal Ahmed');
  const [disbRole, setDisbRole] = useState<'worker' | 'salesman' | 'manager'>('worker');
  const [disbType, setDisbType] = useState<'Salary' | 'Petty Cash' | 'Expense Reimbursement' | 'Field Allowance'>('Petty Cash');
  const [disbAmount, setDisbAmount] = useState('1000');
  const [disbMode, setDisbMode] = useState<'Cash' | 'Bank Wire' | 'Cheque'>('Cash');
  const [disbRef, setDisbRef] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const pendingClaims = approvalClaims.filter((c) => c.status === 'pending');
  const totalPendingAmount = pendingClaims.reduce((sum, c) => sum + c.amount, 0);

  const filteredClaims = approvalClaims.filter((c) =>
    claimFilter === 'all' ? true : c.status === claimFilter
  );

  const handleReviewAction = async (claimId: string, status: 'approved' | 'rejected') => {
    await reviewApprovalClaim(claimId, status, managerReviewNote || undefined);
    showToast(`Claim marked as ${status.toUpperCase()}! ${status === 'approved' ? 'Recorded into expense ledger.' : ''}`);
    setSelectedClaim(null);
    setManagerReviewNote('');
  };

  const handleOpenBudgetModal = (budget: DepartmentBudget) => {
    setTargetBudget(budget);
    setNewBudgetCap(budget.monthlyCap.toString());
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudgetCap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBudget) return;
    const val = parseFloat(newBudgetCap);
    if (isNaN(val) || val <= 0) return;

    await updateDepartmentBudgetCap(targetBudget.id, val);
    setIsBudgetModalOpen(false);
    showToast(`Updated monthly spending cap for ${targetBudget.department} to ${formatCurrency(val, false, currency)}!`);
  };

  const handleCreateDisbursement = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(disbAmount);
    if (isNaN(amt) || amt <= 0) return;

    await recordDisbursement({
      recipientName: disbRecipient.trim(),
      recipientRole: disbRole,
      type: disbType,
      amount: amt,
      paymentMode: disbMode,
      referenceNote: disbRef.trim() || 'Operations & Payroll Release',
      processedBy: profile.displayName,
    });

    setIsDisbursementModalOpen(false);
    showToast(`Disbursed ${formatCurrency(amt, false, currency)} to ${disbRecipient}! Automatically logged in expense ledger.`);
    setDisbRef('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              Operations & Approvals Control Desk
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manager Review Queue, Department Budgets & Payroll
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Authorize field worker petty cash claims, fuel reimbursements, customer discount requests, and monitor monthly departmental spending caps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDisbursementModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-emerald-400/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Process Staff Disbursement</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Pending Claims Review
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono-numbers">
            {pendingClaims.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Totaling {formatCurrency(totalPendingAmount, false, currency)}
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active Department Budgets
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
            {departmentBudgets.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Materials, fleet fuel, petty cash & client gifts
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Processed Staff Disbursements
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono-numbers">
            {disbursements.length} records
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Salaries, site floats, and worker reimbursements
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operational Approver Role
          </span>
          <div className="text-base font-bold text-slate-200 mt-1 capitalize font-mono">
            {profile.displayName.split(' ')[0]} ({role})
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Authorized to approve claims & ceilings</span>
          </p>
        </div>
      </div>

      {/* SECTION 1: Claims & Approvals Queue */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Expense Verification & Worker Claims Queue
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredClaims.length} claims
            </span>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setClaimFilter(s)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  claimFilter === s
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Claim Details & Description</th>
                <th className="py-3 px-3">Submitted By</th>
                <th className="py-3 px-3">Project Ref</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Manager Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-sans">
                    <div className="font-semibold text-white">{claim.category}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {claim.description}
                    </div>
                    {claim.receiptNote && (
                      <div className="text-[10px] text-slate-500 mt-1 font-mono italic">
                        Receipt: {claim.receiptNote}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <div className="text-slate-200 font-medium">{claim.submittedBy}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">
                      {claim.employeeRole} • {claim.submittedAt.slice(0, 10)}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-sans text-slate-400">
                    {claim.projectRef}
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-rose-400 text-sm">
                    -{formatCurrency(claim.amount, false, currency)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${
                        claim.status === 'approved'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                          : claim.status === 'rejected'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/80 animate-pulse'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-sans">
                    {claim.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleReviewAction(claim.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Approve & Post</span>
                        </button>
                        <button
                          onClick={() => handleReviewAction(claim.id, 'rejected')}
                          className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500">
                        Reviewed by {claim.reviewedBy || 'Manager'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Department Spending Budgets & Limits */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Department Budget Ceilings & Spending Cap Monitoring
            </h3>
          </div>
          <span className="text-xs text-slate-400">Monthly Cycle: October - November 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentBudgets.map((b) => {
            const pct = Math.min(100, Math.round((b.currentSpent / b.monthlyCap) * 100));
            const isNearCap = pct >= b.alertThresholdPct;

            return (
              <div key={b.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug">{b.department}</h4>
                    <span className="text-[10px] text-slate-500">{b.category}</span>
                  </div>
                  <button
                    onClick={() => handleOpenBudgetModal(b)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                  >
                    Adjust Cap
                  </button>
                </div>

                <div className="space-y-1 font-mono-numbers">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Spent:</span>
                    <span className="text-white font-bold">{formatCurrency(b.currentSpent, false, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Monthly Cap:</span>
                    <span className="text-slate-300">{formatCurrency(b.monthlyCap, false, currency)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isNearCap ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className={isNearCap ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {pct}% utilized
                  </span>
                  <span className="text-slate-500">
                    Buffer: {formatCurrency(Math.max(0, b.monthlyCap - b.currentSpent), false, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Staff Disbursements & Payroll Records */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Staff Payroll, Petty Cash Floats & Disbursements Log
            </h3>
          </div>
          <button
            onClick={() => setIsDisbursementModalOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Disbursement</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-3">Disbursement Type</th>
                <th className="py-3 px-3">Reference / Purpose</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-4">Processed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {disbursements.map((d) => (
                <tr key={d.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    {d.recipientName}
                    <span className="text-[10px] text-slate-500 font-mono ml-2 uppercase">
                      ({d.recipientRole})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">
                    {d.referenceNote}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-rose-400 text-sm">
                    -{formatCurrency(d.amount, false, currency)}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-400">
                    {d.paymentMode}
                  </td>
                  <td className="py-3 px-4 font-sans text-[11px] text-slate-500">
                    {d.processedBy} • {d.processedAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Process Disbursement */}
      {isDisbursementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Process Staff Disbursement</span>
              </h3>
              <button
                onClick={() => setIsDisbursementModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDisbursement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={disbRecipient}
                  onChange={(e) => setDisbRecipient(e.target.value)}
                  placeholder="e.g. Faisal Ahmed"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Disbursement Type
                  </label>
                  <select
                    value={disbType}
                    onChange={(e) => setDisbType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Petty Cash">Petty Cash Float</option>
                    <option value="Salary">Monthly Salary</option>
                    <option value="Expense Reimbursement">Expense Reimbursement</option>
                    <option value="Field Allowance">Field Allowance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={disbAmount}
                    onChange={(e) => setDisbAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={disbMode}
                    onChange={(e) => setDisbMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Cash">Cash / Petty Float</option>
                    <option value="Bank Wire">Bank Wire Transfer</option>
                    <option value="Cheque">Company Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Recipient Role
                  </label>
                  <select
                    value={disbRole}
                    onChange={(e) => setDisbRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="worker">Site Worker</option>
                    <option value="salesman">Salesman</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Reference Note / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={disbRef}
                  onChange={(e) => setDisbRef(e.target.value)}
                  placeholder="e.g. Weekly site fuel float & Salik highway gate card"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisbursementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Disburse & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Adjust Budget Ceiling */}
      {isBudgetModalOpen && targetBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>Adjust Monthly Budget Ceiling</span>
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Department: <strong className="text-white">{targetBudget.department}</strong>
            </p>

            <form onSubmit={handleSaveBudgetCap} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Monthly Cap ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={newBudgetCap}
                  onChange={(e) => setNewBudgetCap(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Update Ceiling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 border border-emerald-500 text-white text-xs rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

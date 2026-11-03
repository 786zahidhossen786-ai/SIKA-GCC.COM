import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/analytics';
import { 
  Truck, 
  Fuel, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  HardHat, 
  FileCheck, 
  Calendar, 
  MapPin, 
  Printer, 
  Search, 
  Check, 
  XCircle, 
  PackageCheck, 
  CreditCard 
} from 'lucide-react';
import { ClaimCategory, WorkerSiteLog } from '../../types';

export const FieldClaimsView: React.FC = () => {
  const { 
    approvalClaims, 
    submitApprovalClaim, 
    workerLogs, 
    addWorkerLog, 
    currency 
  } = useFinancialData();
  
  const formatMoney = (v: number) => formatCurrency(v, false, currency);
  const { currentUser, role } = useAuth();

  // Fast Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimCategory, setClaimCategory] = useState<ClaimCategory>('Diesel Fuel & Fleet');
  const [claimAmount, setClaimAmount] = useState<number>(180);
  const [claimDescription, setClaimDescription] = useState('Diesel fill for delivery pickup truck (Plate 4421-R)');
  const [claimProjectRef, setClaimProjectRef] = useState('Riyadh Metro Line 3');
  const [claimReceiptNote, setClaimReceiptNote] = useState('Attached fuel station invoice #89201');

  // Work Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('NEOM Bay Worker Camp 2');
  const [taskType, setTaskType] = useState<WorkerSiteLog['taskType']>('Delivery & Offloading');
  const [hoursLogged, setHoursLogged] = useState<number>(8);
  const [docketNo, setDocketNo] = useState(`DCK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [shiftNotes, setShiftNotes] = useState('Delivered 40 drums of SikaTop Seal-107 and 20 rolls of PVC waterstop.');

  // Printable Docket State
  const [selectedDocket, setSelectedDocket] = useState<WorkerSiteLog | null>(null);

  // Claim filtering
  const [claimFilter, setClaimFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = useMemo(() => {
    return approvalClaims.filter(c => {
      const matchFilter = claimFilter === 'all' || c.status === claimFilter;
      const matchSearch = c.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.projectRef.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [approvalClaims, claimFilter, searchQuery]);

  // Quick Preset Helper
  const applyQuickPreset = (preset: { category: ClaimCategory; amount: number; desc: string; note: string }) => {
    setClaimCategory(preset.category);
    setClaimAmount(preset.amount);
    setClaimDescription(preset.desc);
    setClaimReceiptNote(preset.note);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimDescription || claimAmount <= 0) return;

    await submitApprovalClaim({
      submittedBy: currentUser?.displayName || 'Site Worker',
      employeeRole: role,
      category: claimCategory,
      amount: claimAmount,
      description: claimDescription,
      projectRef: claimProjectRef,
      receiptNote: claimReceiptNote || undefined
    });

    setIsClaimModalOpen(false);
  };

  const handleLogShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || hoursLogged <= 0) return;

    await addWorkerLog({
      workerName: currentUser?.displayName || 'Tariq Site Specialist',
      siteName,
      taskType,
      hoursLogged,
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      notes: shiftNotes,
      deliveryDocketNo: docketNo || undefined
    });

    setIsShiftModalOpen(false);
    setShiftNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Field Worker Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 border border-orange-800/40 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5 text-orange-400" />
              Site Staff & Driver Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Field Work & Petty Cash Claims
            </h1>
            <p className="text-orange-200/80 text-sm max-w-2xl leading-relaxed">
              Submit on-site expenses (Diesel, Salik toll, emergency hardware, site meals), track reimbursement approvals, and log chemical delivery dockets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Expense Claim
            </button>
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-orange-300" />
              Log Site Shift / Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Approvals</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400">
            {approvalClaims.filter(c => c.status === 'pending').length} Claims
          </p>
          <span className="text-[10px] text-slate-500">In Manager Queue</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Approved & Reimbursed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">
            {formatMoney(approvalClaims.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0))}
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">Auto-posted to ledger</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Site Shifts Logged</span>
            <Truck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-white">{workerLogs.length} Dockets</p>
          <span className="text-[10px] text-indigo-400 font-medium">NEOM, Riyadh & Jeddah</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Hours On Site</span>
            <HardHat className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <p className="text-xl font-black text-orange-400">
            {workerLogs.reduce((sum, l) => sum + l.hoursLogged, 0)} hrs
          </p>
          <span className="text-[10px] text-slate-500">Documented delivery & seal</span>
        </div>
      </div>

      {/* Main Grid: Claims Tracker + Site Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Claims Tracker (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-400" />
              <h2 className="text-base font-bold text-white">Expense & Reimbursement Tracker</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter tabs */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setClaimFilter(tab)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                      claimFilter === tab
                        ? 'bg-orange-500 text-stone-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker, site, or project ref..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* List of Claims */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No expense claims matching the filter.
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{claim.submittedBy}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 font-medium">
                        {claim.category}
                      </span>
                      {claim.status === 'pending' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          Pending Review
                        </span>
                      )}
                      {claim.status === 'approved' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                          <Check className="w-2.5 h-2.5" />
                          Approved
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" />
                          Rejected
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-300">{claim.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {claim.projectRef}
                      </span>
                      <span>•</span>
                      <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>
                      {claim.receiptNote && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 font-mono">Invoice: {claim.receiptNote}</span>
                        </>
                      )}
                    </div>

                    {claim.managerNote && (
                      <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1 mt-1">
                        Manager note: {claim.managerNote}
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-base font-black text-white">{formatMoney(claim.amount)}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {claim.pushedToExpenseLedger ? '✅ In Expense Ledger' : 'Awaiting payout'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Site Delivery & Work Log (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Site Deliveries & Shifts</h3>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                + Log Shift
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Proof of site delivery and waterproofing installation records for DCC TRADING CO clients.
            </p>

            {/* List of Shifts */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {workerLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        {log.siteName}
                      </h4>
                      <p className="text-[11px] text-indigo-300 font-medium">{log.taskType}</p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
                      {log.hoursLogged} hrs
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">{log.notes}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Worker: {log.workerName}</span>
                      <span>•</span>
                      <span>{log.date}</span>
                    </div>

                    {log.deliveryDocketNo && (
                      <button
                        onClick={() => setSelectedDocket(log)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        {log.deliveryDocketNo}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Delivery dockets can be printed or exported as digital proof of delivery for site clients.</span>
          </div>
        </div>
      </div>

      {/* Fast Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-orange-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                Submit Fast Expense Claim
              </h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                1-Tap Quick Presets:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyQuickPreset({
                    category: 'Diesel Fuel & Fleet',
                    amount: 180,
                    desc: 'Diesel refueling for DCC Site Van',
                    note: 'Station Receipt #DCC-PET-401'
                  })}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-orange-500/20 hover:border-orange-500/40 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-orange-400" /> Fuel 180 {currency}
                  </p>
                  <span className="text-[9px] text-slate-400">Delivery Van</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset({
                    category: 'Salik & Toll Charges',
                    amount: 50,
                    desc: 'Salik highway toll gate top-up',
                    note: 'SMS Recharge Ref #SALIK-992'
                  })}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-orange-500/20 hover:border-orange-500/40 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-400" /> Tolls 50 {currency}
                  </p>
                  <span className="text-[9px] text-slate-400">Salik / Gate</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset({
                    category: 'Emergency Hardware & Tools',
                    amount: 95,
                    desc: 'Tape, foam backing rods & masking',
                    note: 'Hardware Cash Memo #8812'
                  })}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-orange-500/20 hover:border-orange-500/40 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-white flex items-center gap-1">
                    <HardHat className="w-3 h-3 text-amber-400" /> Site Tools 95 {currency}
                  </p>
                  <span className="text-[9px] text-slate-400">Emergency hardware</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expense Category</label>
                  <select
                    value={claimCategory}
                    onChange={(e) => setClaimCategory(e.target.value as ClaimCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Diesel Fuel & Fleet">Diesel Fuel & Fleet</option>
                    <option value="Salik & Toll Charges">Salik & Toll Charges</option>
                    <option value="Emergency Hardware & Tools">Emergency Hardware & Tools</option>
                    <option value="Petty Cash & Consumables">Petty Cash & Consumables</option>
                    <option value="Site Worker Meals">Site Worker Meals</option>
                    <option value="Client Hospitality & Gift">Client Hospitality & Gift</option>
                    <option value="Sales Concession / Discount">Sales Concession / Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  placeholder="e.g. 50L Diesel for Riyadh project site trip"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Project Site / Client Reference</label>
                  <input
                    type="text"
                    required
                    value={claimProjectRef}
                    onChange={(e) => setClaimProjectRef(e.target.value)}
                    placeholder="e.g. Riyadh Metro Line 3"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Invoice / Receipt Memo No.</label>
                  <input
                    type="text"
                    value={claimReceiptNote}
                    onChange={(e) => setClaimReceiptNote(e.target.value)}
                    placeholder="e.g. Station Receipt #88219"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold shadow-lg transition-colors cursor-pointer"
                >
                  Send to Manager for Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                Log Site Work or Chemical Delivery
              </h3>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogShift} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Client Construction Site Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Red Sea Global Villa Phase 2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Task Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Delivery & Offloading">Delivery & Offloading</option>
                    <option value="Waterproofing Application">Waterproofing Application</option>
                    <option value="Joint Sealing">Joint Sealing</option>
                    <option value="Warehouse Sorting">Warehouse Sorting</option>
                    <option value="Site Inspection">Site Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hours Logged</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    required
                    value={hoursLogged}
                    onChange={(e) => setHoursLogged(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Docket / Waybill No.</label>
                <input
                  type="text"
                  value={docketNo}
                  onChange={(e) => setDocketNo(e.target.value)}
                  placeholder="e.g. DCK-9021"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Notes / Material Handover</label>
                <textarea
                  rows={3}
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Details of materials handed over, supervisor signature, site conditions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-colors cursor-pointer"
                >
                  Record Shift & Generate Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Delivery Docket Preview Modal */}
      {selectedDocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-stone-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">DCC TRADING CO</h3>
                <p className="text-[11px] text-stone-500 font-medium">Official Chemical Delivery Docket & Handover</p>
              </div>
              <button
                onClick={() => setSelectedDocket(null)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Docket No:</span>
                  <p className="font-mono font-bold text-stone-900">{selectedDocket.deliveryDocketNo}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Date:</span>
                  <p className="font-semibold text-stone-800">{selectedDocket.date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Site Location:</span>
                  <p className="font-semibold text-stone-800">{selectedDocket.siteName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold">Operation:</span>
                  <p className="font-semibold text-stone-800">{selectedDocket.taskType}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">Materials & Notes:</span>
                <p className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-stone-700 leading-relaxed">
                  {selectedDocket.notes}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
                <div className="border border-dashed border-stone-300 rounded-lg p-3 text-center">
                  <span className="text-[10px] text-stone-400">Driver / Technician:</span>
                  <p className="font-bold text-stone-900 mt-1">{selectedDocket.workerName}</p>
                  <div className="mt-4 border-b border-stone-300" />
                  <span className="text-[9px] text-stone-400">Signature</span>
                </div>
                <div className="border border-dashed border-stone-300 rounded-lg p-3 text-center">
                  <span className="text-[10px] text-stone-400">Client Site Receiver:</span>
                  <p className="font-bold text-stone-900 mt-1">Authorized Engineer</p>
                  <div className="mt-4 border-b border-stone-300" />
                  <span className="text-[9px] text-stone-400">Stamp & Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedDocket(null)}
                className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

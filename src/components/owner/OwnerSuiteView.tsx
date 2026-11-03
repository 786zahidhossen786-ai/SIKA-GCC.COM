import React, { useState, useMemo } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/analytics';
import { 
  Crown, 
  TrendingUp, 
  ShieldCheck, 
  HeartHandshake, 
  DollarSign, 
  PieChart, 
  Sliders, 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle,
  Building,
  Users,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';
import { SadaqahRecord } from '../../types';

export const OwnerSuiteView: React.FC = () => {
  const { 
    currency, 
    summary, 
    sadaqahRecords, 
    recordSadaqah, 
    auditLogs,
    saudiEmployees,
    salesContracts,
    approvalClaims,
    syncToCloudDatabase,
    resetToDemoData
  } = useFinancialData();

  const formatMoney = (v: number) => formatCurrency(v, false, currency);
  const { currentUser, role } = useAuth();

  // Profit Distribution State
  const [retainedPct, setRetainedPct] = useState<number>(40);
  const [zakatPct, setZakatPct] = useState<number>(5);
  const dividendPct = Math.max(0, 100 - retainedPct - zakatPct);

  // Partner split of the dividend pool
  const partner1Share = 70; // Managing Founder (Zahid Hossen)
  const partner2Share = 30; // Capital & Commercial Partner

  const netProfit = Math.max(0, summary.netProfit);
  const retainedAmount = (netProfit * retainedPct) / 100;
  const zakatAmount = (netProfit * zakatPct) / 100;
  const dividendPoolAmount = (netProfit * dividendPct) / 100;

  const partner1Payout = (dividendPoolAmount * partner1Share) / 100;
  const partner2Payout = (dividendPoolAmount * partner2Share) / 100;

  // Sadaqah Form State
  const [isSadaqahModalOpen, setIsSadaqahModalOpen] = useState(false);
  const [sadaqahBeneficiary, setSadaqahBeneficiary] = useState('');
  const [sadaqahCategory, setSadaqahCategory] = useState<SadaqahRecord['category']>('Site Workers Welfare');
  const [sadaqahAmount, setSadaqahAmount] = useState<number>(5000);
  const [sadaqahDescription, setSadaqahDescription] = useState('');
  const [sadaqahReceiptNote, setSadaqahReceiptNote] = useState('');

  // Scenario Simulator State
  const [revGrowthPct, setRevGrowthPct] = useState<number>(15);
  const [costInflationPct, setCostInflationPct] = useState<number>(5);

  const simulatedRevenue = summary.totalRevenue * (1 + revGrowthPct / 100);
  const simulatedExpense = summary.totalExpenses * (1 + costInflationPct / 100);
  const simulatedNetProfit = simulatedRevenue - simulatedExpense;
  const simulatedMargin = simulatedRevenue > 0 ? (simulatedNetProfit / simulatedRevenue) * 100 : 0;

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterType, setAuditFilterType] = useState<string>('all');

  // Cloud sync feedback
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase());
      const matchType = auditFilterType === 'all' || log.entityType === auditFilterType;
      return matchSearch && matchType;
    });
  }, [auditLogs, auditSearch, auditFilterType]);

  const totalSadaqahDistributed = useMemo(() => {
    return sadaqahRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [sadaqahRecords]);

  const handleCreateSadaqah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sadaqahBeneficiary || sadaqahAmount <= 0) return;

    await recordSadaqah({
      beneficiary: sadaqahBeneficiary,
      category: sadaqahCategory,
      amount: sadaqahAmount,
      approvedBy: currentUser?.displayName || 'Managing Founder',
      date: new Date().toISOString().split('T')[0],
      description: sadaqahDescription || `${sadaqahCategory} grant for DCC TRADING CO community welfare`,
      receiptNote: sadaqahReceiptNote || undefined
    });

    setIsSadaqahModalOpen(false);
    setSadaqahBeneficiary('');
    setSadaqahAmount(5000);
    setSadaqahDescription('');
    setSadaqahReceiptNote('');
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncToCloudDatabase();
      setSyncMessage(res.message);
      setTimeout(() => setSyncMessage(null), 5000);
    } catch {
      setSyncMessage('Failed to trigger database sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      company: 'DCC TRADING CO',
      exportedAt: new Date().toISOString(),
      summary,
      sadaqahRecords,
      auditLogs,
      salesContracts,
      approvalClaims,
      saudiEmployeesCount: saudiEmployees.length
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCC_TRADING_CO_Executive_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 border border-amber-800/40 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Executive Founder & Partner Command
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              DCC TRADING CO — Owner&apos;s Suite
            </h1>
            <p className="text-amber-200/80 text-sm max-w-2xl leading-relaxed">
              Capital governance, dividend distribution, corporate Sadaqah allocation, real-time stress test scenarios, and immutable audit trails for leadership.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync to Cloud Firestore'}
            </button>
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all"
            >
              <Download className="w-4 h-4 text-amber-300" />
              Export Backup
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            {syncMessage}
          </div>
        )}
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Gross Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-white">{formatMoney(summary.totalRevenue)}</p>
          <span className="text-[10px] text-emerald-400 font-medium">YTD Actuals</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Operating Costs</span>
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-lg font-black text-white">{formatMoney(summary.totalExpenses)}</p>
          <span className="text-[10px] text-slate-400 font-medium">Claims + Imports</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net Operating Profit</span>
            <PieChart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-black text-amber-300">{formatMoney(summary.netProfit)}</p>
          <span className="text-[10px] text-amber-400 font-medium">
            Margin {summary.profitMargin.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Staff</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-lg font-black text-white">{saudiEmployees.length} Members</p>
          <span className="text-[10px] text-indigo-300 font-medium">KSA & UAE Field Staff</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sadaqah Fund</span>
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <p className="text-lg font-black text-teal-300">{formatMoney(totalSadaqahDistributed)}</p>
          <span className="text-[10px] text-teal-400 font-medium">{sadaqahRecords.length} Grants Disbursed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Security Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-lg font-black text-emerald-400">Audited</p>
          <span className="text-[10px] text-slate-400 font-medium">{auditLogs.length} Events Logged</span>
        </div>
      </div>

      {/* Main Grid: Profit Allocation Engine & Corporate Sadaqah */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profit Distribution Engine (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                Capital Governance
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                Net Profit & Dividend Allocation Engine
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Active Net: {formatMoney(netProfit)}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Dynamically partition current net profit between working capital reinvestment, corporate Zakat & Sadaqah obligations, and founding partner dividend payouts.
          </p>

          {/* Allocation Sliders */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">1. Retained Earnings (Company Reserves & Inventory)</span>
                <span className="text-amber-400 font-bold">{retainedPct}% ({formatMoney(retainedAmount)})</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={retainedPct}
                onChange={(e) => setRetainedPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">2. Corporate Zakat & Sadaqah Fund</span>
                <span className="text-teal-400 font-bold">{zakatPct}% ({formatMoney(zakatAmount)})</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="15"
                step="0.5"
                value={zakatPct}
                onChange={(e) => setZakatPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">3. Resulting Partner Dividend Share Pool</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                {dividendPct.toFixed(1)}% ({formatMoney(dividendPoolAmount)})
              </span>
            </div>
          </div>

          {/* Partner Share Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Partner Dividend Distribution Shares
            </h3>
            
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ZH
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Zahid Hossen</h4>
                    <p className="text-[11px] text-slate-400">Managing Founder & Majority Partner (70%)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">{formatMoney(partner1Payout)}</span>
                  <p className="text-[10px] text-slate-400">Direct Wire to WPS / IBAN</p>
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    CP
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Commercial Partner Holding</h4>
                    <p className="text-[11px] text-slate-400">Equity & Trade Finance Partner (30%)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">{formatMoney(partner2Payout)}</span>
                  <p className="text-[10px] text-slate-400">Corporate Account Transfer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Calculations are computed strictly from real ledger balances in {currency}.
            </span>
            <button
              onClick={() => {
                alert(`Dividend allocation sheet approved! Reserved: ${formatMoney(retainedAmount)}, Sadaqah: ${formatMoney(zakatAmount)}, Partners: ${formatMoney(dividendPoolAmount)}`);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-colors"
            >
              Confirm Period Distribution Plan
            </button>
          </div>
        </div>

        {/* Corporate Sadaqah & Community Welfare (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Corporate Sadaqah & Welfare</h3>
                  <p className="text-[11px] text-teal-400 font-medium">Worker relief & community grants</p>
                </div>
              </div>
              <button
                onClick={() => setIsSadaqahModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                + New Grant
              </button>
            </div>

            <div className="bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-teal-300 uppercase tracking-wider font-semibold">
                    Cumulative Sadaqah
                  </span>
                  <h4 className="text-2xl font-black text-white mt-0.5">
                    {formatMoney(totalSadaqahDistributed)}
                  </h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {sadaqahRecords.length} Grants
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Disbursed under DCC TRADING CO Islamic ethics policy for labor assistance, emergency medical support, and local charities.
              </p>
            </div>

            {/* List of Grants */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {sadaqahRecords.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No Sadaqah grants scheduled yet.
                </div>
              ) : (
                sadaqahRecords.map((grant) => (
                  <div
                    key={grant.id}
                    className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 hover:border-teal-500/30 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{grant.beneficiary}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                          {grant.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{grant.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{grant.date}</span>
                        <span>•</span>
                        <span>Approved by: {grant.approvedBy}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-teal-400">{formatMoney(grant.amount)}</span>
                      {grant.receiptNote && (
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">{grant.receiptNote}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Sadaqah grants do not deduct from operational project budgets; they are funded from executive dividends.</span>
          </div>
        </div>
      </div>

      {/* Scenario Growth & Stress Test Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              Strategic Planning
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Quarterly Growth & Stress Testing Simulator
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            What-if modeling for DCC TRADING CO commercial operations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Sales Pipeline Expansion Rate</span>
                <span className={`font-bold ${revGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {revGrowthPct > 0 ? `+${revGrowthPct}%` : `${revGrowthPct}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="60"
                step="5"
                value={revGrowthPct}
                onChange={(e) => setRevGrowthPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Contract Slump (-30%)</span>
                <span>Baseline (0%)</span>
                <span>Hypergrowth (+60%)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Chemical Material & Logistics Inflation Stress</span>
                <span className="font-bold text-amber-400">+{costInflationPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="2.5"
                value={costInflationPct}
                onChange={(e) => setCostInflationPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Stable (0%)</span>
                <span>Moderate (+15%)</span>
                <span>Severe Stress (+35%)</span>
              </div>
            </div>
          </div>

          {/* Simulation Output Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Projected Gross Revenue</span>
              <p className="text-base font-black text-white mt-1">{formatMoney(simulatedRevenue)}</p>
              <span className="text-[10px] text-indigo-400 font-medium">
                {revGrowthPct >= 0 ? `+${formatMoney(simulatedRevenue - summary.totalRevenue)}` : `-${formatMoney(summary.totalRevenue - simulatedRevenue)}`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Projected Operating Costs</span>
              <p className="text-base font-black text-white mt-1">{formatMoney(simulatedExpense)}</p>
              <span className="text-[10px] text-rose-400 font-medium">
                +{formatMoney(simulatedExpense - summary.totalExpenses)} inflation
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Projected Net Profit</span>
              <p className={`text-base font-black mt-1 ${simulatedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatMoney(simulatedNetProfit)}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">
                Projected Margin: {simulatedMargin.toFixed(1)}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Hiring & Expansion Capacity</span>
                <p className="text-sm font-bold text-amber-300 mt-1">
                  {simulatedNetProfit > 100000 ? '✅ 4 New Site Technicians' : simulatedNetProfit > 40000 ? '⚠️ 1 Specialist Rep' : '🛑 Freeze Hiring'}
                </p>
              </div>
              <span className="text-[10px] text-slate-500">Based on SAR 8k/mo fully loaded cost</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Audit Trail & Activity Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Governance & Compliance
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Master Chronological Audit Log
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={auditFilterType}
                onChange={(e) => setAuditFilterType(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="transaction">Transactions</option>
                <option value="contract">Contracts</option>
                <option value="claim">Claims</option>
                <option value="budget">Budgets</option>
                <option value="disbursement">Disbursements</option>
                <option value="distribution">Distributions</option>
                <option value="auth">Auth & Roles</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Entity Type</th>
                <th className="py-2.5 px-3 font-semibold">Performed By</th>
                <th className="py-2.5 px-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{log.performedBy}</span>
                        <span className="text-[10px] text-slate-500">({log.userRole})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Governance & Demo Reset */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Executive Data Hygiene & Factory Reset
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset demo data back to clean SIKA DCC TRADING CO seed states if testing workflows.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all transaction, contract, claim, and employee data to DCC TRADING CO factory defaults?')) {
              resetToDemoData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors shrink-0"
        >
          Reset to Factory Demo Data
        </button>
      </div>

      {/* Sadaqah Modal */}
      {isSadaqahModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                Schedule Corporate Sadaqah Grant
              </h3>
              <button
                onClick={() => setIsSadaqahModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSadaqah} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Beneficiary / Recipient Organization</label>
                <input
                  type="text"
                  required
                  value={sadaqahBeneficiary}
                  onChange={(e) => setSadaqahBeneficiary(e.target.value)}
                  placeholder="e.g. Site Staff Medical Emergency Fund or Local Relief"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={sadaqahCategory}
                    onChange={(e) => setSadaqahCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Site Workers Welfare">Site Workers Welfare</option>
                    <option value="Medical Support">Medical Support</option>
                    <option value="Community Relief">Community Relief</option>
                    <option value="Orphan Education">Orphan Education</option>
                    <option value="Mosque Contribution">Mosque Contribution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sadaqahAmount}
                    onChange={(e) => setSadaqahAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grant Purpose / Description</label>
                <textarea
                  rows={2}
                  value={sadaqahDescription}
                  onChange={(e) => setSadaqahDescription(e.target.value)}
                  placeholder="Details of the assistance or charitable cause..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Reference / Cheque No. (Optional)</label>
                <input
                  type="text"
                  value={sadaqahReceiptNote}
                  onChange={(e) => setSadaqahReceiptNote(e.target.value)}
                  placeholder="e.g. Wire Ref #CHQ-99120"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSadaqahModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg transition-colors"
                >
                  Confirm & Disburse Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

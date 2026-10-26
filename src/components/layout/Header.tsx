import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinancialData } from '../../context/FinancialDataContext';
import { UserRole } from '../../types';
import { SupportedCurrency } from '../../utils/analytics';
import { ShieldCheck, LogIn, LogOut, ChevronDown, Plus, Download, UploadCloud, Cloud } from 'lucide-react';
import { generateTransactionsCsv, downloadCsvFile } from '../../utils/csv';
import { ImportModal } from '../transactions/ImportModal';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenMobileMenu }) => {
  const { profile, role, currentUser, isDemoMode, signInWithGoogle, signOut, switchDemoRole, canAddTransaction } = useAuth();
  const { filteredTransactions, selectedPeriod, currency, setCurrency, ledgerMode, syncToCloudDatabase } = useFinancialData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleExportCsv = () => {
    const csv = generateTransactionsCsv(filteredTransactions);
    downloadCsvFile(csv, `sika-gcc-${selectedPeriod}-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleCloudSync = async () => {
    setSyncStatus('Syncing...');
    const res = await syncToCloudDatabase();
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    founder: { title: 'Founder', color: 'text-amber-400 bg-amber-950/40 border-amber-800/60', desc: 'Root authority: all financial flows & admin' },
    'co-founder': { title: 'Co-Founder', color: 'text-orange-400 bg-orange-950/40 border-orange-800/60', desc: 'Executive partner: full analytics & goals' },
    ceo: { title: 'CEO', color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60', desc: 'Chief Executive: full governance & P&L' },
    director: { title: 'Director', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60', desc: 'Leadership & operational oversight' },
    manager: { title: 'Manager', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60', desc: 'Create & edit data, export reports' },
    salesman: { title: 'Salesman', color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60', desc: 'Sales, client gifts & discounts' },
    worker: { title: 'Worker', color: 'text-slate-300 bg-slate-800/80 border-slate-700', desc: 'Daily operational expenses & petty cash' },
    owner: { title: 'Owner', color: 'text-amber-400 bg-amber-950/40 border-amber-800/60', desc: 'Full administration & delete access' },
    analyst: { title: 'Analyst', color: 'text-sky-400 bg-sky-950/40 border-sky-800/60', desc: 'Read-only analytics & reports' },
  };

  const currencies: { code: SupportedCurrency; label: string }[] = [
    { code: 'AED', label: 'AED (UAE Dirham)' },
    { code: 'SAR', label: 'SAR (Saudi Riyal)' },
    { code: 'USD', label: 'USD ($)' },
    { code: 'QAR', label: 'QAR (Qatari Riyal)' },
    { code: 'KWD', label: 'KWD (Kuwaiti Dinar)' },
    { code: 'EUR', label: 'EUR (€)' },
    { code: 'BDT', label: 'BDT (৳)' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-[#0D131F]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Mobile Hamburger + Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
              SIKA GCC Financial
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              {ledgerMode === 'real' ? 'Real SIKA GCC Ledger' : 'Clean Slate Ledger'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Status (Desktop) */}
        <nav className="hidden xl:flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="text-slate-300">
            Account: <strong className="text-white capitalize font-semibold">{role}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">
            Period: <strong className="text-slate-200 capitalize">{selectedPeriod}</strong>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400 font-mono-numbers">
            {filteredTransactions.length} records
          </span>
        </nav>

        {/* Zone 3: Currency + Actions + RBAC Switcher + Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              title="Select reporting currency"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-750 hover:border-slate-600 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                  {c.code}
                </option>
              ))}
            </select>
          </div>

          {/* Import Real Data Button */}
          <button
            onClick={() => setShowImportModal(true)}
            title="Import real CSV transactions or toggle clean slate"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Real Data / Import</span>
          </button>

          {/* Quick CSV Export */}
          <button
            onClick={handleExportCsv}
            title="Export active view as CSV"
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Sync to Cloud Firestore */}
          {currentUser && (
            <button
              onClick={handleCloudSync}
              title="Sync current records to Cloud Firestore database"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/40 hover:bg-sky-900/60 border border-sky-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Sync Cloud</span>
            </button>
          )}

          {/* Record Transaction Button (only if permitted) */}
          {canAddTransaction ? (
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm hover:shadow-emerald-500/20 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">New Entry</span>
            </button>
          ) : (
            <span
              title="Analyst role has read-only access"
              className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg select-none"
            >
              Read Only
            </span>
          )}

          {/* Role Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors text-xs"
              aria-expanded={showRoleMenu}
              aria-haspopup="true"
            >
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {profile.displayName.slice(0, 1)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-slate-200 truncate max-w-[110px] leading-tight">
                  {profile.displayName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 text-xs">
                <div className="p-2 border-b border-slate-800 mb-2">
                  <p className="font-semibold text-white truncate">{profile.displayName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{profile.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${roleLabels[role]?.color || ''}`}>
                      {roleLabels[role]?.title || role}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {isDemoMode ? 'Persona Switcher' : 'Cloud Connected'}
                    </span>
                  </div>
                </div>

                {/* RBAC Role Switcher */}
                <div className="mb-2 max-h-60 overflow-y-auto">
                  <p className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Switch Account Role:
                  </p>
                  {(['founder', 'co-founder', 'ceo', 'director', 'manager', 'salesman', 'worker'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchDemoRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        role === r ? 'bg-slate-800 text-white font-medium' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="capitalize font-semibold text-slate-200">{roleLabels[r]?.title || r}</div>
                        <div className="text-[10px] text-slate-400">{roleLabels[r]?.desc}</div>
                      </div>
                      {role === r && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>

                {/* Sign In / Out */}
                <div className="pt-2 border-t border-slate-800">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        signOut();
                        setShowRoleMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Google</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signInWithGoogle();
                        setShowRoleMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-emerald-400 hover:bg-emerald-950/30 rounded-lg transition-colors font-medium"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sync toast notification */}
      {syncStatus && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-slate-900 border border-slate-700 text-emerald-300 text-xs rounded-xl shadow-xl flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </>
  );
};

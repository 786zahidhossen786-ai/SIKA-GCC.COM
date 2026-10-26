import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinancialData } from '../../context/FinancialDataContext';
import { UserRole } from '../../types';
import { ShieldCheck, LogIn, LogOut, ChevronDown, Plus, Download } from 'lucide-react';
import { generateTransactionsCsv, downloadCsvFile } from '../../utils/csv';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenMobileMenu }) => {
  const { profile, role, currentUser, isDemoMode, signInWithGoogle, signOut, switchDemoRole, canAddTransaction } = useAuth();
  const { filteredTransactions, selectedPeriod } = useFinancialData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleExportCsv = () => {
    const csv = generateTransactionsCsv(filteredTransactions);
    downloadCsvFile(csv, `vantage-${selectedPeriod}-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-[#0D131F]/90 backdrop-blur-md border-b border-slate-800/80">
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
        <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          Vantage Financial
        </span>
        <span className="hidden sm:inline-block text-xs text-slate-500 font-medium whitespace-nowrap">
          {profile.businessName}
        </span>
      </div>

      {/* Zone 2: Navigation Links (Desktop) */}
      <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
        <span className="text-slate-300">
          Role: <strong className="text-white capitalize font-semibold">{role}</strong>
        </span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span className="text-slate-400">
          Active: <strong className="text-slate-200 capitalize">{selectedPeriod}</strong>
        </span>
        <span aria-hidden="true" className="text-slate-700">·</span>
        <span className="text-slate-400 font-mono-numbers">
          {filteredTransactions.length} records
        </span>
      </nav>

      {/* Zone 3: Actions + RBAC Switcher + Auth */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick CSV Export */}
        <button
          onClick={handleExportCsv}
          title="Export active view as CSV"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Record Transaction Button (only if permitted) */}
        {canAddTransaction ? (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm hover:shadow-emerald-500/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Entry</span>
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
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-850 rounded-lg transition-colors text-xs"
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${roleLabels[role].color}`}>
                    {roleLabels[role].title}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isDemoMode ? 'Demo Persona' : 'Authenticated'}
                  </span>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="mb-2 max-h-60 overflow-y-auto">
                <p className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Test Role-Based Access:
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
  );
};

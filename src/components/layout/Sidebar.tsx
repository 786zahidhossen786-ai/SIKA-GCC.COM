import React from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { ViewTab } from '../../types';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users,
  RotateCcw,
  Sparkles,
  X,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, resetToDemoData } = useFinancialData();
  const { role, profile } = useAuth();

  const navItems: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Growth Overview', icon: LayoutDashboard },
    { id: 'reports', label: 'Periodic Reports', icon: FileSpreadsheet },
    { id: 'transactions', label: 'Transaction Ledger', icon: Receipt },
    { id: 'team', label: 'Team & RBAC', icon: Users },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#090D15] border-r border-slate-800/80 p-4 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              SIKA GCC Analytics
            </h1>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Commercial Growth & P&L</p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="my-5 flex-1 space-y-1">
        <p className="px-3 pb-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
          Intelligence Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Summary Banner */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Active Role</span>
          <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
            {role}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium truncate">{profile.displayName}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {(role === 'founder' || role === 'co-founder' || role === 'owner') && 'Full root administrative & deletion capabilities'}
          {role === 'ceo' && 'Executive governance & full P&L oversight'}
          {role === 'director' && 'Leadership oversight & operational control'}
          {role === 'manager' && 'Add/edit transactions and export CSVs'}
          {role === 'salesman' && 'Sales orders, customer discounts & client gifts'}
          {role === 'worker' && 'Daily operational expenses & petty cash logs'}
          {role === 'analyst' && 'Analytical view and report export access'}
        </p>
      </div>

      {/* Reset Seed Demo Data */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          onClick={() => {
            if (confirm('Reset transactions, goals, and team back to default demonstration records?')) {
              resetToDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800/80"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restore Demo Data</span>
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-600">
          SIKA GCC Commercial v2026.1
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

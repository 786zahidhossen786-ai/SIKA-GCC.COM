import React, { useMemo } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { ViewTab } from '../../types';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users,
  RotateCcw,
  X,
  TrendingUp,
  LogIn,
  Lock,
  Bot,
  Briefcase,
  ClipboardCheck,
  Crown,
  HardHat,
  ShieldAlert,
  Building2,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, resetToDemoData, saudiEmployees } = useFinancialData();
  const { role, profile, openLoginModal, lockSession, isAuthenticated } = useAuth();

  // Calculate urgent document expiries for Saudi/GCC workforce
  const urgentDocAlertsCount = useMemo(() => {
    const now = new Date();
    let count = 0;
    saudiEmployees.forEach(emp => {
      const dates = [
        emp.iqamaExpiryGregorian,
        emp.passportExpiryDate,
        emp.qiwaContractEndDate,
        emp.insuranceExpiryDate,
        emp.drivingLicenseExpiry,
        emp.healthCertExpiry
      ].filter(Boolean) as string[];

      const hasUrgent = dates.some(d => {
        const exp = new Date(d);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      });
      if (hasUrgent) count++;
    });
    return count;
  }, [saudiEmployees]);

  const navSections: {
    title: string;
    items: {
      id: ViewTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
      roleTag?: string;
    }[];
  }[] = [
    {
      title: 'Financial Core',
      items: [
        { id: 'overview', label: 'Growth Overview', icon: LayoutDashboard },
        { id: 'reports', label: 'Periodic Reports', icon: FileSpreadsheet },
        { id: 'transactions', label: 'Transaction Ledger', icon: Receipt },
      ]
    },
    {
      title: 'Role Workspaces',
      items: [
        { id: 'sales-hub', label: 'Sales & Commercial Contracts', icon: Briefcase, roleTag: 'Sales' },
        { id: 'manager-ops', label: 'Manager Approvals & Budgets', icon: ClipboardCheck, roleTag: 'Manager' },
        { id: 'owner-suite', label: 'Owner Executive Suite', icon: Crown, roleTag: 'Owner' },
        { id: 'field-claims', label: 'Site Claims & Field Work', icon: HardHat, roleTag: 'Worker' },
      ]
    },
    {
      title: 'Workforce & Compliance',
      items: [
        { 
          id: 'employee-docs', 
          label: 'Iqama & Passport Dossiers', 
          icon: ShieldAlert,
          badge: urgentDocAlertsCount > 0 ? `${urgentDocAlertsCount} Due` : undefined,
          badgeColor: urgentDocAlertsCount > 0 ? 'bg-rose-500 text-white' : undefined
        },
        { id: 'team', label: 'Team & RBAC Privileges', icon: Users },
        { id: 'ai-advisor', label: 'Account AI Advisor', icon: Bot },
      ]
    }
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#090D15] border-r border-slate-800/80 p-4 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-black shadow-lg shadow-amber-950/40">
            <Building2 className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
              DCC TRADING CO
            </h1>
            <p className="text-[10px] text-amber-400/90 mt-1 font-semibold uppercase tracking-wider">
              Saudi Arabia & GCC
            </p>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="my-4 flex-1 space-y-5 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 pb-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-bold shadow-sm border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.roleTag && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/80">
                        {item.roleTag}
                      </span>
                    )}
                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-1 ${item.badgeColor || 'bg-amber-500 text-stone-950'}`}>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role Summary Banner */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Active Role</span>
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {role}
          </span>
        </div>
        <p className="text-[11px] text-white font-medium truncate">{profile.displayName}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
          {role === 'owner' && 'Full executive, capital & audit governance'}
          {role === 'manager' && 'Budget oversight & claim approval authority'}
          {role === 'salesman' && 'Client contracts & quotation management'}
          {role === 'worker' && 'Field claims & chemical delivery logging'}
          {role === 'analyst' && 'Analytical intelligence & P&L view'}
        </p>

        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={openLoginModal}
            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Switch Account' : 'Sign In Portal'}</span>
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={lockSession}
              className="text-slate-500 hover:text-amber-400 transition-colors p-1 rounded cursor-pointer"
              title="Lock Screen"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Reset to Clean Zero State & Company Wordmark */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => {
            if (confirm('Reset all transactions, contracts, claims, and financial figures to clean zero state?')) {
              resetToDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800/80 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset to Zero State (Clean)</span>
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-600 font-medium">
          DCC TRADING CO • Enterprise Suite
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

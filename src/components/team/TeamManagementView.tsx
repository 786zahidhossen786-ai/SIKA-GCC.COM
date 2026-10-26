import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, TeamMember } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Check,
  X,
  Lock,
  Trash2,
  KeyRound,
  Briefcase,
  Crown,
  Building,
} from 'lucide-react';

export const TeamManagementView: React.FC = () => {
  const { teamMembers, addTeamMember, updateTeamMemberRole, removeTeamMember } = useFinancialData();
  const { role: currentRole, canManageTeam, switchDemoRole } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('salesman');

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    await addTeamMember({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'active',
    });

    setInviteName('');
    setInviteEmail('');
    setInviteRole('salesman');
    setIsInviteOpen(false);
  };

  const roleMeta: Record<UserRole, { label: string; style: string; tier: string }> = {
    founder: { label: 'Founder', style: 'text-amber-400 bg-amber-950/40 border-amber-800/60', tier: 'Executive' },
    'co-founder': { label: 'Co-Founder', style: 'text-orange-400 bg-orange-950/40 border-orange-800/60', tier: 'Executive' },
    ceo: { label: 'CEO', style: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60', tier: 'Executive' },
    director: { label: 'Director', style: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60', tier: 'Leadership' },
    manager: { label: 'Manager', style: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60', tier: 'Management' },
    salesman: { label: 'Salesman', style: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60', tier: 'Commercial' },
    worker: { label: 'Worker', style: 'text-slate-300 bg-slate-800/80 border-slate-700', tier: 'Operations' },
    owner: { label: 'Owner', style: 'text-amber-400 bg-amber-950/40 border-amber-800/60', tier: 'Executive' },
    analyst: { label: 'Analyst', style: 'text-sky-400 bg-sky-950/40 border-sky-800/60', tier: 'Analytics' },
  };

  const personaOptions: { role: UserRole; name: string; title: string; desc: string }[] = [
    { role: 'founder', name: 'Zahid Hossen', title: 'Founder', desc: 'Root authority: all financial flows, Sadaqah, deletions, team control.' },
    { role: 'co-founder', name: 'Tariq Rahman', title: 'Co-Founder', desc: 'Executive partner: full financial analytics, team & goal privileges.' },
    { role: 'ceo', name: 'Elena Rostova', title: 'CEO', desc: 'Chief Executive: full company P&L visibility & executive governance.' },
    { role: 'director', name: 'Robert Hayes', title: 'Director', desc: 'Leadership: approve operations, edit ledger entries, review team.' },
    { role: 'manager', name: 'Alex Vance', title: 'Manager', desc: 'Operational: record/edit revenue & expenses, export full reports.' },
    { role: 'salesman', name: 'Bilal Karim', title: 'Salesman', desc: 'Commercial: record sales, log client gifts & negotiated discounts.' },
    { role: 'worker', name: 'David Miller', title: 'Worker', desc: 'Frontline: record daily expenses & petty cash. Deletion/team locked.' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Organizational Hierarchy & Access Control (RBAC)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separation of duties between Founders, Executives, Management, Salesmen, and Workers.
          </p>
        </div>

        {canManageTeam ? (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Provision Account</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Only Founders/Executives Can Manage Team</span>
          </span>
        )}
      </div>

      {/* Interactive Persona Switcher for Evaluation */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Test Live Role Enforcement (Click Persona to Switch View):
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Active: <strong className="text-emerald-400 capitalize">{currentRole}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {personaOptions.map((p) => {
            const isActive = currentRole === p.role;
            return (
              <button
                key={p.role}
                onClick={() => switchDemoRole(p.role)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-slate-800 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-xs ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {p.title}
                  </span>
                  {isActive ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 capitalize">{p.name.split(' ')[0]}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Permission Matrix Table */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
          Permission Governance Matrix by Role Tier
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Hierarchical security boundaries enforced across client actions and backend Firestore rules.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-2.5 px-3">System Permission</th>
                <th className="py-2.5 px-3 text-center text-amber-400">Founder / Co-Founder / CEO</th>
                <th className="py-2.5 px-3 text-center text-indigo-400">Director / Manager</th>
                <th className="py-2.5 px-3 text-center text-cyan-400">Salesman</th>
                <th className="py-2.5 px-3 text-center text-slate-300">Worker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">View Financial Dashboards & Reports</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Record Sales, Invoices & Revenues</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Log Customer Discounts & Client Gifts</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Record Daily Expenses & Petty Cash</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Disburse & Track Sadaqah (Charity)</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Modify Existing Historical Records</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Permanently Delete Audit Ledger Entries</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Manage Team Accounts & Role Privileges</td>
                <td className="py-2.5 px-3 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
                <td className="py-2.5 px-3 text-center"><X className="w-4 h-4 text-slate-600 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Member List */}
      <div className="bg-[#111726] border border-slate-850 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Authorized Organization Members ({teamMembers.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Current Persona: <strong className="text-white capitalize">{currentRole}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Access Tier</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold">Added On</th>
                <th className="py-3 px-4 text-right font-semibold">Role Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {teamMembers.map((m) => {
                const meta = roleMeta[m.role] || roleMeta.salesman;
                const isExecutive = m.role === 'founder' || m.role === 'co-founder' || m.role === 'owner';

                return (
                  <tr key={m.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {m.email}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {meta.tier}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${meta.style}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded capitalize">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-numbers text-slate-400 whitespace-nowrap">
                      {m.createdAt.slice(0, 10)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {canManageTeam && !isExecutive ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={m.role}
                            onChange={(e) => updateTeamMemberRole(m.id, e.target.value as UserRole)}
                            className="bg-slate-900 border border-slate-750 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-400"
                          >
                            <option value="co-founder">Co-Founder</option>
                            <option value="ceo">CEO</option>
                            <option value="director">Director</option>
                            <option value="manager">Manager</option>
                            <option value="salesman">Salesman</option>
                            <option value="worker">Worker</option>
                          </select>
                          <button
                            onClick={() => removeTeamMember(m.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {isExecutive ? 'Executive' : 'Locked'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite / Provision Account Dialog */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F1624] border border-slate-750 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Provision Organization Account
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add a Founder, Co-Founder, CEO, Director, Manager, Salesman, or Worker account.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Tariq Rahman"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@vantagecorp.io"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Assigned Account Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="co-founder">Co-Founder (Executive Partner)</option>
                  <option value="ceo">CEO (Chief Executive Officer)</option>
                  <option value="director">Director (Leadership & Oversight)</option>
                  <option value="manager">Manager (Operations & Ledger)</option>
                  <option value="salesman">Salesman (Sales, Invoicing, Discounts & Gifts)</option>
                  <option value="worker">Worker (Daily Expenses & Petty Cash)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                >
                  Grant Account Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

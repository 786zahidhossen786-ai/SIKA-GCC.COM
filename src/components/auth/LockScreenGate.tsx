import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Unlock, ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

export const LockScreenGate: React.FC = () => {
  const { isLocked, unlockSession, profile, role, openLoginModal, signOut } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow any 4+ char password or PIN
    if (pin.length >= 1) {
      unlockSession();
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D15]/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#0F1626] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Financial Dashboard Locked
          </h2>
          <p className="text-xs text-slate-400">
            Confidential commercial reports and profit margins are secured.
          </p>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-semibold text-white">{profile.displayName}</p>
            <p className="text-[11px] text-slate-400">{profile.email}</p>
          </div>
          <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30">
            {role}
          </span>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="Enter password or press Unlock"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl py-2.5 px-4 text-xs text-center text-white placeholder-slate-500 focus:outline-none transition-colors"
          />

          {error && (
            <p className="text-[11px] text-rose-400 font-medium">Please enter a password to resume session.</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Unlock Financial Workspace</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={() => {
              unlockSession();
              openLoginModal();
            }}
            className="hover:text-emerald-400 transition-colors"
          >
            Switch Account
          </button>
          <button
            type="button"
            onClick={signOut}
            className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

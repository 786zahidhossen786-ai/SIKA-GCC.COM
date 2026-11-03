import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  X,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    signInWithGoogle,
    loginWithEmail,
    loginWithRole,
    role: currentRole,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'email' | 'roles'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isLoginModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const res = await signInWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Successfully authenticated with Google!');
      setTimeout(() => {
        closeLoginModal();
        setSuccessMsg('');
      }, 1200);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to authenticate.');
    } else {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        closeLoginModal();
        setSuccessMsg('');
      }, 1000);
    }
  };

  const handleQuickRole = (role: UserRole) => {
    loginWithRole(role);
    setSuccessMsg(`Logged in as ${DEMO_PROFILES[role].displayName}`);
    setTimeout(() => {
      closeLoginModal();
      setSuccessMsg('');
    }, 800);
  };

  const roleList: { role: UserRole; title: string; badge: string; desc: string; email: string }[] = [
    {
      role: 'founder',
      title: 'Zahid Hossen',
      badge: 'Founder & Owner',
      desc: 'Root administrative rights, delete transactions, full financial analytics',
      email: '786zahidhossen786@gmail.com',
    },
    {
      role: 'co-founder',
      title: 'Tariq Rahman',
      badge: 'Co-Founder',
      desc: 'Executive partner, full P&L oversight, goal settings & approvals',
      email: 'tariq.cofounder@sika-gcc.com',
    },
    {
      role: 'ceo',
      title: 'Amina Al-Mansoor',
      badge: 'Chief Executive Officer',
      desc: 'Company governance, high-level reporting, P&L audit controls',
      email: 'amina.ceo@sika-gcc.com',
    },
    {
      role: 'director',
      title: 'Eng. Khalid Al-Sayed',
      badge: 'Technical Director',
      desc: 'Operational management, chemical project oversight & logging',
      email: 'khalid.director@sika-gcc.com',
    },
    {
      role: 'manager',
      title: 'Hassan Reza',
      badge: 'Finance & Ops Manager',
      desc: 'Record & edit transactions, monthly reports & CSV exports',
      email: 'hassan.finance@sika-gcc.com',
    },
    {
      role: 'salesman',
      title: 'Bilal Karim',
      badge: 'Senior Sales Executive',
      desc: 'Log contract sales, client discounts (rebates) & corporate gifts',
      email: 'bilal.sales@sika-gcc.com',
    },
    {
      role: 'worker',
      title: 'Faisal Ahmed',
      badge: 'Site Operations Worker',
      desc: 'Log daily petty cash, fuel, truck toll & warehouse expenses',
      email: 'faisal.worker@sika-gcc.com',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-xl bg-[#0F1626] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131B2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="login-title" className="text-base font-bold text-white tracking-tight">
                SIKA GCC Authentication Portal
              </h2>
              <p className="text-xs text-slate-400">
                Secure access for commercial reports, revenue analytics & RBAC
              </p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-[#0C1220] px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('google');
              setErrorMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'google'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Sign-In
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Email & Password
          </button>
          <button
            onClick={() => {
              setActiveTab('roles');
              setErrorMsg('');
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Team Roles</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Google Authentication */}
          {activeTab === 'google' && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1.5 mb-5">
                <p className="text-xs text-slate-300">
                  Authenticate securely using your Google Workspace or personal Google account.
                </p>
                <p className="text-[11px] text-slate-500">
                  Signing in with <strong className="text-slate-300">786zahidhossen786@gmail.com</strong> grants automatic Founder / Executive Owner status.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-3 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {/* Google Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
              </button>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Cloud Firestore Protection</span>
                </div>
                <p>
                  Tokens are validated through Firebase Security Rules. Financial updates are stored persistently in project <code className="text-emerald-400">ai-studio-b50d98bb-7355-440c-9af6-bb55b2931880</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Email & Password */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Work Email Address:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 786zahidhossen786@gmail.com or bilal.sales@sika-gcc.com"
                    required
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password (min 4 chars)"
                    required
                    className="w-full bg-slate-950 border border-slate-750 focus:border-emerald-400 rounded-xl py-2 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick autofill helper chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                  Quick Autofill Company Accounts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Founder (Zahid)', mail: '786zahidhossen786@gmail.com' },
                    { label: 'CEO (Amina)', mail: 'amina.ceo@sika-gcc.com' },
                    { label: 'Salesman (Bilal)', mail: 'bilal.sales@sika-gcc.com' },
                    { label: 'Worker (Faisal)', mail: 'faisal.worker@sika-gcc.com' },
                  ].map((chip) => (
                    <button
                      key={chip.mail}
                      type="button"
                      onClick={() => {
                        setEmail(chip.mail);
                        setPassword('sika2026');
                      }}
                      className="px-2 py-1 text-[10px] bg-slate-850 hover:bg-slate-750 text-slate-300 border border-slate-700/80 rounded-md transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Instant Team Roles */}
          {activeTab === 'roles' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">
                Click any team member card to immediately authenticate and assume their operational role and permissions:
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {roleList.map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickRole(item.role)}
                    className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{item.email}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#131B2E] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control Enforced</span>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
          >
            Continue as Guest Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

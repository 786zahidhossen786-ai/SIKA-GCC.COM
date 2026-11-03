import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinancialData } from '../../context/FinancialDataContext';
import {
  ROLE_CONFIGS,
  filterFinancialDataForRole,
  generateOfflineScopedResponse,
  ScopedFinancialData,
} from '../../utils/aiRoleScopingEngine';
import { UserRole } from '../../types';
import {
  Sparkles,
  Send,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  Fuel,
  Receipt,
  HeartHandshake,
  Tag,
  DollarSign,
  Copy,
  Info,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini-3.8-flash' | 'scoped-deterministic-engine';
  isRefusal?: boolean;
}

export const AccountAIAssistant: React.FC = () => {
  const { profile, role, switchDemoRole } = useAuth();
  const { filteredTransactions, currency } = useFinancialData();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.salesman;
  const scopedData: ScopedFinancialData = filterFinancialDataForRole(
    role,
    filteredTransactions,
    profile,
    currency
  );

  // Initialize or reset welcome message when active user profile or role changes
  useEffect(() => {
    const welcomeText = `Hello **${profile.displayName}**,\n\nI am your dedicated **${config.personaTitle}**, configured with strict data guardrails for your **${config.roleBadge}** account.\n\n${config.scopeDescription}\n\n**${config.securityNotice}**\n\nAsk me any question below or pick a suggested query to get started!`;

    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'scoped-deterministic-engine',
      },
    ]);
  }, [role, profile.displayName, profile.email]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      // Call server endpoint
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'aistudio-build',
        },
        body: JSON.stringify({
          message: text,
          role,
          profile,
          transactions: filteredTransactions,
          currency,
          history,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const isRefusal = data.answer.includes('🔒') || data.answer.includes('Access Restricted');
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'assistant',
            text: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: data.source || 'gemini-3.8-flash',
            isRefusal,
          },
        ]);
      } else {
        // Fallback to local scoped engine
        const fallbackText = generateOfflineScopedResponse(text, role, profile, scopedData);
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'assistant',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'scoped-deterministic-engine',
            isRefusal: fallbackText.includes('🔒'),
          },
        ]);
      }
    } catch (err) {
      // In case server is unreachable, use immediate scoped deterministic response
      const fallbackText = generateOfflineScopedResponse(text, role, profile, scopedData);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'scoped-deterministic-engine',
          isRefusal: fallbackText.includes('🔒'),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const welcomeText = `Conversation reset for **${profile.displayName}** (${config.roleBadge}). What financial or operational topic would you like to review?`;
    setMessages([
      {
        id: 'reset-' + Date.now(),
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'scoped-deterministic-engine',
      },
    ]);
  };

  const testRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'founder', label: 'Founder (Zahid)', desc: 'Full P&L, Net Profit & Sadaqah' },
    { role: 'salesman', label: 'Salesman (Bilal)', desc: 'Sales, Discounts & Gifts Only' },
    { role: 'worker', label: 'Worker (Faisal)', desc: 'Fuel, Tools & Daily Petty Cash' },
    { role: 'manager', label: 'Manager (Hassan)', desc: 'Operations & Procurement' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Account Intelligence Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0F172A] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Account-Scoped AI Advisor
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeColor}`}
                >
                  {config.roleBadge}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {profile.displayName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
                {config.personaTitle} &bull; {config.scopeDescription}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-400/90">
                <Shield className="w-3.5 h-3.5" />
                <span>{config.securityNotice}</span>
              </div>
            </div>
          </div>

          {/* Quick Perspective Switcher */}
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl lg:max-w-xs shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Simulate Account View
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Instant Test</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {testRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => switchDemoRole(r.role)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
                    role === r.role
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  <div className="truncate">{r.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Scoped Metrics Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Revenue */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block mb-0.5">Visible Revenue</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {scopedData.totalVisibleRevenue.toLocaleString()} {currency}
            </span>
          </div>

          {/* Net Profit (Redacted for Salesman/Worker) */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block mb-0.5">Net Profit Margin</span>
            {scopedData.netProfitVisible !== null ? (
              <span className="text-sm font-bold font-mono text-white">
                {scopedData.profitMarginPercent}% ({scopedData.netProfitVisible.toLocaleString()} {currency})
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400/90 text-xs font-semibold">
                <Lock className="w-3 h-3" />
                <span>Restricted (Confidential)</span>
              </div>
            )}
          </div>

          {/* Discounts */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block mb-0.5">Customer Discounts</span>
            {scopedData.discountTotal !== null ? (
              <span className="text-sm font-bold font-mono text-amber-400">
                {scopedData.discountTotal.toLocaleString()} {currency}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Lock className="w-3 h-3" />
                <span>N/A for Role</span>
              </div>
            )}
          </div>

          {/* Gifts */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 block mb-0.5">Client Hospitality/Gifts</span>
            {scopedData.giftTotal !== null ? (
              <span className="text-sm font-bold font-mono text-cyan-400">
                {scopedData.giftTotal.toLocaleString()} {currency}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Lock className="w-3 h-3" />
                <span>N/A for Role</span>
              </div>
            )}
          </div>

          {/* Daily Site Expenses */}
          <div className="bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block mb-0.5">Daily Expenses & Fuel</span>
            {scopedData.dailyExpensesTotal !== null ? (
              <span className="text-sm font-bold font-mono text-slate-200">
                {scopedData.dailyExpensesTotal.toLocaleString()} {currency}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Lock className="w-3 h-3" />
                <span>N/A for Role</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-2xl flex flex-col h-[640px] shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-white tracking-wide">
                Active Intelligence Session
              </span>
              <span className="text-[11px] text-slate-400 block">
                Scoped strictly to {profile.displayName} ({role})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : msg.isRefusal
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? 'bg-emerald-600/90 text-white shadow-md'
                      : msg.isRefusal
                      ? 'bg-rose-950/20 border border-rose-800/40 text-slate-200'
                      : 'bg-slate-900 border border-slate-800/90 text-slate-200 shadow-sm'
                  }`}
                >
                  {/* Markdown-like rendering with formatted lines */}
                  <div className="space-y-2 whitespace-pre-wrap font-sans">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="text-sm font-bold text-white pt-1">
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    <div className="flex items-center gap-2">
                      {!isUser && msg.source && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400">
                          {msg.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Account Engine'}
                        </span>
                      )}
                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-white transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Evaluating financial ledger with role permissions...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Suggestions:
            </span>
            {config.suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Box */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask as ${profile.displayName} (${config.roleBadge})...`}
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
            <span>Powered by Gemini 3.8 Flash &bull; Role-Enforced Server Scoping</span>
            <span>SIKA GCC Commercial Solutions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

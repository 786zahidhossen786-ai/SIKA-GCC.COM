import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../../types';
import { TRANSACTION_CATEGORIES } from '../../data/seedData';
import { useAuth } from '../../context/AuthContext';
import { useFinancialData } from '../../context/FinancialDataContext';
import { X, Heart, Gift, Tag, Coffee } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<boolean>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { profile, role } = useAuth();
  const { currency } = useFinancialData();
  const [type, setType] = useState<TransactionType>('revenue');
  const [category, setCategory] = useState<string>('Commercial Chemical Contracts');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>('2026-10-26');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('cleared');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Wire');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setCategory(initialData.category);
      setAmount(initialData.amount.toString());
      setDate(initialData.date);
      setDescription(initialData.description);
      setStatus(initialData.status);
      setPaymentMethod(initialData.paymentMethod || 'Wire Transfer');
      setRecordedBy(initialData.recordedBy || profile.displayName);
    } else {
      setType('revenue');
      setCategory('Commercial Chemical Contracts');
      setAmount('');
      setDate('2026-10-26');
      setDescription('');
      setStatus('cleared');
      setPaymentMethod('Bank Wire');
      setRecordedBy(profile.displayName);
    }
    setErrorMsg('');
  }, [initialData, isOpen, profile.displayName]);

  // Quick preset selector
  const selectSpecialPreset = (
    presetType: TransactionType,
    presetCat: string,
    defaultDesc: string
  ) => {
    setType(presetType);
    setCategory(presetCat);
    if (!description) setDescription(defaultDesc);
  };

  // Update category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(TRANSACTION_CATEGORIES[newType][0]);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid monetary amount greater than 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please provide a memo or description for this transaction.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const success = await onSubmit({
      type,
      category,
      amount: parsedAmount,
      date,
      description: description.trim(),
      status,
      paymentMethod,
      recordedBy: recordedBy.trim() || profile.displayName,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0F1624] border border-slate-750 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="modal-title" className="text-base font-bold text-white tracking-tight mb-1">
          {initialData ? 'Edit Financial Record' : 'Record Business Transaction'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Record company sales, daily operational expenses, client gifts, discounts, or Sadaqah.
        </p>

        {/* Quick Presets for Requested Special Categories */}
        <div className="mb-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-2">
            Quick Categories (Sadaqah, Gifts, Discounts, Daily Expenses):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => selectSpecialPreset('expense', 'Sadaqah & Charity', 'Corporate Sadaqah & Community Welfare')}
              className="p-1.5 bg-slate-850 hover:bg-emerald-950/40 text-emerald-400 border border-slate-750 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Heart className="w-3 h-3" />
              <span>Sadaqah</span>
            </button>
            <button
              type="button"
              onClick={() => selectSpecialPreset('expense', 'Gifts & Honorariums', 'Client Appreciation Gift')}
              className="p-1.5 bg-slate-850 hover:bg-purple-950/40 text-purple-400 border border-slate-750 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Gift className="w-3 h-3" />
              <span>Gifts</span>
            </button>
            <button
              type="button"
              onClick={() => selectSpecialPreset('expense', 'Discounts & Deductions', 'Customer Promotional Discount')}
              className="p-1.5 bg-slate-850 hover:bg-amber-950/40 text-amber-400 border border-slate-750 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Tag className="w-3 h-3" />
              <span>Discount</span>
            </button>
            <button
              type="button"
              onClick={() => selectSpecialPreset('expense', 'Daily Expenses & Petty Cash', 'Daily office & petty cash supplies')}
              className="p-1.5 bg-slate-850 hover:bg-sky-950/40 text-sky-400 border border-slate-750 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Coffee className="w-3 h-3" />
              <span>Daily Exp</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Segmented Toggle */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Flow Direction
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('revenue')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'revenue'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                + Revenue (Sales / Inflow)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                - Expense (Cost / Outflow)
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-sm text-white font-mono-numbers focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date (YYYY-MM-DD) *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Financial Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                {TRANSACTION_CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Settlement Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="cleared">Cleared (Settled)</option>
                <option value="pending">Pending (Unsettled)</option>
              </select>
            </div>
          </div>

          {/* Payment Method & Logged By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Instrument
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Stripe">Stripe (Online)</option>
                <option value="Bank ACH">Bank ACH</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Logged By (Actor)
              </label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                placeholder="e.g. Bilal Karim (Salesman)"
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Memo / Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Enterprise Client Q4 Retainer Milestone"
              maxLength={255}
              required
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

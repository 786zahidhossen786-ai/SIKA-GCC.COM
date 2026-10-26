import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { X, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importTransactionsCsv, setLedgerMode, clearTransactions, ledgerMode, transactions } = useFinancialData();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        setFeedback(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      setFeedback({ type: 'error', message: 'Please paste CSV data or select a file first.' });
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    const result = await importTransactionsCsv(csvText);
    setIsProcessing(false);

    if (result.error) {
      setFeedback({ type: 'error', message: result.error });
    } else {
      setFeedback({
        type: 'success',
        message: `Successfully imported ${result.count} real transactions into your ledger!`,
      });
      setTimeout(() => {
        onClose();
        setCsvText('');
        setFeedback(null);
      }, 1500);
    }
  };

  const handleLoadRealSikaData = () => {
    setLedgerMode('real');
    setFeedback({ type: 'success', message: 'Loaded authentic SIKA GCC commercial ledger records!' });
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 1000);
  };

  const handleClearToCleanSlate = () => {
    if (confirm('Clear all transactions to start a 100% clean, empty ledger for your real data?')) {
      clearTransactions();
      setFeedback({ type: 'success', message: 'Ledger cleared to clean slate. You can now record or import real data!' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        className="w-full max-w-2xl bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131B2E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 id="import-title" className="text-base font-bold text-white">
                Import Real Business Data
              </h2>
              <p className="text-xs text-slate-400">
                Upload real CSV transactions or switch between SIKA GCC commercial data and clean slate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
          {/* Quick Real Data Actions Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-white block">Real SIKA GCC Commercial Data</span>
              <p className="text-[11px] text-slate-400">
                Load authentic SIKA GCC construction chemicals, waterproofing & sealant records.
              </p>
              <button
                type="button"
                onClick={handleLoadRealSikaData}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load SIKA GCC Data</span>
              </button>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-3">
              <span className="text-[11px] font-semibold text-rose-300 block">Clean Blank Ledger (0 Records)</span>
              <p className="text-[11px] text-slate-400">
                Wipe placeholders and start fresh with an empty ledger for your own business entries.
              </p>
              <button
                type="button"
                onClick={handleClearToCleanSlate}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Start Clean Slate</span>
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="text-xs font-medium">{feedback.message}</span>
            </div>
          )}

          {/* File input */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-200">
              Upload CSV File:
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-slate-400" />
                <span className="text-xs text-slate-300 font-medium">Click to select a CSV file from your computer</span>
                <span className="text-[11px] text-slate-500">Supports Date, Type, Category, Amount, Description, Recorded By</span>
              </label>
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">
              Or Paste CSV Data Below:
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Date,Type,Category,Amount,Description,Recorded By
2026-10-26,revenue,Commercial Chemical Contracts,54500,Sikaflex 11FC+ Polyurethane Sealant Contract,Bilal Karim (Salesman)
2026-10-26,expense,Sadaqah & Charity,5000,Monthly Corporate Sadaqah Welfare,Zahid Hossen (Founder)
2026-10-26,expense,Daily Expenses & Petty Cash,680,Site delivery diesel & toll petty cash,Faisal Ahmed (Worker)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#131B2E] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Current active ledger: <strong className="text-white capitalize">{ledgerMode}</strong> ({transactions.length} records)
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isProcessing || !csvText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
            >
              {isProcessing ? 'Importing...' : 'Import Real Transactions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AccountAIAssistant } from './AccountAIAssistant';
import { X, Bot } from 'lucide-react';

interface AIFloatingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIFloatingDrawer: React.FC<AIFloatingDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#090D15] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Close Bar */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-sm font-semibold">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span>SIKA GCC &bull; Account AI Financial Co-Pilot</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close AI Co-Pilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-60px)]">
          <AccountAIAssistant />
        </div>
      </div>
    </div>
  );
};

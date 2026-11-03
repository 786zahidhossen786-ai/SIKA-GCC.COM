import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { SalesContract, ContractStatus, PaymentTerms } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import {
  Briefcase,
  FileText,
  DollarSign,
  Gift,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Building,
  Tag,
  Percent,
  TrendingUp,
  AlertCircle,
  X,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

export const SalesmanHubView: React.FC = () => {
  const {
    salesContracts,
    addSalesContract,
    updateSalesContractStatus,
    pushContractToRevenueLedger,
    clientGifts,
    addClientGift,
    currency,
  } = useFinancialData();

  const { profile, role } = useAuth();

  // Filters & State
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isDiscountCalcOpen, setIsDiscountCalcOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Contract Form State
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [location, setLocation] = useState('Dubai, UAE');
  const [chemicalProduct, setChemicalProduct] = useState('Sikaflex 11FC+ Polyurethane Sealant');
  const [quantity, setQuantity] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [commissionRate, setCommissionRate] = useState('2.5');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('30 Days Net');
  const [contractNotes, setContractNotes] = useState('');

  // Gift Form State
  const [giftClient, setGiftClient] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftItem, setGiftItem] = useState('');
  const [giftCost, setGiftCost] = useState('');
  const [giftOccasion, setGiftOccasion] = useState('');

  // Discount Calculator State
  const [calcBaseValue, setCalcBaseValue] = useState('50000');
  const [calcDiscountPct, setCalcDiscountPct] = useState('5');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Commission & Performance Metrics
  const totalBookedValue = salesContracts.reduce((sum, c) => sum + c.netValue, 0);
  const totalCommissionEarned = salesContracts.reduce((sum, c) => sum + c.commissionEarned, 0);
  const signedContracts = salesContracts.filter((c) => c.status === 'signed' || c.status === 'delivered');
  const totalSignedValue = signedContracts.reduce((sum, c) => sum + c.netValue, 0);
  const totalDiscountsGiven = salesContracts.reduce((sum, c) => sum + c.discountAmount, 0);

  // Filtered Contracts
  const filteredContracts = salesContracts.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chemicalProduct.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = parseFloat(contractValue);
    const disc = parseFloat(discountAmount) || 0;
    if (isNaN(rawVal) || rawVal <= 0) return;

    const netVal = Math.max(0, rawVal - disc);
    const commRate = parseFloat(commissionRate) || 2.5;

    await addSalesContract({
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      projectTitle: projectTitle.trim(),
      location: location.trim(),
      chemicalProduct: chemicalProduct.trim(),
      quantityM2OrTons: quantity.trim() || 'Standard Delivery Batch',
      contractValue: rawVal,
      discountAmount: disc,
      netValue: netVal,
      commissionRatePct: commRate,
      commissionStatus: 'pending',
      status: 'draft',
      paymentTerms,
      salesmanName: profile.displayName,
      salesmanEmail: profile.email,
      notes: contractNotes.trim(),
    });

    setIsContractModalOpen(false);
    showToast(`New commercial proposal created for ${clientName}!`);

    // Reset Form
    setClientName('');
    setClientContact('');
    setProjectTitle('');
    setContractValue('');
    setDiscountAmount('0');
    setQuantity('');
    setContractNotes('');
  };

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(giftCost);
    if (isNaN(cost) || cost <= 0) return;

    await addClientGift({
      clientName: giftClient.trim(),
      recipientName: giftRecipient.trim(),
      giftItem: giftItem.trim(),
      cost,
      occasion: giftOccasion.trim(),
      salesmanName: profile.displayName,
      approvedBy: role === 'manager' || role === 'founder' || role === 'ceo' ? profile.displayName : undefined,
    });

    setIsGiftModalOpen(false);
    showToast(`Client appreciation gift logged and recorded in expense ledger!`);
    setGiftClient('');
    setGiftRecipient('');
    setGiftItem('');
    setGiftCost('');
    setGiftOccasion('');
  };

  const handlePushToLedger = async (contract: SalesContract) => {
    const success = await pushContractToRevenueLedger(contract.id);
    if (success) {
      showToast(`Contract ${contract.projectTitle} recorded into company revenue ledger!`);
    }
  };

  // Discount Calculator Values
  const calcBaseNum = parseFloat(calcBaseValue) || 0;
  const calcDiscNum = parseFloat(calcDiscountPct) || 0;
  const calcDiscAmt = (calcBaseNum * calcDiscNum) / 100;
  const calcNetRevenue = calcBaseNum - calcDiscAmt;
  const calcEstGrossProfit = calcNetRevenue * 0.42; // assuming 42% standard gross margin
  const calcSalesCommission = calcNetRevenue * 0.025; // 2.5%

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              Commercial Sales & Contract Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Client Contracts & Sales Order Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage corporate chemical contracts, client discount concessions, executive hospitality gifts, and sales commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDiscountCalcOpen(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            <span>Discount Calculator</span>
          </button>

          <button
            onClick={() => setIsGiftModalOpen(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>Log Client Gift</span>
          </button>

          <button
            onClick={() => setIsContractModalOpen(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Sales Proposal</span>
          </button>
        </div>
      </div>

      {/* Sales Performance & Commission KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Pipeline Value
          </span>
          <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
            {formatCurrency(totalBookedValue, false, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {salesContracts.length} commercial chemical proposals
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Signed Contracts Revenue
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono-numbers">
            {formatCurrency(totalSignedValue, false, currency)}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{signedContracts.length} contracts signed & active</span>
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Sales Commission Earned
          </span>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono-numbers">
            {formatCurrency(totalCommissionEarned, false, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated at 2.5% - 3.0% on closed deals
          </p>
        </div>

        <div className="p-4 bg-[#111726] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Sales Discounts
          </span>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono-numbers">
            {formatCurrency(totalDiscountsGiven, false, currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Negotiated customer rebates & volume concessions
          </p>
        </div>
      </div>

      {/* Contracts Ledger & Management Table */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Commercial Contracts & Proposals
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredContracts.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, project, product..."
                className="bg-slate-900 border border-slate-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
              />
            </div>

            {/* Status Pills */}
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              {(['all', 'draft', 'negotiation', 'signed', 'delivered'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Client & Project</th>
                <th className="py-3 px-3">Chemical Specifications</th>
                <th className="py-3 px-3 text-right">Gross Value</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Net Revenue</th>
                <th className="py-3 px-3 text-right">Commission</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filteredContracts.map((cnt) => {
                const statusStyles: Record<ContractStatus, string> = {
                  draft: 'bg-slate-800 text-slate-300 border-slate-700',
                  negotiation: 'bg-amber-950/40 text-amber-300 border-amber-800/80',
                  approved: 'bg-blue-950/40 text-blue-300 border-blue-800/80',
                  signed: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80',
                  delivered: 'bg-purple-950/40 text-purple-300 border-purple-800/80',
                };

                return (
                  <tr key={cnt.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-white">{cnt.clientName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-500" />
                        <span>{cnt.projectTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{cnt.location}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="text-slate-200 font-medium">{cnt.chemicalProduct}</div>
                      <div className="text-[11px] text-slate-400">{cnt.quantityM2OrTons}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{cnt.paymentTerms}</div>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCurrency(cnt.contractValue, false, currency)}
                    </td>

                    <td className="py-3 px-3 text-right text-amber-400">
                      {cnt.discountAmount > 0 ? `-${formatCurrency(cnt.discountAmount, false, currency)}` : '0.00'}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white text-sm">
                      {formatCurrency(cnt.netValue, false, currency)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="text-cyan-400 font-semibold">
                        +{formatCurrency(cnt.commissionEarned, false, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {cnt.commissionRatePct}% rate
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${statusStyles[cnt.status]}`}>
                        {cnt.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        {!cnt.pushedToLedger ? (
                          <button
                            onClick={() => handlePushToLedger(cnt)}
                            title="Push signed revenue into main company ledger"
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                          >
                            <Send className="w-3 h-3 stroke-[2.5]" />
                            <span>Push to Ledger</span>
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Ledger</span>
                          </span>
                        )}

                        {cnt.status === 'negotiation' && (
                          <button
                            onClick={() => updateSalesContractStatus(cnt.id, 'signed')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-medium"
                          >
                            Mark Signed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Client Gifts & Hospitality Log Strip */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Corporate Gifts & Executive Hospitality Records
            </h3>
          </div>
          <button
            onClick={() => setIsGiftModalOpen(true)}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Gift</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientGifts.map((gift) => (
            <div key={gift.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{gift.recipientName}</span>
                <span className="font-mono font-bold text-purple-400">
                  {formatCurrency(gift.cost, false, currency)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">{gift.giftItem}</p>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>{gift.clientName}</span>
                <span>Logged by {gift.salesmanName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Create Sales Contract */}
      {isContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Create Commercial Sales Contract</span>
              </h3>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Client / Contractor Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Al Habtoor Engineering LLC"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g. Al Habtoor Tower Facade"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Site Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dubai Marina, UAE"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Chemical Product & Batch Quantity *
                </label>
                <input
                  type="text"
                  required
                  value={chemicalProduct}
                  onChange={(e) => setChemicalProduct(e.target.value)}
                  placeholder="e.g. Sikaflex 11FC+ Polyurethane Sealant (500 drums)"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Gross Value ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={contractValue}
                    onChange={(e) => setContractValue(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Discount ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                  className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                >
                  <option value="30 Days Net">30 Days Net (Standard Corporate)</option>
                  <option value="50% Advance / 50% on Delivery">50% Advance / 50% on Delivery</option>
                  <option value="100% Advance">100% Advance (New Client)</option>
                  <option value="60 Days PDC">60 Days Post-Dated Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Contract Notes / Specification Details
                </label>
                <textarea
                  rows={2}
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  placeholder="Material inspection certificates, consultant approval status, delivery milestones..."
                  className="w-full bg-slate-950 border border-slate-750 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Discount & Margin Calculator */}
      {isDiscountCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Sales Discount Feasibility Calculator</span>
              </h3>
              <button
                onClick={() => setIsDiscountCalcOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulate the impact of proposed customer price cuts on project net revenue, gross margins, and salesman commission before submitting for manager approval.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Original Order Value ({currency})
                </label>
                <input
                  type="number"
                  value={calcBaseValue}
                  onChange={(e) => setCalcBaseValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                  <span>Discount Percentage</span>
                  <span className="text-amber-400 font-mono">{calcDiscountPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={calcDiscountPct}
                  onChange={(e) => setCalcDiscountPct(e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono-numbers">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Concession / Discount:</span>
                  <span className="text-amber-400 font-bold">-{formatCurrency(calcDiscAmt, false, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Net Project Invoicing:</span>
                  <span className="text-white font-bold">{formatCurrency(calcNetRevenue, false, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Est. Gross Operating Margin:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(calcEstGrossProfit, false, currency)} (~42%)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-2 border-t border-slate-800">
                  <span>Sales Commission (2.5%):</span>
                  <span className="text-cyan-400 font-bold">+{formatCurrency(calcSalesCommission, false, currency)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDiscountCalcOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs rounded-xl"
            >
              Close Calculator
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Client Gift */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Log Executive Client Appreciation Gift</span>
              </h3>
              <button
                onClick={() => setIsGiftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGift} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Contractor / Client Firm *
                </label>
                <input
                  type="text"
                  required
                  value={giftClient}
                  onChange={(e) => setGiftClient(e.target.value)}
                  placeholder="e.g. Al Habtoor Engineering LLC"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Recipient Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  placeholder="e.g. Eng. Tariq Al-Hashimi (Senior Project Manager)"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Gift Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={giftItem}
                    onChange={(e) => setGiftItem(e.target.value)}
                    placeholder="e.g. Executive Oudh Hamper"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={giftCost}
                    onChange={(e) => setGiftCost(e.target.value)}
                    placeholder="850"
                    className="w-full bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Occasion / Business Rationale
                </label>
                <input
                  type="text"
                  value={giftOccasion}
                  onChange={(e) => setGiftOccasion(e.target.value)}
                  placeholder="e.g. Project Delivery Milestone & Strategic Partnership"
                  className="w-full bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Record Gift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 border border-cyan-500 text-white text-xs rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

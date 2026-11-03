import React, { useState } from 'react';
import { useFinancialData } from '../../context/FinancialDataContext';
import { useAuth } from '../../context/AuthContext';
import { SaudiEmployeeRecord, UserRole } from '../../types';
import { formatCurrency } from '../../utils/analytics';
import {
  IdCard,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  User,
  Heart,
  Truck,
  FileCheck,
  Download,
  X,
  ExternalLink,
} from 'lucide-react';
import { downloadCsvFile } from '../../utils/csv';

export const EmployeeComplianceView: React.FC = () => {
  const {
    saudiEmployees,
    addSaudiEmployee,
    updateSaudiEmployee,
    removeSaudiEmployee,
    renewEmployeeDocument,
    currency,
  } = useFinancialData();

  const { role, isExecutive } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'expired' | 'urgent30' | 'due60'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<SaudiEmployeeRecord | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewalTarget, setRenewalTarget] = useState<{
    employeeId: string;
    employeeName: string;
    docType: 'iqama' | 'passport' | 'qiwa' | 'insurance' | 'drivingLicense' | 'healthCert';
    docLabel: string;
    currentExpiry: string;
  } | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Employee Form State
  const [empName, setEmpName] = useState('');
  const [empIdNo, setEmpIdNo] = useState('');
  const [empRole, setEmpRole] = useState<UserRole>('worker');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empDept, setEmpDept] = useState('Site Logistics & Operations');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+966 5');
  const [empNationality, setEmpNationality] = useState('Pakistani (باكستاني)');
  const [empIqamaNo, setEmpIqamaNo] = useState('');
  const [empIqamaExp, setEmpIqamaExp] = useState('2027-10-30');
  const [empIqamaProf, setEmpIqamaProf] = useState('فني عوازل وكيماويات');
  const [empIqamaPlace, setEmpIqamaPlace] = useState('Riyadh (الرياض)');
  const [empPassNo, setEmpPassNo] = useState('');
  const [empPassExp, setEmpPassExp] = useState('2028-05-15');
  const [empQiwaNo, setEmpQiwaNo] = useState('QIWA-2026-');
  const [empQiwaExp, setEmpQiwaExp] = useState('2027-12-31');
  const [empGosiNo, setEmpGosiNo] = useState('');
  const [empBasicSalary, setEmpBasicSalary] = useState('4500');
  const [empHousing, setEmpHousing] = useState('1500');
  const [empInsuranceProv, setEmpInsuranceProv] = useState('Tawuniya (التعاونية)');
  const [empInsurancePolicy, setEmpInsurancePolicy] = useState('TAW-CORP-44102');
  const [empInsuranceExp, setEmpInsuranceExp] = useState('2027-04-30');
  const [empInsuranceClass, setEmpInsuranceClass] = useState<'VIP' | 'Class A' | 'Class B' | 'Class C'>('Class B');
  const [empDrivingNo, setEmpDrivingNo] = useState('');
  const [empDrivingExp, setEmpDrivingExp] = useState('');
  const [empHealthExp, setEmpHealthExp] = useState('');
  const [empBank, setEmpBank] = useState('Al Rajhi Bank (مصرف الراجحي)');
  const [empIban, setEmpIban] = useState('SA');
  const [empJoiningDate, setEmpJoiningDate] = useState('2026-01-01');
  const [empNotes, setEmpNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper: calculate days remaining from today (reference: 2026-11-03)
  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return 9999;
    const today = new Date('2026-11-03');
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (days: number) => {
    if (days < 0) {
      return {
        label: `EXPIRED (${Math.abs(days)}d ago)`,
        style: 'bg-rose-950/70 text-rose-300 border-rose-700/80 animate-pulse font-bold',
        type: 'expired',
      };
    } else if (days <= 30) {
      return {
        label: `CRITICAL (${days}d left)`,
        style: 'bg-amber-950/70 text-amber-300 border-amber-700/80 font-bold',
        type: 'urgent30',
      };
    } else if (days <= 60) {
      return {
        label: `DUE SOON (${days}d left)`,
        style: 'bg-yellow-950/40 text-yellow-300 border-yellow-700/60 font-semibold',
        type: 'due60',
      };
    }
    return {
      label: `VALID (${days}d)`,
      style: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 font-medium',
      type: 'valid',
    };
  };

  // Identify all upcoming owner reminders across all documents
  interface ExpiryAlert {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: UserRole;
    docType: 'iqama' | 'passport' | 'qiwa' | 'insurance' | 'drivingLicense' | 'healthCert';
    docLabel: string;
    docValue: string;
    expiryDate: string;
    daysLeft: number;
    urgency: 'expired' | 'urgent30' | 'due60' | 'valid';
  }

  const allAlerts: ExpiryAlert[] = [];

  saudiEmployees.forEach((emp) => {
    // 1. Iqama
    const iqamaDays = getDaysUntil(emp.iqamaExpiryGregorian);
    const iqamaBadge = getStatusBadge(iqamaDays);
    if (iqamaBadge.type !== 'valid') {
      allAlerts.push({
        id: `${emp.id}-iqama`,
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeRole: emp.role,
        docType: 'iqama',
        docLabel: 'Iqama / Residence ID (هوية مقيم)',
        docValue: emp.iqamaNumber,
        expiryDate: emp.iqamaExpiryGregorian,
        daysLeft: iqamaDays,
        urgency: iqamaBadge.type as any,
      });
    }

    // 2. Passport
    const passDays = getDaysUntil(emp.passportExpiryDate);
    const passBadge = getStatusBadge(passDays);
    if (passBadge.type !== 'valid') {
      allAlerts.push({
        id: `${emp.id}-passport`,
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeRole: emp.role,
        docType: 'passport',
        docLabel: 'Passport (جواز السفر)',
        docValue: emp.passportNumber,
        expiryDate: emp.passportExpiryDate,
        daysLeft: passDays,
        urgency: passBadge.type as any,
      });
    }

    // 3. Qiwa
    const qiwaDays = getDaysUntil(emp.qiwaContractEndDate);
    const qiwaBadge = getStatusBadge(qiwaDays);
    if (qiwaBadge.type !== 'valid') {
      allAlerts.push({
        id: `${emp.id}-qiwa`,
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeRole: emp.role,
        docType: 'qiwa',
        docLabel: 'Qiwa Work Contract (عقد قوى)',
        docValue: emp.qiwaContractNumber,
        expiryDate: emp.qiwaContractEndDate,
        daysLeft: qiwaDays,
        urgency: qiwaBadge.type as any,
      });
    }

    // 4. Insurance
    const insDays = getDaysUntil(emp.insuranceExpiryDate);
    const insBadge = getStatusBadge(insDays);
    if (insBadge.type !== 'valid') {
      allAlerts.push({
        id: `${emp.id}-insurance`,
        employeeId: emp.id,
        employeeName: emp.employeeName,
        employeeRole: emp.role,
        docType: 'insurance',
        docLabel: 'Medical Insurance (الضمان الصحي CCHI)',
        docValue: emp.insurancePolicyNumber,
        expiryDate: emp.insuranceExpiryDate,
        daysLeft: insDays,
        urgency: insBadge.type as any,
      });
    }

    // 5. Driving license
    if (emp.drivingLicenseExpiry) {
      const dlDays = getDaysUntil(emp.drivingLicenseExpiry);
      const dlBadge = getStatusBadge(dlDays);
      if (dlBadge.type !== 'valid') {
        allAlerts.push({
          id: `${emp.id}-dl`,
          employeeId: emp.id,
          employeeName: emp.employeeName,
          employeeRole: emp.role,
          docType: 'drivingLicense',
          docLabel: 'Driving License (رخصة القيادة)',
          docValue: emp.drivingLicenseNumber || 'N/A',
          expiryDate: emp.drivingLicenseExpiry,
          daysLeft: dlDays,
          urgency: dlBadge.type as any,
        });
      }
    }

    // 6. Health Card
    if (emp.healthCertExpiry) {
      const hcDays = getDaysUntil(emp.healthCertExpiry);
      const hcBadge = getStatusBadge(hcDays);
      if (hcBadge.type !== 'valid') {
        allAlerts.push({
          id: `${emp.id}-hc`,
          employeeId: emp.id,
          employeeName: emp.employeeName,
          employeeRole: emp.role,
          docType: 'healthCert',
          docLabel: 'Baladiya Health Card (الشهادة الصحية)',
          docValue: 'Occupational Handling',
          expiryDate: emp.healthCertExpiry,
          daysLeft: hcDays,
          urgency: hcBadge.type as any,
        });
      }
    }
  });

  // Sort alerts by most urgent first
  allAlerts.sort((a, b) => a.daysLeft - b.daysLeft);

  const expiredCount = allAlerts.filter((a) => a.daysLeft < 0).length;
  const urgent30Count = allAlerts.filter((a) => a.daysLeft >= 0 && a.daysLeft <= 30).length;
  const due60Count = allAlerts.filter((a) => a.daysLeft > 30 && a.daysLeft <= 60).length;

  // Filtered employees list
  const filteredEmployees = saudiEmployees.filter((emp) => {
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    const matchesSearch =
      emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.iqamaNumber.includes(searchQuery) ||
      emp.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesRole || !matchesSearch) return false;

    if (urgencyFilter === 'expired') {
      const iq = getDaysUntil(emp.iqamaExpiryGregorian);
      const pass = getDaysUntil(emp.passportExpiryDate);
      const qiwa = getDaysUntil(emp.qiwaContractEndDate);
      return iq < 0 || pass < 0 || qiwa < 0;
    } else if (urgencyFilter === 'urgent30') {
      const iq = getDaysUntil(emp.iqamaExpiryGregorian);
      const pass = getDaysUntil(emp.passportExpiryDate);
      const qiwa = getDaysUntil(emp.qiwaContractEndDate);
      const dl = getDaysUntil(emp.drivingLicenseExpiry);
      const hc = getDaysUntil(emp.healthCertExpiry);
      return (
        (iq >= 0 && iq <= 30) ||
        (pass >= 0 && pass <= 30) ||
        (qiwa >= 0 && qiwa <= 30) ||
        (dl >= 0 && dl <= 30) ||
        (hc >= 0 && hc <= 30)
      );
    }
    return true;
  });

  const openRenewalModal = (
    employeeId: string,
    employeeName: string,
    docType: 'iqama' | 'passport' | 'qiwa' | 'insurance' | 'drivingLicense' | 'healthCert',
    docLabel: string,
    currentExpiry: string
  ) => {
    setRenewalTarget({
      employeeId,
      employeeName,
      docType,
      docLabel,
      currentExpiry,
    });
    // Default suggestion: 1 year forward
    const cur = new Date(currentExpiry || '2026-11-03');
    cur.setFullYear(cur.getFullYear() + 1);
    setNewExpiryDate(cur.toISOString().slice(0, 10));
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewalTarget || !newExpiryDate) return;

    await renewEmployeeDocument(renewalTarget.employeeId, renewalTarget.docType, newExpiryDate);
    setIsRenewModalOpen(false);
    showToast(
      `Successfully renewed ${renewalTarget.docLabel} for ${renewalTarget.employeeName} to ${newExpiryDate}!`
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Role',
      'Department',
      'Nationality',
      'Iqama Number',
      'Iqama Expiry',
      'Passport Number',
      'Passport Expiry',
      'Qiwa Contract No',
      'Qiwa Expiry',
      'GOSI No',
      'Basic Salary',
      'Housing Allowance',
      'Medical Insurance Provider',
      'Insurance Expiry',
      'Driving License Expiry',
      'Health Card Expiry',
      'Bank IBAN',
      'Sponsorship Status',
    ];

    const rows = saudiEmployees.map((e) => [
      e.employeeIdNumber,
      `"${e.employeeName}"`,
      e.role,
      `"${e.department}"`,
      `"${e.nationality}"`,
      `'${e.iqamaNumber}`,
      e.iqamaExpiryGregorian,
      e.passportNumber,
      e.passportExpiryDate,
      e.qiwaContractNumber,
      e.qiwaContractEndDate,
      e.gosiNumber,
      e.gosiBasicSalary,
      e.gosiHousingAllowance,
      `"${e.insuranceProvider}"`,
      e.insuranceExpiryDate,
      e.drivingLicenseExpiry || 'N/A',
      e.healthCertExpiry || 'N/A',
      e.ibanNumber,
      `"${e.sponsorshipStatus}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCsvFile(csvContent, `sika-dcc-saudi-employee-compliance-${new Date().toISOString().slice(0, 10)}.csv`);
    showToast('Saudi Arabia employee compliance report exported as CSV!');
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empIqamaNo.trim() || !empPassNo.trim()) return;

    await addSaudiEmployee({
      employeeName: empName.trim(),
      employeeIdNumber: empIdNo.trim() || `EMP-KSA-${Math.floor(100 + Math.random() * 900)}`,
      role: empRole,
      designation: empDesignation.trim() || 'Operations Staff',
      department: empDept.trim(),
      email: empEmail.trim() || 'staff@sika-gcc.com',
      phone: empPhone.trim(),
      nationality: empNationality.trim(),
      iqamaNumber: empIqamaNo.trim(),
      iqamaExpiryGregorian: empIqamaExp,
      iqamaProfession: empIqamaProf.trim(),
      iqamaIssuePlace: empIqamaPlace.trim(),
      passportNumber: empPassNo.trim(),
      passportExpiryDate: empPassExp,
      passportIssueCountry: empNationality.split(' ')[0],
      qiwaContractNumber: empQiwaNo.trim(),
      qiwaContractEndDate: empQiwaExp,
      qiwaStatus: 'documented',
      gosiNumber: empGosiNo.trim() || `${Math.floor(100000000 + Math.random() * 900000000)}`,
      gosiBasicSalary: parseFloat(empBasicSalary) || 4000,
      gosiHousingAllowance: parseFloat(empHousing) || 1000,
      insuranceProvider: empInsuranceProv,
      insurancePolicyNumber: empInsurancePolicy,
      insuranceExpiryDate: empInsuranceExp,
      insuranceClass: empInsuranceClass,
      drivingLicenseNumber: empDrivingNo.trim() || undefined,
      drivingLicenseExpiry: empDrivingExp || undefined,
      healthCertExpiry: empHealthExp || undefined,
      bankName: empBank,
      ibanNumber: empIban.trim(),
      joiningDate: empJoiningDate,
      sponsorshipStatus: 'Company Sponsored (على الكفالة)',
      notes: empNotes.trim(),
    });

    setIsAddModalOpen(false);
    showToast(`Registered ${empName} into Saudi compliance database!`);

    // Reset Form
    setEmpName('');
    setEmpIdNo('');
    setEmpIqamaNo('');
    setEmpPassNo('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <IdCard className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              SIKA DCC TRADING CO • Saudi Arabia HR & Document Compliance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Employee Iqama, Passport & GCC Regulatory Reminders
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized monitoring for Muqeem Iqama permits, Passports, Qiwa contracts, GOSI contributions, CCHI Medical Insurance, and Baladiya Health Cards with automated owner expiry reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Ministry CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-amber-400/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Employee Record</span>
          </button>
        </div>
      </div>

      {/* URGENT OWNER REMINDER NOTIFICATION CENTER */}
      <div className="p-5 bg-[#14120D] border border-amber-500/40 rounded-2xl shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Executive Owner Document Expiry Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {allAlerts.length} Action Items
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Timely renewals avoid Jawazat late renewal penalties (غرامات تأخير الجوازات) and Qiwa service freezes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-700/80 text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <strong>{expiredCount}</strong> Expired
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-700/80 text-amber-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <strong>{urgent30Count}</strong> &lt; 30 Days
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <strong>{due60Count}</strong> in 60 Days
            </span>
          </div>
        </div>

        {/* Reminder Alert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                alert.daysLeft < 0
                  ? 'bg-rose-950/30 border-rose-700/80 text-rose-200'
                  : alert.daysLeft <= 30
                  ? 'bg-amber-950/30 border-amber-600/70 text-amber-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug">
                      {alert.employeeName}
                    </h4>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.employeeRole}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap ${
                      alert.daysLeft < 0
                        ? 'bg-rose-900 text-rose-200 border-rose-500 font-bold'
                        : 'bg-amber-900/80 text-amber-200 border-amber-500 font-semibold'
                    }`}
                  >
                    {alert.daysLeft < 0
                      ? `OVERDUE ${Math.abs(alert.daysLeft)}d`
                      : `${alert.daysLeft}d left`}
                  </span>
                </div>

                <div className="pt-1 text-xs">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{alert.docLabel}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    No: <span className="text-white font-medium">{alert.docValue}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Expires: <strong className="text-amber-300">{alert.expiryDate}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  {alert.docType === 'iqama' && 'Requires Muqeem Portal fee'}
                  {alert.docType === 'passport' && 'Embassy consular appointment'}
                  {alert.docType === 'qiwa' && 'Employer digital signature'}
                  {alert.docType === 'insurance' && 'CCHI policy renewal'}
                  {alert.docType === 'drivingLicense' && 'Absher traffic renewal'}
                  {alert.docType === 'healthCert' && 'Baladiya clinic swab test'}
                </span>

                <button
                  onClick={() =>
                    openRenewalModal(
                      alert.employeeId,
                      alert.employeeName,
                      alert.docType,
                      alert.docLabel,
                      alert.expiryDate
                    )
                  }
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                  <span>Renew</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Directory & Official Documents Table */}
      <div className="p-5 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        {/* Table Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Official Saudi Arabia & GCC Employee Registry
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredEmployees.length} registered
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
                placeholder="Search name, Iqama, passport, dept..."
                className="bg-slate-900 border border-slate-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-52 sm:w-64"
              />
            </div>

            {/* Urgency Filter */}
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setUrgencyFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  urgencyFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setUrgencyFilter('expired')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  urgencyFilter === 'expired'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setUrgencyFilter('urgent30')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  urgencyFilter === 'urgent30'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Due &lt;30d
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[10px]">
                <th className="py-3 px-4">Employee & Designation</th>
                <th className="py-3 px-3">Iqama (هوية مقيم)</th>
                <th className="py-3 px-3">Passport (الجواز)</th>
                <th className="py-3 px-3">Qiwa Labor Contract</th>
                <th className="py-3 px-3">GOSI & Wages</th>
                <th className="py-3 px-3">Medical Insurance</th>
                <th className="py-3 px-3">Licenses & Health</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filteredEmployees.map((emp) => {
                const iqamaDays = getDaysUntil(emp.iqamaExpiryGregorian);
                const iqamaStatus = getStatusBadge(iqamaDays);

                const passDays = getDaysUntil(emp.passportExpiryDate);
                const passStatus = getStatusBadge(passDays);

                const qiwaDays = getDaysUntil(emp.qiwaContractEndDate);
                const qiwaStatus = getStatusBadge(qiwaDays);

                return (
                  <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-white text-xs">{emp.employeeName}</div>
                      <div className="text-[11px] text-slate-400">{emp.designation}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                          {emp.employeeIdNumber}
                        </span>
                        <span>{emp.nationality}</span>
                      </div>
                    </td>

                    {/* Iqama */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-mono text-white font-semibold text-xs tracking-wide">
                        {emp.iqamaNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">{emp.iqamaProfession}</div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${iqamaStatus.style}`}>
                          {iqamaStatus.label}
                        </span>
                      </div>
                    </td>

                    {/* Passport */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-mono text-white font-semibold text-xs">
                        {emp.passportNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Expires: {emp.passportExpiryDate}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${passStatus.style}`}>
                          {passStatus.label}
                        </span>
                      </div>
                    </td>

                    {/* Qiwa Contract */}
                    <td className="py-3 px-3 font-sans">
                      <div className="font-mono text-slate-300 text-[11px]">
                        {emp.qiwaContractNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        End: {emp.qiwaContractEndDate}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${qiwaStatus.style}`}>
                          {qiwaStatus.label}
                        </span>
                      </div>
                    </td>

                    {/* GOSI & Salary */}
                    <td className="py-3 px-3 font-sans">
                      <div className="text-white font-semibold text-xs font-mono-numbers">
                        {formatCurrency(emp.gosiBasicSalary + emp.gosiHousingAllowance, false, 'SAR')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Basic: {formatCurrency(emp.gosiBasicSalary, false, 'SAR')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        GOSI: {emp.gosiNumber}
                      </div>
                    </td>

                    {/* Insurance */}
                    <td className="py-3 px-3 font-sans">
                      <div className="text-slate-200 text-xs font-medium">
                        {emp.insuranceProvider}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {emp.insuranceClass} • Exp: {emp.insuranceExpiryDate}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Pol: {emp.insurancePolicyNumber}
                      </div>
                    </td>

                    {/* Driving & Health Card */}
                    <td className="py-3 px-3 font-sans text-[11px]">
                      {emp.drivingLicenseNumber ? (
                        <div className="text-slate-300">
                          <span>DL: {emp.drivingLicenseExpiry}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">No DL</span>
                      )}
                      {emp.healthCertExpiry && (
                        <div className="text-amber-400 text-[10px] mt-0.5">
                          Health Card: {emp.healthCertExpiry}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors"
                        >
                          View Full File
                        </button>

                        <button
                          onClick={() =>
                            openRenewalModal(
                              emp.id,
                              emp.employeeName,
                              'iqama',
                              'Iqama (هوية مقيم)',
                              emp.iqamaExpiryGregorian
                            )
                          }
                          className="px-2 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-semibold"
                          title="Quick renew Iqama"
                        >
                          Renew
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Full Employee Dossier Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base">
                  {selectedEmployee.employeeName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedEmployee.employeeName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedEmployee.designation} • {selectedEmployee.employeeIdNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Residence & Immigration (Iqama & Passport) */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase text-[11px] tracking-wider">
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Immigration & Residency (الجوازات)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><strong>Iqama Number:</strong> <span className="font-mono text-white">{selectedEmployee.iqamaNumber}</span></p>
                  <p><strong>Iqama Expiry:</strong> <span className="font-mono text-amber-300">{selectedEmployee.iqamaExpiryGregorian}</span></p>
                  <p><strong>Iqama Profession:</strong> {selectedEmployee.iqamaProfession}</p>
                  <p><strong>Passport Number:</strong> <span className="font-mono text-white">{selectedEmployee.passportNumber}</span></p>
                  <p><strong>Passport Expiry:</strong> <span className="font-mono text-amber-300">{selectedEmployee.passportExpiryDate}</span></p>
                  <p><strong>Nationality:</strong> {selectedEmployee.nationality}</p>
                  <p><strong>Sponsorship:</strong> {selectedEmployee.sponsorshipStatus}</p>
                </div>
              </div>

              {/* Box 2: Qiwa, GOSI & Wages */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 uppercase text-[11px] tracking-wider">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Labor Contract & Wages (قوى والتأمينات)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><strong>Qiwa Contract No:</strong> <span className="font-mono text-white">{selectedEmployee.qiwaContractNumber}</span></p>
                  <p><strong>Contract End Date:</strong> <span className="font-mono text-cyan-300">{selectedEmployee.qiwaContractEndDate}</span></p>
                  <p><strong>Qiwa Status:</strong> <span className="capitalize font-semibold text-emerald-400">{selectedEmployee.qiwaStatus}</span></p>
                  <p><strong>GOSI Reg No:</strong> <span className="font-mono text-white">{selectedEmployee.gosiNumber}</span></p>
                  <p><strong>Basic Wage:</strong> {formatCurrency(selectedEmployee.gosiBasicSalary, false, 'SAR')}</p>
                  <p><strong>Housing Allowance:</strong> {formatCurrency(selectedEmployee.gosiHousingAllowance, false, 'SAR')}</p>
                  <p><strong>Joining Date:</strong> {selectedEmployee.joiningDate}</p>
                </div>
              </div>

              {/* Box 3: Medical Insurance & Health */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 uppercase text-[11px] tracking-wider">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Health & Safety Compliance (الضمان الصحي)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><strong>Insurance Provider:</strong> {selectedEmployee.insuranceProvider}</p>
                  <p><strong>Policy Number:</strong> <span className="font-mono text-white">{selectedEmployee.insurancePolicyNumber}</span></p>
                  <p><strong>Insurance Expiry:</strong> <span className="font-mono text-rose-300">{selectedEmployee.insuranceExpiryDate}</span></p>
                  <p><strong>Policy Class:</strong> {selectedEmployee.insuranceClass}</p>
                  <p><strong>Baladiya Health Card:</strong> {selectedEmployee.healthCertExpiry || 'Not Required'}</p>
                  <p><strong>Driving License:</strong> {selectedEmployee.drivingLicenseNumber ? `${selectedEmployee.drivingLicenseNumber} (Exp: ${selectedEmployee.drivingLicenseExpiry})` : 'None'}</p>
                </div>
              </div>

              {/* Box 4: Banking & Wage Protection (WPS) */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 uppercase text-[11px] tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>WPS & Banking (حماية الأجور)</span>
                </div>
                <div className="space-y-1 text-slate-300">
                  <p><strong>Salary Bank:</strong> {selectedEmployee.bankName}</p>
                  <p className="break-all"><strong>IBAN Number:</strong> <span className="font-mono text-white text-[11px]">{selectedEmployee.ibanNumber}</span></p>
                  <p><strong>Official Phone:</strong> {selectedEmployee.phone}</p>
                  <p><strong>Company Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Notes / Compliance Remarks:</strong></p>
                  <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2 rounded border border-slate-800">
                    {selectedEmployee.notes || 'No special remarks recorded.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Registered in SIKA DCC TRADING CO Compliance Registry
              </span>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Document Renewal Modal */}
      {isRenewModalOpen && renewalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Renew Employee Document</span>
              </h3>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Update the official expiry date after completing the renewal on the government portal (Muqeem / Qiwa / Absher).
            </p>

            <form onSubmit={handleConfirmRenewal} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <p><strong>Employee:</strong> <span className="text-white font-semibold">{renewalTarget.employeeName}</span></p>
                <p><strong>Document:</strong> <span className="text-amber-400 font-semibold">{renewalTarget.docLabel}</span></p>
                <p><strong>Previous Expiry Date:</strong> <span className="font-mono text-slate-400">{renewalTarget.currentExpiry}</span></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  New Extended Expiry Date (YYYY-MM-DD) *
                </label>
                <input
                  type="date"
                  required
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono-numbers focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Renewal Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0F1626] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Register Employee in Saudi Compliance Registry</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              {/* Section 1: Basic Info */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  1. Personal & Company Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="e.g. Tariq Al-Ghamdi"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Internal Badge No.</label>
                    <input
                      type="text"
                      value={empIdNo}
                      onChange={(e) => setEmpIdNo(e.target.value)}
                      placeholder="e.g. EMP-KSA-402"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">System Role</label>
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="salesman">Salesman</option>
                      <option value="worker">Site Worker</option>
                      <option value="manager">Manager</option>
                      <option value="director">Director</option>
                      <option value="co-founder">Co-Founder</option>
                      <option value="founder">Founder / Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Designation</label>
                    <input
                      type="text"
                      value={empDesignation}
                      onChange={(e) => setEmpDesignation(e.target.value)}
                      placeholder="e.g. Site Chemical Applicator"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={empNationality}
                      onChange={(e) => setEmpNationality(e.target.value)}
                      placeholder="e.g. Jordanian (أردني)"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Iqama & Passport */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  2. Iqama & Passport Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Iqama Number (10 digits) *</label>
                    <input
                      type="text"
                      required
                      value={empIqamaNo}
                      onChange={(e) => setEmpIqamaNo(e.target.value)}
                      placeholder="e.g. 2491029481"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Iqama Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={empIqamaExp}
                      onChange={(e) => setEmpIqamaExp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Iqama Profession</label>
                    <input
                      type="text"
                      value={empIqamaProf}
                      onChange={(e) => setEmpIqamaProf(e.target.value)}
                      placeholder="e.g. مندوب مبيعات"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Passport Number *</label>
                    <input
                      type="text"
                      required
                      value={empPassNo}
                      onChange={(e) => setEmpPassNo(e.target.value)}
                      placeholder="e.g. PK-8819204"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Passport Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={empPassExp}
                      onChange={(e) => setEmpPassExp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Qiwa, GOSI, Insurance, Banking */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  3. Qiwa, GOSI & Medical Insurance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Qiwa Contract No.</label>
                    <input
                      type="text"
                      value={empQiwaNo}
                      onChange={(e) => setEmpQiwaNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Qiwa Contract End Date</label>
                    <input
                      type="date"
                      value={empQiwaExp}
                      onChange={(e) => setEmpQiwaExp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Medical Insurance Provider</label>
                    <input
                      type="text"
                      value={empInsuranceProv}
                      onChange={(e) => setEmpInsuranceProv(e.target.value)}
                      placeholder="e.g. Bupa Arabia"
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">GOSI Basic Wage (SAR)</label>
                    <input
                      type="number"
                      value={empBasicSalary}
                      onChange={(e) => setEmpBasicSalary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Housing Allowance (SAR)</label>
                    <input
                      type="number"
                      value={empHousing}
                      onChange={(e) => setEmpHousing(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">WPS Bank Name</label>
                    <input
                      type="text"
                      value={empBank}
                      onChange={(e) => setEmpBank(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank IBAN Number</label>
                  <input
                    type="text"
                    value={empIban}
                    onChange={(e) => setEmpIban(e.target.value)}
                    placeholder="SA..."
                    className="w-full bg-slate-950 border border-slate-750 focus:border-amber-400 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 border border-amber-500 text-white text-xs rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

import { db } from './index.ts';
import { 
  users, 
  transactions, 
  saudiEmployees, 
  salesContracts, 
  approvalClaims, 
  workerSiteLogs, 
  sadaqahRecords, 
  auditLogs 
} from './schema.ts';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_SAUDI_EMPLOYEES, 
  INITIAL_SALES_CONTRACTS, 
  INITIAL_APPROVAL_CLAIMS, 
  INITIAL_WORKER_LOGS, 
  INITIAL_SADAQAH_RECORDS, 
  INITIAL_AUDIT_LOGS 
} from '../data/seedData.ts';

export async function seedDatabase() {
  try {
    // 1. Seed default owner user
    await db.insert(users).values({
      uid: 'founder-zahid',
      email: '786zahidhossen786@gmail.com',
      displayName: 'Zahid Hossen (Founder)',
      role: 'owner',
    }).onConflictDoNothing();

    // 2. Seed transactions
    for (const t of INITIAL_TRANSACTIONS) {
      await db.insert(transactions).values({
        id: t.id,
        userId: t.userId,
        type: t.type,
        category: t.category,
        amount: t.amount,
        date: t.date,
        description: t.description,
        status: t.status,
        paymentMethod: t.paymentMethod,
        recordedBy: t.recordedBy,
        createdAt: t.createdAt,
      }).onConflictDoNothing();
    }

    // 3. Seed saudi employees
    for (const emp of INITIAL_SAUDI_EMPLOYEES) {
      await db.insert(saudiEmployees).values({
        id: emp.id,
        employeeName: emp.employeeName,
        employeeIdNumber: emp.employeeIdNumber,
        role: emp.role,
        designation: emp.designation,
        department: emp.department,
        email: emp.email,
        phone: emp.phone,
        nationality: emp.nationality,
        iqamaNumber: emp.iqamaNumber,
        iqamaExpiryGregorian: emp.iqamaExpiryGregorian,
        iqamaProfession: emp.iqamaProfession,
        iqamaIssuePlace: emp.iqamaIssuePlace,
        passportNumber: emp.passportNumber,
        passportExpiryDate: emp.passportExpiryDate,
        passportIssueCountry: emp.passportIssueCountry,
        qiwaContractNumber: emp.qiwaContractNumber,
        qiwaContractEndDate: emp.qiwaContractEndDate,
        qiwaStatus: emp.qiwaStatus,
        gosiNumber: emp.gosiNumber,
        gosiBasicSalary: emp.gosiBasicSalary,
        gosiHousingAllowance: emp.gosiHousingAllowance,
        insuranceProvider: emp.insuranceProvider,
        insurancePolicyNumber: emp.insurancePolicyNumber,
        insuranceExpiryDate: emp.insuranceExpiryDate,
        insuranceClass: emp.insuranceClass,
        drivingLicenseNumber: emp.drivingLicenseNumber,
        drivingLicenseExpiry: emp.drivingLicenseExpiry,
        healthCertExpiry: emp.healthCertExpiry,
        bankName: emp.bankName,
        ibanNumber: emp.ibanNumber,
        joiningDate: emp.joiningDate,
        sponsorshipStatus: emp.sponsorshipStatus,
        notes: emp.notes,
        createdAt: emp.createdAt,
      }).onConflictDoNothing();
    }

    // 4. Seed sales contracts
    for (const c of INITIAL_SALES_CONTRACTS) {
      await db.insert(salesContracts).values({
        id: c.id,
        contractCode: c.id.toUpperCase(),
        clientName: c.clientName,
        projectName: c.projectTitle,
        siteLocation: c.location,
        chemicalProducts: c.chemicalProduct,
        grossAmount: c.contractValue,
        discountAmount: c.discountAmount,
        netAmount: c.netValue,
        status: c.status,
        paymentTerms: c.paymentTerms,
        salesmanName: c.salesmanName,
        commissionRatePct: c.commissionRatePct,
        commissionEarned: c.commissionEarned,
        pushedToLedger: c.pushedToLedger,
        contractDate: c.createdAt.slice(0, 10),
        createdAt: c.createdAt,
      }).onConflictDoNothing();
    }

    // 5. Seed approval claims
    for (const clm of INITIAL_APPROVAL_CLAIMS) {
      await db.insert(approvalClaims).values({
        id: clm.id,
        submittedBy: clm.submittedBy,
        employeeRole: clm.employeeRole,
        category: clm.category,
        amount: clm.amount,
        description: clm.description,
        projectRef: clm.projectRef,
        receiptNote: clm.receiptNote,
        status: clm.status,
        managerNote: clm.managerNote,
        submittedAt: clm.submittedAt,
        reviewedAt: clm.reviewedAt,
        reviewedBy: clm.reviewedBy,
        pushedToExpenseLedger: clm.pushedToExpenseLedger,
      }).onConflictDoNothing();
    }

    // 6. Seed worker logs
    for (const wl of INITIAL_WORKER_LOGS) {
      await db.insert(workerSiteLogs).values({
        id: wl.id,
        workerName: wl.workerName,
        siteName: wl.siteName,
        taskType: wl.taskType,
        hoursLogged: wl.hoursLogged,
        status: wl.status,
        date: wl.date,
        notes: wl.notes,
        deliveryDocketNo: wl.deliveryDocketNo,
        createdAt: wl.createdAt,
      }).onConflictDoNothing();
    }

    // 7. Seed sadaqah records
    for (const s of INITIAL_SADAQAH_RECORDS) {
      await db.insert(sadaqahRecords).values({
        id: s.id,
        beneficiary: s.beneficiary,
        category: s.category,
        amount: s.amount,
        approvedBy: s.approvedBy,
        date: s.date,
        description: s.description,
        receiptNote: s.receiptNote,
        createdAt: s.createdAt,
      }).onConflictDoNothing();
    }

    // 8. Seed audit logs
    for (const a of INITIAL_AUDIT_LOGS) {
      await db.insert(auditLogs).values({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        performedBy: a.performedBy,
        userRole: a.userRole,
        details: a.details,
        timestamp: a.timestamp,
      }).onConflictDoNothing();
    }

    console.log('Database successfully seeded with DCC TRADING CO initial records.');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

import { db } from './index.ts';
import { 
  transactions, 
  saudiEmployees, 
  salesContracts, 
  approvalClaims, 
  workerSiteLogs, 
  sadaqahRecords, 
  auditLogs 
} from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// ----------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------
export async function getAllTransactions() {
  try {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  } catch (error) {
    console.error("Database query failed [getAllTransactions]:", error);
    throw new Error("Failed to fetch transactions from database.", { cause: error });
  }
}

export async function insertTransaction(data: typeof transactions.$inferInsert) {
  try {
    const result = await db.insert(transactions).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertTransaction]:", error);
    throw new Error("Failed to insert transaction into database.", { cause: error });
  }
}

export async function updateTransactionRecord(id: string, data: Partial<typeof transactions.$inferInsert>) {
  try {
    const result = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [updateTransactionRecord]:", error);
    throw new Error("Failed to update transaction in database.", { cause: error });
  }
}

export async function deleteTransactionRecord(id: string) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));
    return true;
  } catch (error) {
    console.error("Database query failed [deleteTransactionRecord]:", error);
    throw new Error("Failed to delete transaction from database.", { cause: error });
  }
}

// ----------------------------------------------------
// SAUDI EMPLOYEES
// ----------------------------------------------------
export async function getAllSaudiEmployees() {
  try {
    return await db.select().from(saudiEmployees).orderBy(saudiEmployees.employeeName);
  } catch (error) {
    console.error("Database query failed [getAllSaudiEmployees]:", error);
    throw new Error("Failed to fetch employees from database.", { cause: error });
  }
}

export async function insertSaudiEmployee(data: typeof saudiEmployees.$inferInsert) {
  try {
    const result = await db.insert(saudiEmployees).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertSaudiEmployee]:", error);
    throw new Error("Failed to insert employee into database.", { cause: error });
  }
}

export async function updateSaudiEmployeeRecord(id: string, data: Partial<typeof saudiEmployees.$inferInsert>) {
  try {
    const result = await db.update(saudiEmployees).set(data).where(eq(saudiEmployees.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [updateSaudiEmployeeRecord]:", error);
    throw new Error("Failed to update employee in database.", { cause: error });
  }
}

export async function deleteSaudiEmployeeRecord(id: string) {
  try {
    await db.delete(saudiEmployees).where(eq(saudiEmployees.id, id));
    return true;
  } catch (error) {
    console.error("Database query failed [deleteSaudiEmployeeRecord]:", error);
    throw new Error("Failed to delete employee from database.", { cause: error });
  }
}

// ----------------------------------------------------
// SALES CONTRACTS
// ----------------------------------------------------
export async function getAllSalesContracts() {
  try {
    return await db.select().from(salesContracts).orderBy(desc(salesContracts.contractDate));
  } catch (error) {
    console.error("Database query failed [getAllSalesContracts]:", error);
    throw new Error("Failed to fetch sales contracts from database.", { cause: error });
  }
}

export async function insertSalesContract(data: typeof salesContracts.$inferInsert) {
  try {
    const result = await db.insert(salesContracts).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertSalesContract]:", error);
    throw new Error("Failed to insert sales contract into database.", { cause: error });
  }
}

export async function updateSalesContractRecord(id: string, data: Partial<typeof salesContracts.$inferInsert>) {
  try {
    const result = await db.update(salesContracts).set(data).where(eq(salesContracts.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [updateSalesContractRecord]:", error);
    throw new Error("Failed to update sales contract in database.", { cause: error });
  }
}

// ----------------------------------------------------
// APPROVAL CLAIMS
// ----------------------------------------------------
export async function getAllApprovalClaims() {
  try {
    return await db.select().from(approvalClaims).orderBy(desc(approvalClaims.submittedAt));
  } catch (error) {
    console.error("Database query failed [getAllApprovalClaims]:", error);
    throw new Error("Failed to fetch claims from database.", { cause: error });
  }
}

export async function insertApprovalClaim(data: typeof approvalClaims.$inferInsert) {
  try {
    const result = await db.insert(approvalClaims).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertApprovalClaim]:", error);
    throw new Error("Failed to insert claim into database.", { cause: error });
  }
}

export async function updateApprovalClaimRecord(id: string, data: Partial<typeof approvalClaims.$inferInsert>) {
  try {
    const result = await db.update(approvalClaims).set(data).where(eq(approvalClaims.id, id)).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [updateApprovalClaimRecord]:", error);
    throw new Error("Failed to update claim in database.", { cause: error });
  }
}

// ----------------------------------------------------
// WORKER SITE LOGS
// ----------------------------------------------------
export async function getAllWorkerSiteLogs() {
  try {
    return await db.select().from(workerSiteLogs).orderBy(desc(workerSiteLogs.date));
  } catch (error) {
    console.error("Database query failed [getAllWorkerSiteLogs]:", error);
    throw new Error("Failed to fetch worker logs from database.", { cause: error });
  }
}

export async function insertWorkerSiteLog(data: typeof workerSiteLogs.$inferInsert) {
  try {
    const result = await db.insert(workerSiteLogs).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertWorkerSiteLog]:", error);
    throw new Error("Failed to insert worker log into database.", { cause: error });
  }
}

// ----------------------------------------------------
// SADAQAH RECORDS
// ----------------------------------------------------
export async function getAllSadaqahRecords() {
  try {
    return await db.select().from(sadaqahRecords).orderBy(desc(sadaqahRecords.date));
  } catch (error) {
    console.error("Database query failed [getAllSadaqahRecords]:", error);
    throw new Error("Failed to fetch Sadaqah records from database.", { cause: error });
  }
}

export async function insertSadaqahRecord(data: typeof sadaqahRecords.$inferInsert) {
  try {
    const result = await db.insert(sadaqahRecords).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertSadaqahRecord]:", error);
    throw new Error("Failed to insert Sadaqah record into database.", { cause: error });
  }
}

// ----------------------------------------------------
// AUDIT LOGS
// ----------------------------------------------------
export async function getAllAuditLogs() {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  } catch (error) {
    console.error("Database query failed [getAllAuditLogs]:", error);
    throw new Error("Failed to fetch audit logs from database.", { cause: error });
  }
}

export async function insertAuditLog(data: typeof auditLogs.$inferInsert) {
  try {
    const result = await db.insert(auditLogs).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed [insertAuditLog]:", error);
    throw new Error("Failed to insert audit log into database.", { cause: error });
  }
}

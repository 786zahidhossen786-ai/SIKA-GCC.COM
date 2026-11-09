import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  getAllTransactions,
  insertTransaction,
  updateTransactionRecord,
  deleteTransactionRecord,
  getAllSaudiEmployees,
  insertSaudiEmployee,
  updateSaudiEmployeeRecord,
  deleteSaudiEmployeeRecord,
  getAllSalesContracts,
  insertSalesContract,
  updateSalesContractRecord,
  getAllApprovalClaims,
  insertApprovalClaim,
  updateApprovalClaimRecord,
  getAllWorkerSiteLogs,
  insertWorkerSiteLog,
  getAllSadaqahRecords,
  insertSadaqahRecord,
  getAllAuditLogs,
  insertAuditLog
} from './src/db/queries.ts';
import { seedDatabase, clearDatabase } from './src/db/seed.ts';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DCC TRADING CO Cloud SQL Service', timestamp: new Date().toISOString() });
});

// User profile synchronization
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { role } = req.body;
    const dbUser = await getOrCreateUser(user.uid, user.email || 'user@dcctrading.sa', user.name, role || 'owner');
    res.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error('Error syncing user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user profile' });
  }
});

// Transactions API
app.get('/api/transactions', async (req, res) => {
  try {
    const txs = await getAllTransactions();
    res.json(txs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const result = await insertTransaction(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const result = await updateTransactionRecord(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await deleteTransactionRecord(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

// Saudi Employees API
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await getAllSaudiEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch employees' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const result = await insertSaudiEmployee(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const result = await updateSaudiEmployeeRecord(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await deleteSaudiEmployeeRecord(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
});

// Sales Contracts API
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await getAllSalesContracts();
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch contracts' });
  }
});

app.post('/api/contracts', async (req, res) => {
  try {
    const result = await insertSalesContract(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create contract' });
  }
});

app.put('/api/contracts/:id', async (req, res) => {
  try {
    const result = await updateSalesContractRecord(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update contract' });
  }
});

// Claims API
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await getAllApprovalClaims();
    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch claims' });
  }
});

app.post('/api/claims', async (req, res) => {
  try {
    const result = await insertApprovalClaim(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create claim' });
  }
});

app.put('/api/claims/:id', async (req, res) => {
  try {
    const result = await updateApprovalClaimRecord(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update claim' });
  }
});

// Worker Site Logs API
app.get('/api/worker-logs', async (req, res) => {
  try {
    const logs = await getAllWorkerSiteLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch worker logs' });
  }
});

app.post('/api/worker-logs', async (req, res) => {
  try {
    const result = await insertWorkerSiteLog(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create worker log' });
  }
});

// Corporate Sadaqah API
app.get('/api/sadaqah', async (req, res) => {
  try {
    const records = await getAllSadaqahRecords();
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch sadaqah records' });
  }
});

app.post('/api/sadaqah', async (req, res) => {
  try {
    const result = await insertSadaqahRecord(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create sadaqah record' });
  }
});

// Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await getAllAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const result = await insertAuditLog(req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create audit log' });
  }
});

// Seed / Reset API endpoints
app.post('/api/seed', async (req, res) => {
  try {
    const ok = await seedDatabase();
    res.json({ success: ok, message: 'Database initialized for DCC TRADING CO.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to initialize database' });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    const ok = await clearDatabase();
    res.json({ success: ok, message: 'All database records reset to zero state.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to clear database' });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  // Ensure basic user record exists without populating mock data
  try {
    await seedDatabase();
  } catch (err) {
    console.warn('Initial setup check:', err);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DCC TRADING CO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

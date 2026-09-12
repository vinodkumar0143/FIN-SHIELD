import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createInvoicesRouter } from './routes/invoices.routes.js';
import { createTransactionsRouter } from './routes/transactions.routes.js';
import { createVendorsRouter } from './routes/vendors.routes.js';
import { createBudgetsRouter } from './routes/budgets.routes.js';
import { InvestigationsRepository } from './repositories/investigations.repository.js';
import { WorkflowsRepository } from './repositories/workflows.repository.js';
import { ApprovalsRepository } from './repositories/approvals.repository.js';
import { AlertsRepository } from './repositories/alerts.repository.js';
import { AuditLogsRepository } from './repositories/auditLogs.repository.js';
import { requireAuth, requirePermission } from './middleware/auth.middleware.js';
import { ROLE_PERMISSIONS } from './lib/permissions.js';
dotenv.config();
export function createApp() {
    const app = express();
    app.use(cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    // Health check endpoint (Public)
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            service: 'FIN-SHIELD Financial Intelligence Engine',
            version: '4.0.0',
            timestamp: new Date().toISOString()
        });
    });
    // Phase 3: Authenticated User Context (/api/auth/me)
    app.get('/api/auth/me', requireAuth, (req, res) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
            });
            return;
        }
        const permissions = ROLE_PERMISSIONS[req.user.role] || [];
        res.json({
            success: true,
            data: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                profile: req.user.profile,
                permissions
            }
        });
    });
    // Phase 4: Core Financial Intelligence Routers
    app.use('/api/invoices', createInvoicesRouter());
    app.use('/api/transactions', createTransactionsRouter());
    app.use('/api/vendors', createVendorsRouter());
    app.use('/api/budgets', createBudgetsRouter());
    // Other Repositories
    const investigationsRepo = new InvestigationsRepository();
    const workflowsRepo = new WorkflowsRepository();
    const approvalsRepo = new ApprovalsRepository();
    const alertsRepo = new AlertsRepository();
    const auditLogsRepo = new AuditLogsRepository();
    app.get('/api/investigations', requireAuth, requirePermission('investigations.view'), async (_req, res) => {
        try {
            const data = await investigationsRepo.findAll();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
    });
    app.get('/api/workflows', requireAuth, requirePermission('workflows.view'), async (_req, res) => {
        try {
            const data = await workflowsRepo.findAll();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
    });
    app.get('/api/approvals', requireAuth, requirePermission('approvals.view'), async (_req, res) => {
        try {
            const data = await approvalsRepo.findAll();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
    });
    app.get('/api/alerts', requireAuth, requirePermission('alerts.view'), async (_req, res) => {
        try {
            const data = await alertsRepo.findAll();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
    });
    app.get('/api/audit-logs', requireAuth, requirePermission('audit.view'), async (_req, res) => {
        try {
            const data = await auditLogsRepo.findAll();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
        }
    });
    // Global Error Handler
    app.use((err, _req, res, _next) => {
        console.error('[UNHANDLED EXPRESS ERROR]', err);
        res.status(err.status || 500).json({
            success: false,
            error: {
                code: err.code || 'INTERNAL_SERVER_ERROR',
                message: err.message || 'An unexpected error occurred on the server'
            }
        });
    });
    return app;
}

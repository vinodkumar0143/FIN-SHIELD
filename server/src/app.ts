import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createInvoicesRouter } from './routes/invoices.routes.js'
import { createTransactionsRouter } from './routes/transactions.routes.js'
import { createVendorsRouter } from './routes/vendors.routes.js'
import { createBudgetsRouter } from './routes/budgets.routes.js'
import { createRiskRouter } from './routes/risk.routes.js'
import { createAnomaliesRouter } from './routes/anomalies.routes.js'
import { createEvidenceRouter } from './routes/evidence.routes.js'
import { createInvestigationsRouter } from './routes/investigations.routes.js'
import { createAiRouter } from './routes/ai.routes.js'
import { createWorkflowsRouter } from './routes/workflows.routes.js'
import { createApprovalsRouter } from './routes/approvals.routes.js'
import { createHoldsRouter } from './routes/holds.routes.js'
import { createEscalationsRouter } from './routes/escalations.routes.js'
import { createForecastingRouter } from './routes/forecasting.routes.js'
import { createAnalyticsRouter } from './routes/analytics.routes.js'
import { createReportsRouter } from './routes/reports.routes.js'
import { createAlertsRouter } from './routes/alerts.routes.js'
import { createAuditRouter } from './routes/audit.routes.js'
import { createIntegrationsRouter } from './routes/integrations.routes.js'
import { createSettingsRouter } from './routes/settings.routes.js'
import { createUsersRouter } from './routes/users.routes.js'
import { AuditLogsRepository } from './repositories/auditLogs.repository.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from './middleware/auth.middleware.js'
import { ROLE_PERMISSIONS } from './lib/permissions.js'

dotenv.config()

export function createApp(): Express {
  const app = express()

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true)
      // Allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, etc.)
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }
      if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
        return callback(null, true)
      }
      return callback(null, true) // permissive fallback for local dev
    },
    credentials: true
  }))

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Health check endpoint (Public)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'FIN-SHIELD Financial Intelligence Engine',
      version: '12.0.0',
      timestamp: new Date().toISOString()
    })
  })

  // Phase 3: Authenticated User Context (/api/auth/me)
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      })
      return
    }

    const permissions = ROLE_PERMISSIONS[req.user.role] || []

    res.json({
      success: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        permissions
      }
    })
  })

  // Phase 4 & Phase 5: Financial Intelligence & Risk Routers
  app.use('/api/invoices', createInvoicesRouter())
  app.use('/api/transactions', createTransactionsRouter())
  app.use('/api/vendors', createVendorsRouter())
  app.use('/api/budgets', createBudgetsRouter())
  app.use('/api/risk', createRiskRouter())
  app.use('/api/anomalies', createAnomaliesRouter())
  app.use('/api/evidence', createEvidenceRouter())
  app.use('/api/investigations', createInvestigationsRouter())
  app.use('/api/ai', createAiRouter())

  // Phase 7: Financial Workflow Automation & Governance Routers
  app.use('/api/workflows', createWorkflowsRouter())
  app.use('/api/approvals', createApprovalsRouter())
  app.use('/api/holds', createHoldsRouter())
  app.use('/api/escalations', createEscalationsRouter())

  // Phase 8: Forecasting, Analytics, AI Reports & Smart Alerts Routers
  app.use('/api/forecasting', createForecastingRouter())
  app.use('/api/analytics', createAnalyticsRouter())
  app.use('/api/reports', createReportsRouter())
  app.use('/api/alerts', createAlertsRouter())

  // Phase 9: Audit Trail, Integrations, Settings & Users Routers
  app.use('/api/audit', createAuditRouter())
  app.use('/api/integrations', createIntegrationsRouter())
  app.use('/api/settings', createSettingsRouter())
  app.use('/api/users', createUsersRouter())

  // System Repositories for Audit Logs
  const auditLogsRepo = new AuditLogsRepository()

  app.get('/api/audit-logs', requireAuth, requirePermission('audit.view'), async (_req, res) => {
    try {
      const data = await auditLogsRepo.findAll()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[UNHANDLED EXPRESS ERROR]', err?.message || err)
    const isProd = process.env.NODE_ENV === 'production'
    res.status(err.status || 500).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: isProd && (!err.status || err.status >= 500)
          ? 'An internal server error occurred'
          : (err.message || 'An unexpected error occurred on the server')
      }
    })
  })

  return app
}

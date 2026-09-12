import { Router, Response } from 'express'
import { ReportsService } from '../services/reports.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createReportsRouter(): Router {
  const router = Router()
  const reportsService = new ReportsService()

  /**
   * GET /api/reports
   * List all generated financial reports.
   */
  router.get('/', requireAuth, requirePermission('reports.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const type = req.query.type as string | undefined
      const reports = await reportsService.getReports(type)
      res.json({ success: true, data: reports })
    } catch (err: any) {
      console.error('[Reports API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/reports/:id
   * Single report detail and section breakdown.
   */
  router.get('/:id', requireAuth, requirePermission('reports.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reportId = String(req.params.id)
      const report = await reportsService.getReportById(reportId)
      if (!report) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } })
        return
      }
      res.json({ success: true, data: report })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/reports/generate
   * Generates a grounded AI report using Qwen and database evidence.
   */
  router.post('/generate', requireAuth, requirePermission('reports.create'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const { reportName, reportType, reportingPeriod, financialScope } = req.body

      const result = await reportsService.generateReport({
        reportName,
        reportType,
        reportingPeriod,
        financialScope,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.full_name
        }
      })

      res.status(201).json({
        success: true,
        data: result.report,
        content: result.content,
        message: 'AI Financial Report generated and verified successfully'
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'REPORT_GENERATION_ERROR', message: err.message } })
    }
  })

  return router
}

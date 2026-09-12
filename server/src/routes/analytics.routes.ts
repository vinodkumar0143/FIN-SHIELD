import { Router, Response } from 'express'
import { AnalyticsService } from '../services/analytics.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createAnalyticsRouter(): Router {
  const router = Router()
  const analyticsService = new AnalyticsService()

  /**
   * GET /api/analytics/trends
   * Macro spend, revenue velocity, and risk progression.
   */
  router.get('/trends', requireAuth, requirePermission('analytics.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await analyticsService.getMacroTrends()
      res.json({ success: true, data })
    } catch (err: any) {
      console.error('[Analytics Trends Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/analytics/spending
   * Departmental & category spend allocations.
   */
  router.get('/spending', requireAuth, requirePermission('analytics.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await analyticsService.getSpendingBreakdown()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/analytics/vendors
   * Vendor spend velocity and concentration.
   */
  router.get('/vendors', requireAuth, requirePermission('analytics.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await analyticsService.getVendorAnalytics()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/analytics/budget-performance
   * Budget allocation, burn rate, and utilization status.
   */
  router.get('/budget-performance', requireAuth, requirePermission('analytics.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await analyticsService.getBudgetPerformance()
      res.json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

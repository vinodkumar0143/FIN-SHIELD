import { Router, Response } from 'express'
import { ForecastingService } from '../services/forecasting.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createForecastingRouter(): Router {
  const router = Router()
  const forecastingService = new ForecastingService()

  /**
   * GET /api/forecasting/cash-flow
   * Parameters: ?range=7D|30D|90D|1Y
   */
  router.get('/cash-flow', requireAuth, requirePermission('forecasting.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const range = (req.query.range as any) || '30D'
      const data = await forecastingService.getCashFlowForecast(range)
      res.json({ success: true, data })
    } catch (err: any) {
      console.error('[Forecasting API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/forecasting/cash-flow/summary
   */
  router.get('/cash-flow/summary', requireAuth, requirePermission('forecasting.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const range = (req.query.range as any) || '30D'
      const summary = await forecastingService.getSummary(range)
      res.json({ success: true, data: summary })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

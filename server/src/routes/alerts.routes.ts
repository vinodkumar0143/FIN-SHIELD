import { Router, Response } from 'express'
import { SmartAlertsService } from '../services/smartAlerts.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createAlertsRouter(): Router {
  const router = Router()
  const smartAlertsService = new SmartAlertsService()

  /**
   * GET /api/alerts
   * List all alerts with optional severity, status, and type filtering.
   */
  router.get('/', requireAuth, requirePermission('alerts.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const severity = req.query.severity as any
      const status = req.query.status as any
      const type = req.query.type as string | undefined
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const alerts = await smartAlertsService.getAlerts({
        severity,
        status,
        type,
        limit,
        offset
      })

      res.json({ success: true, data: alerts })
    } catch (err: any) {
      console.error('[Alerts API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/alerts/:id
   */
  router.get('/:id', requireAuth, requirePermission('alerts.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const alertId = String(req.params.id)
      const alert = await smartAlertsService.getAlertById(alertId)
      if (!alert) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } })
        return
      }
      res.json({ success: true, data: alert })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/alerts/sync
   * Runs autonomous smart alert scan across entities.
   */
  router.post('/sync', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await smartAlertsService.syncSmartAlerts()
      res.json({
        success: true,
        data: result,
        message: `Smart alert scan complete. ${result.createdAlertsCount} new alerts generated.`
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'ALERT_SYNC_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/alerts/read-all
   */
  router.post('/read-all', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
    try {
      await smartAlertsService.markAllAsRead()
      res.json({ success: true, message: 'All alerts marked as read' })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/alerts/:id/read
   */
  router.post('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const alertId = String(req.params.id)
      const updated = await smartAlertsService.markAsRead(alertId)
      res.json({ success: true, data: updated })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/alerts/:id/resolve
   */
  router.post('/:id/resolve', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const alertId = String(req.params.id)
      const updated = await smartAlertsService.resolveAlert(alertId, {
        id: user.id,
        email: user.email,
        role: user.role
      })
      res.json({ success: true, data: updated, message: 'Alert resolved successfully' })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

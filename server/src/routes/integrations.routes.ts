import { Router, Response } from 'express'
import { IntegrationsService } from '../services/integrations.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createIntegrationsRouter(): Router {
  const router = Router()
  const integrationsService = new IntegrationsService()

  /**
   * GET /api/integrations
   * Returns list and status of all 5 platform integrations without exposing secrets.
   */
  router.get('/', requireAuth, requirePermission('integrations.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const integrations = await integrationsService.getAllIntegrations()
      res.json({ success: true, data: integrations })
    } catch (err: any) {
      console.error('[Integrations API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/integrations/:id/status
   * Real-time status probe for a single connector.
   */
  router.get('/:id/status', requireAuth, requirePermission('integrations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id)
      const integration = await integrationsService.getIntegrationById(id)

      if (!integration) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Integration ${id} not found` } })
        return
      }

      res.json({ success: true, data: integration })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/integrations/:id/test
   * Safely triggers a live health probe and records the test in audit_logs.
   */
  router.post('/:id/test', requireAuth, requirePermission('integrations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const id = String(req.params.id)

      const result = await integrationsService.testIntegration(id, {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.full_name
      })

      res.json({
        success: true,
        data: result,
        message: result.message
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'TEST_PROBE_ERROR', message: err.message } })
    }
  })

  return router
}

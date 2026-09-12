import { Router, Response } from 'express'
import { SettingsService } from '../services/settings.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createSettingsRouter(): Router {
  const router = Router()
  const settingsService = new SettingsService()

  /**
   * GET /api/settings
   * Retrieve active platform configuration.
   */
  router.get('/', requireAuth, requirePermission('settings.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const settings = await settingsService.getSettings()
      res.json({ success: true, data: settings })
    } catch (err: any) {
      console.error('[Settings API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * PATCH /api/settings
   * Update platform configuration with strict validation and audit logging.
   */
  router.patch('/', requireAuth, requirePermission('settings.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const updates = req.body || {}

      const updated = await settingsService.updateSettings(updates, {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.full_name
      })

      res.json({
        success: true,
        data: updated,
        message: 'System configuration updated successfully'
      })
    } catch (err: any) {
      res.status(400).json({ success: false, error: { code: 'SETTINGS_UPDATE_ERROR', message: err.message } })
    }
  })

  return router
}

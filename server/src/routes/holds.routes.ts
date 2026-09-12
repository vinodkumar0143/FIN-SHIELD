import { Router, Response } from 'express'
import { HoldsService } from '../services/holds.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createHoldsRouter(): Router {
  const router = Router()
  const holdsService = new HoldsService()

  /**
   * GET /api/holds
   * Lists all active and historical disbursement holds.
   */
  router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const filter = req.query.filter as 'ALL' | 'ACTIVE' | 'RELEASED' | undefined
      const holds = await holdsService.getHolds(filter)
      res.json({ success: true, data: holds })
    } catch (err: any) {
      console.error('[Holds API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/holds
   * Imposes an emergency disbursement freeze on an invoice.
   */
  router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const { invoiceId, reason } = req.body

      if (!invoiceId || !reason) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invoice ID and justification reason are required.' }
        })
        return
      }

      const holdRecord = await holdsService.placeHold({
        invoiceId: String(invoiceId),
        reason,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.full_name
        }
      })

      res.status(201).json({
        success: true,
        data: holdRecord,
        message: `Disbursement hold placed on invoice. EnterPro lock active.`
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/holds/:invoiceId/release
   * Dual-control authorization to release a payment hold.
   * Strictly limited to Finance Manager or Admin.
   */
  router.post('/:invoiceId/release', requireAuth, requirePermission('holds.release'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const invoiceId = String(req.params.invoiceId)
      const { reason } = req.body

      if (!reason || reason.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'A written justification (minimum 5 characters) is required to release an ERP hold.' }
        })
        return
      }

      const result = await holdsService.releaseHold({
        invoiceId,
        reason,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.full_name
        }
      })

      res.json(result)
    } catch (err: any) {
      const status = err.message.includes('Forbidden') ? 403 : 500
      res.status(status).json({ success: false, error: { code: 'HOLD_RELEASE_ERROR', message: err.message } })
    }
  })

  return router
}

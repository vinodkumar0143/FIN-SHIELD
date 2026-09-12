import { Router, Response } from 'express'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createAuditRouter(): Router {
  const router = Router()
  const auditRepo = new AuditLogsRepository()

  /**
   * GET /api/audit
   * Query immutable audit trail events with pagination and multi-field filters.
   */
  router.get('/', requireAuth, requirePermission('audit.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        startDate,
        endDate,
        userId,
        action,
        entityType,
        source,
        search,
        limit = '50',
        offset = '0'
      } = req.query

      const result = await auditRepo.findWithFilters({
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId as string,
        action: action as string,
        entityType: entityType as string,
        source: source as string,
        search: search as string,
        limit: Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50)),
        offset: Math.max(0, parseInt(offset as string, 10) || 0)
      })

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          limit: parseInt(limit as string, 10) || 50,
          offset: parseInt(offset as string, 10) || 0
        }
      })
    } catch (err: any) {
      console.error('[Audit API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/audit/:id
   * Single audit event inspection with full previous and new state diffs.
   */
  router.get('/:id', requireAuth, requirePermission('audit.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id)
      const entry = await auditRepo.findById(id)

      if (!entry) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit record not found' } })
        return
      }

      res.json({ success: true, data: entry })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  // Read-only integrity: Reject any attempts to alter or purge audit logs
  const rejectMutation = (_req: AuthenticatedRequest, res: Response) => {
    res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'FIN-SHIELD audit records are cryptographically protected and immutable. Modifications are strictly forbidden.'
      }
    })
  }

  router.post('*', rejectMutation)
  router.put('*', rejectMutation)
  router.patch('*', rejectMutation)
  router.delete('*', rejectMutation)

  return router
}

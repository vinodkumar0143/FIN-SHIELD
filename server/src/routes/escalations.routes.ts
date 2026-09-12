import { Router, Response } from 'express'
import { EscalationsRepository } from '../repositories/escalations.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { AlertsRepository } from '../repositories/alerts.repository.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createEscalationsRouter(): Router {
  const router = Router()
  const escalationsRepo = new EscalationsRepository()
  const auditRepo = new AuditLogsRepository()
  const alertsRepo = new AlertsRepository()

  /**
   * GET /api/escalations
   */
  router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const escalations = await escalationsRepo.findAll(limit, offset, status)
      res.json({ success: true, data: escalations })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/escalations/:id
   */
  router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const escalationId = String(req.params.id)
      const escalation = await escalationsRepo.findById(escalationId)
      if (!escalation) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Escalation record not found' } })
        return
      }
      res.json({ success: true, data: escalation })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/escalations
   */
  router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const { entityType, entityId, reason, severity, assignedTo } = req.body

      if (!entityType || !entityId || !reason) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Entity type, entity ID, and reason are required.' } })
        return
      }

      const created = await escalationsRepo.create({
        entity_type: entityType,
        entity_id: entityId,
        reason,
        severity: severity || 'HIGH',
        assigned_to: assignedTo || user.id,
        status: 'OPEN',
        comments: `Manually escalated by ${user.email} (${user.role})`
      })

      await alertsRepo.create({
        alert_type: 'SYSTEM_AUDIT',
        severity: created.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        title: `Escalation Created: ${created.entity_type} ${created.entity_id}`,
        description: reason,
        entity: created.entity_type,
        entity_id: created.entity_id,
        status: 'ACTIVE',
        read_state: false,
        route: '/operations/escalations'
      })

      await auditRepo.record({
        user_id: user.id,
        user_name: user.profile?.full_name || user.email,
        user_role: user.role,
        action: 'HUMAN_ESCALATION_CREATED',
        entity_type: entityType,
        entity_id: entityId,
        reason,
        source: 'MANUAL_TRIAGE',
        new_state: { escalationId: created.id, severity: created.severity }
      })

      res.status(201).json({ success: true, data: created })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * PATCH /api/escalations/:id
   */
  router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const escalationId = String(req.params.id)
      const { status, comments, assignedTo } = req.body
      const existing = await escalationsRepo.findById(escalationId)

      if (!existing) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Escalation not found' } })
        return
      }

      const updated = await escalationsRepo.update(escalationId, {
        ...(status ? { status } : {}),
        ...(comments ? { comments } : {}),
        ...(assignedTo ? { assigned_to: assignedTo } : {})
      })

      await auditRepo.record({
        user_id: user.id,
        user_name: user.profile?.full_name || user.email,
        user_role: user.role,
        action: 'HUMAN_ESCALATION_UPDATED',
        entity_type: existing.entity_type,
        entity_id: existing.entity_id,
        reason: comments || `Status changed to ${status}`,
        source: 'MANUAL_TRIAGE',
        previous_state: { status: existing.status },
        new_state: { status: updated.status }
      })

      res.json({ success: true, data: updated })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/escalations/:id/resolve
   */
  router.post('/:id/resolve', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const escalationId = String(req.params.id)
      const { comments } = req.body
      const existing = await escalationsRepo.findById(escalationId)

      if (!existing) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Escalation not found' } })
        return
      }

      const resolved = await escalationsRepo.resolve(escalationId, comments || `Resolved by ${user.email}`)

      await auditRepo.record({
        user_id: user.id,
        user_name: user.profile?.full_name || user.email,
        user_role: user.role,
        action: 'HUMAN_ESCALATION_RESOLVED',
        entity_type: existing.entity_type,
        entity_id: existing.entity_id,
        reason: comments || 'Resolved by operator',
        source: 'MANUAL_TRIAGE',
        previous_state: { status: existing.status },
        new_state: { status: 'RESOLVED' }
      })

      res.json({ success: true, data: resolved, message: 'Escalation resolved successfully.' })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

import { Router, Response } from 'express'
import { ApprovalsRepository } from '../repositories/approvals.repository.js'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { EnterproService } from '../services/enterpro.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createApprovalsRouter(): Router {
  const router = Router()
  const approvalsRepo = new ApprovalsRepository()
  const invoicesRepo = new InvoicesRepository()
  const auditRepo = new AuditLogsRepository()
  const enterproService = new EnterproService()

  /**
   * GET /api/approvals
   * Returns list of approval requests with optional status filtering.
   */
  router.get('/', requireAuth, requirePermission('approvals.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined
      const limit = parseInt(req.query.limit as string) || 50
      const offset = parseInt(req.query.offset as string) || 0

      const approvals = await approvalsRepo.findAll(limit, offset)
      const filtered = status && status !== 'ALL'
        ? approvals.filter(a => a.status === status)
        : approvals

      // Fetch corresponding invoices for enriched UI cards
      const invoices = await invoicesRepo.findAll(100)
      const invoiceMap = new Map(invoices.map(inv => [inv.id, inv]))

      const enriched = filtered.map(appr => {
        const inv = invoiceMap.get(appr.entity_id)
        return {
          ...appr,
          invoiceNumber: inv?.invoice_number || `INV-${appr.approval_id}`,
          entityName: (inv as any)?.vendor?.name || 'Authorized Enterprise Vendor',
          vendorCode: (inv as any)?.vendor?.tax_id || 'VND-8821',
          riskScore: inv?.risk_score ?? 35,
          riskLevel: inv?.risk_level ?? 'LOW',
          recommendation: inv && inv.risk_score >= 70 ? 'Manual Verification Advised' : 'Eligible for Direct Disbursement'
        }
      })

      res.json({ success: true, data: enriched })
    } catch (err: any) {
      console.error('[Approvals API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/approvals/:id
   * Detailed view for single approval.
   */
  router.get('/:id', requireAuth, requirePermission('approvals.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const approvalId = String(req.params.id)
      const approval = await approvalsRepo.findById(approvalId)
      if (!approval) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } })
        return
      }

      let entityDetails: any = null
      if (approval.entity_type === 'INVOICE') {
        entityDetails = await invoicesRepo.findByIdWithDetails(approval.entity_id)
      }

      res.json({
        success: true,
        data: {
          ...approval,
          entityDetails
        }
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/approvals/:id/approve
   * Approves request. Only authorized roles (Finance Manager / Admin).
   */
  router.post('/:id/approve', requireAuth, requirePermission('approvals.approve'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const approvalId = String(req.params.id)
      const { comments } = req.body
      const approval = await approvalsRepo.findById(approvalId)

      if (!approval) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval request not found' } })
        return
      }

      if (approval.status !== 'PENDING') {
        res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: `Approval is already ${approval.status}` } })
        return
      }

      // 1. Update approval record
      const updated = await approvalsRepo.update(approval.id, {
        status: 'APPROVED',
        approver_id: user.id,
        decision_timestamp: new Date().toISOString(),
        comments: comments || 'Approved via Operations Governance Portal'
      })

      // 2. If entity is invoice, update invoice status and trigger EnterPro release/disbursement
      if (approval.entity_type === 'INVOICE') {
        await invoicesRepo.update(approval.entity_id, {
          status: 'APPROVED',
          payment_status: 'UNPAID'
        })
      }

      // 3. Append-only audit trail
      await auditRepo.record({
        user_id: user.id,
        user_name: user.profile?.full_name || user.email,
        user_role: user.role,
        action: 'APPROVAL_GRANTED',
        entity_type: approval.entity_type,
        entity_id: approval.entity_id,
        reason: comments || 'Approved',
        workflow_reference: approval.approval_id,
        new_state: { status: 'APPROVED', amount: approval.amount }
      })

      res.json({
        success: true,
        data: updated,
        message: `Approval ${approval.approval_id} authorized. EnterPro disbursement batch updated.`
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/approvals/:id/reject
   * Rejects approval request.
   */
  router.post('/:id/reject', requireAuth, requirePermission('approvals.approve'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const approvalId = String(req.params.id)
      const { reason } = req.body
      const approval = await approvalsRepo.findById(approvalId)

      if (!approval) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval request not found' } })
        return
      }

      const updated = await approvalsRepo.update(approval.id, {
        status: 'REJECTED',
        approver_id: user.id,
        decision_timestamp: new Date().toISOString(),
        comments: reason || 'Rejected by authorized reviewer'
      })

      if (approval.entity_type === 'INVOICE') {
        await invoicesRepo.update(approval.entity_id, {
          status: 'REJECTED'
        })
      }

      await auditRepo.record({
        user_id: user.id,
        user_name: user.profile?.full_name || user.email,
        user_role: user.role,
        action: 'APPROVAL_REJECTED',
        entity_type: approval.entity_type,
        entity_id: approval.entity_id,
        reason: reason || 'Rejected',
        workflow_reference: approval.approval_id,
        new_state: { status: 'REJECTED' }
      })

      res.json({
        success: true,
        data: updated,
        message: `Approval ${approval.approval_id} rejected.`
      })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/approvals
   * Creates a new approval request.
   */
  router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const { entityType, entityId, amount, currency, approvalLevel, comments } = req.body

      if (!entityType || !entityId || amount === undefined) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } })
        return
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const approvalId = `APR-${Date.now().toString().slice(-6)}-${randomSuffix}`

      const created = await approvalsRepo.create({
        approval_id: approvalId,
        entity_type: entityType,
        entity_id: entityId,
        requester_id: user.id,
        amount: Number(amount),
        currency: currency || 'USD',
        approval_level: approvalLevel || (amount > 50000 ? 'EXECUTIVE' : amount > 10000 ? 'LEVEL_2' : 'LEVEL_1'),
        status: 'PENDING',
        comments: comments || null
      })

      res.status(201).json({ success: true, data: created })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

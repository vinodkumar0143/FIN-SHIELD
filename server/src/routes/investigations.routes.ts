import { Router, Response } from 'express'
import { InvestigationsRepository } from '../repositories/investigations.repository.js'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { RecommendationsRepository } from '../repositories/recommendations.repository.js'
import { supabaseAdmin } from '../config/supabase.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createInvestigationsRouter(): Router {
  const router = Router()
  const investigationsRepo = new InvestigationsRepository()
  const invoicesRepo = new InvoicesRepository()
  const auditLogsRepo = new AuditLogsRepository()
  const recommendationsRepo = new RecommendationsRepository()

  // Create an Investigation
  router.post('/', requireAuth, requirePermission('investigations.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entity_type, entity_id, title, summary, risk_score, risk_level, recommendation } = req.body
      const invId = `INV-ST-${(entity_id || Date.now().toString()).substring(0, 8).toUpperCase()}`

      const created = await investigationsRepo.create({
        investigation_id: invId,
        entity_type: entity_type || 'INVOICE',
        entity_id,
        title: title || `Investigation: ${invId}`,
        summary: summary || 'Manually initiated investigation dossier.',
        risk_score: risk_score || 50,
        risk_level: risk_level || 'MEDIUM',
        status: 'OPEN',
        recommendation,
        assigned_to: req.user?.profile?.full_name || req.user?.email || 'Investigator'
      })

      res.status(201).json({
        success: true,
        data: created
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVESTIGATION_CREATE_ERROR', message: err.message }
      })
    }
  })

  // 1. List Investigations with Filters & Pagination
  router.get('/', requireAuth, requirePermission('investigations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20
      const offset = (page - 1) * pageSize

      let query = supabaseAdmin
        .from('investigations')
        .select('*', { count: 'exact' })

      if (req.query.status && req.query.status !== 'ALL') {
        query = query.eq('status', req.query.status as any)
      }

      if (req.query.severity && req.query.severity !== 'ALL') {
        const sev = req.query.severity as string
        query = query.eq('risk_level', sev.toUpperCase() as any)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      const { data, count, error } = await query
      if (error) throw error

      // Enrich with evidence count
      const investigations = data || []
      const enriched = await Promise.all(
        investigations.map(async inv => {
          const evidence = await investigationsRepo.findEvidence(inv.id)
          return {
            ...inv,
            evidenceCount: evidence.length,
            evidence: evidence
          }
        })
      )

      res.json({
        success: true,
        data: {
          investigations: enriched,
          total: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize) || 1
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVESTIGATIONS_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Single Investigation Detail with Evidence & Recommendations
  router.get('/:id', requireAuth, requirePermission('investigations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const idOrInvestigationId = req.params.id as string

      // Try finding by UUID or human investigation_id (e.g. INV-CASE-28491)
      let investigation = await investigationsRepo.findById(idOrInvestigationId)
      if (!investigation) {
        investigation = await investigationsRepo.findByInvestigationId(idOrInvestigationId)
      }

      // If still not found, check if it's an invoice UUID linked to an investigation
      if (!investigation) {
        const { data: invByEntity } = await supabaseAdmin
          .from('investigations')
          .select('*')
          .eq('entity_id', idOrInvestigationId)
          .maybeSingle()
        investigation = invByEntity
      }

      if (!investigation) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Investigation record not found' }
        })
        return
      }

      // Fetch evidence items and recommendations
      const [evidence, recommendations] = await Promise.all([
        investigationsRepo.findEvidence(investigation.id),
        recommendationsRepo.findByInvestigationId(investigation.id).catch(() => [])
      ])

      // Fetch linked invoice if entity_type is INVOICE
      let linkedInvoice: any = null
      if (investigation.entity_type === 'INVOICE') {
        linkedInvoice = await invoicesRepo.findByIdWithDetails(investigation.entity_id)
      }

      res.json({
        success: true,
        data: {
          investigation,
          evidence,
          recommendations,
          linkedInvoice
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVESTIGATION_DETAIL_ERROR', message: err.message }
      })
    }
  })

  // 3. Update Investigation Status
  router.patch('/:id', requireAuth, requirePermission('investigations.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string
      const { status, recommendation } = req.body

      const updated = await investigationsRepo.update(id, {
        status: status || undefined,
        recommendation: recommendation || undefined,
        resolved_at: status === 'RESOLVED' ? new Date().toISOString() : undefined
      })

      // Record Audit
      await auditLogsRepo.record({
        user_id: req.user?.id || null,
        user_name: req.user?.profile?.full_name || req.user?.email || 'Investigator',
        user_role: req.user?.role || 'FINANCE_MANAGER',
        action: 'INVESTIGATION_UPDATED',
        entity_type: 'investigation',
        entity_id: id,
        source: 'FIN-SHIELD Cockpit',
        new_state: { status: updated.status }
      })

      res.json({
        success: true,
        data: updated
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'INVESTIGATION_UPDATE_ERROR', message: err.message }
      })
    }
  })

  return router
}

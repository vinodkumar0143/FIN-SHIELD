import { Router, Response } from 'express'
import { EvidenceAggregationService } from '../services/evidenceAggregation.service.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createEvidenceRouter(): Router {
  const router = Router()
  const evidenceAggregator = new EvidenceAggregationService()

  // 1. Normalized Multi-Source Evidence Package for Entity
  router.get('/:entityType/:entityId', requireAuth, requirePermission('investigations.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const entityType = (req.params.entityType as string).toUpperCase() as any
      const entityId = req.params.entityId as string

      const validTypes = ['INVOICE', 'TRANSACTION', 'VENDOR', 'BUDGET']
      if (!validTypes.includes(entityType)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ENTITY_TYPE', message: `entityType must be one of: ${validTypes.join(', ')}` }
        })
        return
      }

      const evidencePackage = await evidenceAggregator.aggregateEntityEvidence(entityType, entityId, {
        id: req.user?.id,
        name: req.user?.profile?.full_name || req.user?.email,
        role: req.user?.role
      })

      res.json({
        success: true,
        data: evidencePackage
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'EVIDENCE_AGGREGATION_ERROR', message: err.message }
      })
    }
  })

  return router
}

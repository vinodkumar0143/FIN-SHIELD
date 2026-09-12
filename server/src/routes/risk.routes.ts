import { Router, Response } from 'express'
import { RiskAssessmentsRepository } from '../repositories/riskAssessments.repository.js'
import { EvidenceAggregationService } from '../services/evidenceAggregation.service.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createRiskRouter(): Router {
  const router = Router()
  const riskRepo = new RiskAssessmentsRepository()
  const evidenceAggregator = new EvidenceAggregationService()

  // 1. Global Risk Metrics & High-Risk Entity Matrix
  router.get('/', requireAuth, requirePermission('risk.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20
      const offset = (page - 1) * pageSize

      const [metrics, assessments] = await Promise.all([
        riskRepo.getGlobalMetrics(),
        riskRepo.findAll({
          entityType: req.query.entityType as any,
          riskLevel: req.query.riskLevel as any,
          limit: pageSize,
          offset
        })
      ])

      res.json({
        success: true,
        data: {
          metrics,
          assessments: assessments.data,
          total: assessments.total,
          page,
          pageSize,
          totalPages: Math.ceil(assessments.total / pageSize) || 1
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'RISK_MATRIX_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Single Entity Risk Assessment Breakdown
  router.get('/:entityType/:entityId', requireAuth, requirePermission('risk.view'), async (req: AuthenticatedRequest, res: Response) => {
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

      const result = await evidenceAggregator.aggregateEntityEvidence(entityType, entityId, {
        id: req.user?.id,
        name: req.user?.profile?.full_name || req.user?.email,
        role: req.user?.role
      })

      res.json({
        success: true,
        data: result
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ENTITY_RISK_EVALUATION_ERROR', message: err.message }
      })
    }
  })

  return router
}

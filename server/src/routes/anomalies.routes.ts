import { Router, Response } from 'express'
import { AnomalyDetectionService, DetectedAnomaly } from '../services/anomalyDetection.service.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createAnomaliesRouter(): Router {
  const router = Router()
  const anomalyService = new AnomalyDetectionService()

  // 1. List Detected Financial Anomalies with Filters & Pagination
  router.get('/', requireAuth, requirePermission('risk.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const severityFilter = req.query.severity as string
      const entityTypeFilter = req.query.entityType as string
      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 20

      // Run deterministic anomaly sweep across financial entities
      let filtered = await anomalyService.detectAllAnomalies()

      if (severityFilter && severityFilter !== 'ALL') {
        filtered = filtered.filter(a => a.severity === severityFilter)
      }

      if (entityTypeFilter && entityTypeFilter !== 'ALL') {
        filtered = filtered.filter(a => a.entity_type === entityTypeFilter)
      }

      // Sort by severity descending: CRITICAL -> HIGH -> MEDIUM -> LOW
      const severityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      filtered.sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0))

      const total = filtered.length
      const offset = (page - 1) * pageSize
      const paginated = filtered.slice(offset, offset + pageSize)

      res.json({
        success: true,
        data: {
          anomalies: paginated,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize) || 1
        }
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ANOMALIES_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Single Anomaly Detail
  router.get('/:id', requireAuth, requirePermission('risk.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const anomalyId = req.params.id as string

      // If ID references an invoice or entity, extract entityId
      const parts = anomalyId.split('-')
      const entityId = parts.slice(2).join('-') || anomalyId

      const anomalies = await anomalyService.detectInvoiceAnomalies(entityId)
      const found = anomalies.find(a => a.id === anomalyId) || anomalies[0]

      if (!found) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Anomaly record not found' }
        })
        return
      }

      res.json({
        success: true,
        data: found
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'ANOMALY_DETAIL_ERROR', message: err.message }
      })
    }
  })

  return router
}

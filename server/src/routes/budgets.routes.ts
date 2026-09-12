import { Router, Response } from 'express'
import { BudgetMonitoringService } from '../services/budgetMonitoring.service.js'
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest
} from '../middleware/auth.middleware.js'

export function createBudgetsRouter(): Router {
  const router = Router()
  const monitoringService = new BudgetMonitoringService()

  // 1. List Budgets with Computed Utilization & Health Statuses
  router.get('/', requireAuth, requirePermission('budgets.view'), async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const budgets = await monitoringService.getAllBudgets()
      res.json({
        success: true,
        data: budgets
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'BUDGETS_FETCH_ERROR', message: err.message }
      })
    }
  })

  // 2. Budget Detail with Impacting Transactions & Invoices
  router.get('/:id', requireAuth, requirePermission('budgets.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const budget = await monitoringService.getBudgetById(req.params.id as string)
      if (!budget) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Budget record not found' }
        })
        return
      }

      res.json({
        success: true,
        data: budget
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'BUDGET_FETCH_ERROR', message: err.message }
      })
    }
  })

  return router
}

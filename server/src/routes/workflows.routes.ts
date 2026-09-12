import { Router, Response } from 'express'
import { EnterproService } from '../services/enterpro.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'

export function createWorkflowsRouter(): Router {
  const router = Router()
  const enterproService = new EnterproService()

  /**
   * GET /api/workflows
   */
  router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined
      const limit = parseInt(req.query.limit as string) || 50
      const workflows = await enterproService.listWorkflows(status, limit)
      res.json({ success: true, data: workflows })
    } catch (err: any) {
      console.error('[Workflows API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/workflows/:taskId
   */
  router.get('/:taskId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const taskId = String(req.params.taskId)
      const workflow = await enterproService.getWorkflowStatus(taskId)
      if (!workflow) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workflow task not found' } })
        return
      }
      res.json({ success: true, data: workflow })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/workflows
   */
  router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const { entityType, entityId, workflowType, priority, assignedRole, reason, metadata } = req.body

      if (!entityType || !entityId || !workflowType) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Entity type, entity ID, and workflow type are required.' }
        })
        return
      }

      const workflow = await enterproService.createWorkflow({
        entityType,
        entityId,
        workflowType,
        priority,
        assignedRole,
        reason,
        triggeredBy: user.id,
        metadata
      })

      res.status(201).json({ success: true, data: workflow })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/workflows/:taskId/action
   */
  router.post('/:taskId/action', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!
      const taskId = String(req.params.taskId)
      const { action, comments, metadata } = req.body

      if (!action) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Action name is required.' } })
        return
      }

      const result = await enterproService.triggerAction({
        taskId,
        action,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.full_name
        },
        comments,
        metadata
      })

      res.json(result)
    } catch (err: any) {
      const status = err.message.includes('Forbidden') ? 403 : 500
      res.status(status).json({ success: false, error: { code: 'WORKFLOW_ACTION_ERROR', message: err.message } })
    }
  })

  /**
   * POST /api/workflows/webhook
   * Simulated external EnterPro ERP callback.
   */
  router.post('/webhook', async (req, res) => {
    try {
      const { taskId, event, status } = req.body
      console.log(`[EnterPro Webhook Received] taskId=${taskId}, event=${event}, status=${status}`)
      res.json({ success: true, received: true })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'WEBHOOK_ERROR', message: err.message } })
    }
  })

  return router
}

import { Router, Response } from 'express'
import { UsersService } from '../services/users.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type { UserRole } from '../lib/permissions.js'

export function createUsersRouter(): Router {
  const router = Router()
  const usersService = new UsersService()

  /**
   * GET /api/users
   * List all user profiles with optional search and role/status filtering.
   */
  router.get('/', requireAuth, requirePermission('users.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { search, role, status, limit = '50', offset = '0' } = req.query

      const result = await usersService.getUsers({
        search: search as string,
        role: role as string,
        status: status as string,
        limit: Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50)),
        offset: Math.max(0, parseInt(offset as string, 10) || 0)
      })

      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          limit: parseInt(limit as string, 10) || 50,
          offset: parseInt(offset as string, 10) || 0
        }
      })
    } catch (err: any) {
      console.error('[Users API Error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * GET /api/users/:id
   * Single profile detail.
   */
  router.get('/:id', requireAuth, requirePermission('users.view'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = String(req.params.id)
      const user = await usersService.getUserById(id)

      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } })
        return
      }

      res.json({ success: true, data: user })
    } catch (err: any) {
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  /**
   * PATCH /api/users/:id/role
   * Assign or modify user role with strict self-elevation defenses.
   */
  router.patch('/:id/role', requireAuth, requirePermission('users.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actor = req.user!
      const targetUserId = String(req.params.id)
      const { role } = req.body

      if (!role) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Role parameter is required' } })
        return
      }

      const updated = await usersService.updateUserRole(targetUserId, role as UserRole, {
        id: actor.id,
        email: actor.email,
        role: actor.role,
        fullName: actor.profile?.full_name
      })

      res.json({
        success: true,
        data: updated,
        message: `User role updated to ${role} successfully`
      })
    } catch (err: any) {
      const isSecurityViolation = err.message?.includes('Security Violation')
      res.status(isSecurityViolation ? 403 : 400).json({
        success: false,
        error: { code: isSecurityViolation ? 'FORBIDDEN' : 'USER_ROLE_UPDATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * PATCH /api/users/:id/status
   * Activate or suspend user account.
   */
  router.patch('/:id/status', requireAuth, requirePermission('users.manage'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actor = req.user!
      const targetUserId = String(req.params.id)
      const { status } = req.body

      if (!status) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Status parameter is required' } })
        return
      }

      const updated = await usersService.updateUserStatus(targetUserId, status, {
        id: actor.id,
        email: actor.email,
        role: actor.role,
        fullName: actor.profile?.full_name
      })

      res.json({
        success: true,
        data: updated,
        message: `User status updated to ${status} successfully`
      })
    } catch (err: any) {
      const isSecurityViolation = err.message?.includes('Security Violation')
      res.status(isSecurityViolation ? 403 : 400).json({
        success: false,
        error: { code: isSecurityViolation ? 'FORBIDDEN' : 'USER_STATUS_UPDATE_ERROR', message: err.message }
      })
    }
  })

  return router
}

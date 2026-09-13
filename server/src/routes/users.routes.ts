import { Router, Request, Response } from 'express'
import { UsersService } from '../services/users.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type { UserRole } from '../lib/permissions.js'
import { supabaseAdmin } from '../config/supabase.js'

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
   * GET /api/users/check-email
   * Public check to determine whether an email account exists in Supabase.
   * Used by Hackathon Sign-In to give specific feedback:
   * "Email not found. Please create an account first." vs "Incorrect password."
   */
  router.get('/check-email', async (req: Request, res: Response) => {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : ''
      if (!email) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Email query parameter is required' } })
        return
      }

      // Check profiles table
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, status')
        .ilike('email', email)
        .maybeSingle()

      let exists = !!profile

      // If not in profiles, check auth.users via admin API
      if (!exists) {
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 })
          const match = usersData?.users?.find(u => u.email?.toLowerCase() === email)
          if (match) {
            exists = true
          }
        } catch (authErr: any) {
          console.warn('[check-email auth lookup warning]', authErr.message)
        }
      }

      res.json({
        success: true,
        data: {
          exists,
          status: profile?.status || 'ACTIVE'
        }
      })
    } catch (err: any) {
      console.error('[check-email error]', err)
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

  /**
   * POST /api/users/context
   * HACKATHON PROTOTYPE: Allows any authenticated user to select and persist
   * any available Department and Role (Admin, Finance Manager, Finance Analyst, Employee).
   * Note: This permissive configuration is specifically for the hackathon prototype.
   */
  router.post('/context', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actor = req.user!
      const { department, role } = req.body

      const validDepartments = ['Finance', 'Treasury', 'Forensics', 'Operations', 'Procurement']
      const validRoles: UserRole[] = ['ADMIN', 'FINANCE_MANAGER', 'FINANCE_ANALYST', 'EMPLOYEE']

      if (!department || !role) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Department and Role are required' }
        })
        return
      }

      if (!validDepartments.includes(department)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_DEPARTMENT', message: `Invalid department '${department}' specified.` }
        })
        return
      }

      if (!validRoles.includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ROLE', message: `Invalid role '${role}' specified.` }
        })
        return
      }

      const existingProfile = actor.profile
      const fullName = existingProfile?.full_name || actor.email.split('@')[0] || 'User'

      // Persist chosen Department and Role to public.profiles
      const { data: updatedProfile, error: upsertErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: actor.id,
          full_name: fullName,
          email: actor.email,
          department,
          role: role as UserRole,
          status: existingProfile?.status || 'ACTIVE',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (upsertErr) {
        throw upsertErr
      }

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Workspace context confirmed successfully'
      })
    } catch (err: any) {
      console.error('[Users API context error]', err)
      res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
    }
  })

  return router
}

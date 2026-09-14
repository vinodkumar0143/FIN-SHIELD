import { Router, Request, Response } from 'express'
import { UsersService } from '../services/users.service.js'
import { requireAuth, requirePermission, type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type { UserRole } from '../lib/permissions.js'
import { supabaseAdmin } from '../config/supabase.js'
import type { Database } from '../types/database.types.js'

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
   * Allows authenticated users to select and persist their Department and Role.
   * Uses server-side supabaseAdmin to safely create/update public.profiles without browser RLS blocks.
   */
  router.post('/context', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const actor = req.user!
      // Requirement: Profile row ID MUST come strictly from authenticated JWT user ID. Never accept client body ID.
      const targetUserId = actor.id

      const { department, role } = req.body

      if (!department || !role) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Department and Role are required' }
        })
        return
      }

      // 1. Validate and normalize Department against allowed list
      const ALLOWED_DEPARTMENTS = ['Finance', 'Treasury', 'Forensics', 'Operations', 'Procurement']
      const matchedDept = ALLOWED_DEPARTMENTS.find(
        d => d.toLowerCase() === String(department).trim().toLowerCase()
      )

      if (!matchedDept) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DEPARTMENT',
            message: `Invalid department '${department}'. Allowed: ${ALLOWED_DEPARTMENTS.join(', ')}`
          }
        })
        return
      }

      // 2. Validate and normalize Role against allowed list (supports both Enum and Display Name)
      const ROLE_MAP: Record<string, UserRole> = {
        'ADMIN': 'ADMIN',
        'Admin': 'ADMIN',
        'admin': 'ADMIN',
        'FINANCE_MANAGER': 'FINANCE_MANAGER',
        'Finance Manager': 'FINANCE_MANAGER',
        'finance_manager': 'FINANCE_MANAGER',
        'FINANCE_ANALYST': 'FINANCE_ANALYST',
        'Finance Analyst': 'FINANCE_ANALYST',
        'finance_analyst': 'FINANCE_ANALYST',
        'EMPLOYEE': 'EMPLOYEE',
        'Employee': 'EMPLOYEE',
        'employee': 'EMPLOYEE'
      }

      const normalizedRole = ROLE_MAP[String(role).trim()]
      if (!normalizedRole) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: `Invalid role '${role}'. Allowed: Admin, Finance Manager, Finance Analyst, Employee`
          }
        })
        return
      }

      // 3. Inspect existing profile using privileged server supabaseAdmin client
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle()

      // 4. Security Check: Inactive / Suspended account defense
      // CASE 3 & CASE 4: Existing INACTIVE or SUSPENDED profile must NEVER be reactivated or modified through context selection.
      if (existingProfile) {
        if (existingProfile.status === 'INACTIVE') {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: 'Your FinShield account is not currently active. Please contact your administrator.'
            }
          })
          return
        }

        if (existingProfile.status === 'SUSPENDED') {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: 'Your FinShield account is suspended. Please contact your administrator.'
            }
          })
          return
        }

        if (existingProfile.status !== 'ACTIVE') {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: 'Your FinShield account is not active. Please contact your administrator.'
            }
          })
          return
        }
      }

      // 5. Ensure valid email for NOT NULL / UNIQUE constraint on public.profiles
      let userEmail = existingProfile?.email || actor.email
      if (!userEmail) {
        try {
          const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(targetUserId)
          if (authUserData?.user?.email) {
            userEmail = authUserData.user.email
          }
        } catch (authErr: any) {
          console.warn('[USERS CONTEXT] Fallback auth email lookup notice:', authErr.message)
        }
      }

      if (!userEmail) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_EMAIL',
            message: 'User email could not be resolved from authenticated session.'
          }
        })
        return
      }

      // 6. Resolve user name and avatar from existing profile or auth metadata
      const userMeta = actor.user_metadata || {}
      const fullName =
        existingProfile?.full_name ||
        userMeta.full_name ||
        userMeta.name ||
        userEmail.split('@')[0] ||
        'User'
      const avatarUrl =
        existingProfile?.avatar_url ||
        userMeta.avatar_url ||
        userMeta.picture ||
        null

      let updatedProfile: Database['public']['Tables']['profiles']['Row'] | null = null

      if (existingProfile) {
        // CASE 2 — EXISTING ACTIVE PROFILE:
        // Update department and role only.
        // Strictly PRESERVE existing status = 'ACTIVE'. Do NOT modify status. Do NOT create duplicate rows.
        const { data, error: updateErr } = await supabaseAdmin
          .from('profiles')
          .update({
            department: matchedDept,
            role: normalizedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId)
          .select()
          .single()

        if (updateErr) {
          console.error('[Users API context update error]', updateErr)
          throw updateErr
        }
        updatedProfile = data
      } else {
        // CASE 1 — NEW PROFILE:
        // No public.profiles row exists for authenticated JWT user.
        // Insert new profile with status = 'ACTIVE'.
        const { data, error: insertErr } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: targetUserId,
            full_name: fullName,
            email: userEmail,
            department: matchedDept,
            role: normalizedRole,
            avatar_url: avatarUrl,
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertErr) {
          // If concurrent insert occurred, perform safe update on department/role only
          if (insertErr.code === '23505') {
            const { data: fallbackData, error: fallbackErr } = await supabaseAdmin
              .from('profiles')
              .update({
                department: matchedDept,
                role: normalizedRole,
                updated_at: new Date().toISOString()
              })
              .eq('id', targetUserId)
              .select()
              .single()

            if (fallbackErr) throw fallbackErr
            updatedProfile = fallbackData
          } else {
            console.error('[Users API context insert error]', insertErr)
            throw insertErr
          }
        } else {
          updatedProfile = data
        }
      }

      res.json({
        success: true,
        profile: updatedProfile,
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

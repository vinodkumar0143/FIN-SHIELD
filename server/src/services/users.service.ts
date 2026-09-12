import { UsersRepository, ProfileRow, UserQueryFilters } from '../repositories/users.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import type { UserRole } from '../lib/permissions.js'

const ALLOWED_ROLES: UserRole[] = ['ADMIN', 'FINANCE_MANAGER', 'FINANCE_ANALYST', 'EMPLOYEE']
const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED']

export class UsersService {
  constructor(
    private usersRepo: UsersRepository = new UsersRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  async getUsers(filters: UserQueryFilters = {}): Promise<{ users: ProfileRow[]; total: number }> {
    return this.usersRepo.findAll(filters)
  }

  async getUserById(id: string): Promise<ProfileRow | null> {
    return this.usersRepo.findById(id)
  }

  /**
   * Updates a user's RBAC role with strict self-elevation and admin protection.
   */
  async updateUserRole(
    targetUserId: string,
    newRole: UserRole,
    actor: { id: string; email: string; role: string; fullName?: string }
  ): Promise<ProfileRow> {
    // 1. Role format validation
    if (!ALLOWED_ROLES.includes(newRole)) {
      throw new Error(`Invalid role '${newRole}'. Allowed roles: ${ALLOWED_ROLES.join(', ')}`)
    }

    // 2. Fetch target user
    const targetUser = await this.usersRepo.findById(targetUserId)
    if (!targetUser) {
      throw new Error(`User with ID '${targetUserId}' not found`)
    }

    // 3. Self-elevation Defense: Users cannot modify their own privileges
    if (actor.id === targetUserId) {
      throw new Error('Security Violation: Users are strictly prohibited from modifying their own roles.')
    }

    // 4. Admin Protection: Only existing Administrators can grant or revoke the ADMIN role
    if ((newRole === 'ADMIN' || targetUser.role === 'ADMIN') && actor.role !== 'ADMIN') {
      throw new Error('Security Violation: Only existing Administrators can grant or revoke the Administrator role.')
    }

    // 5. Update role in database
    const updated = await this.usersRepo.updateRole(targetUserId, newRole)

    // 6. Record append-only audit log
    await this.auditRepo.record({
      user_id: actor.id,
      user_name: actor.fullName || actor.email,
      user_role: actor.role,
      action: 'USER_ROLE_CHANGE',
      entity_type: 'USER_PROFILE',
      entity_id: targetUserId,
      source: 'USER_MANAGEMENT',
      reason: `Role changed from ${targetUser.role} to ${newRole} by ${actor.email}`,
      previous_state: { role: targetUser.role, email: targetUser.email },
      new_state: { role: newRole, email: targetUser.email }
    })

    return updated
  }

  /**
   * Updates user account status (ACTIVE, INACTIVE, SUSPENDED).
   */
  async updateUserStatus(
    targetUserId: string,
    newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    actor: { id: string; email: string; role: string; fullName?: string }
  ): Promise<ProfileRow> {
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status '${newStatus}'. Allowed: ${ALLOWED_STATUSES.join(', ')}`)
    }

    const targetUser = await this.usersRepo.findById(targetUserId)
    if (!targetUser) {
      throw new Error(`User with ID '${targetUserId}' not found`)
    }

    // Prevent self-deactivation
    if (actor.id === targetUserId && newStatus !== 'ACTIVE') {
      throw new Error('Security Violation: You cannot deactivate or suspend your own account.')
    }

    const updated = await this.usersRepo.updateStatus(targetUserId, newStatus)

    await this.auditRepo.record({
      user_id: actor.id,
      user_name: actor.fullName || actor.email,
      user_role: actor.role,
      action: 'USER_STATUS_CHANGE',
      entity_type: 'USER_PROFILE',
      entity_id: targetUserId,
      source: 'USER_MANAGEMENT',
      reason: `Account status changed from ${targetUser.status} to ${newStatus} by ${actor.email}`,
      previous_state: { status: targetUser.status, email: targetUser.email },
      new_state: { status: newStatus, email: targetUser.email }
    })

    return updated
  }
}

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  UserPlus,
  RefreshCw,
  Shield,
  AlertTriangle,
  UserCheck,
  UserX,
  X
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { usersService, type UserProfile, type UserRole, type UserStatus } from '@/services/usersService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface UsersPageProps {
  onNavigate?: (path: string) => void
}

export function UsersPage({ onNavigate: _ }: UsersPageProps) {
  const { profile: currentUser, hasPermission } = useAuth()
  const canManageUsers = hasPermission('users.manage')

  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [newRole, setNewRole] = useState<UserRole>('EMPLOYEE')
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await usersService.getUsers({
        search: searchQuery.trim() || undefined,
        role: selectedRole !== 'ALL' ? (selectedRole as UserRole) : undefined,
        status: selectedStatus !== 'ALL' ? (selectedStatus as UserStatus) : undefined,
      })
      setUsers(res.data || [])
    } catch (err: any) {
      console.error('Failed to load user directory:', err)
      toast.error('Could not load user profiles from server')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedRole, selectedStatus])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // KPIs
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter(u => u.role === 'ADMIN').length
    const managers = users.filter(u => u.role === 'FINANCE_MANAGER').length
    const active = users.filter(u => u.status === 'ACTIVE' || !u.status).length
    return { total, admins, managers, active }
  }, [users])

  const handleOpenRoleModal = (user: UserProfile) => {
    if (user.id === currentUser?.id) {
      toast.error('Self-elevation prohibited: You cannot modify your own role.')
      return
    }
    setEditingUser(user)
    setNewRole(user.role)
  }

  const handleSaveRole = async () => {
    if (!editingUser) return
    setIsUpdatingRole(true)
    try {
      await usersService.updateUserRole(editingUser.id, newRole)
      toast.success(`Role updated to ${newRole} for ${editingUser.full_name || editingUser.email}`)
      setEditingUser(null)
      await fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to update user role')
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleToggleStatus = async (user: UserProfile, targetStatus: UserStatus) => {
    if (user.id === currentUser?.id) {
      toast.error('Security violation: You cannot deactivate or suspend your own account.')
      return
    }
    try {
      await usersService.updateUserStatus(user.id, targetStatus)
      toast.success(`Status for ${user.full_name || user.email} updated to ${targetStatus}`)
      await fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to change user status')
    }
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="error" size="sm">ADMIN</Badge>
      case 'FINANCE_MANAGER':
        return <Badge variant="warning" size="sm">FINANCE MANAGER</Badge>
      case 'FINANCE_ANALYST':
        return <Badge variant="info" size="sm">FINANCE ANALYST</Badge>
      default:
        return <Badge variant="neutral" size="sm">EMPLOYEE</Badge>
    }
  }

  const getStatusBadge = (status: UserStatus | string) => {
    const s = (status || 'ACTIVE').toUpperCase()
    if (s === 'ACTIVE') return <Badge variant="success" size="sm">ACTIVE</Badge>
    if (s === 'SUSPENDED') return <Badge variant="error" size="sm">SUSPENDED</Badge>
    return <Badge variant="neutral" size="sm">{s}</Badge>
  }

  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      return parts[0].slice(0, 2).toUpperCase()
    }
    if (email) return email.slice(0, 2).toUpperCase()
    return 'U'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              ACCESS CONTROL &amp; RBAC
            </span>
            <span className="text-xs text-muted-foreground">Enterprise Identity Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory &amp; Role Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage authorized financial operators, assign approval tiers, and safeguard against unauthorized privilege elevation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            disabled={isLoading}
            onClick={fetchUsers}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
            onClick={() => toast.info('New team members register via Supabase Auth signup flow.')}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase font-medium">Total Directory</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{stats.total} Users</div>
          <span className="text-[11px] text-muted-foreground">Registered identities</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase font-medium">Finance Managers</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{stats.managers} Officers</div>
          <span className="text-[11px] text-muted-foreground">L2 payment authorization</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase font-medium">Administrators</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">{stats.admins} Superadmins</div>
          <span className="text-[11px] text-muted-foreground">System &amp; policy controls</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase font-medium">Active Status</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">{stats.active} Active</div>
          <span className="text-[11px] text-emerald-400">Authenticated via Supabase</span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search user name, email, department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 bg-card/70 border-border text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="h-8 bg-card/70 border border-border rounded px-2.5 text-xs text-foreground font-mono"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
            <option value="FINANCE_ANALYST">FINANCE_ANALYST</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="h-8 bg-card/70 border border-border rounded px-2.5 text-xs text-foreground font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider font-mono">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role Tier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Joined / Updated</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-mono">
                    <Users className="w-6 h-6 mx-auto mb-2 opacity-40 text-cyan-400" />
                    {isLoading ? 'Loading users...' : 'No users match the search filter.'}
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0 font-mono">
                            {getInitials(u.full_name, u.email)}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              {u.full_name || 'Unnamed User'}
                              {isSelf && (
                                <span className="text-[10px] font-mono text-cyan-400 font-normal px-1 rounded bg-cyan-950/60 border border-cyan-800/40">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {u.department || 'Finance Operations'}
                      </td>

                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(u.status || 'ACTIVE')}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(u.updated_at || u.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!canManageUsers || isSelf}
                            className={`h-7 text-xs ${isSelf ? 'opacity-30 cursor-not-allowed' : 'text-cyan-400'}`}
                            onClick={() => handleOpenRoleModal(u)}
                            title={isSelf ? 'Self-elevation is prohibited' : 'Modify user role'}
                          >
                            Edit Role
                          </Button>

                          {u.status === 'SUSPENDED' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canManageUsers || isSelf}
                              className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                              onClick={() => handleToggleStatus(u, 'ACTIVE')}
                              title="Reactivate account"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canManageUsers || isSelf}
                              className={`h-7 text-xs ${isSelf ? 'opacity-30 cursor-not-allowed' : 'text-rose-400 hover:text-rose-300'}`}
                              onClick={() => handleToggleStatus(u, 'SUSPENDED')}
                              title={isSelf ? 'Cannot suspend yourself' : 'Suspend user account'}
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-card border-border/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Role Assignment</span>
                <h3 className="text-base font-bold text-foreground">
                  Update Role for {editingUser.full_name || editingUser.email}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-secondary/30 rounded border border-border/40 space-y-1 font-mono">
                <div className="text-muted-foreground text-[11px]">User: <span className="text-foreground">{editingUser.email}</span></div>
                <div className="text-muted-foreground text-[11px]">Current Role: <span className="text-cyan-300 font-bold">{editingUser.role}</span></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground font-semibold">Select New Role Tier</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono text-xs"
                >
                  <option value="EMPLOYEE">EMPLOYEE — Standard access, submit expenses</option>
                  <option value="FINANCE_ANALYST">FINANCE_ANALYST — Review anomalies &amp; evidence</option>
                  <option value="FINANCE_MANAGER">FINANCE_MANAGER — Approve/reject invoices &amp; workflows</option>
                  <option value="ADMIN">ADMIN — Full system governance &amp; user management</option>
                </select>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded text-[11px] text-cyan-300">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                This modification will be immediately registered in the immutable audit ledger.
              </div>
            </div>

            <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>

              <Button
                variant="default"
                size="sm"
                disabled={isUpdatingRole}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs"
                onClick={handleSaveRole}
              >
                {isUpdatingRole ? 'Updating...' : 'Confirm Role Change'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

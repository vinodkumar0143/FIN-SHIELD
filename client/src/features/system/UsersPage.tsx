import { useState } from 'react'
import {
  Users,
  UserPlus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import { MOCK_USERS, type SystemRole } from './data/systemMockData'
import { toast } from 'sonner'

interface UsersPageProps {
  onNavigate?: (path: string) => void
}

export function UsersPage({ onNavigate: _ }: UsersPageProps) {
  const [users] = useState(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')

  const getRoleBadge = (role: SystemRole) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Users className="w-3 h-3 text-cyan-400" />
              ACCESS CONTROL
            </span>
            <span className="text-xs text-muted-foreground">Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage organization members, assign financial approval tiers, and monitor security posture.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
          onClick={() => toast.info('Invite team member modal opened')}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite User
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Total Users</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-2">{users.length} Active</div>
          <span className="text-xs text-muted-foreground">Across 4 departments</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Finance Managers</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">2 Officers</div>
          <span className="text-xs text-muted-foreground">L2 approval authority</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">Administrators</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">1 Superadmin</div>
          <span className="text-xs text-muted-foreground">Full RLS override authority</span>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <span className="text-xs text-muted-foreground uppercase">MFA Adoption</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">100%</div>
          <span className="text-xs text-emerald-400">Enforced via Supabase Auth</span>
        </Card>
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-80">
        <SearchInput
          placeholder="Search user name, email, department..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-9 bg-card/70 border-border text-xs"
        />
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden border-border/80 bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-card/90 text-muted-foreground font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users
                .filter(u => {
                  if (!searchQuery.trim()) return true
                  const q = searchQuery.toLowerCase()
                  return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q)
                })
                .map(u => (
                <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0">
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="font-bold">{u.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground">
                    {u.department}
                  </td>

                  <td className="py-3.5 px-4">
                    {getRoleBadge(u.role)}
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {u.lastActivity}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Badge variant="success" size="sm">{u.status}</Badge>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-cyan-400"
                      onClick={() => toast.info(`Editing permissions for ${u.name}`)}
                    >
                      Edit Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

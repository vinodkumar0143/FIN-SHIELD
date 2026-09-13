import React, { useState, useEffect } from 'react'
import {
  Menu,
  Search,
  Bell,
  Terminal,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { alertsService } from '@/services/alertsService'
import { toast } from 'sonner'

export interface TopBarProps {
  breadcrumbs: BreadcrumbItem[]
  onOpenCommand: () => void
  onToggleMobileMenu: () => void
  onOpenNotifications?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  breadcrumbs,
  onOpenCommand,
  onToggleMobileMenu,
  onOpenNotifications,
}) => {
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(3)
  const { profile, role, logout } = useAuth()

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await alertsService.getAlerts({ status: 'ACTIVE' })
        if (Array.isArray(res)) {
          const unread = res.filter(a => !a.is_read && !a.read_state)
          setUnreadAlertsCount(unread.length)
        }
      } catch {
        // Retain initial default
      }
    }
    loadAlerts()

    const unsubscribe = alertsService.subscribeToAlerts(() => {
      loadAlerts()
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully')
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="h-16 border-b border-border bg-background/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight transition-colors flex-shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Compact Mark Branding */}
        <div className="lg:hidden flex items-center gap-2">
          <FinShieldLogo variant="compact" size="xs" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">FinShield</span>
        </div>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center min-w-0">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Center: Global Search Entry (⌘K) */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-surface border border-border hover:border-border-elevated text-xs text-muted-foreground hover:text-slate-200 transition-colors shadow-subtle group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-cyan transition-colors" />
            <span className="truncate">Search financial records, invoices, vendors...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-surface-elevated border border-border text-[10px] font-mono text-muted-foreground font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Operational Status, Notifications & User Account */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Compact System Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-muted-foreground">Ledger:</span>
          <span className="text-slate-200 font-medium">Protected</span>
        </div>

        {/* Quick Command Launcher for Mobile */}
        <button
          onClick={onOpenCommand}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight border border-border"
          title="Search / Command"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications Trigger */}
        <Tooltip content={`${unreadAlertsCount} Active Risk Alerts`}>
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-lg text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight border border-border transition-colors relative"
            aria-label="Alert notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Audit Console Shortcut */}
        <Tooltip content="Audit Trail">
          <button
            onClick={() => window.open('/audit', '_self')}
            className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight border border-border transition-colors"
            aria-label="Audit Console"
          >
            <Terminal className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* User Account / Profile Area */}
        <div className="pl-2 border-l border-border flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border-elevated flex items-center justify-center text-slate-200 font-mono text-xs font-semibold">
            {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FS'}
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-slate-100 font-sans leading-tight">
              {profile?.full_name || 'Finance Officer'}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground leading-tight">
              {role}
            </span>
          </div>

          <Tooltip content="Sign Out">
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-surface-highlight transition-colors ml-0.5"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}

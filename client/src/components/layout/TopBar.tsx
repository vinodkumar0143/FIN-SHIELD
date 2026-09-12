import React, { useState, useEffect } from 'react'
import {
  Menu,
  Search,
  Bell,
  Radio,
  UserCheck,
  Terminal,
  LogOut
} from 'lucide-react'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAuth } from '@/contexts/AuthContext'
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
  const [radarActive, setRadarActive] = useState(true)
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
        // Retain default
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
    <header className="h-16 border-b border-[#1E293B] bg-[#0B0F19]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:flex items-center">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Center: Command Palette Trigger Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-[#111827] border border-[#1E293B] hover:border-cyan-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">Search risk alerts, vendors, or prompt AI...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 font-semibold shadow">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Telemetry Status, Actions, User Profile */}
      <div className="flex items-center gap-3">
        {/* Live Network Pulse Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-400">SEC-NET:</span>
          <span className="text-emerald-400 font-bold">ONLINE (99.98%)</span>
        </div>

        {/* Threat Radar Toggle Button */}
        <Tooltip content={radarActive ? 'Active AML Sentinel Active' : 'Sentinel Paused'}>
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`p-2 rounded border transition-colors relative ${
              radarActive
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="h-4 w-4" />
            {radarActive && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        </Tooltip>

        {/* Quick Command Launcher (Mobile/Small screens) */}
        <button
          onClick={onOpenCommand}
          className="md:hidden p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800"
          title="Search / Command"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications Bell */}
        <Tooltip content={`${unreadAlertsCount} High-Priority Risk Alerts`}>
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors relative"
            aria-label="Alert notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Terminal / Dev Console Quick Link */}
        <Tooltip content="Console Output Logs">
          <button
            onClick={() => window.open('/audit', '_self')}
            className="hidden sm:flex p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition-colors"
            aria-label="Audit Console"
          >
            <Terminal className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* User Profile Area */}
        <div className="pl-2 border-l border-slate-800 flex items-center gap-2.5">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shadow-sm">
              {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'FS'}
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-[#0B0F19]" />
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-100 font-mono leading-tight">
              {profile?.full_name || 'Enterprise Operator'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400/90 leading-tight flex items-center gap-1">
              <UserCheck className="h-2.5 w-2.5" />
              {role}
            </span>
          </div>

          <Tooltip content="Sign Out">
            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors ml-1"
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

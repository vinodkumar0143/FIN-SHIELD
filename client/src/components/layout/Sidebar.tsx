import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  Shield,
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Building2,
  PieChart,
  SearchCode,
  ShieldAlert,
  TrendingUp,
  Bot,
  Search,
  CheckSquare,
  Workflow,
  AlertOctagon,
  BarChart3,
  FileSpreadsheet,
  BellRing,
  History,
  Users,
  Cpu,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { useAuth } from '@/contexts/AuthContext'
import type { Permission } from '@/lib/permissions'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'error' | 'warning' | 'info' | 'default'
  permission?: Permission
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface SidebarProps {
  currentPath: string
  onNavigate: (href: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { hasPermission } = useAuth()

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          href: '/dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
          permission: 'dashboard.view',
        },
      ],
    },
    {
      title: 'FINANCIAL INTELLIGENCE',
      items: [
        {
          id: 'invoices',
          label: 'Invoices',
          href: '/invoices',
          icon: <Receipt className="h-4 w-4" />,
          badge: '3',
          badgeVariant: 'error',
          permission: 'invoices.view',
        },
        {
          id: 'transactions',
          label: 'Transactions',
          href: '/transactions',
          icon: <ArrowLeftRight className="h-4 w-4" />,
          badge: 'LIVE',
          badgeVariant: 'info',
          permission: 'transactions.view',
        },
        {
          id: 'vendors',
          label: 'Vendors',
          href: '/vendors',
          icon: <Building2 className="h-4 w-4" />,
          permission: 'vendors.view',
        },
        {
          id: 'budgets',
          label: 'Budgets & Variances',
          href: '/budgets',
          icon: <PieChart className="h-4 w-4" />,
          permission: 'budgets.view',
        },
      ],
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        {
          id: 'investigations',
          label: 'AI Investigations',
          href: '/investigations',
          icon: <SearchCode className="h-4 w-4 text-cyan-400" />,
          badge: '12 Active',
          badgeVariant: 'warning',
          permission: 'investigations.view',
        },
        {
          id: 'risk',
          label: 'Risk Center',
          href: '/risk',
          icon: <ShieldAlert className="h-4 w-4 text-orange-400" />,
          permission: 'risk.view',
        },
        {
          id: 'forecasting',
          label: 'Cash Forecasting',
          href: '/forecasting',
          icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
          permission: 'forecasting.view',
        },
        {
          id: 'assistant',
          label: 'AI Copilot',
          href: '/assistant',
          icon: <Bot className="h-4 w-4 text-indigo-400" />,
          permission: 'assistant.use',
        },
        {
          id: 'search',
          label: 'NL Financial Search',
          href: '/search',
          icon: <Search className="h-4 w-4 text-cyan-400" />,
          permission: 'assistant.use',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'approvals',
          label: 'Approvals Queue',
          href: '/approvals',
          icon: <CheckSquare className="h-4 w-4" />,
          badge: '9',
          badgeVariant: 'warning',
          permission: 'approvals.view',
        },
        {
          id: 'workflows',
          label: 'EnterPro Workflows',
          href: '/workflows',
          icon: <Workflow className="h-4 w-4" />,
          permission: 'workflows.view',
        },
        {
          id: 'escalations',
          label: 'Escalations',
          href: '/escalations',
          icon: <AlertOctagon className="h-4 w-4 text-rose-400" />,
          permission: 'escalations.view',
        },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        {
          id: 'analytics',
          label: 'Predictive Analytics',
          href: '/analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          permission: 'analytics.view',
        },
        {
          id: 'reports',
          label: 'Compliance Reports',
          href: '/reports',
          icon: <FileSpreadsheet className="h-4 w-4" />,
          permission: 'reports.view',
        },
        {
          id: 'alerts',
          label: 'Alert Rules',
          href: '/alerts',
          icon: <BellRing className="h-4 w-4" />,
          permission: 'alerts.view',
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        {
          id: 'audit',
          label: 'Audit Trail',
          href: '/audit',
          icon: <History className="h-4 w-4" />,
          permission: 'audit.view',
        },
        {
          id: 'users',
          label: 'Users & Roles',
          href: '/users',
          icon: <Users className="h-4 w-4" />,
          permission: 'users.view',
        },
        {
          id: 'integrations',
          label: 'Integrations',
          href: '/integrations',
          icon: <Cpu className="h-4 w-4" />,
          permission: 'integrations.view',
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/settings',
          icon: <Sliders className="h-4 w-4" />,
          permission: 'settings.view',
        },
      ],
    },
  ]

  const filteredSections = useMemo(() => {
    return sections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(item => !item.permission || hasPermission(item.permission))
      }))
      .filter(sec => sec.items.length > 0)
  }, [hasPermission])

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#111827] border-r border-[#1E293B] select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
        <div
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-8 w-8 rounded bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-[#0B0F19] shadow-[0_0_14px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all">
            <Shield className="h-5 w-5 fill-[#0B0F19]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
                FIN-SHIELD
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400/90 font-medium">
                AI RISK INTELLIGENCE
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors hidden lg:block"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tenant Indicator (Expanded) */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-[#1E293B]/70 bg-[#0B0F19]/60 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 font-medium truncate">
            TITAN GLOBAL CORP
          </span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-[9px] font-mono text-cyan-400 font-semibold uppercase">
            ENTERPRISE
          </span>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = currentPath === item.href

              const navButton = (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.href)
                    onCloseMobile()
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-all duration-150 group relative',
                    isActive
                      ? 'bg-slate-800/90 text-cyan-300 font-medium border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.12)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="truncate flex-1 text-left font-sans">
                      {item.label}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                        item.badgeVariant === 'error' && 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
                        item.badgeVariant === 'warning' && 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
                        item.badgeVariant === 'info' && 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
                        (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-slate-800 text-slate-400 border border-slate-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-cyan-400 rounded-r shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                </button>
              )

              return collapsed ? (
                <Tooltip key={item.id} content={item.label} side="right">
                  {navButton}
                </Tooltip>
              ) : (
                navButton
              )
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0B0F19]/80 space-y-2">
        {!collapsed ? (
          <div className="rounded border border-indigo-500/25 bg-indigo-950/20 p-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>FinLLM-v4 Operational</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-slate-400 text-[9px]">
              <span>Latency: 24ms</span>
              <span className="text-emerald-400 font-bold">100% ONLINE</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex items-center justify-center transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 transition-all duration-200 z-30',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs flex-1 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

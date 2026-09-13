import React, { useMemo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import {
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
  ChevronDown,
  Lock,
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
  isCollapsible?: boolean
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
  const [showWorkspace, setShowWorkspace] = useState(false)

  // Auto-expand workspace if user is currently on a workspace route
  const workspaceRoutes = useMemo(() => [
    '/transactions',
    '/budgets',
    '/risk',
    '/forecasting',
    '/holds',
    '/escalations',
    '/analytics',
    '/reports',
    '/alerts',
    '/audit',
    '/users',
    '/integrations',
    '/settings',
    '/design-system',
  ], [])

  useEffect(() => {
    if (workspaceRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'))) {
      setShowWorkspace(true)
    }
  }, [currentPath, workspaceRoutes])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, onCloseMobile])

  // Primary restructured financial navigation architecture
  const primarySections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Command Center',
          href: '/dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
          permission: 'dashboard.view',
        },
      ],
    },
    {
      title: 'INVESTIGATE',
      items: [
        {
          id: 'investigations',
          label: 'Investigations',
          href: '/investigations',
          icon: <SearchCode className="h-4 w-4" />,
          badge: '12',
          badgeVariant: 'warning',
          permission: 'investigations.view',
        },
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
          id: 'vendors',
          label: 'Vendors',
          href: '/vendors',
          icon: <Building2 className="h-4 w-4" />,
          permission: 'vendors.view',
        },
      ],
    },
    {
      title: 'OPERATE',
      items: [
        {
          id: 'workflows',
          label: 'Workflows',
          href: '/workflows',
          icon: <Workflow className="h-4 w-4" />,
          permission: 'workflows.view',
        },
        {
          id: 'approvals',
          label: 'Approvals',
          href: '/approvals',
          icon: <CheckSquare className="h-4 w-4" />,
          badge: '9',
          badgeVariant: 'warning',
          permission: 'approvals.view',
        },
      ],
    },
    {
      title: 'DISCOVER',
      items: [
        {
          id: 'search',
          label: 'Search',
          href: '/search',
          icon: <Search className="h-4 w-4" />,
          permission: 'assistant.use',
        },
        {
          id: 'assistant',
          label: 'Ask FinShield',
          href: '/assistant',
          icon: <Bot className="h-4 w-4" />,
          permission: 'assistant.use',
        },
      ],
    },
  ]

  // Secondary capabilities preserved and cleanly partitioned
  const workspaceSection: NavSection = {
    title: 'WORKSPACE & SYSTEM',
    isCollapsible: true,
    items: [
      {
        id: 'transactions',
        label: 'Transactions',
        href: '/transactions',
        icon: <ArrowLeftRight className="h-4 w-4" />,
        permission: 'transactions.view',
      },
      {
        id: 'budgets',
        label: 'Budgets & Variances',
        href: '/budgets',
        icon: <PieChart className="h-4 w-4" />,
        permission: 'budgets.view',
      },
      {
        id: 'risk',
        label: 'Risk Center',
        href: '/risk',
        icon: <ShieldAlert className="h-4 w-4" />,
        permission: 'risk.view',
      },
      {
        id: 'forecasting',
        label: 'Cash Forecasting',
        href: '/forecasting',
        icon: <TrendingUp className="h-4 w-4" />,
        permission: 'forecasting.view',
      },
      {
        id: 'holds',
        label: 'Payment Holds',
        href: '/holds',
        icon: <Lock className="h-4 w-4" />,
        permission: 'holds.view',
      },
      {
        id: 'escalations',
        label: 'Escalations',
        href: '/escalations',
        icon: <AlertOctagon className="h-4 w-4" />,
        permission: 'escalations.view',
      },
      {
        id: 'analytics',
        label: 'Analytics',
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
  }

  const filteredPrimarySections = useMemo(() => {
    return primarySections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(item => !item.permission || hasPermission(item.permission))
      }))
      .filter(sec => sec.items.length > 0)
  }, [primarySections, hasPermission])

  const filteredWorkspaceItems = useMemo(() => {
    return workspaceSection.items.filter(item => !item.permission || hasPermission(item.permission))
  }, [workspaceSection.items, hasPermission])

  const renderNavButton = (item: NavItem) => {
    const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href + '/'))

    const button = (
      <button
        key={item.id}
        onClick={() => {
          onNavigate(item.href)
          onCloseMobile()
        }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors duration-150 relative text-left select-none',
          isActive
            ? 'bg-brand-cyan/10 text-slate-100 font-medium border-l-2 border-brand-cyan'
            : 'text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight/60',
          collapsed && 'justify-center px-2'
        )}
      >
        <span
          className={cn(
            'flex-shrink-0 transition-colors',
            isActive ? 'text-brand-cyan' : 'text-muted-foreground'
          )}
        >
          {item.icon}
        </span>

        {!collapsed && (
          <span className="truncate flex-1 font-sans">
            {item.label}
          </span>
        )}

        {!collapsed && item.badge && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold',
              item.badgeVariant === 'error' && 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
              item.badgeVariant === 'warning' && 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
              (!item.badgeVariant || item.badgeVariant === 'default') && 'bg-surface-elevated text-muted-foreground border border-border'
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    )

    return collapsed ? (
      <Tooltip key={item.id} content={item.label} side="right">
        {button}
      </Tooltip>
    ) : (
      button
    )
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-surface border-r border-border select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        <div
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <FinShieldLogo
            variant="compact"
            size="sm"
            className="group-hover:border-cyan-500/60 transition-colors shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-100">
                FinShield
              </span>
              <span className="text-[10px] font-mono tracking-wider text-muted-foreground">
                Financial Investigation Center
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight transition-colors hidden lg:block"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight transition-colors lg:hidden"
          title="Close navigation"
          aria-label="Close navigation"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Tenant Indicator */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-border/80 bg-surface-subtle flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground font-medium truncate">
            TITAN GLOBAL CORP
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] font-mono text-slate-300 uppercase">
            ENTERPRISE
          </span>
        </div>
      )}

      {/* Navigation Body */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Primary Sections (Overview, Investigate, Operate, Discover) */}
        {filteredPrimarySections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/70 uppercase">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(renderNavButton)}
            </div>
          </div>
        ))}

        {/* Secondary Workspace & Capabilities */}
        {filteredWorkspaceItems.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border/60">
            {!collapsed ? (
              <button
                onClick={() => setShowWorkspace(!showWorkspace)}
                className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/70 hover:text-slate-200 uppercase transition-colors"
              >
                <span>WORKSPACE &amp; SYSTEM</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-150',
                    showWorkspace ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>
            ) : null}

            {(showWorkspace || collapsed) && (
              <div className="space-y-0.5">
                {filteredWorkspaceItems.map(renderNavButton)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer — Clean Status Indicator */}
      <div className="p-3 border-t border-border bg-surface-subtle">
        {!collapsed ? (
          <div className="rounded-lg border border-border bg-surface p-2.5 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold">Engine Active</span>
              </div>
              <span className="text-muted-foreground">24ms</span>
            </div>
            <div className="mt-1 text-[9px] text-muted-foreground flex justify-between items-center">
              <span>Continuous Audit</span>
              <span className="text-slate-400">v4.2</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded-lg text-muted-foreground hover:text-slate-100 hover:bg-surface-highlight flex items-center justify-center transition-colors"
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
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 transition-all duration-200 z-30',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
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

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandMenu } from '@/components/ui/CommandMenu'
import { Drawer } from '@/components/ui/Drawer'
import { Clock, ArrowRight } from 'lucide-react'
import { RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export interface AppShellProps {
  currentPath: string
  onNavigate: (path: string) => void
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Derive dynamic breadcrumbs with professional financial terminology
  const getBreadcrumbs = () => {
    const segments = currentPath.split('/').filter(Boolean)
    const crumbs = [{ label: 'FINSHIELD', href: '/dashboard' }]

    if (segments.length === 0 || segments[0] === 'dashboard') {
      crumbs.push({ label: 'Command Center', href: '/dashboard' })
    } else {
      const categoryMap: Record<string, string> = {
        invoices: 'Invoices',
        transactions: 'Transactions',
        vendors: 'Vendors',
        budgets: 'Budgets & Variances',
        investigations: 'Investigations',
        risk: 'Risk Center',
        forecasting: 'Cash Forecasting',
        assistant: 'Ask FinShield',
        search: 'Search',
        approvals: 'Approvals',
        workflows: 'Workflows',
        holds: 'Payment Holds',
        escalations: 'Escalations',
        analytics: 'Analytics',
        reports: 'Compliance Reports',
        alerts: 'Alert Rules',
        audit: 'Audit Trail',
        users: 'Users & Roles',
        integrations: 'Integrations',
        settings: 'Settings',
        'design-system': 'Design System',
      }

      crumbs.push({
        label: categoryMap[segments[0]] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1),
        href: `/${segments[0]}`,
      })
    }

    return crumbs
  }

  // Active risk items for the Notification Drawer
  const alerts = [
    {
      id: 'al-1',
      title: 'Invoice INV-28491 Flagged for High Risk',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: '₹4,82,000',
      time: '12m ago',
      score: 87,
      type: 'ANOMALY_BREACH',
    },
    {
      id: 'al-2',
      title: 'Disbursement Account Altered within 72h',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: 'N/A',
      time: '24m ago',
      score: 78,
      type: 'BANK_ACCOUNT_CHANGE',
    },
    {
      id: 'al-3',
      title: 'Quarterly Operations Budget Overrun (+18.5%)',
      vendor: 'Operations Dept',
      amount: '₹3,02,000',
      time: '1h ago',
      score: 65,
      type: 'BUDGET_OVERRUN',
    },
    {
      id: 'al-4',
      title: 'Soft Duplicate Detected: Identical Amount to INV-28412',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: '₹4,82,000',
      time: '3h ago',
      score: 82,
      type: 'DUPLICATE_INVOICE',
    },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <TopBar
          breadcrumbs={getBreadcrumbs()}
          onOpenCommand={() => setCommandOpen(true)}
          onToggleMobileMenu={() => setMobileOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette Modal (⌘K / Ctrl+K) */}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSelectRoute={(route) => {
          onNavigate(route)
          setCommandOpen(false)
        }}
      />

      {/* Live Financial Alerts & Risk Feed Drawer */}
      <Drawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title="Financial Risk & Activity Feed"
        description="Real-time multi-signal anomalies and payment holds requiring investigation."
        width="md"
      >
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-lg border border-border bg-surface hover:border-border-elevated transition-colors space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100 font-sans">
                  {alert.title}
                </span>
                <RiskBadge score={alert.score} showScore={false} size="sm" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{alert.vendor}</span>
                <span className="text-slate-100 font-semibold">{alert.amount}</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {alert.time}
                </span>
                <button
                  onClick={() => {
                    onNavigate('/investigations')
                    setNotificationsOpen(false)
                  }}
                  className="text-brand-cyan hover:text-brand-cyan-bright font-medium flex items-center gap-1 group-hover:underline"
                >
                  <span>Investigate</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-3">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => {
                onNavigate('/alerts')
                setNotificationsOpen(false)
              }}
            >
              View All Alert Rules & History
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}

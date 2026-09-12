import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandMenu } from '@/components/ui/CommandMenu'
import { Drawer } from '@/components/ui/Drawer'
import { Clock } from 'lucide-react'
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

  // Derive dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const segments = currentPath.split('/').filter(Boolean)
    const crumbs = [{ label: 'FIN-SHIELD', href: '/dashboard' }]

    if (segments.length === 0 || segments[0] === 'dashboard') {
      crumbs.push({ label: 'Executive Dashboard', href: '/dashboard' })
    } else {
      const categoryMap: Record<string, string> = {
        invoices: 'Invoices & Ingestion',
        transactions: 'Live Transactions',
        vendors: 'Vendor Risk Profiles',
        budgets: 'Department Budgets',
        investigations: 'AI Investigations',
        risk: 'Risk Center',
        forecasting: 'Cash Forecasting',
        assistant: 'AI Copilot',
        search: 'Natural Language Search',
        approvals: 'Approvals Queue',
        workflows: 'EnterPro Workflows',
        escalations: 'Incident Escalations',
        analytics: 'Predictive Analytics',
        reports: 'Compliance Reports',
        alerts: 'Alert Rules',
        audit: 'Audit Trail',
        users: 'Users & Roles',
        integrations: 'Platform Integrations',
        settings: 'Settings',
      }

      crumbs.push({
        label: categoryMap[segments[0]] || segments[0].toUpperCase(),
        href: `/${segments[0]}`,
      })
    }

    return crumbs
  }

  // Static mock alerts for the Notification Drawer
  const alerts = [
    {
      id: 'al-1',
      title: 'Invoice INV-28491 Flagged for Critical Risk',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: '₹4,82,000',
      time: '12m ago',
      score: 87,
      type: 'ANOMALY_BREACH',
    },
    {
      id: 'al-2',
      title: 'Disbursement Account Altered within 96h',
      vendor: 'ABC Supplies Pvt Ltd',
      amount: 'N/A',
      time: '24m ago',
      score: 78,
      type: 'BANK_ACCOUNT_CHANGE',
    },
    {
      id: 'al-3',
      title: 'Quarterly Operations Budget Overrun Risk (+18.5%)',
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#F8FAFC]">
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
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar
          breadcrumbs={getBreadcrumbs()}
          onOpenCommand={() => setCommandOpen(true)}
          onToggleMobileMenu={() => setMobileOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0B0F19]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command Search Modal Foundation (⌘K) */}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSelectRoute={(route) => {
          onNavigate(route)
          setCommandOpen(false)
        }}
      />

      {/* Live Notifications Drawer */}
      <Drawer
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title="Live Threat & Anomaly Feed"
        description="Real-time multi-source risk triggers detected by the continuous audit sentinel."
        width="md"
      >
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-md border border-[#1E293B] bg-[#0F131D] hover:border-cyan-500/40 transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-100 font-mono">
                  {alert.title}
                </span>
                <RiskBadge score={alert.score} showScore={false} />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{alert.vendor}</span>
                <span className="text-slate-200 font-bold">{alert.amount}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {alert.time}
                </span>
                <button
                  onClick={() => {
                    onNavigate('/investigations')
                    setNotificationsOpen(false)
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium group-hover:underline"
                >
                  Investigate →
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

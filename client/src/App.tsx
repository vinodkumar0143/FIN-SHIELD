import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/ui/AnimatedContainer'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Auth & Foundation (Instant load)
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'

// Lazy loaded routes for optimal bundle chunking and performance (Phase 11D)
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const DesignSystemShowcase = lazy(() => import('@/features/foundation/DesignSystemShowcase').then(m => ({ default: m.DesignSystemShowcase })))

// Phase 1C: Financial Intelligence
const InvoicesPage = lazy(() => import('@/features/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })))
const InvoiceDetailPage = lazy(() => import('@/features/invoices/InvoiceDetailPage').then(m => ({ default: m.InvoiceDetailPage })))
const InvoiceUploadPage = lazy(() => import('@/features/invoices/InvoiceUploadPage').then(m => ({ default: m.InvoiceUploadPage })))
const TransactionsPage = lazy(() => import('@/features/transactions/TransactionsPage').then(m => ({ default: m.TransactionsPage })))
const TransactionDetailPage = lazy(() => import('@/features/transactions/TransactionDetailPage').then(m => ({ default: m.TransactionDetailPage })))
const VendorsPage = lazy(() => import('@/features/vendors/VendorsPage').then(m => ({ default: m.VendorsPage })))
const VendorDetailPage = lazy(() => import('@/features/vendors/VendorDetailPage').then(m => ({ default: m.VendorDetailPage })))
const BudgetsPage = lazy(() => import('@/features/budgets/BudgetsPage').then(m => ({ default: m.BudgetsPage })))
const BudgetDetailPage = lazy(() => import('@/features/budgets/BudgetDetailPage').then(m => ({ default: m.BudgetDetailPage })))

// Phase 1D: AI Intelligence
const InvestigationsPage = lazy(() => import('@/features/investigations/InvestigationsPage').then(m => ({ default: m.InvestigationsPage })))
const InvestigationDetailPage = lazy(() => import('@/features/investigations/InvestigationDetailPage').then(m => ({ default: m.InvestigationDetailPage })))
const RiskPage = lazy(() => import('@/features/risk/RiskPage').then(m => ({ default: m.RiskPage })))
const ForecastingPage = lazy(() => import('@/features/forecasting/ForecastingPage').then(m => ({ default: m.ForecastingPage })))
const AssistantPage = lazy(() => import('@/features/assistant/AssistantPage').then(m => ({ default: m.AssistantPage })))
const SearchPage = lazy(() => import('@/features/search/SearchPage').then(m => ({ default: m.SearchPage })))

// Phase 1E: Operations
const ApprovalsPage = lazy(() => import('@/features/operations/ApprovalsPage').then(m => ({ default: m.ApprovalsPage })))
const ApprovalDetailPage = lazy(() => import('@/features/operations/ApprovalDetailPage').then(m => ({ default: m.ApprovalDetailPage })))
const WorkflowsPage = lazy(() => import('@/features/operations/WorkflowsPage').then(m => ({ default: m.WorkflowsPage })))
const WorkflowDetailPage = lazy(() => import('@/features/operations/WorkflowDetailPage').then(m => ({ default: m.WorkflowDetailPage })))
const PaymentHoldsPage = lazy(() => import('@/features/operations/PaymentHoldsPage').then(m => ({ default: m.PaymentHoldsPage })))
const EscalationsPage = lazy(() => import('@/features/operations/EscalationsPage').then(m => ({ default: m.EscalationsPage })))

// Phase 1F: Insights & System
const AnalyticsPage = lazy(() => import('@/features/insights/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const ReportsPage = lazy(() => import('@/features/insights/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ReportDetailPage = lazy(() => import('@/features/insights/ReportDetailPage').then(m => ({ default: m.ReportDetailPage })))
const AlertsPage = lazy(() => import('@/features/insights/AlertsPage').then(m => ({ default: m.AlertsPage })))
const AuditTrailPage = lazy(() => import('@/features/insights/AuditTrailPage').then(m => ({ default: m.AuditTrailPage })))
const UsersPage = lazy(() => import('@/features/system/UsersPage').then(m => ({ default: m.UsersPage })))
const IntegrationsPage = lazy(() => import('@/features/system/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const SettingsPage = lazy(() => import('@/features/system/SettingsPage').then(m => ({ default: m.SettingsPage })))

function RouteLoadingFallback() {
  return (
    <div className="space-y-6 p-2 animate-pulse" role="status" aria-label="Loading view">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-3.5 w-72 bg-slate-800/60 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-lg bg-slate-800/50 border border-slate-800" />
        ))}
      </div>
      <div className="h-72 rounded-lg bg-slate-800/30 border border-slate-800" />
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle root redirect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/signup') {
        handleNavigate('/login')
      } else if (isAuthenticated && (currentPath === '/' || currentPath === '/login' || currentPath === '/signup')) {
        handleNavigate('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, currentPath])

  // Public standalone pages (rendered outside AppShell)
  if (currentPath === '/login') {
    return <LoginPage onNavigate={handleNavigate} />
  }

  if (currentPath === '/signup') {
    return <SignupPage onNavigate={handleNavigate} />
  }

  // Render active protected route inside AppShell
  const renderRouteContent = () => {
    // 1. Overview & Showcase
    if (currentPath === '/dashboard') {
      return (
        <ProtectedRoute requiredPermission="dashboard.view" onNavigate={handleNavigate}>
          <DashboardPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/design-system') {
      return (
        <ProtectedRoute onNavigate={handleNavigate}>
          <DesignSystemShowcase onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    // 2. Financial Intelligence
    if (currentPath === '/invoices') {
      return (
        <ProtectedRoute requiredPermission="invoices.view" onNavigate={handleNavigate}>
          <InvoicesPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/invoices/upload') {
      return (
        <ProtectedRoute requiredPermission="invoices.upload" onNavigate={handleNavigate}>
          <InvoiceUploadPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/invoices/')) {
      const id = currentPath.replace('/invoices/', '')
      return (
        <ProtectedRoute requiredPermission="invoices.view" onNavigate={handleNavigate}>
          <InvoiceDetailPage invoiceId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/transactions') {
      return (
        <ProtectedRoute requiredPermission="transactions.view" onNavigate={handleNavigate}>
          <TransactionsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/transactions/')) {
      const id = currentPath.replace('/transactions/', '')
      return (
        <ProtectedRoute requiredPermission="transactions.view" onNavigate={handleNavigate}>
          <TransactionDetailPage transactionId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/vendors') {
      return (
        <ProtectedRoute requiredPermission="vendors.view" onNavigate={handleNavigate}>
          <VendorsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/vendors/')) {
      const id = currentPath.replace('/vendors/', '')
      return (
        <ProtectedRoute requiredPermission="vendors.view" onNavigate={handleNavigate}>
          <VendorDetailPage vendorId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/budgets') {
      return (
        <ProtectedRoute requiredPermission="budgets.view" onNavigate={handleNavigate}>
          <BudgetsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/budgets/')) {
      const id = currentPath.replace('/budgets/', '')
      return (
        <ProtectedRoute requiredPermission="budgets.view" onNavigate={handleNavigate}>
          <BudgetDetailPage budgetId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    // 3. AI Intelligence
    if (currentPath === '/investigations') {
      return (
        <ProtectedRoute requiredPermission="investigations.view" onNavigate={handleNavigate}>
          <InvestigationsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/investigations/')) {
      const id = currentPath.replace('/investigations/', '')
      return (
        <ProtectedRoute requiredPermission="investigations.view" onNavigate={handleNavigate}>
          <InvestigationDetailPage investigationId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/risk') {
      return (
        <ProtectedRoute requiredPermission="risk.view" onNavigate={handleNavigate}>
          <RiskPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/forecasting') {
      return (
        <ProtectedRoute requiredPermission="forecasting.view" onNavigate={handleNavigate}>
          <ForecastingPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/assistant') {
      return (
        <ProtectedRoute requiredPermission="assistant.use" onNavigate={handleNavigate}>
          <AssistantPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/search') {
      return (
        <ProtectedRoute onNavigate={handleNavigate}>
          <SearchPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    // 4. Operations
    if (currentPath === '/approvals') {
      return (
        <ProtectedRoute requiredPermission="approvals.view" onNavigate={handleNavigate}>
          <ApprovalsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/approvals/')) {
      const id = currentPath.replace('/approvals/', '')
      return (
        <ProtectedRoute requiredPermission="approvals.view" onNavigate={handleNavigate}>
          <ApprovalDetailPage approvalId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/workflows') {
      return (
        <ProtectedRoute requiredPermission="workflows.view" onNavigate={handleNavigate}>
          <WorkflowsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/workflows/')) {
      const id = currentPath.replace('/workflows/', '')
      return (
        <ProtectedRoute requiredPermission="workflows.view" onNavigate={handleNavigate}>
          <WorkflowDetailPage workflowId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/holds') {
      return (
        <ProtectedRoute requiredPermission="holds.view" onNavigate={handleNavigate}>
          <PaymentHoldsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/escalations') {
      return (
        <ProtectedRoute requiredPermission="escalations.view" onNavigate={handleNavigate}>
          <EscalationsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    // 5. Insights & System
    if (currentPath === '/analytics') {
      return (
        <ProtectedRoute requiredPermission="analytics.view" onNavigate={handleNavigate}>
          <AnalyticsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/reports') {
      return (
        <ProtectedRoute requiredPermission="reports.view" onNavigate={handleNavigate}>
          <ReportsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath.startsWith('/reports/')) {
      const id = currentPath.replace('/reports/', '')
      return (
        <ProtectedRoute requiredPermission="reports.view" onNavigate={handleNavigate}>
          <ReportDetailPage reportId={id} onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    if (currentPath === '/alerts') {
      return (
        <ProtectedRoute requiredPermission="alerts.view" onNavigate={handleNavigate}>
          <AlertsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/audit') {
      return (
        <ProtectedRoute requiredPermission="audit.view" onNavigate={handleNavigate}>
          <AuditTrailPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/users') {
      return (
        <ProtectedRoute requiredPermission="users.view" onNavigate={handleNavigate}>
          <UsersPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/integrations') {
      return (
        <ProtectedRoute requiredPermission="integrations.view" onNavigate={handleNavigate}>
          <IntegrationsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }
    if (currentPath === '/settings') {
      return (
        <ProtectedRoute requiredPermission="settings.view" onNavigate={handleNavigate}>
          <SettingsPage onNavigate={handleNavigate} />
        </ProtectedRoute>
      )
    }

    // Fallback: Dashboard
    return (
      <ProtectedRoute requiredPermission="dashboard.view" onNavigate={handleNavigate}>
        <DashboardPage onNavigate={handleNavigate} />
      </ProtectedRoute>
    )
  }

  return (
    <AppShell currentPath={currentPath} onNavigate={handleNavigate}>
      <AnimatePresence mode="wait">
        <PageTransition key={currentPath}>
          <Suspense fallback={<RouteLoadingFallback />}>
            {renderRouteContent()}
          </Suspense>
        </PageTransition>
      </AnimatePresence>
    </AppShell>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            border: '1px solid #1f2937',
            color: '#f9fafb',
            fontSize: '12px',
            fontFamily: 'Inter, system-ui, sans-serif'
          }
        }}
      />
    </AuthProvider>
  )
}

export default App

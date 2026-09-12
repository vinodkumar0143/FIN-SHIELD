import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { DesignSystemShowcase } from '@/features/foundation/DesignSystemShowcase'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'

// Phase 1C: Financial Intelligence
import { InvoicesPage } from '@/features/invoices/InvoicesPage'
import { InvoiceDetailPage } from '@/features/invoices/InvoiceDetailPage'
import { InvoiceUploadPage } from '@/features/invoices/InvoiceUploadPage'
import { TransactionsPage } from '@/features/transactions/TransactionsPage'
import { TransactionDetailPage } from '@/features/transactions/TransactionDetailPage'
import { VendorsPage } from '@/features/vendors/VendorsPage'
import { VendorDetailPage } from '@/features/vendors/VendorDetailPage'
import { BudgetsPage } from '@/features/budgets/BudgetsPage'
import { BudgetDetailPage } from '@/features/budgets/BudgetDetailPage'

// Phase 1D: AI Intelligence
import { InvestigationsPage } from '@/features/investigations/InvestigationsPage'
import { InvestigationDetailPage } from '@/features/investigations/InvestigationDetailPage'
import { RiskPage } from '@/features/risk/RiskPage'
import { ForecastingPage } from '@/features/forecasting/ForecastingPage'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { SearchPage } from '@/features/search/SearchPage'

// Phase 1E: Operations
import { ApprovalsPage } from '@/features/operations/ApprovalsPage'
import { ApprovalDetailPage } from '@/features/operations/ApprovalDetailPage'
import { WorkflowsPage } from '@/features/operations/WorkflowsPage'
import { WorkflowDetailPage } from '@/features/operations/WorkflowDetailPage'
import { PaymentHoldsPage } from '@/features/operations/PaymentHoldsPage'
import { EscalationsPage } from '@/features/operations/EscalationsPage'

// Phase 1F: Insights & System
import { AnalyticsPage } from '@/features/insights/AnalyticsPage'
import { ReportsPage } from '@/features/insights/ReportsPage'
import { ReportDetailPage } from '@/features/insights/ReportDetailPage'
import { AlertsPage } from '@/features/insights/AlertsPage'
import { AuditTrailPage } from '@/features/insights/AuditTrailPage'
import { UsersPage } from '@/features/system/UsersPage'
import { IntegrationsPage } from '@/features/system/IntegrationsPage'
import { SettingsPage } from '@/features/system/SettingsPage'

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
        <ProtectedRoute requiredPermission="assistant.use" onNavigate={handleNavigate}>
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
    if (currentPath === '/escalations' || currentPath.startsWith('/escalations/')) {
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
      {renderRouteContent()}
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

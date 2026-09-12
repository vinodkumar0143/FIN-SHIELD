import { AlertsRepository, AlertRow } from '../repositories/alerts.repository.js'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { WorkflowsRepository } from '../repositories/workflows.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export interface SmartAlertFilter {
  severity?: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'
  status?: 'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  type?: string
  limit?: number
  offset?: number
}

export class SmartAlertsService {
  constructor(
    private alertsRepo: AlertsRepository = new AlertsRepository(),
    private invoicesRepo: InvoicesRepository = new InvoicesRepository(),
    private budgetsRepo: BudgetsRepository = new BudgetsRepository(),
    private vendorsRepo: VendorsRepository = new VendorsRepository(),
    private workflowsRepo: WorkflowsRepository = new WorkflowsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  /**
   * Scans the financial state and synthesizes de-duplicated smart alerts.
   */
  async syncSmartAlerts(): Promise<{
    createdAlertsCount: number
    activeAlerts: AlertRow[]
  }> {
    const existingAlerts = await this.alertsRepo.findAll(200)
    const existingMap = new Set<string>()
    existingAlerts.forEach(a => {
      if (a.entity_id) {
        existingMap.add(`${a.alert_type}:${a.entity_id}`)
      }
    })

    let createdCount = 0

    // 1. Scan Invoices for High Risk and Duplicates
    const invoices = await this.invoicesRepo.findAll(100)
    for (const inv of invoices) {
      if (inv.risk_score >= 70) {
        const key = `SUSPICIOUS_PAYMENT:${inv.id}`
        if (!existingMap.has(key)) {
          await this.alertsRepo.create({
            alert_type: 'SUSPICIOUS_PAYMENT',
            severity: inv.risk_score >= 80 ? 'CRITICAL' : 'WARNING',
            title: `High Risk Detected on Invoice ${inv.invoice_number}`,
            description: `Invoice ${inv.invoice_number} scored ${inv.risk_score}/100 with deterministic anomaly signals. Requires authorized verification.`,
            entity: 'INVOICE',
            entity_id: inv.id,
            status: 'ACTIVE',
            read_state: false,
            route: `/invoices/${inv.invoice_number}`
          })
          existingMap.add(key)
          createdCount++
        }
      }

      if (inv.duplicate_status === 'POTENTIAL_DUPLICATE' || inv.duplicate_status === 'CONFIRMED_DUPLICATE') {
        const key = `DUPLICATE_INVOICE:${inv.id}`
        if (!existingMap.has(key)) {
          await this.alertsRepo.create({
            alert_type: 'DUPLICATE_INVOICE',
            severity: inv.duplicate_status === 'CONFIRMED_DUPLICATE' ? 'CRITICAL' : 'WARNING',
            title: `Duplicate Invoice Detected: ${inv.invoice_number}`,
            description: `Potential duplicate submission matching historical amounts and vendor parameters.`,
            entity: 'INVOICE',
            entity_id: inv.id,
            status: 'ACTIVE',
            read_state: false,
            route: `/invoices/${inv.invoice_number}`
          })
          existingMap.add(key)
          createdCount++
        }
      }
    }

    // 2. Scan Budgets for Threshold Breaches
    const budgets = await this.budgetsRepo.findAll()
    for (const b of budgets) {
      const allocated = Number(b.allocated_amount || 0)
      const spent = Number(b.spent_amount || 0)
      if (allocated > 0) {
        const ratio = spent / allocated
        if (ratio >= 0.85) {
          const key = `BUDGET_BREACH:${b.id}`
          if (!existingMap.has(key)) {
            await this.alertsRepo.create({
              alert_type: 'BUDGET_BREACH',
              severity: ratio >= 1.0 ? 'CRITICAL' : 'WARNING',
              title: ratio >= 1.0 ? `Budget Deficit: ${b.department}` : `Budget Warning Threshold: ${b.department}`,
              description: `Department spend at ${Math.round(ratio * 100)}% of allocation (${spent.toLocaleString('en-IN')} of ${allocated.toLocaleString('en-IN')}).`,
              entity: 'BUDGET',
              entity_id: b.id,
              status: 'ACTIVE',
              read_state: false,
              route: `/budgets`
            })
            existingMap.add(key)
            createdCount++
          }
        }
      }
    }

    // 3. Scan Active Payment Holds
    const holdTasks = await this.workflowsRepo.findActivePaymentHolds()
    for (const hold of holdTasks) {
      const holdTarget = hold.entity_id || hold.id
      const key = `SYSTEM_AUDIT:${holdTarget}`
      if (!existingMap.has(key)) {
        await this.alertsRepo.create({
          alert_type: 'SYSTEM_AUDIT',
          severity: hold.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          title: `Active Escrow Hold [${hold.task_id}]`,
          description: `Disbursement frozen by EnterPro ERP workflow for ${hold.entity_type} ${hold.entity_id}.`,
          entity: hold.entity_type,
          entity_id: holdTarget,
          status: 'ACTIVE',
          read_state: false,
          route: `/holds`
        })
        existingMap.add(key)
        createdCount++
      }
    }

    const activeAlerts = await this.alertsRepo.findActive()
    return {
      createdAlertsCount: createdCount,
      activeAlerts
    }
  }

  /**
   * Retrieves alerts with optional filtering.
   */
  async getAlerts(filters?: SmartAlertFilter): Promise<AlertRow[]> {
    const limit = filters?.limit || 50
    const offset = filters?.offset || 0
    let alerts = await this.alertsRepo.findAll(limit, offset)

    if (filters?.severity && filters.severity !== 'ALL') {
      alerts = alerts.filter(a => a.severity === filters.severity)
    }

    if (filters?.status && filters.status !== 'ALL') {
      alerts = alerts.filter(a => a.status === filters.status)
    }

    if (filters?.type && filters.type !== 'ALL') {
      alerts = alerts.filter(a => a.alert_type === filters.type)
    }

    return alerts
  }

  /**
   * Retrieves a single alert by ID.
   */
  async getAlertById(id: string): Promise<AlertRow | null> {
    return this.alertsRepo.findById(id)
  }

  /**
   * Marks an alert as read.
   */
  async markAsRead(id: string): Promise<AlertRow> {
    return this.alertsRepo.markAsRead(id)
  }

  /**
   * Marks all unread alerts as read.
   */
  async markAllAsRead(): Promise<void> {
    return this.alertsRepo.markAllAsRead()
  }

  /**
   * Resolves an alert.
   */
  async resolveAlert(id: string, user?: { id: string; email: string; role: string }): Promise<AlertRow> {
    const resolved = await this.alertsRepo.resolve(id)

    if (user) {
      await this.auditRepo.record({
        user_id: user.id,
        user_name: user.email,
        user_role: user.role,
        action: 'SMART_ALERT_RESOLVED',
        entity_type: 'ALERT',
        entity_id: id,
        reason: 'Alert dismissed or resolved by authorized operator',
        source: 'ALERTS_CONSOLE',
        previous_state: { status: 'ACTIVE' },
        new_state: { status: 'RESOLVED' }
      })
    }

    return resolved
  }
}

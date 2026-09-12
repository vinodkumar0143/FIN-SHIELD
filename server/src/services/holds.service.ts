import { WorkflowsRepository } from '../repositories/workflows.repository.js'
import { InvoicesRepository, DetailedInvoice } from '../repositories/invoices.repository.js'
import { AlertsRepository } from '../repositories/alerts.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { EnterproService } from './enterpro.service.js'

export interface PaymentHoldSummary {
  id: string
  holdRef: string
  workflowTaskId: string
  invoiceId: string
  invoiceNumber: string
  vendorName: string
  amount: number
  currency: string
  riskScore: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reason: string
  heldDate: string
  durationDays: number
  heldBy: string
  status: 'ACTIVE' | 'RELEASED' | 'ESCALATED'
  enterproStatus: string
}

export interface PlaceHoldParams {
  invoiceId: string
  reason: string
  user: {
    id: string
    email: string
    role: string
    fullName?: string
  }
}

export interface ReleaseHoldParams {
  invoiceId: string
  reason: string
  user: {
    id: string
    email: string
    role: string
    fullName?: string
  }
}

export class HoldsService {
  constructor(
    private workflowsRepo: WorkflowsRepository = new WorkflowsRepository(),
    private invoicesRepo: InvoicesRepository = new InvoicesRepository(),
    private alertsRepo: AlertsRepository = new AlertsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository(),
    private enterproService: EnterproService = new EnterproService()
  ) {}

  /**
   * Retrieves all payment hold records across invoices and workflow tasks.
   */
  async getHolds(filter?: 'ALL' | 'ACTIVE' | 'RELEASED'): Promise<PaymentHoldSummary[]> {
    // 1. Get all invoices with ON_HOLD status or HELD payment status
    const invoices = await this.invoicesRepo.findAll(100)

    // 2. Fetch payment hold workflow tasks
    const holdTasks = await this.workflowsRepo.findAll(100)
    const holdTasksMap = new Map<string, typeof holdTasks[0]>()
    holdTasks.forEach(task => {
      if (task.workflow_type === 'PAYMENT_HOLD' && task.entity_type === 'INVOICE') {
        holdTasksMap.set(task.entity_id, task)
      }
    })

    const records: PaymentHoldSummary[] = []
    const now = new Date().getTime()

    for (const inv of invoices) {
      const task = holdTasksMap.get(inv.id)
      const isCurrentlyHeld = inv.status === 'ON_HOLD' || inv.payment_status === 'HELD'

      if (!isCurrentlyHeld && (!task || task.status !== 'COMPLETED')) {
        continue
      }

      const heldDate = task?.created_at || inv.created_at
      const diffMs = now - new Date(heldDate).getTime()
      const durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))

      const status: PaymentHoldSummary['status'] = 
        !isCurrentlyHeld ? 'RELEASED'
        : task?.status === 'ESCALATED' ? 'ESCALATED'
        : 'ACTIVE'

      if (filter && filter !== 'ALL') {
        if (filter === 'ACTIVE' && status !== 'ACTIVE' && status !== 'ESCALATED') continue
        if (filter === 'RELEASED' && status !== 'RELEASED') continue
      }

      records.push({
        id: task?.id || inv.id,
        holdRef: task?.task_id || `HOLD-${inv.invoice_number}`,
        workflowTaskId: task?.task_id || 'PENDING_WORKFLOW',
        invoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
        vendorName: (inv as any).vendor?.name || 'Vendor',
        amount: inv.amount,
        currency: inv.currency || 'USD',
        riskScore: inv.risk_score,
        severity: inv.risk_level,
        reason: task ? `Automated disbursement hold by EnterPro (${task.task_id})` : 'Disbursement hold placed due to risk threshold',
        heldDate,
        durationDays,
        heldBy: task?.source || 'ENTERPRO_ERP',
        status,
        enterproStatus: status === 'ACTIVE' ? 'ERP_DISBURSEMENT_LOCKED' : 'RELEASED_IN_ERP'
      })
    }

    return records
  }

  /**
   * Places a payment hold on an invoice, halting ERP disbursement.
   */
  async placeHold(params: PlaceHoldParams): Promise<PaymentHoldSummary> {
    const invoice = await this.invoicesRepo.findById(params.invoiceId)
    if (!invoice) {
      throw new Error(`Invoice with ID ${params.invoiceId} not found`)
    }

    // 1. Update invoice status to ON_HOLD and HELD
    await this.invoicesRepo.update(params.invoiceId, {
      status: 'ON_HOLD',
      payment_status: 'HELD'
    })

    // 2. Dispatch EnterPro payment hold workflow
    const workflow = await this.enterproService.createWorkflow({
      entityType: 'INVOICE',
      entityId: params.invoiceId,
      workflowType: 'PAYMENT_HOLD',
      priority: invoice.risk_score >= 80 ? 'CRITICAL' : 'HIGH',
      assignedRole: 'FINANCE_MANAGER',
      reason: params.reason,
      triggeredBy: params.user.id,
      metadata: {
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        riskScore: invoice.risk_score
      }
    })

    // 3. Record in append-only audit log
    await this.auditRepo.record({
      user_id: params.user.id,
      user_name: params.user.fullName || params.user.email,
      user_role: params.user.role,
      action: 'PAYMENT_HOLD_PLACED',
      entity_type: 'INVOICE',
      entity_id: params.invoiceId,
      reason: params.reason,
      source: 'ENTERPRO_ERP',
      workflow_reference: workflow.taskId,
      new_state: {
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        status: 'ON_HOLD'
      }
    })

    return {
      id: workflow.workflowId,
      holdRef: workflow.taskId,
      workflowTaskId: workflow.taskId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      vendorName: 'Vendor',
      amount: invoice.amount,
      currency: invoice.currency || 'USD',
      riskScore: invoice.risk_score,
      severity: invoice.risk_level,
      reason: params.reason,
      heldDate: new Date().toISOString(),
      durationDays: 1,
      heldBy: params.user.email,
      status: 'ACTIVE',
      enterproStatus: 'ERP_DISBURSEMENT_LOCKED'
    }
  }

  /**
   * Authorizes and releases a payment hold.
   * Dual-control requirement: only FINANCE_MANAGER or ADMIN.
   */
  async releaseHold(params: ReleaseHoldParams): Promise<{
    success: boolean
    message: string
    invoice: any
  }> {
    if (params.user.role !== 'FINANCE_MANAGER' && params.user.role !== 'ADMIN') {
      throw new Error('Forbidden: Only Finance Managers or Administrators have authority to release payment holds.')
    }

    if (!params.reason || params.reason.trim().length < 5) {
      throw new Error('Validation Error: A mandatory justification reason (min 5 characters) must be documented for hold release.')
    }

    const invoice = await this.invoicesRepo.findById(params.invoiceId)
    if (!invoice) {
      throw new Error(`Invoice with ID ${params.invoiceId} not found`)
    }

    // 1. Release hold in EnterPro workflow
    const holdTasks = await this.workflowsRepo.findAll(50)
    const activeHoldTask = holdTasks.find(
      t => t.entity_id === params.invoiceId && t.workflow_type === 'PAYMENT_HOLD' && t.status !== 'COMPLETED'
    )

    if (activeHoldTask) {
      await this.enterproService.triggerAction({
        taskId: activeHoldTask.task_id,
        action: 'RELEASE_PAYMENT',
        user: params.user,
        comments: params.reason
      })
    } else {
      // Direct invoice status update if no active task
      await this.invoicesRepo.update(params.invoiceId, {
        status: 'VALIDATED',
        payment_status: 'UNPAID'
      })
    }

    // 2. Resolve related hold alerts
    const alerts = await this.alertsRepo.findAll(50)
    for (const alert of alerts) {
      if (alert.entity_id === params.invoiceId && alert.status === 'ACTIVE') {
        await this.alertsRepo.resolve(alert.id)
      }
    }

    // 3. Record audit log
    await this.auditRepo.record({
      user_id: params.user.id,
      user_name: params.user.fullName || params.user.email,
      user_role: params.user.role,
      action: 'PAYMENT_HOLD_RELEASED',
      entity_type: 'INVOICE',
      entity_id: params.invoiceId,
      reason: params.reason,
      source: 'ENTERPRO_ERP',
      workflow_reference: activeHoldTask?.task_id || null,
      previous_state: { status: 'ON_HOLD', payment_status: 'HELD' },
      new_state: { status: 'VALIDATED', payment_status: 'UNPAID' }
    })

    return {
      success: true,
      message: `Payment hold on invoice ${invoice.invoice_number} released successfully. ERP disbursement queue unlocked.`,
      invoice: await this.invoicesRepo.findById(params.invoiceId)
    }
  }
}

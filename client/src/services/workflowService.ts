import { apiClient } from './apiClient'
import { supabase } from '../lib/supabaseClient'

export interface WorkflowStep {
  name: string
  role: string
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface WorkflowExecution {
  workflowId: string
  taskId: string
  entityType: string
  entityId: string
  workflowType: 'PAYMENT_HOLD' | 'FORENSIC_REVIEW' | 'VENDOR_REAUTHENTICATION' | 'BUDGET_OVERRIDE' | 'COMPLIANCE_SIGN_OFF'
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  erpSyncStatus: 'SYNCHRONIZED' | 'PENDING_DISPATCH' | 'ERP_LOCKED' | 'RESOLVED'
  erpReferenceNumber: string
  steps: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export interface ApprovalRecord {
  id: string
  approval_id: string
  entity_type: 'INVOICE' | 'PURCHASE_ORDER' | 'BUDGET_OVERRIDE' | 'PAYMENT_RELEASE'
  entity_id: string
  requester_id: string
  approver_id: string | null
  amount: number
  currency: string
  approval_level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'EXECUTIVE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
  comments: string | null
  decision_timestamp: string | null
  created_at: string
  updated_at: string
  invoiceNumber?: string
  entityName?: string
  vendorCode?: string
  riskScore?: number
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendation?: string
  entityDetails?: any
}

export interface PaymentHoldItem {
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

export interface EscalationRecord {
  id: string
  entity_type: string
  entity_id: string
  reason: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assigned_to: string | null
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
  comments: string | null
  created_at: string
  resolved_at: string | null
}

export const workflowService = {
  // ================= WORKFLOWS (EnterPro) =================
  async getWorkflows(status?: string): Promise<WorkflowExecution[]> {
    return apiClient.get('/api/workflows', status && status !== 'ALL' ? { status } : undefined)
  },

  async getWorkflowById(taskId: string): Promise<WorkflowExecution> {
    return apiClient.get(`/api/workflows/${taskId}`)
  },

  async createWorkflow(payload: {
    entityType: string
    entityId: string
    workflowType: string
    priority?: string
    assignedRole?: string
    reason?: string
    metadata?: Record<string, any>
  }): Promise<WorkflowExecution> {
    return apiClient.post('/api/workflows', payload)
  },

  async triggerAction(taskId: string, action: string, comments?: string): Promise<{
    success: boolean
    message: string
    workflow: WorkflowExecution
  }> {
    return apiClient.post(`/api/workflows/${taskId}/action`, { action, comments })
  },

  // ================= APPROVALS =================
  async getApprovals(status?: string): Promise<ApprovalRecord[]> {
    return apiClient.get('/api/approvals', status && status !== 'ALL' ? { status } : undefined)
  },

  async getApprovalById(id: string): Promise<ApprovalRecord> {
    return apiClient.get(`/api/approvals/${id}`)
  },

  async approve(id: string, comments?: string): Promise<{ success: boolean; message: string; data: ApprovalRecord }> {
    return apiClient.post(`/api/approvals/${id}/approve`, { comments })
  },

  async reject(id: string, reason?: string): Promise<{ success: boolean; message: string; data: ApprovalRecord }> {
    return apiClient.post(`/api/approvals/${id}/reject`, { reason })
  },

  async createApproval(payload: {
    entityType: string
    entityId: string
    amount: number
    currency?: string
    approvalLevel?: string
    comments?: string
  }): Promise<ApprovalRecord> {
    return apiClient.post('/api/approvals', payload)
  },

  // ================= PAYMENT HOLDS =================
  async getHolds(filter?: 'ALL' | 'ACTIVE' | 'RELEASED'): Promise<PaymentHoldItem[]> {
    return apiClient.get('/api/holds', filter ? { filter } : undefined)
  },

  async placeHold(invoiceId: string, reason: string): Promise<{
    success: boolean
    message: string
    data: PaymentHoldItem
  }> {
    return apiClient.post('/api/holds', { invoiceId, reason })
  },

  async releaseHold(invoiceId: string, reason: string): Promise<{
    success: boolean
    message: string
    invoice: any
  }> {
    return apiClient.post(`/api/holds/${invoiceId}/release`, { reason })
  },

  // ================= HUMAN ESCALATIONS =================
  async getEscalations(status?: string): Promise<EscalationRecord[]> {
    return apiClient.get('/api/escalations', status && status !== 'ALL' ? { status } : undefined)
  },

  async getEscalationById(id: string): Promise<EscalationRecord> {
    return apiClient.get(`/api/escalations/${id}`)
  },

  async createEscalation(payload: {
    entityType: string
    entityId: string
    reason: string
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    assignedTo?: string
  }): Promise<EscalationRecord> {
    return apiClient.post('/api/escalations', payload)
  },

  async updateEscalation(id: string, updates: Partial<EscalationRecord>): Promise<EscalationRecord> {
    return apiClient.patch(`/api/escalations/${id}`, updates)
  },

  async resolveEscalation(id: string, comments?: string): Promise<{
    success: boolean
    message: string
    data: EscalationRecord
  }> {
    return apiClient.post(`/api/escalations/${id}/resolve`, { comments })
  },

  // ================= REALTIME SYNCHRONIZATION =================
  subscribeToOperations(callback: (payload: { table: string; eventType: string; new: any; old: any }) => void) {
    const channel = supabase
      .channel('operations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workflow_tasks' }, (payload) => {
        callback({ table: 'workflow_tasks', eventType: payload.eventType, new: payload.new, old: payload.old })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, (payload) => {
        callback({ table: 'approvals', eventType: payload.eventType, new: payload.new, old: payload.old })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'escalations' }, (payload) => {
        callback({ table: 'escalations', eventType: payload.eventType, new: payload.new, old: payload.old })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, (payload) => {
        callback({ table: 'invoices', eventType: payload.eventType, new: payload.new, old: payload.old })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

import { apiClient } from './apiClient'

export interface AuditLogEntry {
  id: string
  user_id: string | null
  user_name: string
  user_role: string
  action: string
  entity_type: string
  entity_id: string
  previous_state: Record<string, any> | null
  new_state: Record<string, any> | null
  reason: string | null
  source: string
  workflow_reference: string | null
  timestamp: string
}

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  entityType?: string
  source?: string
  search?: string
  limit?: number
  offset?: number
}

export interface AuditLogResponse {
  success: boolean
  data: AuditLogEntry[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export const auditService = {
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogResponse> {
    return apiClient.get('/api/audit', filters as Record<string, any>)
  },

  async getAuditLogById(id: string): Promise<AuditLogEntry> {
    return apiClient.get(`/api/audit/${id}`)
  }
}

import { apiClient } from './apiClient'

export interface InvestigationItem {
  id: string
  investigation_id: string
  entity_type: string
  entity_id: string
  title: string
  summary: string
  risk_score: number
  risk_level: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ON_HOLD'
  assigned_to: string | null
  recommendation: any
  created_at: string
  updated_at: string
  invoices?: {
    id: string
    invoice_number: string
    amount: number
    vendor_id: string
    vendors?: {
      name: string
      category: string
    }
  }
}

export interface InvestigationsListResponse {
  success: boolean
  data: InvestigationItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const investigationsService = {
  async getInvestigations(params: {
    page?: number
    pageSize?: number
    status?: string
    severity?: string
    search?: string
  } = {}): Promise<InvestigationsListResponse> {
    return apiClient.get('/api/investigations', params as Record<string, any>)
  },

  async getInvestigationById(id: string): Promise<{ success: boolean; data: InvestigationItem }> {
    return apiClient.get(`/api/investigations/${id}`)
  },

  async createInvestigation(payload: {
    entity_type: string
    entity_id: string
    title: string
    summary: string
    risk_score: number
    risk_level: string
    recommendation?: any
  }): Promise<{ success: boolean; data: InvestigationItem }> {
    return apiClient.post('/api/investigations', payload)
  },

  async updateStatus(
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ON_HOLD',
    notes?: string
  ): Promise<{ success: boolean; data: InvestigationItem }> {
    return apiClient.patch(`/api/investigations/${id}/status`, { status, notes })
  }
}

import { apiClient } from './apiClient'

export interface GlobalRiskMetrics {
  averageRiskScore: number
  totalAssessments: number
  levelDistribution: Record<string, number>
  distribution?: Record<string, number>
  highRiskCount: number
  criticalRiskCount: number
  highRiskEntities?: Array<{
    id: string
    entity_type: string
    entity_id: string
    overall_score: number
    risk_level: string
    reasons?: any[]
  }>
}

export interface DetectedAnomalyItem {
  id: string
  anomaly_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  entity_type: string
  entity_id: string
  title: string
  detected_value: string | number
  expected_baseline: string | number | null
  deviation_percentage: number | null
  explanation: string
  evidence_source: string
  timestamp: string
}

export interface UnifiedEvidence {
  entity_type: string
  entity_id: string
  entity_reference?: string
  risk_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  explanation: string
  evidence: Array<{
    id: string
    evidence_type: string
    severity: string
    source: string
    title: string
    description: string
    detected_value: any
    baseline_value: any
    deviation: number | null
    risk_contribution: number
  }>
  signals: Array<{
    signal_type: string
    severity: string
    score_contribution: number
    description: string
    evidence_source: string
  }>
  component_scores: Record<string, number>
  calculated_at: string
}

export interface InvestigationItem {
  id: string
  investigation_number: string
  title: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  assigned_to?: string
  entity_type: string
  entity_id: string
  summary: string
  findings?: any[]
  evidence_count?: number
  created_at: string
  updated_at: string
  evidence_items?: any[]
}

export const riskService = {
  async getGlobalRisk(): Promise<GlobalRiskMetrics> {
    return apiClient.get('/api/risk')
  },

  async getEntityRisk(entityType: string, entityId: string): Promise<UnifiedEvidence> {
    return apiClient.get(`/api/risk/${entityType}/${entityId}`)
  },

  async getAnomalies(filters?: { severity?: string; entityType?: string; page?: number; pageSize?: number }): Promise<{
    anomalies: DetectedAnomalyItem[]
    total: number
    page: number
    pageSize: number
  }> {
    return apiClient.get('/api/anomalies', filters)
  },

  async getEntityEvidence(entityType: string, entityId: string): Promise<UnifiedEvidence> {
    return apiClient.get(`/api/evidence/${entityType}/${entityId}`)
  },

  async getInvestigations(filters?: { status?: string; severity?: string; page?: number; pageSize?: number }): Promise<{
    investigations: InvestigationItem[]
    total: number
    page: number
    pageSize: number
  }> {
    return apiClient.get('/api/investigations', filters)
  },

  async getInvestigationById(id: string): Promise<{
    investigation: InvestigationItem
    evidence: any[]
    relatedInvoices: any[]
  }> {
    return apiClient.get(`/api/investigations/${id}`)
  },

  async updateInvestigation(id: string, payload: Partial<InvestigationItem>): Promise<InvestigationItem> {
    return apiClient.patch(`/api/investigations/${id}`, payload)
  }
}

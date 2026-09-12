import { apiClient } from './apiClient'

export interface AiInvestigationResponse {
  id?: string
  investigationId: string
  entityType: string
  entityId: string
  entityReference: string
  deterministicRiskScore: number
  deterministicRiskLevel: string
  summary: string
  keyFindings: string[]
  suspiciousSignals: string[]
  likelyCauses: string[]
  financialImpact: string
  confidence: number
  recommendedAction: string
  recommendedNextStep: string
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
  modelUsed: string
  isAiFallback: boolean
  createdAt: string
}

export interface AiRecommendationResponse {
  id?: string
  recommendationType: string
  recommendationText: string
  reasoningSummary: string
  confidence: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  suggestedWorkflow: string
  supportingEvidenceIds: string[]
  isAiFallback: boolean
  model: string
}

export interface AiAssistantResponse {
  question: string
  answer: string
  citations: Array<{
    entityType: string
    entityId?: string
    entityReference: string
    description: string
  }>
  suggestedFollowUps: string[]
  modelUsed: string
  isFallback: boolean
}

export interface AiSearchResultItem {
  id: string
  type: 'INVOICE' | 'VENDOR' | 'BUDGET' | 'TRANSACTION'
  title: string
  subtitle: string
  amount?: number
  currency?: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  highlights: string[]
  entityUrl: string
}

export interface AiSearchResponse {
  query: string
  interpretedEntity: string
  structuredFilters: Record<string, any>
  results: AiSearchResultItem[]
  totalResults: number
  modelUsed: string
  isFallback: boolean
}

export const aiService = {
  /**
   * Run grounded AI forensic investigation on a financial entity.
   */
  async investigateEntity(entityType: string, entityId: string): Promise<AiInvestigationResponse> {
    return apiClient.post('/api/ai/investigate', { entityType, entityId })
  },

  /**
   * Generate actionable, prioritized recommendations based on deterministic evidence.
   */
  async generateRecommendations(payload: {
    investigationId?: string
    entityType: string
    entityReference: string
    riskScore: number
    riskLevel: string
    anomalies: any[]
    evidence: any[]
  }): Promise<AiRecommendationResponse> {
    return apiClient.post('/api/ai/recommendations', payload)
  },

  /**
   * Ask the financial assistant a natural language question with strict entity grounding.
   */
  async askAssistant(question: string): Promise<AiAssistantResponse> {
    return apiClient.post('/api/ai/assistant', { question })
  },

  /**
   * Universal natural language search across financial instruments and ledgers.
   */
  async search(query: string): Promise<AiSearchResponse> {
    return apiClient.post('/api/ai/search', { query })
  }
}

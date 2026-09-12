import { QwenService } from './qwen.service.js'
import { buildRecommendationPrompt } from './prompts/financialPrompts.js'
import { RecommendationsRepository, RecommendationRow } from '../repositories/recommendations.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export interface ValidatedRecommendation {
  recommendationType: 'APPROVE' | 'APPROVE_WITH_REVIEW' | 'HOLD' | 'REQUEST_INFORMATION' | 'REJECT' | 'ESCALATE' | 'INVESTIGATE_VENDOR'
  recommendationText: string
  reasoningSummary: string
  confidence: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  suggestedWorkflow: string
  supportingEvidenceIds: string[]
  isAiFallback: boolean
  model: string
}

export class AiRecommendationsService {
  constructor(
    private qwenService: QwenService = new QwenService(),
    private recommendationsRepo: RecommendationsRepository = new RecommendationsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  /**
   * Formulate prioritized financial recommendations based on deterministic evidence.
   */
  async generateRecommendation(context: {
    entityType: string
    entityReference: string
    riskScore: number
    riskLevel: string
    anomalies: any[]
    evidence: any[]
  }): Promise<ValidatedRecommendation> {
    const prompt = buildRecommendationPrompt(context)
    const completion = await this.qwenService.generateCompletion(prompt, { temperature: 0.1 })
    const output = completion.parsedJson || {}

    const validTypes: ValidatedRecommendation['recommendationType'][] = [
      'APPROVE', 'APPROVE_WITH_REVIEW', 'HOLD', 'REQUEST_INFORMATION', 'REJECT', 'ESCALATE', 'INVESTIGATE_VENDOR'
    ]

    const recommendationType = validTypes.includes(output.recommendationType)
      ? output.recommendationType
      : (context.riskScore >= 75 ? 'HOLD' : context.riskScore >= 50 ? 'APPROVE_WITH_REVIEW' : 'APPROVE')

    const recommendationText = typeof output.recommendationText === 'string' && output.recommendationText.trim().length > 0
      ? output.recommendationText.trim()
      : `Recommended action: ${recommendationType} based on risk score of ${context.riskScore}/100.`

    const reasoningSummary = typeof output.reasoningSummary === 'string' && output.reasoningSummary.trim().length > 0
      ? output.reasoningSummary.trim()
      : `Instrument evaluated with ${context.anomalies.length} anomaly signals.`

    const confidence = typeof output.confidence === 'number' && output.confidence >= 0 && output.confidence <= 100
      ? Math.round(output.confidence)
      : 90

    const validPriorities: ValidatedRecommendation['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const priority = validPriorities.includes(output.priority)
      ? output.priority
      : (context.riskScore >= 75 ? 'CRITICAL' : context.riskScore >= 50 ? 'HIGH' : 'LOW')

    const suggestedWorkflow = typeof output.suggestedWorkflow === 'string' && output.suggestedWorkflow.trim().length > 0
      ? output.suggestedWorkflow.trim()
      : (context.riskScore >= 75 ? 'PAYMENT_HOLD' : 'FORENSIC_REVIEW')

    const supportingEvidenceIds = Array.isArray(output.supportingEvidenceIds)
      ? output.supportingEvidenceIds.map(String)
      : []

    return {
      recommendationType,
      recommendationText,
      reasoningSummary,
      confidence,
      priority,
      suggestedWorkflow,
      supportingEvidenceIds,
      isAiFallback: completion.isFallback,
      model: completion.model
    }
  }

  /**
   * Generates recommendation and persists it to the recommendations table.
   * Note: Qwen only recommends. Actual execution requires human approval workflow.
   */
  async generateAndPersistRecommendation(
    investigationId: string,
    entityType: string,
    entityReference: string,
    riskScore: number,
    riskLevel: string,
    anomalies: any[],
    evidence: any[],
    actor?: { id?: string; name?: string; role?: string }
  ): Promise<RecommendationRow> {
    const rec = await this.generateRecommendation({
      entityType,
      entityReference,
      riskScore,
      riskLevel,
      anomalies,
      evidence
    })

    const normalizedConfidence = Math.min(1.0, Math.max(0.0, Number((rec.confidence > 1 ? rec.confidence / 100 : rec.confidence).toFixed(3))))

    const saved = await this.recommendationsRepo.create({
      investigation_id: investigationId,
      recommendation_type: rec.recommendationType,
      recommendation_text: rec.recommendationText,
      reasoning_summary: rec.reasoningSummary,
      confidence: normalizedConfidence,
      status: 'PENDING'
    })

    // Record audit log
    try {
      await this.auditRepo.record({
        user_id: actor?.id || null,
        user_name: actor?.name || 'Qwen AI Recommendation Engine',
        user_role: actor?.role || 'SYSTEM',
        action: 'RECOMMENDATION_GENERATED',
        entity_type: entityType.toLowerCase(),
        entity_id: investigationId,
        source: 'FIN-SHIELD Qwen Engine',
        new_state: {
          recommendation_id: saved.id,
          recommendation_type: rec.recommendationType,
          confidence: rec.confidence,
          priority: rec.priority
        }
      })
    } catch (err: any) {
      console.warn('[AUDIT LOG RECOMMENDATION WARN]', err.message)
    }

    return saved
  }

  async getRecommendationsForInvestigation(investigationId: string): Promise<RecommendationRow[]> {
    return this.recommendationsRepo.findByInvestigationId(investigationId)
  }
}

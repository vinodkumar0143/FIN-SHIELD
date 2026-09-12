import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'
import { EvidenceAggregationService, UnifiedEvidencePackage } from './evidenceAggregation.service.js'
import { AnomalyDetectionService } from './anomalyDetection.service.js'
import { QwenService } from './qwen.service.js'
import { buildInvestigationPrompt } from './prompts/financialPrompts.js'
import { InvestigationsRepository, InvestigationRow } from '../repositories/investigations.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { AiRecommendationsService } from './aiRecommendations.service.js'

export interface ValidatedAiInvestigationResult {
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
  evidence: UnifiedEvidencePackage['evidence']
  modelUsed: string
  isAiFallback: boolean
  createdAt: string
}

export class FinancialInvestigatorService {
  constructor(
    private client: SupabaseClient<Database> = supabaseAdmin,
    private evidenceService: EvidenceAggregationService = new EvidenceAggregationService(),
    private anomalyDetector: AnomalyDetectionService = new AnomalyDetectionService(),
    private qwenService: QwenService = new QwenService(),
    private investigationsRepo: InvestigationsRepository = new InvestigationsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository(),
    private recommendationsService: AiRecommendationsService = new AiRecommendationsService()
  ) {}

  /**
   * Conduct a grounded AI forensic investigation on a financial entity.
   */
  async investigateEntity(
    entityType: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET',
    entityId: string,
    actor?: { id?: string; name?: string; role?: string }
  ): Promise<ValidatedAiInvestigationResult> {
    // 1. Gather deterministic evidence from Phase 5 engine
    const evidencePackage = await this.evidenceService.aggregateEntityEvidence(entityType, entityId, actor)
    const anomalies = await this.anomalyDetector.detectInvoiceAnomalies(entityId).catch(() => [])

    // 2. Enrich context for specific entity types
    let vendorProfile: any = null
    let poMatchContext: any = null
    let budgetContext: any = null
    let duplicateContext: any = null

    if (entityType === 'INVOICE') {
      const { data: inv } = await this.client
        .from('invoices')
        .select('*')
        .eq('id', entityId)
        .maybeSingle()

      if (inv?.vendor_id) {
        const { data: vendor } = await this.client
          .from('vendors')
          .select('name, risk_score, risk_level, status, payment_terms')
          .eq('id', inv.vendor_id)
          .maybeSingle()
        vendorProfile = vendor
      }

      if (inv?.purchase_order_id) {
        const { data: po } = await this.client
          .from('purchase_orders')
          .select('po_number, total_amount, department, status')
          .eq('id', inv.purchase_order_id)
          .maybeSingle()
        poMatchContext = {
          poNumber: po?.po_number,
          authorizedAmount: po?.total_amount,
          department: po?.department,
          invoiceAmount: inv.amount,
          varianceDelta: inv.amount - (po?.total_amount || 0)
        }
      }
    }

    // 3. Build grounded prompt and call Qwen
    const prompt = buildInvestigationPrompt({
      entityType,
      entityId,
      entityReference: evidencePackage.entity_reference,
      riskScore: evidencePackage.risk_score,
      riskLevel: evidencePackage.risk_level,
      explanation: evidencePackage.explanation,
      anomalies,
      evidence: evidencePackage.evidence,
      vendorProfile,
      budgetContext,
      poMatchContext,
      duplicateContext
    })

    const completion = await this.qwenService.generateCompletion(prompt, { temperature: 0.1 })
    const aiOutput = completion.parsedJson || {}

    // 4. Validate output schema & enforce safety boundaries
    const summary = typeof aiOutput.summary === 'string' && aiOutput.summary.trim().length > 0
      ? aiOutput.summary.trim()
      : `Forensic audit of ${evidencePackage.entity_reference || entityId} identified ${evidencePackage.risk_level} risk conditions.`

    const keyFindings = Array.isArray(aiOutput.keyFindings) && aiOutput.keyFindings.length > 0
      ? aiOutput.keyFindings.map(String)
      : evidencePackage.evidence.map(e => e.description)

    const suspiciousSignals = Array.isArray(aiOutput.suspiciousSignals) && aiOutput.suspiciousSignals.length > 0
      ? aiOutput.suspiciousSignals.map(String)
      : anomalies.map(a => a.title)

    const likelyCauses = Array.isArray(aiOutput.likelyCauses) && aiOutput.likelyCauses.length > 0
      ? aiOutput.likelyCauses.map(String)
      : ['Operational ledger or contract divergence']

    const financialImpact = typeof aiOutput.financialImpact === 'string' && aiOutput.financialImpact.trim().length > 0
      ? aiOutput.financialImpact.trim()
      : `Financial risk score evaluated at ${evidencePackage.risk_score}/100.`

    const confidence = typeof aiOutput.confidence === 'number' && aiOutput.confidence >= 0 && aiOutput.confidence <= 100
      ? Math.round(aiOutput.confidence)
      : 88

    const normalizedConfidence = Math.min(1.0, Math.max(0.0, Number((confidence > 1 ? confidence / 100 : confidence).toFixed(3))))

    const validActions = ['HOLD', 'APPROVE_WITH_REVIEW', 'REQUEST_INFORMATION', 'ESCALATE', 'INVESTIGATE_VENDOR', 'REJECT', 'APPROVE']
    const recommendedAction = validActions.includes(aiOutput.recommendedAction)
      ? aiOutput.recommendedAction
      : (evidencePackage.risk_score >= 75 ? 'HOLD' : 'APPROVE_WITH_REVIEW')

    const recommendedNextStep = typeof aiOutput.recommendedNextStep === 'string' && aiOutput.recommendedNextStep.trim().length > 0
      ? aiOutput.recommendedNextStep.trim()
      : 'Maintain autonomous payment hold and await secondary review.'

    // 5. Store / Upsert investigation record in Supabase
    let investigationRecord: InvestigationRow | null = null
    const existingInvestigation = await this.investigationsRepo.findByInvestigationId(`INV-ST-${entityId.substring(0, 8).toUpperCase()}`)

    const investigationNumber = `INV-ST-${entityId.substring(0, 8).toUpperCase()}`

    if (existingInvestigation) {
      investigationRecord = existingInvestigation
    } else {
      try {
        investigationRecord = await this.investigationsRepo.create({
          investigation_id: investigationNumber,
          entity_type: entityType,
          entity_id: entityId,
          title: `AI Forensic Investigation: ${evidencePackage.entity_reference || entityId}`,
          summary,
          risk_score: evidencePackage.risk_score,
          risk_level: evidencePackage.risk_level,
          status: 'AI_ANALYSIS',
          recommendation: `${recommendedAction}: ${recommendedNextStep}`,
          confidence: normalizedConfidence,
          assigned_to: (actor?.id && actor.id.length === 36) ? actor.id : null
        })
      } catch (err: any) {
        console.warn('[INVESTIGATION PERSIST WARN]', err.message)
      }
    }

    // 6. Map and persist forensic evidence items if investigation created
    if (investigationRecord) {
      for (const item of evidencePackage.evidence) {
        try {
          const mappedType = this.mapEvidenceType(item.evidence_type)
          await this.investigationsRepo.addEvidence({
            investigation_id: investigationRecord.id,
            evidence_type: mappedType as any,
            source_entity: entityType,
            source_entity_id: entityId,
            title: item.title,
            description: item.description,
            value: String(item.detected_value || ''),
            significance: item.severity,
            risk_contribution: item.risk_contribution,
            metadata: {
              baseline: item.baseline_value,
              deviation: item.deviation,
              source: item.source
            }
          })
        } catch {
          // Ignore duplicate evidence inserts
        }
      }

      // 7. Persist initial recommendation
      try {
        await this.recommendationsService.generateAndPersistRecommendation(
          investigationRecord.id,
          entityType,
          evidencePackage.entity_reference || entityId,
          evidencePackage.risk_score,
          evidencePackage.risk_level,
          anomalies,
          evidencePackage.evidence
        )
      } catch (recErr: any) {
        console.warn('[RECOMMENDATION PERSIST WARN]', recErr.message)
      }
    }

    // 8. Record audit log
    try {
      await this.auditRepo.record({
        user_id: actor?.id || null,
        user_name: actor?.name || 'Qwen AI Financial Investigator',
        user_role: actor?.role || 'SYSTEM',
        action: 'AI_INVESTIGATION_COMPLETED',
        entity_type: entityType.toLowerCase(),
        entity_id: entityId,
        source: 'FIN-SHIELD Qwen Engine',
        new_state: {
          investigation_id: investigationRecord?.id || investigationNumber,
          risk_score: evidencePackage.risk_score,
          confidence,
          recommended_action: recommendedAction
        }
      })
    } catch (auditErr: any) {
      console.warn('[AUDIT LOG WARN]', auditErr.message)
    }

    return {
      id: investigationRecord?.id,
      investigationId: investigationRecord?.investigation_id || investigationNumber,
      entityType,
      entityId,
      entityReference: evidencePackage.entity_reference || entityId,
      deterministicRiskScore: evidencePackage.risk_score,
      deterministicRiskLevel: evidencePackage.risk_level,
      summary,
      keyFindings,
      suspiciousSignals,
      likelyCauses,
      financialImpact,
      confidence,
      recommendedAction,
      recommendedNextStep,
      evidence: evidencePackage.evidence,
      modelUsed: completion.model,
      isAiFallback: completion.isFallback,
      createdAt: new Date().toISOString()
    }
  }

  private mapEvidenceType(rawType: string): string {
    switch (rawType) {
      case 'DUPLICATE_INVOICE': return 'DUPLICATE_HASH'
      case 'PO_MISMATCH': return 'PO_MISMATCH'
      case 'ABNORMAL_PAYMENT_BEHAVIOR': return 'BANK_ROUTING_CHANGE'
      case 'BUDGET_THRESHOLD_EXCEEDED': return 'BUDGET_OVERRUN'
      case 'UNUSUAL_INVOICE_FREQUENCY':
      case 'UNUSUAL_TRANSACTION_FREQUENCY': return 'FREQUENCY_ANOMALY'
      default: return 'OCR_DISCREPANCY'
    }
  }
}

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'
import { AnomalyDetectionService, DetectedAnomaly } from './anomalyDetection.service.js'
import { RiskScoringService, RiskScoreResult } from './riskScoring.service.js'
import { RiskAssessmentsRepository } from '../repositories/riskAssessments.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export interface AggregatedEvidenceItem {
  id: string
  evidence_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  source: string
  title: string
  description: string
  detected_value: number | string
  baseline_value: number | string | null
  deviation: number | null
  risk_contribution: number
}

export interface UnifiedEvidencePackage {
  entity_type: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
  entityType: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
  entity_id: string
  entityId: string
  entity_reference?: string
  risk_score: number
  riskScore: { score: number; level: string }
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  explanation: string
  evidence: AggregatedEvidenceItem[]
  findings: AggregatedEvidenceItem[]
  sources: string[]
  metrics: { anomalyCount: number; signalsCount: number; maxScoreContribution: number }
  signals: RiskScoreResult['signals']
  component_scores: RiskScoreResult['component_scores']
  calculated_at: string
}

export class EvidenceAggregationService {
  constructor(
    private client: SupabaseClient<Database> = supabaseAdmin,
    private anomalyDetector: AnomalyDetectionService = new AnomalyDetectionService(),
    private riskScorer: RiskScoringService = new RiskScoringService(),
    private riskRepo: RiskAssessmentsRepository = new RiskAssessmentsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  /**
   * Evaluates an entity, aggregates multi-source evidence, updates risk assessments & audit trail.
   */
  async aggregateEntityEvidence(
    entityType: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET',
    entityId: string,
    actor?: { id?: string; name?: string; role?: string }
  ): Promise<UnifiedEvidencePackage> {
    let anomalies: DetectedAnomaly[] = []
    let entityReference = entityId

    if (entityType === 'INVOICE') {
      anomalies = await this.anomalyDetector.detectInvoiceAnomalies(entityId)
      // Fetch reference
      const { data: inv } = await this.client.from('invoices').select('invoice_number').eq('id', entityId).maybeSingle()
      if (inv) entityReference = inv.invoice_number
    } else if (entityType === 'TRANSACTION') {
      anomalies = await this.anomalyDetector.detectTransactionAnomalies(entityId)
      const { data: txn } = await this.client.from('transactions').select('transaction_reference').eq('id', entityId).maybeSingle()
      if (txn) entityReference = txn.transaction_reference
    } else if (entityType === 'VENDOR') {
      // Collect anomalies across all invoices for this vendor
      const { data: vInvs } = await this.client.from('invoices').select('id').eq('vendor_id', entityId).limit(5)
      for (const inv of (vInvs || [])) {
        const invAnoms = await this.anomalyDetector.detectInvoiceAnomalies(inv.id)
        anomalies.push(...invAnoms)
      }
      const { data: ven } = await this.client.from('vendors').select('name').eq('id', entityId).maybeSingle()
      if (ven) entityReference = ven.name
    }

    // 2. Deterministically score the aggregated anomalies
    const scoringResult = this.riskScorer.calculateRiskScore(anomalies)

    // 3. Map anomalies into normalized, explainable evidence items
    const evidence: AggregatedEvidenceItem[] = anomalies.map(anom => {
      const matchingSignal = scoringResult.signals.find(s => s.signal_type === anom.anomaly_type)
      return {
        id: anom.id,
        evidence_type: anom.anomaly_type,
        severity: anom.severity,
        source: anom.evidence_source,
        title: anom.title,
        description: anom.explanation,
        detected_value: anom.detected_value,
        baseline_value: anom.expected_baseline,
        deviation: anom.deviation_percentage,
        risk_contribution: matchingSignal?.score_contribution || 10
      }
    })

    // 4. Persist assessment to Supabase risk_assessments table
    try {
      await this.riskRepo.upsert({
        entity_type: entityType,
        entity_id: entityId,
        overall_score: scoringResult.risk_score,
        risk_level: scoringResult.risk_level,
        component_scores: scoringResult.component_scores as any,
        reasons: scoringResult.signals as any
      })
    } catch (err: any) {
      console.warn('[RISK ASSESSMENT PERSIST WARN]', err.message)
    }

    // 5. Update parent entity risk_score & risk_level in database
    if (entityType === 'INVOICE') {
      await this.client
        .from('invoices')
        .update({
          risk_score: scoringResult.risk_score,
          risk_level: scoringResult.risk_level,
          anomaly_status: scoringResult.risk_score >= 50 ? 'CONFIRMED' : anomalies.length > 0 ? 'SUSPECTED' : 'NONE'
        })
        .eq('id', entityId)
    } else if (entityType === 'TRANSACTION') {
      await this.client
        .from('transactions')
        .update({
          risk_score: scoringResult.risk_score,
          risk_level: scoringResult.risk_level,
          anomaly_flag: scoringResult.risk_score >= 50
        })
        .eq('id', entityId)
    } else if (entityType === 'VENDOR') {
      await this.client
        .from('vendors')
        .update({
          risk_score: scoringResult.risk_score,
          risk_level: scoringResult.risk_level
        })
        .eq('id', entityId)
    }

    // 6. Record Audit Log for significant risk score changes
    if (scoringResult.risk_score >= 50) {
      try {
        await this.auditRepo.record({
          user_id: actor?.id || null,
          user_name: actor?.name || 'Deterministic Risk Engine',
          user_role: actor?.role || 'SYSTEM',
          action: 'RISK_ASSESSMENT_EVALUATED',
          entity_type: entityType.toLowerCase(),
          entity_id: entityId,
          source: 'FIN-SHIELD Engine',
          new_state: {
            risk_score: scoringResult.risk_score,
            risk_level: scoringResult.risk_level,
            anomalies_detected: anomalies.length
          }
        })
      } catch (logErr: any) {
        console.warn('[AUDIT LOG WARN]', logErr.message)
      }
    }

    const sources = Array.from(new Set(evidence.map(e => e.source)))
    const maxScore = evidence.reduce((m, e) => Math.max(m, e.risk_contribution), 0)

    return {
      entity_type: entityType,
      entityType: entityType,
      entity_id: entityId,
      entityId: entityId,
      entity_reference: entityReference,
      risk_score: scoringResult.risk_score,
      riskScore: { score: scoringResult.risk_score, level: scoringResult.risk_level },
      risk_level: scoringResult.risk_level,
      explanation: scoringResult.explanation,
      evidence,
      findings: evidence,
      sources,
      metrics: {
        anomalyCount: anomalies.length,
        signalsCount: scoringResult.signals.length,
        maxScoreContribution: maxScore
      },
      signals: scoringResult.signals,
      component_scores: scoringResult.component_scores,
      calculated_at: scoringResult.calculated_at
    }
  }

  /**
   * Convenience wrapper to aggregate evidence specifically for an invoice.
   */
  async aggregateInvoiceEvidence(invoiceId: string, actor?: { id?: string; name?: string; role?: string }): Promise<UnifiedEvidencePackage> {
    return this.aggregateEntityEvidence('INVOICE', invoiceId, actor)
  }
}

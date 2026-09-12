import { AnomalyDetectionService, DetectedAnomaly, AnomalySeverity } from './anomalyDetection.service.js'
import { supabaseAdmin } from '../config/supabase.js'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface RiskSignalContribution {
  signal_type: string
  severity: AnomalySeverity
  score_contribution: number
  description: string
  evidence_source: string
}

export interface RiskScoreResult {
  risk_score: number
  risk_level: RiskLevel
  signals: RiskSignalContribution[]
  explanation: string
  component_scores: {
    po_mismatch: number
    duplicate_risk: number
    banking_alteration: number
    amount_velocity: number
    budget_impact: number
    vendor_reputation: number
    cluster_multiplier: number
  }
  calculated_at: string
}

export interface CalculatedEntityRisk {
  score: number
  classification: RiskLevel
  risk_score: number
  risk_level: RiskLevel
  contributingFactors: RiskSignalContribution[]
  compoundMultiplier: number
  signals: RiskSignalContribution[]
  component_scores: RiskScoreResult['component_scores']
  explanation: string
  calculated_at: string
}

export interface RiskWeightConfig {
  poMismatchMax: number
  duplicateMax: number
  bankingAlterationMax: number
  amountVelocityMax: number
  budgetImpactMax: number
  vendorReputationMax: number
  clusterMultiplierBoost: number
}

export const DEFAULT_RISK_WEIGHTS: RiskWeightConfig = {
  poMismatchMax: 30,
  duplicateMax: 30,
  bankingAlterationMax: 30,
  amountVelocityMax: 25,
  budgetImpactMax: 20,
  vendorReputationMax: 15,
  clusterMultiplierBoost: 15
}

export class RiskScoringService {
  constructor(private weights: RiskWeightConfig = DEFAULT_RISK_WEIGHTS) {}

  classifyScore(score: number): RiskLevel {
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 25) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * Deterministically calculate a 0-100 risk score from a set of detected anomalies.
   */
  calculateRiskScore(anomalies: DetectedAnomaly[]): RiskScoreResult {
    const signals: RiskSignalContribution[] = []
    const componentScores = {
      po_mismatch: 0,
      duplicate_risk: 0,
      banking_alteration: 0,
      amount_velocity: 0,
      budget_impact: 0,
      vendor_reputation: 0,
      cluster_multiplier: 0
    }

    if (anomalies.length === 0) {
      return {
        risk_score: 5,
        risk_level: 'LOW',
        signals: [],
        explanation: 'Clean financial audit: No statistical deviations, duplicate vectors, or PO discrepancies detected.',
        component_scores: componentScores,
        calculated_at: new Date().toISOString()
      }
    }

    // Evaluate each anomaly deterministically
    for (const anom of anomalies) {
      let contribution = 0

      switch (anom.anomaly_type) {
        case 'PO_MISMATCH':
          contribution = anom.severity === 'CRITICAL' ? this.weights.poMismatchMax : Math.round(this.weights.poMismatchMax * 0.65)
          componentScores.po_mismatch = Math.max(componentScores.po_mismatch, contribution)
          break

        case 'DUPLICATE_INVOICE':
          contribution = anom.severity === 'CRITICAL' ? this.weights.duplicateMax : Math.round(this.weights.duplicateMax * 0.7)
          componentScores.duplicate_risk = Math.max(componentScores.duplicate_risk, contribution)
          break

        case 'ABNORMAL_PAYMENT_BEHAVIOR':
          contribution = this.weights.bankingAlterationMax
          componentScores.banking_alteration = Math.max(componentScores.banking_alteration, contribution)
          break

        case 'UNUSUALLY_HIGH_INVOICE_AMOUNT':
        case 'UNUSUALLY_HIGH_TRANSACTION_AMOUNT':
        case 'SUDDEN_SPEND_INCREASE':
          contribution = anom.severity === 'CRITICAL' ? this.weights.amountVelocityMax : Math.round(this.weights.amountVelocityMax * 0.6)
          componentScores.amount_velocity = Math.max(componentScores.amount_velocity, contribution)
          break

        case 'BUDGET_THRESHOLD_EXCEEDED':
          contribution = anom.severity === 'CRITICAL' ? this.weights.budgetImpactMax : Math.round(this.weights.budgetImpactMax * 0.6)
          componentScores.budget_impact = Math.max(componentScores.budget_impact, contribution)
          break

        case 'UNUSUAL_VENDOR_ACTIVITY':
          contribution = anom.severity === 'CRITICAL' ? this.weights.vendorReputationMax : Math.round(this.weights.vendorReputationMax * 0.5)
          componentScores.vendor_reputation = Math.max(componentScores.vendor_reputation, contribution)
          break

        case 'UNUSUAL_INVOICE_FREQUENCY':
        case 'UNUSUAL_TRANSACTION_FREQUENCY':
          contribution = 10
          break
      }

      if (contribution > 0) {
        signals.push({
          signal_type: anom.anomaly_type,
          severity: anom.severity,
          score_contribution: contribution,
          description: anom.explanation,
          evidence_source: anom.evidence_source
        })
      }
    }

    // Apply compound cluster synergy if multiple critical/high anomalies are active
    const highOrCriticalCount = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length
    if (highOrCriticalCount >= 3) {
      componentScores.cluster_multiplier = this.weights.clusterMultiplierBoost
      signals.push({
        signal_type: 'MULTI_SIGNAL_COMPOUND_SYNERGY',
        severity: 'CRITICAL',
        score_contribution: this.weights.clusterMultiplierBoost,
        description: `Compound correlation multiplier: ${highOrCriticalCount} distinct high/critical financial breaches co-occurring simultaneously.`,
        evidence_source: 'FIN-SHIELD_CORRELATION_MATRIX'
      })
    }

    // Base score calculation
    let rawScore = (
      componentScores.po_mismatch +
      componentScores.duplicate_risk +
      componentScores.banking_alteration +
      componentScores.amount_velocity +
      componentScores.budget_impact +
      componentScores.vendor_reputation +
      componentScores.cluster_multiplier
    )

    // Base floor of 10 if any anomaly exists
    rawScore = Math.max(rawScore, 10)
    // Clamp to 100
    const finalScore = Math.min(100, Math.round(rawScore))
    const riskLevel = this.classifyScore(finalScore)

    // Build explainable text summary
    const topReasons = signals
      .sort((a, b) => b.score_contribution - a.score_contribution)
      .slice(0, 3)
      .map(s => s.description)

    const explanation = `Evaluated score of ${finalScore}/100 (${riskLevel}). Primary risk drivers: ${topReasons.join(' ')}`

    return {
      risk_score: finalScore,
      risk_level: riskLevel,
      signals,
      explanation,
      component_scores: componentScores,
      calculated_at: new Date().toISOString()
    }
  }

  async calculateInvoiceRisk(invoiceId: string): Promise<CalculatedEntityRisk> {
    const anomalyDetector = new AnomalyDetectionService()
    const anomalies = await anomalyDetector.detectInvoiceAnomalies(invoiceId)
    const result = this.calculateRiskScore(anomalies)
    const hasCluster = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length >= 3

    return {
      score: result.risk_score,
      classification: result.risk_level,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      contributingFactors: result.signals,
      compoundMultiplier: hasCluster ? 1.5 : 1.0,
      signals: result.signals,
      component_scores: result.component_scores,
      explanation: result.explanation,
      calculated_at: result.calculated_at
    }
  }

  async calculateTransactionRisk(transactionId: string): Promise<CalculatedEntityRisk> {
    const anomalyDetector = new AnomalyDetectionService()
    const anomalies = await anomalyDetector.detectTransactionAnomalies(transactionId)
    const result = this.calculateRiskScore(anomalies)

    return {
      score: result.risk_score,
      classification: result.risk_level,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      contributingFactors: result.signals,
      compoundMultiplier: 1.0,
      signals: result.signals,
      component_scores: result.component_scores,
      explanation: result.explanation,
      calculated_at: result.calculated_at
    }
  }

  async calculateVendorRisk(vendorId: string): Promise<CalculatedEntityRisk> {
    const anomalyDetector = new AnomalyDetectionService()
    const { data: invoices } = await supabaseAdmin.from('invoices').select('id').eq('vendor_id', vendorId).limit(5)
    const anomalies: DetectedAnomaly[] = []
    for (const inv of invoices || []) {
      const anoms = await anomalyDetector.detectInvoiceAnomalies(inv.id)
      anomalies.push(...anoms)
    }
    const result = this.calculateRiskScore(anomalies)

    return {
      score: result.risk_score,
      classification: result.risk_level,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      contributingFactors: result.signals,
      compoundMultiplier: 1.0,
      signals: result.signals,
      component_scores: result.component_scores,
      explanation: result.explanation,
      calculated_at: result.calculated_at
    }
  }

  async calculateBudgetRisk(budgetId: string): Promise<CalculatedEntityRisk> {
    const { data: budget } = await supabaseAdmin.from('budgets').select('*').eq('id', budgetId).maybeSingle()
    let score = 15
    let healthStatus = 'ON_TRACK'
    if (budget) {
      const allocated = Number(budget.allocated_amount) || 1
      const spent = Number(budget.spent_amount) || 0
      const utilPct = (spent / allocated) * 100
      if (utilPct >= 100) {
        score = 88
        healthStatus = 'OVER_BUDGET'
      } else if (utilPct >= 85) {
        score = 65
        healthStatus = 'NEAR_LIMIT'
      } else {
        score = 20
        healthStatus = 'ON_TRACK'
      }
    }
    const classification = this.classifyScore(score)

    return {
      score,
      classification,
      risk_score: score,
      risk_level: classification,
      contributingFactors: [],
      compoundMultiplier: 1.0,
      signals: [],
      component_scores: {
        po_mismatch: 0,
        duplicate_risk: 0,
        banking_alteration: 0,
        amount_velocity: 0,
        budget_impact: score,
        vendor_reputation: 0,
        cluster_multiplier: 0
      },
      explanation: `Budget risk scored at ${score}/100 based on utilization status ${healthStatus}.`,
      calculated_at: new Date().toISOString()
    }
  }
}

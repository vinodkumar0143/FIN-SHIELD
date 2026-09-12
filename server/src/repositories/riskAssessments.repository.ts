import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type RiskAssessmentRow = Database['public']['Tables']['risk_assessments']['Row']
export type RiskAssessmentInsert = Database['public']['Tables']['risk_assessments']['Insert']

export interface RiskFilterOptions {
  entityType?: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  minScore?: number
  maxScore?: number
  limit?: number
  offset?: number
}

export class RiskAssessmentsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(options?: RiskFilterOptions): Promise<{ data: RiskAssessmentRow[]; total: number }> {
    const limit = options?.limit || 50
    const offset = options?.offset || 0

    let query = this.client
      .from('risk_assessments')
      .select('*', { count: 'exact' })

    if (options?.entityType) {
      query = query.eq('entity_type', options.entityType)
    }
    if (options?.riskLevel) {
      query = query.eq('risk_level', options.riskLevel)
    }
    if (options?.minScore !== undefined) {
      query = query.gte('overall_score', options.minScore)
    }
    if (options?.maxScore !== undefined) {
      query = query.lte('overall_score', options.maxScore)
    }

    query = query
      .order('overall_score', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: data || [],
      total: count || 0
    }
  }

  async findByEntity(entityType: RiskAssessmentRow['entity_type'], entityId: string): Promise<RiskAssessmentRow | null> {
    const { data, error } = await this.client
      .from('risk_assessments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return null
    return data
  }

  async create(assessment: RiskAssessmentInsert): Promise<RiskAssessmentRow> {
    const { data, error } = await this.client
      .from('risk_assessments')
      .insert(assessment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async upsert(assessment: RiskAssessmentInsert): Promise<RiskAssessmentRow> {
    // Check if an assessment already exists for this entity
    const existing = await this.findByEntity(assessment.entity_type, assessment.entity_id)

    if (existing) {
      const { data, error } = await this.client
        .from('risk_assessments')
        .update({
          overall_score: assessment.overall_score,
          risk_level: assessment.risk_level,
          component_scores: assessment.component_scores,
          reasons: assessment.reasons
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    }

    return this.create(assessment)
  }

  async getGlobalMetrics(): Promise<{
    averageScore: number
    averageRiskScore: number
    totalAssessments: number
    levelDistribution: Record<string, number>
    distribution: Record<string, number>
    highRiskCount: number
    criticalRiskCount: number
  }> {
    const { data, error } = await this.client
      .from('risk_assessments')
      .select('overall_score, risk_level')

    if (error) throw error
    const rows = data || []

    if (rows.length === 0) {
      const emptyDist = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
      return {
        averageScore: 0,
        averageRiskScore: 0,
        totalAssessments: 0,
        levelDistribution: emptyDist,
        distribution: emptyDist,
        highRiskCount: 0,
        criticalRiskCount: 0
      }
    }

    let sum = 0
    const distribution: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }

    for (const r of rows) {
      sum += r.overall_score
      distribution[r.risk_level] = (distribution[r.risk_level] || 0) + 1
    }

    const avg = Number((sum / rows.length).toFixed(1))
    return {
      averageScore: avg,
      averageRiskScore: avg,
      totalAssessments: rows.length,
      levelDistribution: distribution,
      distribution,
      highRiskCount: distribution.HIGH || 0,
      criticalRiskCount: distribution.CRITICAL || 0
    }
  }
}

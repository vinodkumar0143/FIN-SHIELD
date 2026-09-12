import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type RiskAssessmentRow = Database['public']['Tables']['risk_assessments']['Row']
export type RiskAssessmentInsert = Database['public']['Tables']['risk_assessments']['Insert']

export class RiskAssessmentsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findByEntity(entityType: RiskAssessmentRow['entity_type'], entityId: string): Promise<RiskAssessmentRow | null> {
    const { data, error } = await this.client
      .from('risk_assessments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

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
}

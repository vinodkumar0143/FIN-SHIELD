import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type RecommendationRow = Database['public']['Tables']['recommendations']['Row']
export type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert']
export type RecommendationUpdate = Database['public']['Tables']['recommendations']['Update']

export class RecommendationsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findByInvestigationId(investigationId: string): Promise<RecommendationRow[]> {
    const { data, error } = await this.client
      .from('recommendations')
      .select('*')
      .eq('investigation_id', investigationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<RecommendationRow | null> {
    const { data, error } = await this.client
      .from('recommendations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async create(rec: RecommendationInsert): Promise<RecommendationRow> {
    const { data, error } = await this.client
      .from('recommendations')
      .insert(rec)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: RecommendationRow['status']): Promise<RecommendationRow> {
    const { data, error } = await this.client
      .from('recommendations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<RecommendationRow[]> {
    const { data, error } = await this.client
      .from('recommendations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }
}

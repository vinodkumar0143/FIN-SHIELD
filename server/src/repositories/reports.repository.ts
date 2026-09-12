import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type ReportRow = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export class ReportsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0, type?: string): Promise<ReportRow[]> {
    let query = this.client
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && type !== 'ALL') {
      query = query.eq('report_type', type as any)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<ReportRow | null> {
    const { data, error } = await this.client
      .from('reports')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async create(report: ReportInsert): Promise<ReportRow> {
    const { data, error } = await this.client
      .from('reports')
      .insert(report)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: ReportUpdate): Promise<ReportRow> {
    const { data, error } = await this.client
      .from('reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

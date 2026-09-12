import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type EscalationRow = Database['public']['Tables']['escalations']['Row']
export type EscalationInsert = Database['public']['Tables']['escalations']['Insert']
export type EscalationUpdate = Database['public']['Tables']['escalations']['Update']

export class EscalationsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0, status?: string): Promise<EscalationRow[]> {
    let query = this.client
      .from('escalations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'ALL') {
      query = query.eq('status', status as any)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<EscalationRow | null> {
    const { data, error } = await this.client
      .from('escalations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async findByEntity(entityType: string, entityId: string): Promise<EscalationRow[]> {
    const { data, error } = await this.client
      .from('escalations')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findOpen(): Promise<EscalationRow[]> {
    const { data, error } = await this.client
      .from('escalations')
      .select('*')
      .in('status', ['OPEN', 'INVESTIGATING'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(escalation: EscalationInsert): Promise<EscalationRow> {
    const { data, error } = await this.client
      .from('escalations')
      .insert(escalation)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: EscalationUpdate): Promise<EscalationRow> {
    const { data, error } = await this.client
      .from('escalations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async resolve(id: string, comments?: string): Promise<EscalationRow> {
    const { data, error } = await this.client
      .from('escalations')
      .update({
        status: 'RESOLVED',
        resolved_at: new Date().toISOString(),
        comments: comments || 'Resolved by operator'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

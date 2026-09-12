import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type AlertRow = Database['public']['Tables']['alerts']['Row']
export type AlertInsert = Database['public']['Tables']['alerts']['Insert']
export type AlertUpdate = Database['public']['Tables']['alerts']['Update']

export class AlertsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<AlertRow[]> {
    const { data, error } = await this.client
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findActive(): Promise<AlertRow[]> {
    const { data, error } = await this.client
      .from('alerts')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(alert: AlertInsert): Promise<AlertRow> {
    const { data, error } = await this.client
      .from('alerts')
      .insert(alert)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async markAsRead(id: string): Promise<AlertRow> {
    const { data, error } = await this.client
      .from('alerts')
      .update({ read_state: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async resolve(id: string): Promise<AlertRow> {
    const { data, error } = await this.client
      .from('alerts')
      .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

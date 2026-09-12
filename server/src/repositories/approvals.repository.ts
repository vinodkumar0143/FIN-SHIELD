import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type ApprovalRow = Database['public']['Tables']['approvals']['Row']
export type ApprovalInsert = Database['public']['Tables']['approvals']['Insert']
export type ApprovalUpdate = Database['public']['Tables']['approvals']['Update']

export class ApprovalsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<ApprovalRow[]> {
    const { data, error } = await this.client
      .from('approvals')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<ApprovalRow | null> {
    const { data, error } = await this.client
      .from('approvals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findPending(): Promise<ApprovalRow[]> {
    const { data, error } = await this.client
      .from('approvals')
      .select('*')
      .eq('status', 'PENDING')
      .order('amount', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(approval: ApprovalInsert): Promise<ApprovalRow> {
    const { data, error } = await this.client
      .from('approvals')
      .insert(approval)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: ApprovalUpdate): Promise<ApprovalRow> {
    const { data, error } = await this.client
      .from('approvals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

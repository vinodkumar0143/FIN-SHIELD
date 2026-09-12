import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type TransactionRow = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export class TransactionsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<TransactionRow[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<TransactionRow | null> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByVendor(vendorId: string): Promise<TransactionRow[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findAnomalies(): Promise<TransactionRow[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('anomaly_flag', true)
      .order('risk_score', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(transaction: TransactionInsert): Promise<TransactionRow> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

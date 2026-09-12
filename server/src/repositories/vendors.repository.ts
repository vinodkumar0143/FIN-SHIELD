import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type VendorRow = Database['public']['Tables']['vendors']['Row']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert']
export type VendorUpdate = Database['public']['Tables']['vendors']['Update']

export class VendorsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<VendorRow[]> {
    const { data, error } = await this.client
      .from('vendors')
      .select('*')
      .order('risk_score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<VendorRow | null> {
    const { data, error } = await this.client
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByRiskLevel(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): Promise<VendorRow[]> {
    const { data, error } = await this.client
      .from('vendors')
      .select('*')
      .eq('risk_level', riskLevel)
      .order('total_exposure', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(vendor: VendorInsert): Promise<VendorRow> {
    const { data, error } = await this.client
      .from('vendors')
      .insert(vendor)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: VendorUpdate): Promise<VendorRow> {
    const { data, error } = await this.client
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

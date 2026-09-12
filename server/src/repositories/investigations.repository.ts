import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type InvestigationRow = Database['public']['Tables']['investigations']['Row']
export type InvestigationInsert = Database['public']['Tables']['investigations']['Insert']
export type InvestigationUpdate = Database['public']['Tables']['investigations']['Update']
export type InvestigationEvidenceRow = Database['public']['Tables']['investigation_evidence']['Row']
export type InvestigationEvidenceInsert = Database['public']['Tables']['investigation_evidence']['Insert']

export class InvestigationsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<InvestigationRow[]> {
    const { data, error } = await this.client
      .from('investigations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<InvestigationRow | null> {
    const { data, error } = await this.client
      .from('investigations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByInvestigationId(investigationId: string): Promise<InvestigationRow | null> {
    const { data, error } = await this.client
      .from('investigations')
      .select('*')
      .eq('investigation_id', investigationId)
      .single()

    if (error) return null
    return data
  }

  async findEvidence(investigationId: string): Promise<InvestigationEvidenceRow[]> {
    const { data, error } = await this.client
      .from('investigation_evidence')
      .select('*')
      .eq('investigation_id', investigationId)
      .order('risk_contribution', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addEvidence(evidence: InvestigationEvidenceInsert): Promise<InvestigationEvidenceRow> {
    const { data, error } = await this.client
      .from('investigation_evidence')
      .insert(evidence)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async create(investigation: InvestigationInsert): Promise<InvestigationRow> {
    const { data, error } = await this.client
      .from('investigations')
      .insert(investigation)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: InvestigationUpdate): Promise<InvestigationRow> {
    const { data, error } = await this.client
      .from('investigations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

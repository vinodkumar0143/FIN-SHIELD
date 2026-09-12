import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type BudgetRow = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export class BudgetsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(): Promise<BudgetRow[]> {
    const { data, error } = await this.client
      .from('budgets')
      .select('*')
      .order('allocated_amount', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<BudgetRow | null> {
    const { data, error } = await this.client
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async findByDepartment(department: string): Promise<BudgetRow[]> {
    const { data, error } = await this.client
      .from('budgets')
      .select('*')
      .eq('department', department)

    if (error) throw error
    return data || []
  }

  async create(budget: BudgetInsert): Promise<BudgetRow> {
    const { data, error } = await this.client
      .from('budgets')
      .insert(budget)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: BudgetUpdate): Promise<BudgetRow> {
    const { data, error } = await this.client
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

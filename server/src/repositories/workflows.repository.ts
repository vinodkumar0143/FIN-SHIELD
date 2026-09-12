import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type WorkflowTaskRow = Database['public']['Tables']['workflow_tasks']['Row']
export type WorkflowTaskInsert = Database['public']['Tables']['workflow_tasks']['Insert']
export type WorkflowTaskUpdate = Database['public']['Tables']['workflow_tasks']['Update']

export class WorkflowsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 50, offset: number = 0): Promise<WorkflowTaskRow[]> {
    const { data, error } = await this.client
      .from('workflow_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findByTaskId(taskId: string): Promise<WorkflowTaskRow | null> {
    const { data, error } = await this.client
      .from('workflow_tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (error) return null
    return data
  }

  async findActivePaymentHolds(): Promise<WorkflowTaskRow[]> {
    const { data, error } = await this.client
      .from('workflow_tasks')
      .select('*')
      .eq('workflow_type', 'PAYMENT_HOLD')
      .eq('status', 'ACTIVE')
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  }

  async create(task: WorkflowTaskInsert): Promise<WorkflowTaskRow> {
    const { data, error } = await this.client
      .from('workflow_tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: WorkflowTaskUpdate): Promise<WorkflowTaskRow> {
    const { data, error } = await this.client
      .from('workflow_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

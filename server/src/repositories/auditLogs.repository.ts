import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export class AuditLogsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(limit: number = 100, offset: number = 0): Promise<AuditLogRow[]> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLogRow[]> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('timestamp', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Append-only ledger recording.
   * Modifying or deleting audit records is forbidden by PostgreSQL RLS.
   */
  async record(entry: AuditLogInsert): Promise<AuditLogRow> {
    const { data, error } = await this.client
      .from('audit_logs')
      .insert(entry)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export interface AuditLogFilters {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  entityType?: string
  source?: string
  search?: string
  limit?: number
  offset?: number
}

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

  async findWithFilters(filters: AuditLogFilters = {}): Promise<{
    data: AuditLogRow[]
    total: number
  }> {
    const limit = filters.limit || 50
    const offset = filters.offset || 0

    let query = this.client
      .from('audit_logs')
      .select('*', { count: 'exact' })

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.action && filters.action !== 'ALL') {
      query = query.eq('action', filters.action)
    }

    if (filters.entityType && filters.entityType !== 'ALL') {
      query = query.eq('entity_type', filters.entityType)
    }

    if (filters.source && filters.source !== 'ALL') {
      query = query.eq('source', filters.source)
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate)
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim()
      // ILIKE search across actor name, action, or entity_id
      query = query.or(`user_name.ilike.%${s}%,action.ilike.%${s}%,entity_id.ilike.%${s}%,workflow_reference.ilike.%${s}%`)
    }

    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error
    return {
      data: data || [],
      total: count || (data?.length ?? 0)
    }
  }

  async findById(id: string): Promise<AuditLogRow | null> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
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

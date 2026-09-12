import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'
import type { UserRole } from '../lib/permissions.js'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface UserQueryFilters {
  search?: string
  role?: string
  status?: string
  limit?: number
  offset?: number
}

export class UsersRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async findAll(filters: UserQueryFilters = {}): Promise<{ users: ProfileRow[]; total: number }> {
    const limit = filters.limit || 50
    const offset = filters.offset || 0

    let query = this.client
      .from('profiles')
      .select('*', { count: 'exact' })

    if (filters.role && filters.role !== 'ALL') {
      query = query.eq('role', filters.role as any)
    }

    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status as any)
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim()
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,department.ilike.%${s}%`)
    }

    query = query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return {
      users: data || [],
      total: count || (data?.length ?? 0)
    }
  }

  async findById(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) return null
    return data
  }

  async updateRole(id: string, newRole: UserRole): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateStatus(id: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<ProfileRow> {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

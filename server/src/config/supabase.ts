import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import type { Database } from '../types/database.types.js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

/**
 * Privileged administrative Supabase Client.
 * STRICTLY SERVER-SIDE. NEVER EXPOSE TO CLIENT BUNDLE.
 * Bypasses RLS for autonomous background operations, risk evaluations, and seeding.
 */
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Standard Supabase client using public Anon key.
 */
export const supabaseAnon: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

/**
 * Scoped client created for an incoming user request with their JWT.
 * Respects Row Level Security (RLS) as configured in Phase 2B.
 */
export function createSupabaseUserClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

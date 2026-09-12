import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export interface SystemSettingsRecord {
  orgName: string
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
  fiscalYearStart: string
  riskThresholdHigh: number
  riskThresholdCritical: number
  budgetAlertThreshold: number
  budgetBreachThreshold: number
  autoHoldEnabled: boolean
  emailAlertsEnabled: boolean
  slackAlertsEnabled: boolean
  forecastDefaultHorizon: '7D' | '30D' | '90D' | '1Y'
  aiModelPreference: string
  immutableAuditLedger: boolean
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsRecord = {
  orgName: 'Apex Global Technologies Corp',
  currency: 'INR',
  currencySymbol: '₹',
  timezone: 'Asia/Kolkata (IST)',
  dateFormat: 'DD/MM/YYYY',
  fiscalYearStart: 'April',
  riskThresholdHigh: 70,
  riskThresholdCritical: 80,
  budgetAlertThreshold: 85,
  budgetBreachThreshold: 100,
  autoHoldEnabled: true,
  emailAlertsEnabled: true,
  slackAlertsEnabled: false,
  forecastDefaultHorizon: '30D',
  aiModelPreference: 'qwen-plus',
  immutableAuditLedger: true
}

export class SettingsRepository {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async getSettings(): Promise<SystemSettingsRecord> {
    try {
      const { data, error } = await this.client
        .from('system_settings' as any)
        .select('value')
        .eq('key', 'app_config')
        .maybeSingle()

      if (error || !data) {
        return DEFAULT_SYSTEM_SETTINGS
      }

      return {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...(data as any).value
      }
    } catch {
      return DEFAULT_SYSTEM_SETTINGS
    }
  }

  async updateSettings(settings: Partial<SystemSettingsRecord>, updatedBy?: string): Promise<SystemSettingsRecord> {
    const current = await this.getSettings()
    const merged: SystemSettingsRecord = {
      ...current,
      ...settings,
      immutableAuditLedger: true // Cannot disable audit ledger
    }

    const { error } = await this.client
      .from('system_settings' as any)
      .upsert({
        key: 'app_config',
        value: merged as any,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.warn('[SettingsRepository Update Error]', error)
    }

    return merged
  }
}

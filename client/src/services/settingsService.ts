import { apiClient } from './apiClient'

export interface SystemSettings {
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

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    return apiClient.get('/api/settings')
  },

  async updateSettings(updates: Partial<SystemSettings>): Promise<{
    success: boolean
    data: SystemSettings
    message: string
  }> {
    return apiClient.patch('/api/settings', updates)
  }
}

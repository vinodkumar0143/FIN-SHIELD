import { apiClient } from './apiClient'
import { supabase } from '../lib/supabaseClient'

export interface SmartAlertItem {
  id: string
  alert_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  entity_type: string
  entity_id: string
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED'
  read_state?: boolean
  is_read?: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at?: string
}

export interface AlertFilterParams {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status?: 'ACTIVE' | 'RESOLVED' | 'DISMISSED'
  type?: string
  limit?: number
  offset?: number
}

export interface AlertSyncResult {
  invoicesScanned: number
  duplicatesScanned: number
  budgetsScanned: number
  paymentHoldsScanned: number
  createdAlertsCount: number
}

export const alertsService = {
  async getAlerts(params: AlertFilterParams = {}): Promise<SmartAlertItem[]> {
    return apiClient.get('/api/alerts', params as Record<string, any>)
  },

  async getAlertById(id: string): Promise<SmartAlertItem> {
    return apiClient.get(`/api/alerts/${id}`)
  },

  async markAsRead(id: string): Promise<SmartAlertItem> {
    return apiClient.post(`/api/alerts/${id}/read`)
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/api/alerts/read-all')
  },

  async resolveAlert(id: string): Promise<{ success: boolean; data: SmartAlertItem; message: string }> {
    return apiClient.post(`/api/alerts/${id}/resolve`)
  },

  async syncAlerts(): Promise<AlertSyncResult> {
    const res = await apiClient.post<{ success: boolean; data: AlertSyncResult }>('/api/alerts/sync')
    return res.data
  },

  subscribeToAlerts(callback: (payload: { eventType: string; new: any; old: any }) => void) {
    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        callback({ eventType: payload.eventType, new: payload.new, old: payload.old })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

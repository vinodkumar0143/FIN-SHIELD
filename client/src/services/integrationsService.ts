import { apiClient } from './apiClient'

export interface IntegrationConfigItem {
  key: string
  value: string
}

export interface IntegrationItem {
  id: string
  name: string
  category: string
  status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED'
  configured: boolean
  latencyMs: number
  lastSync: string
  description: string
  capabilities: string[]
  configKeys: IntegrationConfigItem[]
}

export interface TestProbeResult {
  id: string
  success: boolean
  latencyMs: number
  message: string
  timestamp: string
}

export const integrationsService = {
  async getIntegrations(): Promise<IntegrationItem[]> {
    return apiClient.get('/api/integrations')
  },

  async getIntegrationStatus(id: string): Promise<IntegrationItem> {
    return apiClient.get(`/api/integrations/${id}/status`)
  },

  async testIntegration(id: string): Promise<TestProbeResult> {
    const res = await apiClient.post<{ success: boolean; data: TestProbeResult }>(`/api/integrations/${id}/test`)
    return (res as any).data || res
  }
}

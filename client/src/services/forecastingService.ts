import { apiClient } from './apiClient'

export interface ForecastPoint {
  date: string
  inflow: number
  outflow: number
  outflowWithHolds: number
  netCash: number
  closingBalance: number
  isProjected: boolean
}

export interface KeyDriver {
  title: string
  description: string
  impact: string
  type: 'positive' | 'negative'
}

export interface CashFlowSummary {
  currentBalance: number
  projectedInflow: number
  projectedOutflow: number
  projectedNet: number
  capitalPreservedByHolds: number
  activeHoldsCount: number
  forecastHorizon: string
  keyDrivers: KeyDriver[]
}

export const forecastingService = {
  async getCashFlow(range: '7D' | '30D' | '90D' | '1Y' = '30D'): Promise<{
    timeSeries: ForecastPoint[]
    summary: CashFlowSummary
  }> {
    return apiClient.get('/api/forecasting/cash-flow', { range })
  },

  async getSummary(range: '7D' | '30D' | '90D' | '1Y' = '30D'): Promise<CashFlowSummary> {
    return apiClient.get('/api/forecasting/cash-flow/summary', { range })
  }
}

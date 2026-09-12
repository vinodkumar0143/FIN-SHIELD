import { apiClient } from './apiClient'

export interface StructuredFinancialReport {
  executiveSummary: string
  financialPerformance: {
    revenue: number
    spend: number
    netPosition: number
    commentary: string
  }
  cashFlowOutlook: {
    projectedInflow: number
    projectedOutflow: number
    commentary: string
  }
  spendingTrendAnalysis: string
  riskAnomalySummary: {
    totalAnomalies: number
    highRiskCount: number
    commentary: string
  }
  vendorInvoiceInsights: string
  budgetObservations: string
  keyFindings: string[]
  recommendedActions: Array<{
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    action: string
    rationale: string
  }>
  isAiFallback: boolean
  modelUsed?: string
}

export interface ReportItem {
  id: string
  report_name: string
  report_type: 'FINANCIAL_SUMMARY' | 'RISK_REPORT' | 'VENDOR_RISK_REPORT' | 'BUDGET_REPORT' | 'ANOMALY_REPORT' | 'INVESTIGATION_REPORT'
  reporting_period: string
  generated_by: string
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  file_size?: string
  storage_path?: string
  metadata?: StructuredFinancialReport
  created_at: string
  updated_at: string
}

export interface GenerateReportPayload {
  reportName: string
  reportType: 'FINANCIAL_SUMMARY' | 'RISK_REPORT' | 'VENDOR_RISK_REPORT' | 'BUDGET_REPORT' | 'ANOMALY_REPORT' | 'INVESTIGATION_REPORT'
  reportingPeriod?: string
  financialScope?: string
}

export const reportsService = {
  async getReports(type?: string): Promise<ReportItem[]> {
    return apiClient.get('/api/reports', type && type !== 'ALL' ? { type } : undefined)
  },

  async getReportById(id: string): Promise<ReportItem> {
    return apiClient.get(`/api/reports/${id}`)
  },

  async generateReport(payload: GenerateReportPayload): Promise<{
    report: ReportItem
    content: StructuredFinancialReport
    message: string
  }> {
    return apiClient.post('/api/reports/generate', payload)
  }
}

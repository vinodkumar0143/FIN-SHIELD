import { apiClient } from './apiClient'

export interface MonthlyTrendPoint {
  month: string
  revenue: number
  spend: number
  riskIndex: number
  netVariance: number
  invoiceCount: number
}

export interface MacroTrendsResponse {
  monthlyTrends: MonthlyTrendPoint[]
  kpis: {
    totalSpendYTD: number
    totalRevenueYTD: number
    avgMonthlyRiskIndex: number
    momSpendChangePercent: number
    unusualTrendFlags: string[]
  }
}

export interface DepartmentSpend {
  department: string
  amount: number
  percentage: number
  budgetCap: number
  isOverBudget: boolean
}

export interface CategorySpend {
  category: string
  amount: number
  percentage: number
}

export interface SpendingBreakdownResponse {
  departments: DepartmentSpend[]
  categories: CategorySpend[]
  totalSpend: number
  anomalyDepartments: string[]
}

export interface VendorSpendMetric {
  vendorId: string
  vendorName: string
  totalSpend: number
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  invoiceCount: number
  momChangePercent: number
  status: string
}

export interface VendorAnalyticsResponse {
  vendors: VendorSpendMetric[]
  concentrationSummary: {
    top3SharePercent: number
    highestRiskVendor: string
    spikeVendors: string[]
  }
}

export interface BudgetUtilizationSummary {
  totalAllocated: number
  totalSpent: number
  totalCommitted: number
  utilizationPercentage: number
  status: 'OPTIMAL' | 'WARNING' | 'BREACHED'
  budgets: Array<{
    id: string
    name: string
    department: string
    category: string
    allocated: number
    spent: number
    committed: number
    utilization: number
    status: 'OPTIMAL' | 'WARNING' | 'BREACHED'
  }>
}

export const analyticsService = {
  async getTrends(): Promise<MacroTrendsResponse> {
    return apiClient.get('/api/analytics/trends')
  },

  async getSpending(): Promise<SpendingBreakdownResponse> {
    return apiClient.get('/api/analytics/spending')
  },

  async getVendors(): Promise<VendorAnalyticsResponse> {
    return apiClient.get('/api/analytics/vendors')
  },

  async getBudgetPerformance(): Promise<BudgetUtilizationSummary> {
    return apiClient.get('/api/analytics/budget-performance')
  }
}

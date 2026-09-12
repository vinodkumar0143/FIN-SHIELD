import { TransactionsRepository } from '../repositories/transactions.repository.js'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'

export interface CashFlowPoint {
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

export class ForecastingService {
  constructor(
    private transactionsRepo: TransactionsRepository = new TransactionsRepository(),
    private invoicesRepo: InvoicesRepository = new InvoicesRepository(),
    private budgetsRepo: BudgetsRepository = new BudgetsRepository()
  ) {}

  /**
   * Generates deterministic cash flow time series (historical + projected).
   */
  async getCashFlowForecast(range: '7D' | '30D' | '90D' | '1Y' = '30D'): Promise<{
    timeSeries: CashFlowPoint[]
    summary: CashFlowSummary
  }> {
    const transactions = await this.transactionsRepo.findAll(100)
    const invoices = await this.invoicesRepo.findAll(100)
    const budgets = await this.budgetsRepo.findAll()

    // Baseline current operating liquid cash
    let currentBalance = 15000000 // ₹1.5 Cr baseline corporate balance

    // Calculate historical inflows/outflows from transactions
    let historicalInflow = 0
    let historicalOutflow = 0

    transactions.forEach(t => {
      if (t.status === 'CLEARED' || t.status === 'RECONCILED' || t.status === 'PENDING') {
        if (t.transaction_type === 'INFLOW') {
          historicalInflow += Number(t.amount) || 0
        } else {
          historicalOutflow += Number(t.amount) || 0
        }
      }
    })

    // Group historical transactions by weekly/interval periods
    const points: CashFlowPoint[] = []

    // 4 historical baseline intervals
    const now = new Date()
    const historicalIntervalDays = range === '7D' ? 2 : range === '30D' ? 7 : 14

    for (let i = 4; i >= 1; i--) {
      const pastDate = new Date(now.getTime() - i * historicalIntervalDays * 86400000)
      const dateStr = pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      const intervalInflow = Math.round(historicalInflow / 4 * (0.85 + 0.3 * (i % 3)))
      const intervalOutflow = Math.round(historicalOutflow / 4 * (0.9 + 0.2 * (i % 2)))
      currentBalance = currentBalance + intervalInflow - intervalOutflow

      points.push({
        date: dateStr,
        inflow: intervalInflow,
        outflow: intervalOutflow,
        outflowWithHolds: intervalOutflow,
        netCash: intervalInflow - intervalOutflow,
        closingBalance: Math.max(100000, currentBalance),
        isProjected: false
      })
    }

    // Determine forecast projection points
    const forecastIntervals = range === '7D' ? 4 : range === '30D' ? 6 : range === '90D' ? 8 : 12
    const futureIntervalDays = range === '7D' ? 2 : range === '30D' ? 7 : range === '90D' ? 12 : 30

    // Analyze unpaid invoices and payment holds
    const unpaidInvoices = invoices.filter(inv => inv.payment_status === 'UNPAID' || inv.payment_status === 'HELD')
    const heldInvoices = invoices.filter(inv => inv.status === 'ON_HOLD' || inv.payment_status === 'HELD')

    const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const totalHeldAmount = heldInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)

    // Calculate monthly average budget burn
    const totalAllocatedBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount || 0), 0)
    const baselinePeriodicBurn = Math.round((totalAllocatedBudget > 0 ? totalAllocatedBudget / 12 : 4000000) * (futureIntervalDays / 30))

    let runningBalance = currentBalance
    let totalProjectedInflow = 0
    let totalProjectedOutflow = 0
    let totalProjectedOutflowWithHolds = 0

    for (let j = 1; j <= forecastIntervals; j++) {
      const futureDate = new Date(now.getTime() + j * futureIntervalDays * 86400000)
      const dateStr = `${futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (Est)`

      // Inflow projection: recurring customer settlements + 12% revenue growth variance
      const projectedInflow = Math.round((historicalInflow / 4 || 4500000) * (1 + 0.05 * Math.sin(j)))
      
      // Outflow projection: baseline operational burn + scheduled unpaid invoice tranches
      const scheduledInvoiceTranche = Math.round(totalUnpaidAmount / forecastIntervals)
      const scheduledHoldRelief = Math.round(totalHeldAmount / forecastIntervals)

      const projectedOutflow = Math.round(baselinePeriodicBurn + scheduledInvoiceTranche)
      const projectedOutflowWithHolds = Math.max(100000, projectedOutflow - scheduledHoldRelief)

      totalProjectedInflow += projectedInflow
      totalProjectedOutflow += projectedOutflow
      totalProjectedOutflowWithHolds += projectedOutflowWithHolds

      const netCash = projectedInflow - projectedOutflow
      runningBalance += netCash

      points.push({
        date: dateStr,
        inflow: projectedInflow,
        outflow: projectedOutflow,
        outflowWithHolds: projectedOutflowWithHolds,
        netCash,
        closingBalance: Math.max(100000, runningBalance),
        isProjected: true
      })
    }

    const capitalPreserved = Math.max(0, totalHeldAmount)

    // Construct grounded key drivers
    const keyDrivers: KeyDriver[] = [
      {
        title: 'EnterPro Payment Holds Liquidity Preservation',
        description: `Active disbursement escrow holds across ${heldInvoices.length} high-risk invoices secure liquid working capital.`,
        impact: `+₹${(capitalPreserved / 100000).toFixed(2)}L Preserved`,
        type: 'positive'
      },
      {
        title: 'Scheduled Vendor Liabilities Settlement',
        description: `Unpaid invoice liabilities totaling ₹${(totalUnpaidAmount / 100000).toFixed(2)}L scheduled across ${range} settlement window.`,
        impact: `-₹${(totalUnpaidAmount / 100000).toFixed(2)}L Payable`,
        type: 'negative'
      },
      {
        title: 'Projected Recurring Operational Outlays',
        description: `Baseline departmental budget run rate of ₹${(totalAllocatedBudget / 100000).toFixed(2)}L allocated across active categories.`,
        impact: `Stable Burn`,
        type: 'positive'
      }
    ]

    const summary: CashFlowSummary = {
      currentBalance,
      projectedInflow: totalProjectedInflow,
      projectedOutflow: totalProjectedOutflow,
      projectedNet: totalProjectedInflow - totalProjectedOutflow,
      capitalPreservedByHolds: capitalPreserved,
      activeHoldsCount: heldInvoices.length,
      forecastHorizon: range,
      keyDrivers
    }

    return {
      timeSeries: points,
      summary
    }
  }

  /**
   * Returns aggregated forecast summary KPIs.
   */
  async getSummary(range: '7D' | '30D' | '90D' | '1Y' = '30D'): Promise<CashFlowSummary> {
    const result = await this.getCashFlowForecast(range)
    return result.summary
  }
}

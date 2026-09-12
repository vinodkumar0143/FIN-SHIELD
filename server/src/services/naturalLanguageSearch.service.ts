import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'
import { TransactionsRepository } from '../repositories/transactions.repository.js'
import { QwenService } from './qwen.service.js'
import { buildSearchIntentPrompt } from './prompts/financialPrompts.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export interface UnifiedSearchResultItem {
  id: string
  type: 'INVOICE' | 'VENDOR' | 'BUDGET' | 'TRANSACTION'
  title: string
  subtitle: string
  amount?: number
  currency?: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: string
  highlights: string[]
  entityUrl: string
}

export interface NaturalLanguageSearchResponse {
  query: string
  interpretedIntent: {
    entity: 'invoices' | 'vendors' | 'transactions' | 'budgets'
    filters: Record<string, any>
    explanation: string
  }
  results: UnifiedSearchResultItem[]
  total: number
  isAiFallback: boolean
  model: string
}

export class NaturalLanguageSearchService {
  constructor(
    private qwenService: QwenService = new QwenService(),
    private invoicesRepo: InvoicesRepository = new InvoicesRepository(),
    private vendorsRepo: VendorsRepository = new VendorsRepository(),
    private budgetsRepo: BudgetsRepository = new BudgetsRepository(),
    private transactionsRepo: TransactionsRepository = new TransactionsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  /**
   * Translates natural language queries into validated structured filters and executes safe database lookups.
   */
  async search(
    query: string,
    actor?: { id?: string; name?: string; role?: string }
  ): Promise<NaturalLanguageSearchResponse> {
    // 1. Understand intent using Qwen
    const prompt = buildSearchIntentPrompt(query)
    const completion = await this.qwenService.generateCompletion(prompt, { temperature: 0.1 })
    const output = completion.parsedJson || {}

    const validEntities = ['invoices', 'vendors', 'transactions', 'budgets'] as const
    const entity = validEntities.includes(output.entity) ? output.entity : 'invoices'
    const filters = typeof output.filters === 'object' && output.filters !== null ? output.filters : {}
    const explanation = typeof output.explanation === 'string' && output.explanation.trim().length > 0
      ? output.explanation.trim()
      : `Matched queries against ${entity}.`

    const results: UnifiedSearchResultItem[] = []

    // 2. Execute safe, validated repository query (ZERO RAW SQL)
    if (entity === 'invoices') {
      const { data: invoices } = await this.invoicesRepo.findFiltered({
        search: filters.search_term,
        status: filters.status,
        minAmount: filters.amount_gte,
        maxAmount: filters.amount_lte,
        limit: 25
      })

      let list = invoices || []
      if (filters.risk_level) {
        list = list.filter(i => i.risk_level === filters.risk_level)
      }

      list.forEach(inv => {
        const highlights: string[] = []
        if (inv.risk_score >= 50) highlights.push(`Elevated Risk: ${inv.risk_score}/100`)
        if (inv.status === 'ON_HOLD') highlights.push('Autonomous Hold Active')
        if ((inv.vendor as any)?.name) highlights.push(`Vendor: ${(inv.vendor as any).name}`)

        results.push({
          id: inv.id,
          type: 'INVOICE',
          title: inv.invoice_number,
          subtitle: (inv.vendor as any)?.name || 'Unknown Vendor',
          amount: inv.amount,
          currency: inv.currency,
          riskScore: inv.risk_score,
          riskLevel: inv.risk_level,
          status: inv.status,
          highlights,
          entityUrl: `/invoices/${inv.id}`
        })
      })
    } else if (entity === 'vendors') {
      let vendors = await this.vendorsRepo.findAll()
      if (filters.risk_level) {
        vendors = vendors.filter(v => v.risk_level === filters.risk_level)
      }
      if (filters.status) {
        vendors = vendors.filter(v => v.status === filters.status)
      }

      vendors.slice(0, 25).forEach(v => {
        results.push({
          id: v.id,
          type: 'VENDOR',
          title: v.name,
          subtitle: `${v.category} • Tax ID: ${v.tax_id || 'N/A'}`,
          amount: v.total_exposure,
          currency: 'INR',
          riskScore: v.risk_score,
          riskLevel: v.risk_level,
          status: v.status,
          highlights: [`Category: ${v.category}`, `Terms: ${v.payment_terms}`],
          entityUrl: `/vendors/${v.id}`
        })
      })
    } else if (entity === 'budgets') {
      let budgets = await this.budgetsRepo.findAll()
      if (typeof filters.utilization_gte === 'number') {
        budgets = budgets.filter(b => {
          const pct = (b.spent_amount / b.allocated_amount) * 100
          return pct >= filters.utilization_gte
        })
      }

      budgets.slice(0, 25).forEach(b => {
        const util = Number(((b.spent_amount / b.allocated_amount) * 100).toFixed(1))
        const riskLevel = util >= 100 ? 'CRITICAL' : util >= 85 ? 'HIGH' : 'LOW'
        const riskScore = util >= 100 ? 88 : util >= 85 ? 65 : 20

        results.push({
          id: b.id,
          type: 'BUDGET',
          title: `${b.department} Department`,
          subtitle: `Category: ${b.category}`,
          amount: b.spent_amount,
          currency: 'INR',
          riskScore,
          riskLevel,
          status: util >= 100 ? 'OVER_BUDGET' : util >= 85 ? 'NEAR_LIMIT' : 'ON_TRACK',
          highlights: [`${util}% Utilized`, `Allocated: ₹${b.allocated_amount.toLocaleString('en-IN')}`],
          entityUrl: `/budgets/${b.id}`
        })
      })
    } else if (entity === 'transactions') {
      let txns = await this.transactionsRepo.findAll(25)
      if (typeof filters.amount_gte === 'number') {
        txns = txns.filter(t => t.amount >= filters.amount_gte)
      }
      if (filters.status) {
        txns = txns.filter(t => t.status === filters.status)
      }

      txns.forEach(t => {
        results.push({
          id: t.id,
          type: 'TRANSACTION',
          title: t.transaction_reference,
          subtitle: t.description || 'Disbursement',
          amount: t.amount,
          currency: t.currency,
          riskScore: t.status === 'BLOCKED' ? 85 : 20,
          riskLevel: t.status === 'BLOCKED' ? 'CRITICAL' : 'LOW',
          status: t.status,
          highlights: [t.status, `Wire Method: ${(t as any).payment_method || 'NEFT/RTGS'}`],
          entityUrl: `/transactions/${t.id}`
        })
      })
    }

    // 3. Record audit log
    try {
      await this.auditRepo.record({
        user_id: actor?.id || null,
        user_name: actor?.name || 'User Natural Language Search',
        user_role: actor?.role || 'USER',
        action: 'NATURAL_LANGUAGE_SEARCH',
        entity_type: entity,
        entity_id: 'search',
        source: 'FIN-SHIELD Natural Language Engine',
        new_state: {
          query,
          interpreted_entity: entity,
          results_count: results.length
        }
      })
    } catch {
      // Non-critical audit failure
    }

    return {
      query,
      interpretedIntent: {
        entity,
        filters,
        explanation
      },
      results,
      total: results.length,
      isAiFallback: completion.isFallback,
      model: completion.model
    }
  }
}

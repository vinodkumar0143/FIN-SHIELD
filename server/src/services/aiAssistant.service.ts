import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'
import { TransactionsRepository } from '../repositories/transactions.repository.js'
import { RiskAssessmentsRepository } from '../repositories/riskAssessments.repository.js'
import { QwenService } from './qwen.service.js'
import { buildAssistantPrompt } from './prompts/financialPrompts.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'

export interface AssistantAnswerCitation {
  entityType: 'INVOICE' | 'VENDOR' | 'BUDGET' | 'TRANSACTION'
  reference: string
  title: string
}

export interface AssistantResponse {
  answer: string
  citations: AssistantAnswerCitation[]
  suggestedFollowUps: string[]
  isAiFallback: boolean
  model: string
  timestamp: string
}

export class AiAssistantService {
  constructor(
    private qwenService: QwenService = new QwenService(),
    private invoicesRepo: InvoicesRepository = new InvoicesRepository(),
    private vendorsRepo: VendorsRepository = new VendorsRepository(),
    private budgetsRepo: BudgetsRepository = new BudgetsRepository(),
    private transactionsRepo: TransactionsRepository = new TransactionsRepository(),
    private riskRepo: RiskAssessmentsRepository = new RiskAssessmentsRepository(),
    private auditRepo: AuditLogsRepository = new AuditLogsRepository()
  ) {}

  /**
   * Process a conversational question from the user with full grounding in Supabase ledger data.
   */
  async askAssistant(
    userQuestion: string,
    actor?: { id?: string; name?: string; role?: string }
  ): Promise<AssistantResponse> {
    const q = userQuestion.toLowerCase()

    // 1. Context Assembly: Retrieve relevant authorized financial telemetry based on intent
    const contextData: any = {}

    // Global Risk Metrics
    const globalMetrics = await this.riskRepo.getGlobalMetrics().catch(() => null)
    if (globalMetrics) {
      contextData.globalRiskMetrics = {
        averageScore: globalMetrics.averageRiskScore,
        totalAssessments: globalMetrics.totalAssessments,
        criticalCount: globalMetrics.criticalRiskCount,
        highCount: globalMetrics.highRiskCount
      }
    }

    // Invoices context
    if (q.includes('invoice') || q.includes('inv-') || q.includes('acme') || q.includes('20481') || q.includes('28491') || q.includes('risk') || q.includes('review')) {
      const { data: invoices } = await this.invoicesRepo.findFiltered({ limit: 10 })
      contextData.topInvoices = (invoices || []).map(i => ({
        invoiceNumber: i.invoice_number,
        amount: i.amount,
        currency: i.currency,
        status: i.status,
        riskScore: i.risk_score,
        riskLevel: i.risk_level,
        vendor: (i.vendor as any)?.name || 'Unknown'
      }))
    }

    // Budgets context
    if (q.includes('budget') || q.includes('utilization') || q.includes('department') || q.includes('spend')) {
      const budgets = await this.budgetsRepo.findAll().catch(() => [])
      contextData.departmentBudgets = (budgets || []).map(b => ({
        department: b.department,
        allocatedAmount: b.allocated_amount,
        spentAmount: b.spent_amount,
        utilizationPercent: Number(((b.spent_amount / b.allocated_amount) * 100).toFixed(1))
      }))
    }

    // Vendors context
    if (q.includes('vendor') || q.includes('supplier') || q.includes('counterparty') || q.includes('acme') || q.includes('abc')) {
      const vendors = await this.vendorsRepo.findAll().catch(() => [])
      contextData.vendors = (vendors || []).slice(0, 10).map(v => ({
        name: v.name,
        category: v.category,
        status: v.status,
        riskScore: v.risk_score,
        riskLevel: v.risk_level,
        totalExposure: v.total_exposure
      }))
    }

    // 2. Build prompt and generate answer
    const prompt = buildAssistantPrompt(userQuestion, contextData)
    const completion = await this.qwenService.generateCompletion(prompt, { temperature: 0.2 })
    const output = completion.parsedJson || {}

    const answer = typeof output.answer === 'string' && output.answer.trim().length > 0
      ? output.answer.trim()
      : completion.rawText || 'I evaluated the ledger records but could not synthesize an answer.'

    const citations: AssistantAnswerCitation[] = Array.isArray(output.citations)
      ? output.citations.map((c: any) => ({
          entityType: c.entityType || 'INVOICE',
          reference: c.reference || '',
          title: c.title || ''
        }))
      : []

    const suggestedFollowUps: string[] = Array.isArray(output.suggestedFollowUps)
      ? output.suggestedFollowUps.map(String)
      : ['Why is INV-20481 risky?', 'Which budgets are exceeded?', 'Show high-risk vendors']

    // 3. Record audit log
    try {
      await this.auditRepo.record({
        user_id: actor?.id || null,
        user_name: actor?.name || 'User Assistant Query',
        user_role: actor?.role || 'USER',
        action: 'ASSISTANT_QUERY',
        entity_type: 'assistant',
        entity_id: 'chat',
        source: 'FIN-SHIELD Assistant',
        new_state: {
          question: userQuestion,
          citations_count: citations.length,
          model: completion.model
        }
      })
    } catch {
      // Non-critical audit failure
    }

    return {
      answer,
      citations,
      suggestedFollowUps,
      isAiFallback: completion.isFallback,
      model: completion.model,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}

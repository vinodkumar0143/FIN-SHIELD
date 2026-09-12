import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types.js'
import { supabaseAdmin } from '../config/supabase.js'

export type VendorRow = Database['public']['Tables']['vendors']['Row']

export interface VendorIntelligenceMetrics {
  vendor: VendorRow
  financialSummary: {
    totalSpend: number
    outstandingAmount: number
    paidAmount: number
    overdueAmount: number
    invoiceCount: number
    transactionCount: number
    averageInvoiceAmount: number
    largestInvoice: {
      id: string
      invoiceNumber: string
      amount: number
      date: string
    } | null
    poCount: number
    poMatchRate: number
    duplicateInvoiceCount: number
  }
  operationalMetrics: {
    invoiceFrequencyDays: number
    averageDaysToSettle: number
    spendGrowthPercent: number
    poMismatchFrequency: number
  }
  spendingTrend: Array<{ month: string; amount: number; invoiceCount: number }>
  recentInvoices: Array<Database['public']['Tables']['invoices']['Row']>
  recentTransactions: Array<Database['public']['Tables']['transactions']['Row']>
  purchaseOrders: Array<Database['public']['Tables']['purchase_orders']['Row']>
}

export class VendorIntelligenceService {
  constructor(private client: SupabaseClient<Database> = supabaseAdmin) {}

  async getVendorIntelligence(vendorId: string): Promise<VendorIntelligenceMetrics | null> {
    // 1. Get vendor record
    const { data: vendor, error: vErr } = await this.client
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .maybeSingle()

    if (vErr || !vendor) return null

    // 2. Fetch all invoices for this vendor
    const { data: invoices = [] } = await this.client
      .from('invoices')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('invoice_date', { ascending: false })

    // 3. Fetch all transactions for this vendor
    const { data: transactions = [] } = await this.client
      .from('transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('transaction_date', { ascending: false })

    // 4. Fetch all purchase orders for this vendor
    const { data: purchaseOrders = [] } = await this.client
      .from('purchase_orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('order_date', { ascending: false })

    const invList = invoices || []
    const txnList = transactions || []
    const poList = purchaseOrders || []

    const todayStr = new Date().toISOString().split('T')[0]

    let totalInvoiceAmount = 0
    let paidAmount = 0
    let outstandingAmount = 0
    let overdueAmount = 0
    let duplicateCount = 0
    let largestInv: VendorIntelligenceMetrics['financialSummary']['largestInvoice'] = null
    const monthlySpendMap: Record<string, { amount: number; count: number }> = {}

    for (const inv of invList) {
      const amt = Number(inv.amount) || 0
      totalInvoiceAmount += amt

      if (!largestInv || amt > largestInv.amount) {
        largestInv = {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          amount: amt,
          date: inv.invoice_date
        }
      }

      if (inv.payment_status === 'PAID') {
        paidAmount += amt
      } else {
        outstandingAmount += amt
        if (inv.due_date < todayStr) {
          overdueAmount += amt
        }
      }

      if (inv.duplicate_status === 'POTENTIAL_DUPLICATE' || inv.duplicate_status === 'CONFIRMED_DUPLICATE') {
        duplicateCount++
      }

      const m = inv.invoice_date.substring(0, 7)
      if (!monthlySpendMap[m]) {
        monthlySpendMap[m] = { amount: 0, count: 0 }
      }
      monthlySpendMap[m].amount += amt
      monthlySpendMap[m].count += 1
    }

    const invoiceCount = invList.length
    const transactionCount = txnList.length
    const averageInvoiceAmount = invoiceCount > 0 ? Number((totalInvoiceAmount / invoiceCount).toFixed(2)) : 0

    // PO match rate calculation
    const poInvoices = invList.filter(i => !!i.purchase_order_id)
    const mismatchedPoInvoices = invList.filter(i => i.status === 'FLAGGED' || i.status === 'ON_HOLD')
    const poMatchRate = poInvoices.length > 0
      ? Number((((poInvoices.length - mismatchedPoInvoices.length) / poInvoices.length) * 100).toFixed(1))
      : 100

    const poMismatchFrequency = poInvoices.length > 0
      ? Number(((mismatchedPoInvoices.length / poInvoices.length) * 100).toFixed(1))
      : 0

    // Invoice frequency calculation
    let invoiceFrequencyDays = 30
    if (invList.length >= 2) {
      const dates = invList.map(i => new Date(i.invoice_date).getTime()).sort((a, b) => a - b)
      const diffTotal = dates[dates.length - 1] - dates[0]
      invoiceFrequencyDays = Math.round(diffTotal / ((dates.length - 1) * (1000 * 60 * 60 * 24)))
    }

    // Average days to settle
    let averageDaysToSettle = 14
    const settledPairs: number[] = []
    for (const inv of invList) {
      const linkedTxn = txnList.find(t => t.invoice_id === inv.id && t.status === 'CLEARED')
      if (linkedTxn) {
        const dInv = new Date(inv.invoice_date).getTime()
        const dTxn = new Date(linkedTxn.transaction_date).getTime()
        settledPairs.push(Math.max(0, Math.round((dTxn - dInv) / (1000 * 60 * 60 * 24))))
      }
    }
    if (settledPairs.length > 0) {
      averageDaysToSettle = Math.round(settledPairs.reduce((a, b) => a + b, 0) / settledPairs.length)
    }

    // Spend growth calculation (last 30 days vs prior 30 days)
    const now = Date.now()
    const d30 = 30 * 24 * 60 * 60 * 1000
    const d60 = 60 * 24 * 60 * 60 * 1000
    const recentSpend = invList
      .filter(i => now - new Date(i.invoice_date).getTime() <= d30)
      .reduce((s, i) => s + i.amount, 0)
    const priorSpend = invList
      .filter(i => {
        const age = now - new Date(i.invoice_date).getTime()
        return age > d30 && age <= d60
      })
      .reduce((s, i) => s + i.amount, 0)

    const spendGrowthPercent = priorSpend > 0
      ? Number((((recentSpend - priorSpend) / priorSpend) * 100).toFixed(1))
      : 0

    const spendingTrend = Object.entries(monthlySpendMap)
      .map(([month, data]) => ({
        month,
        amount: Number(data.amount.toFixed(2)),
        invoiceCount: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      vendor,
      financialSummary: {
        totalSpend: Number(totalInvoiceAmount.toFixed(2)),
        outstandingAmount: Number(outstandingAmount.toFixed(2)),
        paidAmount: Number(paidAmount.toFixed(2)),
        overdueAmount: Number(overdueAmount.toFixed(2)),
        invoiceCount,
        transactionCount,
        averageInvoiceAmount,
        largestInvoice: largestInv,
        poCount: poList.length,
        poMatchRate,
        duplicateInvoiceCount: duplicateCount
      },
      operationalMetrics: {
        invoiceFrequencyDays: invoiceFrequencyDays > 0 ? invoiceFrequencyDays : 30,
        averageDaysToSettle,
        spendGrowthPercent,
        poMismatchFrequency
      },
      spendingTrend,
      recentInvoices: invList.slice(0, 10),
      recentTransactions: txnList.slice(0, 10),
      purchaseOrders: poList.slice(0, 10)
    }
  }
}

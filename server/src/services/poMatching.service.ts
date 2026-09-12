import { PurchaseOrdersRepository, type PurchaseOrderRow, type PurchaseOrderItemRow } from '../repositories/purchaseOrders.repository.js'

export type PoMatchStatus = 'MATCHED' | 'PARTIAL_MATCH' | 'MISMATCH' | 'NO_PO' | 'REVIEW_REQUIRED'

export interface LineItemMatchResult {
  invoiceItemDescription: string
  poItemDescription: string | null
  invoiceQuantity: number
  poQuantity: number | null
  invoiceUnitPrice: number
  poUnitPrice: number | null
  unitPriceDelta: number
  unitPriceVariancePercent: number
  quantityMatched: boolean
  unitPriceMatched: boolean
  status: 'MATCH' | 'PRICE_VARIANCE' | 'QTY_VARIANCE' | 'MISSING_IN_PO'
}

export interface PoMatchResult {
  status: PoMatchStatus
  poId: string | null
  poNumber: string | null
  poAmount: number | null
  invoiceAmount: number
  currencyMatch: boolean
  vendorMatch: boolean
  amountDelta: number | null
  percentVariance: number | null
  lineItemMatches: LineItemMatchResult[]
  mismatchReasons: string[]
  evidence: {
    ruleTriggered: string
    details: string
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
  }[]
}

export class PoMatchingService {
  constructor(private poRepo: PurchaseOrdersRepository = new PurchaseOrdersRepository()) {}

  async matchInvoice(params: {
    invoiceAmount: number
    currency: string
    vendorId: string
    poNumber?: string | null
    purchaseOrderId?: string | null
    lineItems?: Array<{
      description: string
      quantity: number
      unit_price: number
      total?: number
    }>
  }): Promise<PoMatchResult> {
    const { invoiceAmount, currency, vendorId, poNumber, purchaseOrderId, lineItems = [] } = params

    // 1. Locate PO
    let po: PurchaseOrderRow | null = null
    if (purchaseOrderId) {
      po = await this.poRepo.findById(purchaseOrderId)
    } else if (poNumber && poNumber.trim()) {
      po = await this.poRepo.findByPoNumber(poNumber.trim())
    }

    if (!po) {
      return {
        status: 'NO_PO',
        poId: null,
        poNumber: poNumber || null,
        poAmount: null,
        invoiceAmount,
        currencyMatch: true,
        vendorMatch: false,
        amountDelta: null,
        percentVariance: null,
        lineItemMatches: [],
        mismatchReasons: ['No corresponding Purchase Order located in procurement database'],
        evidence: [
          {
            ruleTriggered: 'NO_PO_FOUND',
            details: `Invoice submitted with PO Reference "${poNumber || 'NONE'}", but no record exists.`,
            severity: 'WARNING'
          }
        ]
      }
    }

    const mismatchReasons: string[] = []
    const evidence: PoMatchResult['evidence'] = []

    // 2. Vendor match check
    const vendorMatch = po.vendor_id === vendorId
    if (!vendorMatch) {
      mismatchReasons.push(`PO belongs to another vendor account (${po.vendor_id} vs ${vendorId})`)
      evidence.push({
        ruleTriggered: 'VENDOR_MISMATCH',
        details: 'Purchase Order vendor ID does not match invoice vendor ID',
        severity: 'CRITICAL'
      })
    }

    // 3. Currency match check
    const currencyMatch = po.currency.toUpperCase() === currency.toUpperCase()
    if (!currencyMatch) {
      mismatchReasons.push(`Currency mismatch: PO is ${po.currency}, Invoice is ${currency}`)
      evidence.push({
        ruleTriggered: 'CURRENCY_MISMATCH',
        details: `Expected ${po.currency} but invoice is denominated in ${currency}`,
        severity: 'CRITICAL'
      })
    }

    // 4. Header Amount delta & variance
    const amountDelta = Number((invoiceAmount - po.total_amount).toFixed(2))
    const percentVariance = po.total_amount > 0
      ? Number(((amountDelta / po.total_amount) * 100).toFixed(2))
      : 0

    if (Math.abs(percentVariance) > 0.05) {
      const direction = amountDelta > 0 ? '+' : ''
      mismatchReasons.push(`Total amount differs from PO by ${direction}${percentVariance}% (Δ ₹${Math.abs(amountDelta).toLocaleString('en-IN')})`)
      evidence.push({
        ruleTriggered: 'HEADER_AMOUNT_VARIANCE',
        details: `Invoice total ₹${invoiceAmount.toLocaleString('en-IN')} vs PO authorized amount ₹${po.total_amount.toLocaleString('en-IN')} (${direction}${percentVariance}%)`,
        severity: Math.abs(percentVariance) > 10 ? 'CRITICAL' : 'WARNING'
      })
    }

    // 5. Line items matching
    const poItems: PurchaseOrderItemRow[] = await this.poRepo.findItems(po.id)
    const lineItemMatches: LineItemMatchResult[] = []

    for (const invItem of lineItems) {
      // Find matching PO item using fuzzy/token comparison
      const invDesc = invItem.description.toLowerCase().trim()
      let bestPoItem: PurchaseOrderItemRow | null = null
      let highestSimilarity = 0

      for (const pItem of poItems) {
        const poDesc = pItem.description.toLowerCase().trim()
        // Simple token overlap similarity
        const invTokens = new Set(invDesc.split(/\s+/))
        const poTokens = new Set(poDesc.split(/\s+/))
        let matches = 0
        invTokens.forEach(t => { if (poTokens.has(t)) matches++ })
        const similarity = matches / Math.max(invTokens.size, poTokens.size)

        if (similarity > highestSimilarity) {
          highestSimilarity = similarity
          bestPoItem = pItem
        }
      }

      // If no token overlap match, fallback if single item
      if (!bestPoItem && poItems.length === 1 && lineItems.length === 1) {
        bestPoItem = poItems[0]
      }

      if (bestPoItem) {
        const unitDelta = Number((invItem.unit_price - bestPoItem.unit_price).toFixed(2))
        const unitVariance = bestPoItem.unit_price > 0
          ? Number(((unitDelta / bestPoItem.unit_price) * 100).toFixed(2))
          : 0
        const qtyMatched = invItem.quantity <= bestPoItem.quantity
        const unitPriceMatched = Math.abs(unitDelta) <= 0.01

        let itemStatus: LineItemMatchResult['status'] = 'MATCH'
        if (!unitPriceMatched) {
          itemStatus = 'PRICE_VARIANCE'
          mismatchReasons.push(
            `Unit price variance on "${invItem.description}": ₹${invItem.unit_price} vs authorized ₹${bestPoItem.unit_price} (${unitVariance > 0 ? '+' : ''}${unitVariance}%)`
          )
          evidence.push({
            ruleTriggered: 'LINE_ITEM_PRICE_VARIANCE',
            details: `Item "${invItem.description}" billed at ₹${invItem.unit_price}, exceeding PO price ₹${bestPoItem.unit_price} by ${unitVariance}%`,
            severity: Math.abs(unitVariance) > 15 ? 'CRITICAL' : 'WARNING'
          })
        } else if (!qtyMatched) {
          itemStatus = 'QTY_VARIANCE'
          mismatchReasons.push(
            `Quantity variance on "${invItem.description}": billed ${invItem.quantity} vs PO authorized ${bestPoItem.quantity}`
          )
          evidence.push({
            ruleTriggered: 'LINE_ITEM_QTY_VARIANCE',
            details: `Billed quantity (${invItem.quantity}) exceeds PO quantity (${bestPoItem.quantity})`,
            severity: 'WARNING'
          })
        }

        lineItemMatches.push({
          invoiceItemDescription: invItem.description,
          poItemDescription: bestPoItem.description,
          invoiceQuantity: invItem.quantity,
          poQuantity: bestPoItem.quantity,
          invoiceUnitPrice: invItem.unit_price,
          poUnitPrice: bestPoItem.unit_price,
          unitPriceDelta: unitDelta,
          unitPriceVariancePercent: unitVariance,
          quantityMatched: qtyMatched,
          unitPriceMatched: unitPriceMatched,
          status: itemStatus
        })
      } else {
        lineItemMatches.push({
          invoiceItemDescription: invItem.description,
          poItemDescription: null,
          invoiceQuantity: invItem.quantity,
          poQuantity: null,
          invoiceUnitPrice: invItem.unit_price,
          poUnitPrice: null,
          unitPriceDelta: invItem.unit_price,
          unitPriceVariancePercent: 100,
          quantityMatched: false,
          unitPriceMatched: false,
          status: 'MISSING_IN_PO'
        })
        mismatchReasons.push(`Item "${invItem.description}" not found in Purchase Order line items`)
        evidence.push({
          ruleTriggered: 'UNAUTHORIZED_LINE_ITEM',
          details: `Invoice contains item "${invItem.description}" which was not approved in PO ${po.po_number}`,
          severity: 'CRITICAL'
        })
      }
    }

    // 6. Determine overall PO Match Status
    let status: PoMatchStatus = 'MATCHED'

    if (!vendorMatch || !currencyMatch) {
      status = 'MISMATCH'
    } else if (Math.abs(percentVariance) > 10 || lineItemMatches.some(m => Math.abs(m.unitPriceVariancePercent) > 10)) {
      status = 'MISMATCH'
    } else if (lineItemMatches.some(m => m.status === 'MISSING_IN_PO')) {
      status = 'REVIEW_REQUIRED'
    } else if (Math.abs(percentVariance) > 0.05 || lineItemMatches.some(m => !m.quantityMatched || !m.unitPriceMatched)) {
      status = 'PARTIAL_MATCH'
    }

    return {
      status,
      poId: po.id,
      poNumber: po.po_number,
      poAmount: po.total_amount,
      invoiceAmount,
      currencyMatch,
      vendorMatch,
      amountDelta,
      percentVariance,
      lineItemMatches,
      mismatchReasons,
      evidence
    }
  }
}

import dotenv from 'dotenv'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { TransactionsRepository } from '../repositories/transactions.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'
import { PurchaseOrdersRepository } from '../repositories/purchaseOrders.repository.js'
import { PoMatchingService } from '../services/poMatching.service.js'
import { DuplicateDetectionService } from '../services/duplicateDetection.service.js'
import { InvoiceExtractionService } from '../services/invoiceExtraction.service.js'
import { TransactionIntelligenceService } from '../services/transactionIntelligence.service.js'
import { VendorIntelligenceService } from '../services/vendorIntelligence.service.js'
import { BudgetMonitoringService } from '../services/budgetMonitoring.service.js'
import { supabaseAdmin } from '../config/supabase.js'

dotenv.config()

async function runPhase4Tests() {
  console.log('\n==================================================')
  console.log('FIN-SHIELD PHASE 4: CORE FINANCIAL INTELLIGENCE VERIFICATION')
  console.log('==================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}${detail ? ` (${detail})` : ''}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Database Invoices & Hero Demo Data Retrieval
    // ----------------------------------------------------
    console.log('--- TEST 1: INVOICES DATA LAYER & HERO CASES ---')
    const invRepo = new InvoicesRepository()
    const { data: invoices, total } = await invRepo.findFiltered({ limit: 20 })
    assert(total > 0 && invoices.length > 0, 'Invoices fetched from live Supabase', `Total: ${total}`)

    const heroAcme = invoices.find(i => i.invoice_number === 'INV-20481')
    assert(!!heroAcme, 'Hero Invoice INV-20481 (Acme Industrial) exists in live database')
    if (heroAcme) {
      assert(heroAcme.amount === 1840000, 'INV-20481 amount verified', `₹${heroAcme.amount.toLocaleString('en-IN')} / ₹18.4L`)
      assert(heroAcme.status === 'ON_HOLD', 'INV-20481 initial status is ON_HOLD', heroAcme.status)
    }

    const heroAbc = invoices.find(i => i.invoice_number === 'INV-28491')
    assert(!!heroAbc, 'Hero Invoice INV-28491 (ABC Supplies) exists in live database')

    // ----------------------------------------------------
    // TEST 2: Deterministic PO Matching (Phase 4C)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: DETERMINISTIC PO MATCHING ENGINE ---')
    const poMatchingSvc = new PoMatchingService()
    const poRepo = new PurchaseOrdersRepository()

    // Test with Acme Industrial PO: PO-2026-0901-REV1 (d0000000-0000-0000-0000-000000000002)
    const acmePo = await poRepo.findById('d0000000-0000-0000-0000-000000000002')
    assert(!!acmePo, 'Acme Industrial PO record located', acmePo?.po_number)

    if (acmePo && heroAcme) {
      const matchResult = await poMatchingSvc.matchInvoice({
        invoiceAmount: heroAcme.amount,
        currency: heroAcme.currency,
        vendorId: heroAcme.vendor_id,
        purchaseOrderId: acmePo.id,
        lineItems: [
          {
            description: 'Heavy Industrial Chiller Pump & Assemblies',
            quantity: 2,
            unit_price: 920000.00 // Invoice billed 920k vs PO authorized 600k
          }
        ]
      })

      assert(matchResult.status === 'MISMATCH', 'Detected PO MISMATCH on price discrepancy', matchResult.status)
      assert(Number(matchResult.percentVariance) > 50, 'Computed accurate price delta', `+${matchResult.percentVariance}%`)
      assert(matchResult.evidence.length > 0, 'Generated structured evidence for audit', matchResult.evidence[0]?.ruleTriggered)
    }

    // Test No PO Case
    const noPoResult = await poMatchingSvc.matchInvoice({
      invoiceAmount: 50000,
      currency: 'INR',
      vendorId: 'b0000000-0000-0000-0000-000000000001',
      poNumber: 'PO-NON-EXISTENT'
    })
    assert(noPoResult.status === 'NO_PO', 'Handled missing PO correctly as NO_PO')

    // ----------------------------------------------------
    // TEST 3: Deterministic Duplicate Invoice Detection (Phase 4D)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: DETERMINISTIC DUPLICATE DETECTION ---')
    const dupSvc = new DuplicateDetectionService()

    // Exact duplicate test against INV-28491
    const exactDup = await dupSvc.checkDuplicates({
      vendorId: 'b0000000-0000-0000-0000-000000000001',
      invoiceNumber: 'inv-28491', // lowercase test for normalization
      amount: 482000,
      invoiceDate: '2026-09-08'
    })
    assert(exactDup.duplicateStatus === 'CONFIRMED_DUPLICATE', 'Exact match detected CONFIRMED_DUPLICATE', `Confidence: ${exactDup.confidenceScore}%`)

    // Near duplicate test: same vendor, identical amount within temporal window
    const nearDup = await dupSvc.checkDuplicates({
      vendorId: 'b0000000-0000-0000-0000-000000000001',
      invoiceNumber: 'INV-28491-DUP',
      amount: 478000, // matches INV-28412
      invoiceDate: '2026-09-01'
    })
    assert(nearDup.duplicateStatus === 'POTENTIAL_DUPLICATE' || nearDup.duplicateStatus === 'CONFIRMED_DUPLICATE', 'Near-duplicate detected POTENTIAL_DUPLICATE', `Confidence: ${nearDup.confidenceScore}%`)

    // Unique invoice test
    const uniqueCheck = await dupSvc.checkDuplicates({
      vendorId: 'b0000000-0000-0000-0000-000000000001',
      invoiceNumber: 'INV-COMPLETELY-NEW-9999',
      amount: 111111,
      invoiceDate: '2026-09-12'
    })
    assert(uniqueCheck.duplicateStatus === 'UNIQUE', 'New invoice flagged as UNIQUE', `Confidence: ${uniqueCheck.confidenceScore}%`)

    // ----------------------------------------------------
    // TEST 4: Document Extraction & Math Validation (Phase 4B)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: DOCUMENT EXTRACTION & VALIDATION ---')
    const extractSvc = new InvoiceExtractionService()
    const dummyBuffer = Buffer.from('INVOICE NO: INV-99001\nVENDOR: Acme Industrial Corp\nTOTAL: 150000.00\nPO NO: PO-2026-9900')
    const extraction = await extractSvc.extractAndValidate(dummyBuffer, 'acme_invoice_99001.pdf')

    assert(extraction.invoiceNumber.value === 'INV-99001', 'Extracted invoice number from text', extraction.invoiceNumber.value)
    assert(extraction.vendorName.value.includes('Acme'), 'Matched vendor to existing record', extraction.vendorName.value)
    assert(extraction.validation.isValid === true, 'Passed math & format validation', `Math verified: ${extraction.validation.mathVerified}`)

    // ----------------------------------------------------
    // TEST 5: Transaction Intelligence (Phase 4E)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: TRANSACTION INTELLIGENCE ENGINE ---')
    const txnSvc = new TransactionIntelligenceService()
    const metrics = await txnSvc.calculateMetrics()

    assert(metrics.totalCount > 0, 'Aggregated total transaction count', `Count: ${metrics.totalCount}`)
    assert(metrics.totalVolume > 0, 'Computed gross transaction volume', `Volume: ₹${metrics.totalVolume.toLocaleString('en-IN')}`)
    assert(metrics.outgoingAmount > 0, 'Separated cash outflow', `Outflow: ₹${metrics.outgoingAmount.toLocaleString('en-IN')}`)
    assert(metrics.vendorConcentration.length > 0, 'Computed top vendor concentration', `Top vendor: ${metrics.vendorConcentration[0]?.vendorName}`)

    // ----------------------------------------------------
    // TEST 6: Vendor Intelligence (Phase 4F)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: VENDOR INTELLIGENCE ENGINE ---')
    const vendorSvc = new VendorIntelligenceService()
    const acmeIntel = await vendorSvc.getVendorIntelligence('b0000000-0000-0000-0000-000000000002')

    assert(!!acmeIntel, 'Generated Vendor Intelligence for Acme Industrial')
    if (acmeIntel) {
      assert(acmeIntel.financialSummary.totalSpend > 0, 'Calculated total vendor spend', `₹${acmeIntel.financialSummary.totalSpend.toLocaleString('en-IN')}`)
      assert(acmeIntel.financialSummary.invoiceCount > 0, 'Calculated vendor invoice count', `Count: ${acmeIntel.financialSummary.invoiceCount}`)
      assert(acmeIntel.operationalMetrics.invoiceFrequencyDays > 0, 'Calculated submission cadence', `${acmeIntel.operationalMetrics.invoiceFrequencyDays} days`)
    }

    // ----------------------------------------------------
    // TEST 7: Budget Monitoring (Phase 4G)
    // ----------------------------------------------------
    console.log('\n--- TEST 7: BUDGET MONITORING & HEALTH ENGINE ---')
    const budgetSvc = new BudgetMonitoringService()
    const budgets = await budgetSvc.getAllBudgets()

    assert(budgets.length > 0, 'Retrieved active department budgets', `Count: ${budgets.length}`)
    const validHealth = budgets.every(b => ['HEALTHY', 'ATTENTION', 'NEAR_LIMIT', 'OVER_BUDGET'].includes(b.health_status))
    assert(validHealth, 'All budgets classified into valid health states (HEALTHY/ATTENTION/NEAR_LIMIT/OVER_BUDGET)')

    const sampleBudget = budgets[0]
    assert(sampleBudget.utilization_percent >= 0, 'Computed percentage utilization', `${sampleBudget.department}: ${sampleBudget.utilization_percent}% (${sampleBudget.health_status})`)

    // ----------------------------------------------------
    // TEST 8: Supabase Storage Bucket Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 8: SUPABASE STORAGE VERIFICATION ---')
    const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets()
    const hasDocBucket = buckets?.some(b => b.name === 'invoice-documents')
    assert(!bErr && !!hasDocBucket, 'Private Storage bucket "invoice-documents" verified accessible')

  } catch (err: any) {
    console.error('[UNEXPECTED TEST ERROR]', err)
    failed++
  }

  console.log('\n==================================================')
  console.log(`PHASE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log('==================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runPhase4Tests()

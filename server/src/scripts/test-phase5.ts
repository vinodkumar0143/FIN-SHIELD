import dotenv from 'dotenv'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { TransactionsRepository } from '../repositories/transactions.repository.js'
import { VendorsRepository } from '../repositories/vendors.repository.js'
import { BudgetsRepository } from '../repositories/budgets.repository.js'
import { RiskAssessmentsRepository } from '../repositories/riskAssessments.repository.js'
import { AnomalyDetectionService } from '../services/anomalyDetection.service.js'
import { RiskScoringService } from '../services/riskScoring.service.js'
import { EvidenceAggregationService } from '../services/evidenceAggregation.service.js'

dotenv.config()

async function runPhase5Tests() {
  console.log('\n==================================================')
  console.log('FIN-SHIELD PHASE 5: ANOMALY DETECTION + RISK INTELLIGENCE VERIFICATION')
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
    const invRepo = new InvoicesRepository()
    const txRepo = new TransactionsRepository()
    const vendorRepo = new VendorsRepository()
    const budgetRepo = new BudgetsRepository()
    const riskRepo = new RiskAssessmentsRepository()

    const anomalySvc = new AnomalyDetectionService()
    const riskScoringSvc = new RiskScoringService()
    const evidenceSvc = new EvidenceAggregationService()

    // ----------------------------------------------------
    // TEST 1: Hero Demo Data & Baseline Retrieval
    // ----------------------------------------------------
    console.log('--- TEST 1: HERO DEMO DATA RETRIEVAL ---')
    const { data: invoices } = await invRepo.findFiltered({ limit: 50 })
    const heroAcme = invoices.find(i => i.invoice_number === 'INV-20481')
    const heroAbc = invoices.find(i => i.invoice_number === 'INV-28491')

    assert(!!heroAcme, 'Hero Invoice INV-20481 (Acme Industrial) loaded from Supabase')
    assert(!!heroAbc, 'Hero Invoice INV-28491 (ABC Supplies) loaded from Supabase')

    // ----------------------------------------------------
    // TEST 2: Deterministic Anomaly Detection Engine (Phase 5A)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: DETERMINISTIC ANOMALY DETECTION ENGINE (PHASE 5A) ---')

    if (heroAcme) {
      const acmeAnomalies = await anomalySvc.detectInvoiceAnomalies(heroAcme.id)
      assert(acmeAnomalies.length > 0, 'INV-20481 anomalies detected', `Detected: ${acmeAnomalies.length} anomaly signals`)
      
      const anomalyTypes = acmeAnomalies.map(a => a.anomaly_type)
      console.log('    INV-20481 Anomaly signals:', anomalyTypes.join(', '))

      // Acme @ ₹18.4L should trigger high amount anomaly or baseline deviation
      const hasHighOrBaseline = anomalyTypes.some(t => 
        t === 'UNUSUALLY_HIGH_INVOICE_AMOUNT' || 
        t === 'SPENDING_ABOVE_HISTORICAL_BASELINE' ||
        t === 'PO_MISMATCH' ||
        t === 'BUDGET_THRESHOLD_EXCEEDED' ||
        t === 'MULTIPLE_CONCURRENT_SIGNALS'
      )
      assert(hasHighOrBaseline, 'INV-20481 triggers amount/PO/budget anomaly')
    }

    if (heroAbc) {
      const abcAnomalies = await anomalySvc.detectInvoiceAnomalies(heroAbc.id)
      console.log('    INV-28491 Anomaly signals:', abcAnomalies.map(a => a.anomaly_type).join(', ') || 'None')
      assert(Array.isArray(abcAnomalies), 'INV-28491 anomalies evaluated successfully')
    }

    // Global scan for anomalies across all entities
    const globalAnomalies = await anomalySvc.detectAllAnomalies()
    assert(globalAnomalies.length > 0, 'Global anomaly scan completed across all financial entities', `Found ${globalAnomalies.length} anomalies`)

    const distinctRules = new Set(globalAnomalies.map(a => a.anomaly_type))
    console.log(`    Distinct anomaly rules triggered across system: ${Array.from(distinctRules).join(', ')}`)
    assert(distinctRules.size >= 2, 'Multiple distinct deterministic rules triggered across live data', `${distinctRules.size} rules`)

    // ----------------------------------------------------
    // TEST 3: Deterministic Risk Scoring Engine (Phase 5B)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: DETERMINISTIC RISK SCORING ENGINE (PHASE 5B) ---')

    if (heroAcme) {
      const scoreResult1 = await riskScoringSvc.calculateInvoiceRisk(heroAcme.id)
      assert(scoreResult1.score >= 0 && scoreResult1.score <= 100, 'INV-20481 risk score is bounded within [0, 100]', `Score: ${scoreResult1.score}`)
      assert(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(scoreResult1.classification), 'INV-20481 classification is valid', scoreResult1.classification)
      assert(Array.isArray(scoreResult1.contributingFactors) && scoreResult1.contributingFactors.length > 0, 'Contributing factors breakdown provided', `${scoreResult1.contributingFactors.length} factors`)
      assert(typeof scoreResult1.compoundMultiplier === 'number', 'Compound risk multiplier computed', `Multiplier: ${scoreResult1.compoundMultiplier}x`)

      // Test Reproducibility / Determinism: calling it again must yield the EXACT same score & breakdown
      const scoreResult2 = await riskScoringSvc.calculateInvoiceRisk(heroAcme.id)
      assert(scoreResult1.score === scoreResult2.score, 'Risk scoring is 100% deterministic and reproducible', `Pass 1: ${scoreResult1.score}, Pass 2: ${scoreResult2.score}`)
      assert(scoreResult1.classification === scoreResult2.classification, 'Classification is 100% deterministic', scoreResult1.classification)
    }

    // Check Vendor Risk Scoring
    const vendors = await vendorRepo.findAll()
    if (vendors.length > 0) {
      const vendorScore = await riskScoringSvc.calculateVendorRisk(vendors[0].id)
      assert(vendorScore.score >= 0 && vendorScore.score <= 100, 'Vendor risk score evaluated in [0, 100]', `${vendors[0].name}: ${vendorScore.score} (${vendorScore.classification})`)
    }

    // Check Transaction Risk Scoring
    const transactions = await txRepo.findAll(10)
    if (transactions.length > 0) {
      const txScore = await riskScoringSvc.calculateTransactionRisk(transactions[0].id)
      assert(txScore.score >= 0 && txScore.score <= 100, 'Transaction risk score evaluated in [0, 100]', `${transactions[0].transaction_reference}: ${txScore.score} (${txScore.classification})`)
    }

    // Check Budget Risk Scoring
    const budgets = await budgetRepo.findAll()
    if (budgets.length > 0) {
      const budgetScore = await riskScoringSvc.calculateBudgetRisk(budgets[0].id)
      assert(budgetScore.score >= 0 && budgetScore.score <= 100, 'Budget risk score evaluated in [0, 100]', `${budgets[0].department}: ${budgetScore.score} (${budgetScore.classification})`)
    }

    // ----------------------------------------------------
    // TEST 4: Multi-Source Evidence Aggregation (Phase 5C)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: MULTI-SOURCE EVIDENCE AGGREGATION (PHASE 5C) ---')

    if (heroAcme) {
      const evidence = await evidenceSvc.aggregateInvoiceEvidence(heroAcme.id)
      assert(!!evidence, 'INV-20481 multi-source evidence aggregated successfully')
      assert(evidence.entityType === 'INVOICE' && evidence.entityId === heroAcme.id, 'Evidence entity identity matches')
      assert(Array.isArray(evidence.findings), 'Evidence findings array present', `${evidence.findings.length} findings`)
      assert(Array.isArray(evidence.sources) && evidence.sources.length > 0, 'Evidence sources identified', evidence.sources.join(', '))
      assert(!!evidence.riskScore, 'Aggregated risk score included in evidence assessment', `Score: ${evidence.riskScore.score}`)
      assert(!!evidence.metrics, 'Quantitative evidence metrics included')

      console.log('    Findings summary:')
      evidence.findings.slice(0, 3).forEach((f, idx) => {
        console.log(`      ${idx + 1}. [${f.severity}] ${f.description}`)
      })
    }

    // ----------------------------------------------------
    // TEST 5: Risk Assessment Persistence & Global Metrics
    // ----------------------------------------------------
    console.log('\n--- TEST 5: RISK ASSESSMENTS REPOSITORY & GLOBAL METRICS ---')

    const globalMetrics = await riskRepo.getGlobalMetrics()
    assert(typeof globalMetrics.averageRiskScore === 'number', 'Global average risk score computed', `Avg: ${globalMetrics.averageRiskScore}`)
    assert(typeof globalMetrics.totalAssessments === 'number', 'Total risk assessments counted', `Total: ${globalMetrics.totalAssessments}`)
    assert(typeof globalMetrics.highRiskCount === 'number', 'High risk entities counted', `High: ${globalMetrics.highRiskCount}`)
    assert(typeof globalMetrics.criticalRiskCount === 'number', 'Critical risk entities counted', `Critical: ${globalMetrics.criticalRiskCount}`)
    assert(!!globalMetrics.distribution, 'Risk distribution breakdown available', JSON.stringify(globalMetrics.distribution))

    const { data: allAssessments, total: totalAssessments } = await riskRepo.findAll({ limit: 10 })
    assert(Array.isArray(allAssessments), 'Risk assessments list query successful', `Retrieved ${allAssessments.length} records (Total: ${totalAssessments})`)

    console.log('\n==================================================')
    console.log(`PHASE 5 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`)
    console.log('==================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Fatal error during Phase 5 verification:', error)
    process.exit(1)
  }
}

runPhase5Tests()

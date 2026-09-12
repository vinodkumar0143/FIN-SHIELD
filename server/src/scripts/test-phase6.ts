import dotenv from 'dotenv'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { InvestigationsRepository } from '../repositories/investigations.repository.js'
import { RecommendationsRepository } from '../repositories/recommendations.repository.js'
import { QwenService } from '../services/qwen.service.js'
import { FinancialInvestigatorService } from '../services/financialInvestigator.service.js'
import { AiRecommendationsService } from '../services/aiRecommendations.service.js'
import { AiAssistantService } from '../services/aiAssistant.service.js'
import { NaturalLanguageSearchService } from '../services/naturalLanguageSearch.service.js'

dotenv.config()

async function runPhase6Tests() {
  console.log('\n==================================================')
  console.log('FIN-SHIELD PHASE 6: QWEN AI FINANCIAL INTELLIGENCE VERIFICATION')
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
    const qwenSvc = new QwenService()
    const invRepo = new InvoicesRepository()
    const investigationsRepo = new InvestigationsRepository()
    const recommendationsRepo = new RecommendationsRepository()

    const investigatorSvc = new FinancialInvestigatorService()
    const recommendationsSvc = new AiRecommendationsService()
    const assistantSvc = new AiAssistantService()
    const searchSvc = new NaturalLanguageSearchService()

    // ----------------------------------------------------
    // TEST 1: Qwen Service Foundation & JSON Parsing
    // ----------------------------------------------------
    console.log('--- TEST 1: QWEN SERVICE INTEGRATION & SAFE JSON PARSER ---')
    
    // Test JSON extraction from markdown code block
    const sampleMarkdown = 'Here is the analysis:\n```json\n{\n  "status": "ANALYZED",\n  "confidence": 95\n}\n```'
    const parsed = qwenSvc.extractAndValidateJson(sampleMarkdown)
    assert(parsed !== null && parsed.status === 'ANALYZED' && parsed.confidence === 95, 'Safe JSON extraction handles markdown fences')

    // Test raw text JSON extraction
    const rawJson = '{"confidence": 88, "action": "HOLD"}'
    const parsedRaw = qwenSvc.extractAndValidateJson(rawJson)
    assert(parsedRaw !== null && parsedRaw.action === 'HOLD', 'Safe JSON extraction handles raw JSON strings')

    // Test completion invocation (with graceful grounded fallback engine)
    const testPrompt = 'Perform a comprehensive forensic financial investigation on entity INV-20481'
    const completion = await qwenSvc.generateCompletion(testPrompt)
    assert(!!completion.parsedJson, 'Qwen service returns valid structured JSON', `Model: ${completion.model} (isFallback: ${completion.isFallback})`)
    assert(typeof completion.parsedJson.summary === 'string', 'Structured summary field present in Qwen output')

    // ----------------------------------------------------
    // TEST 2: AI Financial Investigator (Phase 6B & 6C)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: AI FINANCIAL INVESTIGATOR & EVIDENCE GROUNDING ---')
    const { data: invoices } = await invRepo.findFiltered({ limit: 10 })
    const heroAcme = invoices.find(i => i.invoice_number === 'INV-20481')
    assert(!!heroAcme, 'Hero Demo Invoice INV-20481 exists for AI investigation')

    if (heroAcme) {
      const investigation = await investigatorSvc.investigateEntity('INVOICE', heroAcme.id, {
        name: 'Lead AI Auditor',
        role: 'FINANCE_MANAGER'
      })

      assert(!!investigation, 'AI Financial Investigation completed successfully')
      assert(investigation.entityId === heroAcme.id, 'Investigated entity ID correctly linked')
      assert(investigation.deterministicRiskScore === 80, 'Deterministic risk score strictly preserved (80/100)', `Score: ${investigation.deterministicRiskScore}`)
      assert(investigation.deterministicRiskLevel === 'CRITICAL', 'Deterministic risk level strictly preserved (CRITICAL)')
      assert(Array.isArray(investigation.keyFindings) && investigation.keyFindings.length > 0, 'Grounded key findings produced', `${investigation.keyFindings.length} findings`)
      assert(Array.isArray(investigation.suspiciousSignals) && investigation.suspiciousSignals.length > 0, 'Suspicious signals categorized', investigation.suspiciousSignals.join(', '))
      assert(investigation.confidence >= 0 && investigation.confidence <= 100, 'AI Confidence rating bounded [0, 100]', `${investigation.confidence}%`)
      assert(investigation.recommendedAction === 'HOLD', 'AI Recommended Action grounded in critical breach (HOLD)', investigation.recommendedAction)

      // Verify separation of Deterministic Evidence vs AI Interpretation
      assert(Array.isArray(investigation.evidence) && investigation.evidence.length > 0, 'Deterministic evidence items isolated from AI reasoning', `${investigation.evidence.length} items`)
      const hasBaseline = investigation.evidence.some(e => e.baseline_value !== null || e.deviation !== null)
      assert(hasBaseline, 'Forensic evidence items include baseline and deviation metrics')

      // Verify Supabase persistence in investigations table
      const storedInvestigation = await investigationsRepo.findByInvestigationId(investigation.investigationId)
      assert(!!storedInvestigation, 'Investigation persisted to Supabase investigations table', storedInvestigation?.investigation_id)

      // Verify evidence items persisted in investigation_evidence table
      if (storedInvestigation) {
        const storedEvidence = await investigationsRepo.findEvidence(storedInvestigation.id)
        assert(storedEvidence.length > 0, 'Forensic evidence stored in investigation_evidence table', `${storedEvidence.length} rows`)
      }

      console.log(`    Executive Summary: ${investigation.summary.substring(0, 110)}...`)
    }

    // ----------------------------------------------------
    // TEST 3: AI Recommendations (Phase 6D)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: AI FINANCIAL RECOMMENDATIONS ENGINE ---')
    if (heroAcme) {
      const recommendation = await recommendationsSvc.generateRecommendation({
        entityType: 'INVOICE',
        entityReference: 'INV-20481',
        riskScore: 80,
        riskLevel: 'CRITICAL',
        anomalies: [{ title: 'PO Unit Price Discrepancy (+53.33%)' }],
        evidence: [{ description: 'PO delta ₹6,40,000' }]
      })

      assert(recommendation.recommendationType === 'HOLD', 'AI recommendation reflects critical risk (HOLD)', recommendation.recommendationType)
      assert(recommendation.priority === 'CRITICAL', 'Recommendation priority is CRITICAL', recommendation.priority)
      assert(recommendation.confidence >= 80, 'Recommendation confidence >= 80%', `${recommendation.confidence}%`)
      assert(recommendation.suggestedWorkflow === 'PAYMENT_HOLD', 'Suggested safeguard workflow is PAYMENT_HOLD', recommendation.suggestedWorkflow)
      assert(typeof recommendation.recommendationText === 'string', 'Recommendation operational text provided')

      // Verify recommendations repository integration
      const allRecs = await recommendationsRepo.findAll(5)
      assert(Array.isArray(allRecs), 'Recommendations query executed against public.recommendations', `Found: ${allRecs.length}`)
    }

    // ----------------------------------------------------
    // TEST 4: AI Financial Assistant (Phase 6E)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: AI FINANCIAL CONVERSATIONAL ASSISTANT ---')
    
    // Query 1: Hero invoice inquiry
    const q1 = await assistantSvc.askAssistant('Why is INV-20481 suspicious?')
    assert(typeof q1.answer === 'string' && q1.answer.length > 50, 'Assistant generated comprehensive answer for INV-20481')
    assert(q1.answer.includes('INV-20481') || q1.answer.includes('Acme'), 'Answer grounded with target invoice identity')
    assert(q1.citations.length > 0, 'Assistant citations provided linking financial entities', `${q1.citations.length} citations`)
    assert(q1.suggestedFollowUps.length > 0, 'Follow-up prompts generated for interactive workflow', q1.suggestedFollowUps[0])

    // Query 2: Budget inquiry
    const q2 = await assistantSvc.askAssistant('How much of the budget has been used?')
    assert(typeof q2.answer === 'string' && q2.answer.length > 50, 'Assistant generated grounded budget answer')
    assert(q2.answer.includes('Operations') || q2.answer.includes('Budget'), 'Answer cites verified department budget telemetry')

    // ----------------------------------------------------
    // TEST 5: Natural-Language Financial Search (Phase 6F)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: NATURAL-LANGUAGE FINANCIAL SEARCH ---')

    // Search 1: High-amount invoices
    const s1 = await searchSvc.search('Find invoices above ₹10 lakh with high risk')
    assert(s1.interpretedIntent.entity === 'invoices', 'Query entity correctly mapped to "invoices"', s1.interpretedIntent.entity)
    assert(Array.isArray(s1.results), 'Search returns structured results array', `Found ${s1.results.length} items`)
    if (s1.results.length > 0) {
      const acmeMatch = s1.results.find(r => r.title === 'INV-20481')
      assert(!!acmeMatch, 'INV-20481 matched by natural-language query criteria')
    }

    // Search 2: Budgets
    const s2 = await searchSvc.search('Show budgets above 80% utilization')
    assert(s2.interpretedIntent.entity === 'budgets', 'Budget query mapped to "budgets"', s2.interpretedIntent.entity)
    assert(Array.isArray(s2.results) && s2.results.length > 0, 'Budgets search returned structured results', `${s2.results.length} departments`)

    // Search 3: Counterparties
    const s3 = await searchSvc.search('Show high-risk vendors')
    assert(s3.interpretedIntent.entity === 'vendors', 'Vendor query mapped to "vendors"', s3.interpretedIntent.entity)
    assert(Array.isArray(s3.results), 'Vendor search returns structured results')

    // ----------------------------------------------------
    // TEST 6: AI Safety & RBAC Guardrails
    // ----------------------------------------------------
    console.log('\n--- TEST 6: AI SAFETY, NON-INTERFERENCE & IMMUTABILITY ---')

    // Verify AI did NOT overwrite deterministic score
    if (heroAcme) {
      const refreshedAcme = await invRepo.findById(heroAcme.id)
      assert(refreshedAcme?.risk_score === 80, 'Deterministic invoice risk score remains 80 after AI analysis', `Score: ${refreshedAcme?.risk_score}`)
    }

    // Verify recommendations are advisory (do NOT auto-approve/auto-disburse payments)
    const pendingRecs = await recommendationsRepo.findAll(10)
    const arePending = pendingRecs.every(r => r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'OVERRIDDEN')
    assert(arePending, 'AI recommendations are strictly advisory and require human workflow sign-off')

    console.log('\n==================================================')
    console.log(`PHASE 6 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`)
    console.log('==================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Fatal error during Phase 6 verification:', err)
    process.exit(1)
  }
}

runPhase6Tests()

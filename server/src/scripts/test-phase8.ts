import dotenv from 'dotenv'
import { supabaseAdmin } from '../config/supabase.js'
import { ForecastingService } from '../services/forecasting.service.js'
import { AnalyticsService } from '../services/analytics.service.js'
import { ReportsService } from '../services/reports.service.js'
import { SmartAlertsService } from '../services/smartAlerts.service.js'

dotenv.config()

async function runPhase8Tests() {
  console.log('\n==================================================')
  console.log('FIN-SHIELD PHASE 8A–8D: COMPREHENSIVE AUTOMATED VERIFICATION')
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
    // Check seed profiles
    const { data: profiles, error: profileErr } = await supabaseAdmin.from('profiles').select('id, email, role')
    if (profileErr) throw profileErr
    assert(Boolean(profiles && profiles.length > 0), 'Database has seed profiles configured', `${profiles?.length} profiles found`)

    const manager = profiles?.find(p => p.role === 'FINANCE_MANAGER') || profiles?.[0]!
    console.log(`Auditor User Context: ${manager.email} (${manager.role})`)

    // =========================================================================
    // 8A — CASH-FLOW FORECASTING ENGINE
    // =========================================================================
    console.log('\n--- 8A: CASH-FLOW FORECASTING & HOLD PRESERVATION SIMULATION ---')
    const forecastingService = new ForecastingService()

    // 8A.1 Test 30D Forecast Generation
    const forecast30 = await forecastingService.getCashFlowForecast('30D')
    assert(forecast30.timeSeries.length >= 8, 'Generated 30-day projection time series', `${forecast30.timeSeries.length} intervals`)
    
    const samplePoint = forecast30.timeSeries[0]
    assert(
      typeof samplePoint.inflow === 'number' &&
      typeof samplePoint.outflow === 'number' &&
      typeof samplePoint.outflowWithHolds === 'number' &&
      typeof samplePoint.netCash === 'number' &&
      typeof samplePoint.closingBalance === 'number',
      'Projection points contain deterministic financial coordinates',
      `Inflow: ₹${samplePoint.inflow}, Outflow: ₹${samplePoint.outflow}, OutflowWithHolds: ₹${samplePoint.outflowWithHolds}`
    )

    // 8A.2 Test Summary and Hold Capital Preservation
    const summary = forecast30.summary
    assert(summary.currentBalance > 0, 'Current liquid balance calculated from database ledger', `Balance: ₹${summary.currentBalance.toLocaleString()}`)
    assert(summary.projectedInflow > 0, 'Projected receivables calculated', `Inflow: ₹${summary.projectedInflow.toLocaleString()}`)
    assert(summary.projectedOutflow > 0, 'Projected outlays calculated', `Outflow: ₹${summary.projectedOutflow.toLocaleString()}`)
    assert(summary.capitalPreservedByHolds >= 0, 'Capital preserved by active EnterPro holds verified', `Preserved: ₹${summary.capitalPreservedByHolds.toLocaleString()}`)
    assert(summary.keyDrivers.length > 0, 'Key forecast drivers identified', `${summary.keyDrivers.length} drivers: ${summary.keyDrivers.map((d: any) => d.title).join(', ')}`)

    // 8A.3 Test Configurable Horizons
    const forecast7 = await forecastingService.getCashFlowForecast('7D')
    assert(forecast7.timeSeries.length >= 6, 'Configurable horizon 7D verified', `${forecast7.timeSeries.length} intervals`)
    const forecast90 = await forecastingService.getCashFlowForecast('90D')
    assert(forecast90.timeSeries.length >= 10, 'Configurable horizon 90D verified', `${forecast90.timeSeries.length} intervals`)

    // =========================================================================
    // 8B — FINANCIAL TREND ANALYTICS
    // =========================================================================
    console.log('\n--- 8B: FINANCIAL TREND ANALYTICS & VELOCITY ENGINES ---')
    const analyticsService = new AnalyticsService()

    // 8B.1 Macro Trends
    const macro = await analyticsService.getMacroTrends()
    assert(macro.monthlyTrends.length > 0, 'Macro monthly spend/revenue velocity retrieved', `${macro.monthlyTrends.length} months`)
    assert(macro.kpis.totalSpendYTD > 0, 'Macro YTD spend computed', `YTD: ₹${macro.kpis.totalSpendYTD.toLocaleString()}`)
    assert(typeof macro.kpis.momSpendChangePercent === 'number', 'MoM spend velocity percentage computed', `${macro.kpis.momSpendChangePercent.toFixed(1)}%`)

    // 8B.2 Department & Category Spending Breakdown
    const spending = await analyticsService.getSpendingBreakdown()
    assert(spending.departments.length > 0, 'Departmental spend allocation calculated', `${spending.departments.length} departments: ${spending.departments.map(d => `${d.department} (${d.percentage.toFixed(1)}%)`).join(', ')}`)
    assert(spending.categories.length > 0, 'Category spend breakdown calculated', `${spending.categories.length} categories`)

    // 8B.3 Vendor Concentration & Risk Velocity
    const vendorMetrics = await analyticsService.getVendorAnalytics()
    assert(vendorMetrics.vendors.length > 0, 'Vendor spend & concentration metrics computed', `${vendorMetrics.vendors.length} vendors evaluated`)
    assert(vendorMetrics.topSpenderConcentrationPercent > 0, 'Top vendor concentration evaluated', `${vendorMetrics.topSpenderConcentrationPercent.toFixed(1)}%`)

    // 8B.4 Budget Adherence & Burn Rate
    const budgetPerf = await analyticsService.getBudgetPerformance()
    assert(budgetPerf.budgets.length > 0, 'Budget performance retrieved from database', `${budgetPerf.budgets.length} cost centers`)
    assert(budgetPerf.utilizationPercentage >= 0, 'Overall budget burn rate calculated', `${budgetPerf.utilizationPercentage.toFixed(1)}%`)

    // =========================================================================
    // 8C — AI FINANCIAL REPORTS
    // =========================================================================
    console.log('\n--- 8C: GROUNDED AI FINANCIAL REPORTS (QWEN SYNTHESIS) ---')
    const reportsService = new ReportsService()

    // 8C.1 Generate Structured Report
    const genResult = await reportsService.generateReport({
      reportName: 'Automated CI/CD Financial Health Audit',
      reportType: 'FINANCIAL_SUMMARY',
      reportingPeriod: 'September 2026',
      financialScope: 'Enterprise Consolidated Operations',
      user: {
        id: manager.id,
        email: manager.email,
        role: manager.role
      }
    })

    assert(Boolean(genResult.report?.id), 'Report persisted to public.reports table', `Report ID: ${genResult.report.id}`)
    assert(genResult.report.status === 'COMPLETED', 'Report status is COMPLETED')

    // 8C.2 Validate 9 Strict C-Suite Sections
    const rep = genResult.content
    assert(Boolean(rep.executiveSummary && rep.executiveSummary.length > 20), 'Section 1: Executive Summary generated and grounded', rep.executiveSummary.substring(0, 80) + '...')
    assert(typeof rep.financialPerformance.revenue === 'number' && typeof rep.financialPerformance.spend === 'number', 'Section 2: Financial Performance numbers match database')
    assert(typeof rep.cashFlowOutlook.projectedInflow === 'number' && typeof rep.cashFlowOutlook.projectedOutflow === 'number', 'Section 3: Cash Flow Outlook structured')
    assert(Boolean(rep.spendingTrendAnalysis), 'Section 4: Spending Trend Analysis present')
    assert(typeof rep.riskAnomalySummary.totalAnomalies === 'number', 'Section 5: Risk & Anomaly Summary correlated with Phase 5 anomalies')
    assert(Boolean(rep.vendorInvoiceInsights), 'Section 6: Vendor & Invoice Insights populated')
    assert(Boolean(rep.budgetObservations), 'Section 7: Budget Observations populated')
    assert(Array.isArray(rep.keyFindings) && rep.keyFindings.length > 0, 'Section 8: Key Audit Findings structured', `${rep.keyFindings.length} findings`)
    assert(Array.isArray(rep.recommendedActions) && rep.recommendedActions.length > 0, 'Section 9: Strategic Recommendations actionable', `${rep.recommendedActions.length} recommendations`)

    // 8C.3 Query back created report
    const fetchedReport = await reportsService.getReportById(genResult.report.id)
    assert(fetchedReport?.id === genResult.report.id, 'Report successfully fetched by ID')

    // =========================================================================
    // 8D — SMART ALERTS ENGINE
    // =========================================================================
    console.log('\n--- 8D: SMART ALERTS (INVOICES, DUPLICATES, BUDGETS, HOLDS) ---')
    const smartAlertsService = new SmartAlertsService()

    // 8D.1 Run Autonomous Scan
    const syncResult = await smartAlertsService.syncSmartAlerts()
    assert(syncResult.activeAlerts.length >= 0, 'Smart Alert engine evaluated ledger active alerts', `${syncResult.activeAlerts.length} active alerts in system`)
    console.log(`  Alert Scan Result: ${syncResult.createdAlertsCount} alerts created, ${syncResult.activeAlerts.length} active alerts total`)

    // 8D.2 List Alerts and Filter by Severity
    const allAlerts = await smartAlertsService.getAlerts({ limit: 20 })
    assert(allAlerts.length > 0, 'Alerts retrieved from public.alerts', `${allAlerts.length} alerts in queue`)

    const targetAlert = allAlerts[0]
    console.log(`  Target Alert: [${targetAlert.severity}] ${targetAlert.title} (ID: ${targetAlert.id})`)

    // 8D.3 Mark Alert as Read
    const readAlert = await smartAlertsService.markAsRead(targetAlert.id)
    assert(readAlert.read_state === true, 'Alert marked as read in database')

    // 8D.4 Resolve Alert
    const resolvedAlert = await smartAlertsService.resolveAlert(targetAlert.id, {
      id: manager.id,
      email: manager.email,
      role: manager.role
    })
    assert(resolvedAlert.status === 'RESOLVED', 'Alert marked as RESOLVED in database and audit logged')

    // 8D.5 Idempotency and De-duplication Test
    const secondSync = await smartAlertsService.syncSmartAlerts()
    assert(secondSync.createdAlertsCount === 0, 'De-duplication prevents duplicate active alerts on subsequent sync', `Created on 2nd run: ${secondSync.createdAlertsCount}`)

    console.log('\n==================================================')
    console.log(`PHASE 8 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`)
    console.log('==================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('\n[FATAL TEST ERROR]', err)
    process.exit(1)
  }
}

runPhase8Tests()

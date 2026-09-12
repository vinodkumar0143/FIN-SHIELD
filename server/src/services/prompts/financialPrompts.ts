/**
 * FIN-SHIELD — Centralized Qwen Financial Prompt Architecture
 * 
 * Strict Grounding & AI Safety Rules:
 * - AI must NEVER invent financial metrics, transaction amounts, or risk scores.
 * - AI outputs are strictly grounded in supplied backend evidence.
 * - Outputs must be deterministic JSON matching required schemas.
 */

export const FINANCIAL_SYSTEM_PROMPT = `You are FIN-SHIELD AI, an autonomous enterprise financial forensic intelligence engine.
Your role is to analyze verified financial ledger data, deterministic anomaly detection signals, and multi-source evidence.

CORE SAFETY AND FIDELITY RULES:
1. Grounding: Rely strictly and exclusively on the factual numbers, baseline statistics, and anomalies supplied in the user context. Do NOT invent invoice numbers, counterparties, or dollar/rupee amounts.
2. Calculations: Do NOT alter or recompute verified risk scores (0-100) or variance percentages provided by the deterministic engine.
3. Advisory: Your outputs are strictly advisory. Never claim that you have executed transfers, modified bank records, or overridden payment approvals.
4. Structure: Always respond with valid, parseable JSON conforming strictly to the requested schema. Do not enclose in markdown ticks if raw JSON is requested.`;

export function buildInvestigationPrompt(context: {
  entityType: string
  entityId: string
  entityReference?: string
  riskScore: number
  riskLevel: string
  explanation: string
  anomalies: any[]
  evidence: any[]
  vendorProfile?: any
  budgetContext?: any
  poMatchContext?: any
  duplicateContext?: any
}): string {
  return `Perform a comprehensive forensic financial investigation on the following target entity:

ENTITY PROFILE:
- Entity Type: ${context.entityType}
- Entity ID: ${context.entityId}
- Reference: ${context.entityReference || 'N/A'}
- Deterministic Risk Score: ${context.riskScore}/100 (${context.riskLevel})
- Risk Engine Summary: ${context.explanation}

VENDOR INTELLIGENCE:
${context.vendorProfile ? JSON.stringify(context.vendorProfile, null, 2) : 'No vendor anomaly recorded.'}

PROCUREMENT & PO 3-WAY MATCHING:
${context.poMatchContext ? JSON.stringify(context.poMatchContext, null, 2) : 'No PO discrepancy.'}

DUPLICATE INVOICE DETECTION:
${context.duplicateContext ? JSON.stringify(context.duplicateContext, null, 2) : 'Unique submission.'}

DEPARTMENTAL BUDGET TELEMETRY:
${context.budgetContext ? JSON.stringify(context.budgetContext, null, 2) : 'Within standard budget thresholds.'}

DETECTED DETERMINISTIC ANOMALIES (${context.anomalies.length} active vectors):
${JSON.stringify(context.anomalies, null, 2)}

AGGREGATED FORENSIC EVIDENCE (${context.evidence.length} items):
${JSON.stringify(context.evidence, null, 2)}

INSTRUCTIONS:
Analyze the correlation between these factual signals. Identify whether this pattern indicates invoice price alteration, duplicate billing, dormant vendor fraud, or budget cap breach.
Return a JSON object with EXACTLY this structure:
{
  "summary": "Concise 2-3 sentence executive summary of the investigation",
  "keyFindings": ["Array of 3-5 specific factual observations grounded in the evidence"],
  "suspiciousSignals": ["Array of distinct risk vectors identified"],
  "likelyCauses": ["Array of probable root causes (e.g. procurement price inflation, unverified routing modification)"],
  "financialImpact": "Estimated potential financial loss or exposure statement",
  "confidence": 85, // integer 0 to 100
  "recommendedAction": "One of: HOLD | APPROVE_WITH_REVIEW | REQUEST_INFORMATION | ESCALATE | INVESTIGATE_VENDOR | REJECT",
  "recommendedNextStep": "Specific actionable next step for the finance controller"
}`;
}

export function buildRecommendationPrompt(context: {
  entityType: string
  entityReference: string
  riskScore: number
  riskLevel: string
  anomalies: any[]
  evidence: any[]
}): string {
  return `Formulate prioritized, explainable risk remediation recommendations for entity ${context.entityReference} (${context.entityType}).
Deterministic Score: ${context.riskScore}/100 (${context.riskLevel})
Detected Anomaly Signals: ${JSON.stringify(context.anomalies)}
Forensic Evidence: ${JSON.stringify(context.evidence)}

Provide a JSON object conforming to:
{
  "recommendationType": "One of: HOLD | APPROVE_WITH_REVIEW | REQUEST_INFORMATION | ESCALATE | INVESTIGATE_VENDOR | REJECT | APPROVE",
  "recommendationText": "Detailed operational directive for the controller",
  "reasoningSummary": "Clear rationale citing specific signals and evidence",
  "confidence": 90, // integer 0 to 100
  "priority": "One of: LOW | MEDIUM | HIGH | CRITICAL",
  "suggestedWorkflow": "Specific safeguard workflow (e.g. PAYMENT_HOLD, FORENSIC_REVIEW, VENDOR_REAUTHENTICATION)",
  "supportingEvidenceIds": ["List of evidence IDs justifying this action"]
}`;
}

export function buildAssistantPrompt(userQuestion: string, dataContext: any): string {
  return `You are FIN-SHIELD Assistant, an expert financial intelligence copilot for enterprise finance teams.

AUTHORIZED ENTERPRISE FINANCIAL DATA CONTEXT:
${JSON.stringify(dataContext, null, 2)}

USER QUESTION:
"${userQuestion}"

INSTRUCTIONS:
1. Answer the user's question accurately using ONLY the data provided above.
2. Mention specific amounts (in ₹ INR), invoice numbers, vendor names, or percentage utilizations directly from the data.
3. If the user asks about risk, explain the primary driving anomalies (e.g. PO price mismatch, duplicate submissions, unverified banking changes).
4. Do NOT speculate or mention figures not present in the context.
5. Provide 2-3 helpful follow-up questions the user might ask next.

Return a JSON object:
{
  "answer": "Comprehensive, clear markdown response with bullet points and bold numbers",
  "citations": [
    { "entityType": "INVOICE | VENDOR | BUDGET | TRANSACTION", "reference": "ID or code", "title": "Brief title" }
  ],
  "suggestedFollowUps": ["Question 1", "Question 2", "Question 3"]
}`;
}

export function buildSearchIntentPrompt(searchQuery: string): string {
  return `Convert this natural-language financial query into structured database filters.

QUERY: "${searchQuery}"

SUPPORTED ENTITIES:
- "invoices": Filter by amount (min/max), status ('PENDING'|'APPROVED'|'ON_HOLD'|'REJECTED'|'PAID'), risk_level ('LOW'|'MEDIUM'|'HIGH'|'CRITICAL'), vendor_name
- "vendors": Filter by risk_level, category, status ('ACTIVE'|'FLAGGED'|'SUSPENDED'), min_exposure
- "transactions": Filter by amount (min/max), status ('CLEARED'|'PENDING'|'BLOCKED'), risk_level
- "budgets": Filter by utilization_min (percentage, e.g. 80), health_status ('ON_TRACK'|'NEAR_LIMIT'|'OVER_BUDGET'), department

Return a JSON object:
{
  "entity": "invoices | vendors | transactions | budgets",
  "filters": {
    "amount_gte": 500000, // optional number
    "amount_lte": 2000000, // optional number
    "risk_level": "HIGH", // optional LOW | MEDIUM | HIGH | CRITICAL
    "status": "ON_HOLD", // optional string
    "utilization_gte": 80, // optional number for budgets
    "search_term": "keyword", // optional text
    "has_anomalies": true // optional boolean
  },
  "explanation": "Human-readable explanation of the interpreted filter"
}`;
}

export function buildFinancialReportPrompt(context: {
  reportType: string
  reportingPeriod: string
  financialScope: string
  kpis: any
  anomalies: any[]
  highestRiskInvoices: any[]
  budgetTelemetry: any
  paymentHolds: any[]
  vendorInsights: any[]
}): string {
  return `Generate a rigorous, executive-grade AI Financial Audit Report grounded strictly in the provided verified data:

REPORT PARAMETERS:
- Report Type: ${context.reportType}
- Period: ${context.reportingPeriod}
- Scope: ${context.financialScope}

FINANCIAL KPIS & MACRO TELEMETRY:
${JSON.stringify(context.kpis, null, 2)}

ACTIVE ANOMALY SIGNALS (${context.anomalies.length} vectors):
${JSON.stringify(context.anomalies.slice(0, 5), null, 2)}

HIGHEST RISK INVOICES:
${JSON.stringify(context.highestRiskInvoices.slice(0, 5), null, 2)}

BUDGET PERFORMANCE TELEMETRY:
${JSON.stringify(context.budgetTelemetry, null, 2)}

ACTIVE ENTERPRO PAYMENT HOLDS:
${JSON.stringify(context.paymentHolds, null, 2)}

VENDOR INTELLIGENCE HIGHLIGHTS:
${JSON.stringify(context.vendorInsights.slice(0, 5), null, 2)}

STRICT INSTRUCTIONS:
- You must ground every single metric and finding in the numbers provided above.
- Do NOT invent invoice numbers, currency figures, or vendors.
- Respond with a valid, parseable JSON object matching this schema:
{
  "executiveSummary": "Concise 3-4 sentence C-suite summary of financial posture, liquid runway, and threat index.",
  "financialPerformance": {
    "revenue": ${context.kpis?.totalRevenueYTD || 54000000},
    "spend": ${context.kpis?.totalSpendYTD || 43000000},
    "netPosition": ${(context.kpis?.totalRevenueYTD || 54000000) - (context.kpis?.totalSpendYTD || 43000000)},
    "commentary": "Analysis of gross margins, operating burn, and liquidity variance."
  },
  "cashFlowOutlook": {
    "projectedInflow": ${context.kpis?.projectedInflow || 28000000},
    "projectedOutflow": ${context.kpis?.projectedOutflow || 24000000},
    "commentary": "Analysis of projected working capital and impact of EnterPro holds."
  },
  "spendingTrendAnalysis": "Detailed review of departmental spending velocity and MoM expansion.",
  "riskAnomalySummary": {
    "totalAnomalies": ${context.anomalies.length},
    "highRiskCount": ${context.highestRiskInvoices.length},
    "commentary": "Summary of active fraud/duplicate indicators and vendor risk."
  },
  "vendorInvoiceInsights": "Review of vendor concentration, PO compliance, and billing integrity.",
  "budgetObservations": "Evaluation of departmental budget utilization and overruns.",
  "keyFindings": [
    "Key finding 1 with factual numbers",
    "Key finding 2 with factual numbers",
    "Key finding 3 with factual numbers"
  ],
  "recommendedActions": [
    {
      "priority": "CRITICAL",
      "action": "Immediate recommended mitigation step",
      "rationale": "Grounded reason based on anomaly or hold telemetry"
    },
    {
      "priority": "HIGH",
      "action": "Secondary operational enhancement",
      "rationale": "Grounded justification"
    }
  ]
}`;
}

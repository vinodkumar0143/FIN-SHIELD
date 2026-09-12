import { type RiskLevel } from '@/lib/utils'

export interface EvidenceItem {
  id: string
  source: 'INVOICE' | 'VENDOR' | 'PURCHASE_ORDER' | 'TRANSACTIONS' | 'BUDGET' | 'HISTORICAL_BASELINE' | 'ANOMALY_SIGNAL'
  title: string
  value: string
  benchmark: string
  significance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
  riskContribution: number // out of 100
  description: string
  metadata?: Record<string, any>
}

export interface RiskVectorItem {
  name: string
  score: number
  weight: number
  severity: RiskLevel
}

export interface InvestigationRecord {
  id: string
  investigationId: string
  entityName: string
  entityType: 'INVOICE' | 'VENDOR' | 'TRANSACTION' | 'WIRE'
  invoiceNumber?: string
  vendorCode?: string
  amount: number
  riskScore: number
  severity: RiskLevel
  status: 'ANALYZING' | 'ACTION_REQUIRED' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  leadInvestigator: string
  summary: string
  primaryFinding: string
  recommendation: {
    action: string
    reason: string
    confidence: number
    suggestedWorkflow: string
  }
  evidence: EvidenceItem[]
  riskVectors: RiskVectorItem[]
  aiReasoning: {
    finding: string
    evidenceSummary: string
    interpretation: string
    recommendationRationale: string
  }
  timeline: {
    step: 'DETECTED' | 'INGESTING' | 'AI_ANALYSIS' | 'RECOMMENDATION' | 'HUMAN_REVIEW' | 'RESOLUTION'
    label: string
    timestamp: string
    status: 'completed' | 'current' | 'upcoming'
    note: string
  }[]
}

export const MOCK_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: 'inv-28491',
    investigationId: 'AI-INV-2026-089',
    entityName: 'ABC Supplies Pvt Ltd',
    entityType: 'INVOICE',
    invoiceNumber: 'INV-28491',
    vendorCode: 'VEND-0042',
    amount: 482000,
    riskScore: 87,
    severity: 'critical',
    status: 'ON_HOLD',
    createdAt: '2026-09-08 09:14:25 IST',
    updatedAt: '2026-09-08 09:14:32 IST',
    leadInvestigator: 'FIN-SHIELD Qwen-Forensic Engine v4.2',
    summary: 'Critical multi-signal financial anomaly detected on invoice INV-28491 from ABC Supplies Pvt Ltd. Deterministic analysis isolated extreme amount deviation (+3.42 Z-score), recent unverified banking routing alteration, soft duplicate overlap with settled invoice INV-28412, and an impending +18.5% departmental budget overrun in Q3 Operations.',
    primaryFinding: 'High confidence anomalous disbursement request with unverified bank account update and duplicate characteristics.',
    recommendation: {
      action: 'Lock payment in EnterPro escrow (#WF-9042) and escalate to Finance Manager',
      reason: 'Billed amount deviates by +311.9% from historical 90-day baseline, and remittance routing changed without biometric counter-authorization.',
      confidence: 94.8,
      suggestedWorkflow: 'EnterPro Payment Hold #WF-9042'
    },
    riskVectors: [
      { name: 'Amount Deviation', score: 95, weight: 0.30, severity: 'critical' },
      { name: 'Banking Routing Volatility', score: 92, weight: 0.25, severity: 'critical' },
      { name: 'Duplicate Overlap', score: 86, weight: 0.20, severity: 'high' },
      { name: 'Budget Overrun Hazard', score: 82, weight: 0.15, severity: 'high' },
      { name: 'PO 3-Way Match Variance', score: 74, weight: 0.10, severity: 'high' }
    ],
    evidence: [
      {
        id: 'ev-1',
        source: 'HISTORICAL_BASELINE',
        title: 'Amount Statistical Deviation',
        value: '₹4,82,000 (Z-Score: +3.42)',
        benchmark: '90-Day Avg: ₹1,17,000 (σ = ₹1,06,700)',
        significance: 'CRITICAL',
        riskContribution: 35,
        description: 'Invoice billed total is +311.9% higher than ABC Supplies historical average, placing it in the 99.96th percentile of historical outflows for this vendor.'
      },
      {
        id: 'ev-2',
        source: 'VENDOR',
        title: 'Remittance Bank Routing Altered',
        value: 'IFSC: HDFC0000128 (Changed Sep 4)',
        benchmark: 'Historical IFSC: ICIC0000041',
        significance: 'CRITICAL',
        riskContribution: 28,
        description: 'Beneficiary account was changed 4 days prior to invoice submission without registered biometric confirmation from ABC Supplies authorized director.'
      },
      {
        id: 'ev-3',
        source: 'INVOICE',
        title: 'Soft Duplicate Match with Settled Invoice',
        value: 'Match: INV-28412 (96.4% text similarity)',
        benchmark: 'Settled: 2026-08-31 for ₹4,78,000',
        significance: 'HIGH',
        riskContribution: 20,
        description: 'Line item 1 ("Enterprise Grade Industrial Coolant") and Line item 2 ("Valve Actuators") match settled invoice INV-28412 paid just 8 days prior.'
      },
      {
        id: 'ev-4',
        source: 'BUDGET',
        title: 'Departmental Budget Overrun Hazard',
        value: 'Operations Q3 Budget Deficit: -₹1,70,000',
        benchmark: 'Quarterly Allocation Cap: ₹45,00,000',
        significance: 'HIGH',
        riskContribution: 12,
        description: 'Disbursing this invoice drives Q3 Operations budget utilization to 103.8%, creating an unapproved fiscal deficit.'
      },
      {
        id: 'ev-5',
        source: 'PURCHASE_ORDER',
        title: 'Purchase Order Out of Scope Variance',
        value: 'Invoice: ₹4,82,000 vs PO-2026-9042: ₹1,20,000',
        benchmark: 'Approved PO Ceiling: ₹1,20,000',
        significance: 'MEDIUM',
        riskContribution: 5,
        description: 'Invoice exceeds the committed Purchase Order amount by +₹3,62,000 (+301.6%), including uncontracted express freight fees.'
      }
    ],
    aiReasoning: {
      finding: 'Invoice INV-28491 exhibits multiple correlated anomaly vectors indicating potential unauthorized billing, fraudulent account redirection, or double invoicing.',
      evidenceSummary: 'Multi-source analysis confirmed: (1) Amount Z-score +3.42, (2) Remittance bank account altered 4 days prior, (3) 96.4% duplicate text match with INV-28412 settled 8 days prior, and (4) Operations budget breach.',
      interpretation: 'The combination of an unverified bank routing change and a duplicate bill for industrial coolant suggests an account compromise or duplicate submission by vendor billing staff.',
      recommendationRationale: 'Applying an immediate EnterPro escrow hold (#WF-9042) preserves ₹4,82,000 in capital while allowing treasury to obtain voice-authenticated confirmation from vendor executive officers.'
    },
    timeline: [
      { step: 'DETECTED', label: 'Anomaly Trigger Fired', timestamp: '2026-09-08 09:14:22', status: 'completed', note: 'Z-score +3.42 and routing change detected by rule engine' },
      { step: 'INGESTING', label: 'Multi-Source Data Correlated', timestamp: '2026-09-08 09:14:24', status: 'completed', note: 'Vendor ledger, PO-2026-9042, and budget records aggregated' },
      { step: 'AI_ANALYSIS', label: 'Forensic Synthesis & Scoring', timestamp: '2026-09-08 09:14:25', status: 'completed', note: 'Qwen reasoning synthesized 5 evidence vectors into 87/100 risk score' },
      { step: 'RECOMMENDATION', label: 'EnterPro Hold Triggered', timestamp: '2026-09-08 09:14:27', status: 'completed', note: 'Automated hold workflow #WF-9042 placed on payment disbursement' },
      { step: 'HUMAN_REVIEW', label: 'Finance Manager Review', timestamp: 'Pending', status: 'current', note: 'Assigned to Rajesh Sharma / Evelyn Vance for verbal confirmation' },
      { step: 'RESOLUTION', label: 'Final Resolution', timestamp: 'Upcoming', status: 'upcoming', note: 'Awaiting vendor identity verification before release or cancellation' }
    ]
  },
  {
    id: 'inv-29014',
    investigationId: 'AI-INV-2026-091',
    entityName: 'NexGen Cloud Infrastructure',
    entityType: 'INVOICE',
    invoiceNumber: 'INV-29014',
    vendorCode: 'VEND-0109',
    amount: 1245000,
    riskScore: 68,
    severity: 'high',
    status: 'ACTION_REQUIRED',
    createdAt: '2026-09-06 14:15:10 IST',
    updatedAt: '2026-09-06 14:15:20 IST',
    leadInvestigator: 'FIN-SHIELD Qwen-Forensic Engine v4.2',
    summary: 'Cloud infrastructure billing overrun detected. Billed invoice exceeds authorized purchase order PO-2026-9110 by +31.05% due to unreserved on-demand GPU burst surcharges.',
    primaryFinding: 'PO commitment threshold exceeded by ₹2,95,000 without pre-authorized engineering change order.',
    recommendation: {
      action: 'Route invoice to VP of Engineering for out-of-scope compute sign-off',
      reason: 'Base compute matches contract, but on-demand burst charges lack approved change tickets.',
      confidence: 91.2,
      suggestedWorkflow: 'Engineering PO Variance Approval'
    },
    riskVectors: [
      { name: 'PO Cap Variance', score: 82, weight: 0.45, severity: 'high' },
      { name: 'Amount Deviation', score: 65, weight: 0.35, severity: 'medium' },
      { name: 'Budget Impact', score: 62, weight: 0.20, severity: 'medium' }
    ],
    evidence: [
      {
        id: 'ev-6',
        source: 'PURCHASE_ORDER',
        title: 'Unbudgeted Compute Surcharge',
        value: 'Billed ₹12,45,000 vs PO Cap ₹9,50,000',
        benchmark: 'Contracted PO: ₹9,50,000',
        significance: 'HIGH',
        riskContribution: 45,
        description: 'Invoice includes ₹2,95,000 in unreserved H100 GPU compute hours not authorized in the base PO.'
      }
    ],
    aiReasoning: {
      finding: 'NexGen Cloud billed for unauthorized cluster scaling during LLM benchmark run.',
      evidenceSummary: 'Base contract is legitimate, but burst compute surcharge lacks Jira change ticket.',
      interpretation: 'Operational workload spiked beyond budgeted capacity without procurement sign-off.',
      recommendationRationale: 'Reconcile burst hours with engineering telemetry before authorizing payment.'
    },
    timeline: [
      { step: 'DETECTED', label: 'PO Variance Trigger', timestamp: '2026-09-06 14:15:10', status: 'completed', note: 'PO variance +31.05% detected' },
      { step: 'INGESTING', label: 'Cloud PO Checked', timestamp: '2026-09-06 14:15:12', status: 'completed', note: 'Matched PO-2026-9110' },
      { step: 'AI_ANALYSIS', label: 'Forensic Scoring', timestamp: '2026-09-06 14:15:15', status: 'completed', note: 'Scored 68/100 (High Risk)' },
      { step: 'RECOMMENDATION', label: 'Approval Escalated', timestamp: '2026-09-06 14:15:20', status: 'completed', note: 'Routed to Priya Narayanan' },
      { step: 'HUMAN_REVIEW', label: 'VP Engineering Sign-off', timestamp: 'Pending', status: 'current', note: 'Awaiting cloud audit log validation' },
      { step: 'RESOLUTION', label: 'Settlement', timestamp: 'Upcoming', status: 'upcoming', note: 'Disbursement pending' }
    ]
  },
  {
    id: 'inv-27890',
    investigationId: 'AI-INV-2026-085',
    entityName: 'Quantum Logistics Global',
    entityType: 'INVOICE',
    invoiceNumber: 'INV-27890',
    vendorCode: 'VEND-0067',
    amount: 684000,
    riskScore: 72,
    severity: 'high',
    status: 'ON_HOLD',
    createdAt: '2026-09-04 11:42:00 IST',
    updatedAt: '2026-09-04 11:42:15 IST',
    leadInvestigator: 'FIN-SHIELD Qwen-Forensic Engine v4.2',
    summary: 'Remittance bank routing modified to an account in a foreign clearing jurisdiction without 2FA biometric authentication.',
    primaryFinding: 'High risk banking destination change on freight invoice.',
    recommendation: {
      action: 'Hold payment and verify IFSC/SWIFT code directly with vendor treasury',
      reason: 'High correlation with invoice diversion fraud.',
      confidence: 96.0,
      suggestedWorkflow: 'EnterPro Security Hold'
    },
    riskVectors: [
      { name: 'Banking Routing Volatility', score: 94, weight: 0.60, severity: 'critical' },
      { name: 'Amount Deviation', score: 55, weight: 0.40, severity: 'medium' }
    ],
    evidence: [
      {
        id: 'ev-7',
        source: 'VENDOR',
        title: 'International Clearing IFSC Alteration',
        value: 'IFSC: SBIN0000412 (Changed without 2FA)',
        benchmark: 'Historical Domestic Account',
        significance: 'CRITICAL',
        riskContribution: 60,
        description: 'Remittance instructions modified to offshore transit desk.'
      }
    ],
    aiReasoning: {
      finding: 'Sudden change in remittance bank coordinates.',
      evidenceSummary: 'Routing updated without multi-factor token.',
      interpretation: 'Potential business email compromise or unauthorized portal modification.',
      recommendationRationale: 'Hold payment until phone verification with corporate finance officer.'
    },
    timeline: [
      { step: 'DETECTED', label: 'Banking Modification Flag', timestamp: '2026-09-04 11:42:00', status: 'completed', note: 'IFSC modification detected' },
      { step: 'INGESTING', label: 'Vendor History Pulled', timestamp: '2026-09-04 11:42:05', status: 'completed', note: 'Historical bank records verified' },
      { step: 'AI_ANALYSIS', label: 'Risk Assessment', timestamp: '2026-09-04 11:42:10', status: 'completed', note: 'Scored 72/100 (High Risk)' },
      { step: 'RECOMMENDATION', label: 'Hold Triggered', timestamp: '2026-09-04 11:42:15', status: 'completed', note: 'Disbursement locked' },
      { step: 'HUMAN_REVIEW', label: 'Treasury Call Verification', timestamp: 'Pending', status: 'current', note: 'Awaiting call with vendor CFO' },
      { step: 'RESOLUTION', label: 'Closure', timestamp: 'Upcoming', status: 'upcoming', note: 'Hold pending' }
    ]
  }
]

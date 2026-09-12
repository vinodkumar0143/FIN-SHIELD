export interface ReportItem {
  id: string
  title: string
  category: 'Financial Summary' | 'Risk Report' | 'Vendor Risk Report' | 'Budget Report' | 'Anomaly Report' | 'Investigation Report'
  reportingPeriod: string
  generatedAt: string
  generatedBy: string
  status: 'READY' | 'GENERATING'
  fileSize: string
  executiveSummary: string
  kpis: { label: string; value: string; delta?: string }[]
  recommendations: string[]
}

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-sep-risk',
    title: 'September 2026 Executive Financial Risk & Anomaly Audit',
    category: 'Risk Report',
    reportingPeriod: 'Month-to-Date (September 2026)',
    generatedAt: '2026-09-08 10:00 IST',
    generatedBy: 'Dr. Evelyn Vance, Head of Risk',
    status: 'READY',
    fileSize: '3.4 MB',
    executiveSummary: 'Forensic evaluation across 328 invoices and 82 banking disbursement rails isolated 4 critical multi-vector anomalies totaling ₹29.5L at risk. EnterPro automated escrow holds successfully preserved ₹11.66L in capital from unauthorized account redirection.',
    kpis: [
      { label: 'Composite Risk Index', value: '74/100', delta: '+13.2% vs Aug' },
      { label: 'Preserved Capital', value: '₹11,66,000', delta: '100% Locked' },
      { label: 'Critical Anomalies', value: '4 Detected', delta: 'Z-score > 3.0' },
      { label: 'Budget Breaches', value: '1 Active (Ops)', delta: '+18.5% Overrun' }
    ],
    recommendations: [
      'Maintain payment hold #WF-9042 on INV-28491 until verbal confirmation of bank routing change is secured.',
      'Enforce mandatory biometric 2FA for any vendor bank IFSC update across the supplier portal.',
      'Initiate mid-quarter budget re-allocation from Procurement to Operations to resolve the ₹1.70L deficit.'
    ]
  },
  {
    id: 'rep-q3-budget',
    title: 'Q3 FY2026 Departmental Budget & Variance Performance',
    category: 'Budget Report',
    reportingPeriod: 'Q3 FY2026',
    generatedAt: '2026-09-06 18:30 IST',
    generatedBy: 'Financial Planning & Analysis',
    status: 'READY',
    fileSize: '4.1 MB',
    executiveSummary: 'Total quarterly capital burn has reached 94.6% with 22 days remaining in Q3. The Operations Division has entered an Overrun Hazard status at 103.8% utilization.',
    kpis: [
      { label: 'Total Allocated Cap', value: '₹1.98Cr' },
      { label: 'Disbursed To Date', value: '₹1.72Cr' },
      { label: 'Remaining Liquidity', value: '₹26.0L' }
    ],
    recommendations: [
      'Cap discretionary travel expenses in Q3.',
      'Freeze non-critical software license onboarding.'
    ]
  },
  {
    id: 'rep-vendor-intel',
    title: 'Vendor Counterparty Risk & Banking Surveillance Brief',
    category: 'Vendor Risk Report',
    reportingPeriod: 'Trailing 90 Days',
    generatedAt: '2026-09-04 09:15 IST',
    generatedBy: 'Vendor Governance Desk',
    status: 'READY',
    fileSize: '2.8 MB',
    executiveSummary: 'Continuous monitoring of 28 active counterparties flagged 2 vendors for suspicious remittance modification patterns and spending acceleration.',
    kpis: [
      { label: 'Vendors on Watchlist', value: '2 Counterparties' },
      { label: 'Banking Changes Detected', value: '2 in 14 Days' }
    ],
    recommendations: [
      'Require physical or video KYC for ABC Supplies Pvt Ltd and Quantum Logistics Global.'
    ]
  }
]

export interface AlertRecord {
  id: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  description: string
  entity: string
  timestamp: string
  status: 'UNREAD' | 'READ' | 'RESOLVED'
  route: string
}

export const MOCK_ALERTS: AlertRecord[] = [
  {
    id: 'alt-1',
    severity: 'CRITICAL',
    title: 'EnterPro Escrow Hold Placed on INV-28491',
    description: 'Amount Z-score +3.42 and bank IFSC modification detected on ABC Supplies Pvt Ltd.',
    entity: 'INV-28491 (₹4,82,000)',
    timestamp: '2026-09-08 09:14',
    status: 'UNREAD',
    route: '/investigations/inv-28491'
  },
  {
    id: 'alt-2',
    severity: 'CRITICAL',
    title: 'Operations Budget Overrun Deficit Triggered',
    description: 'Q3 budget consumption reached 103.8% (₹1,70,000 deficit).',
    entity: 'DEPT-OPS-01',
    timestamp: '2026-09-08 09:15',
    status: 'UNREAD',
    route: '/budgets/bgt-ops'
  },
  {
    id: 'alt-3',
    severity: 'WARNING',
    title: 'Unverified Offshore Remittance Routing',
    description: 'Quantum Logistics Global IFSC modified without biometric authentication.',
    entity: 'INV-27890 (₹6,84,000)',
    timestamp: '2026-09-04 11:42',
    status: 'READ',
    route: '/holds'
  },
  {
    id: 'alt-4',
    severity: 'INFO',
    title: 'Weekly Forensic Model Recalibration Complete',
    description: '90-day baseline distributions updated for 28 onboarded vendors.',
    entity: 'FIN-SHIELD Engine',
    timestamp: '2026-09-01 00:00',
    status: 'RESOLVED',
    route: '/analytics'
  }
]

export interface AuditRecord {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  entity: string
  previousState: string
  newState: string
  source: string
  workflowRef: string
  status: 'COMMITTED' | 'VERIFIED'
}

export const MOCK_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-08 09:14:27 IST',
    user: 'EnterPro Autonomous Service',
    role: 'SYSTEM',
    action: 'PAYMENT_HOLD_APPLIED',
    entity: 'Invoice INV-28491 (ABC Supplies)',
    previousState: 'STATUS: PENDING, PAYMENT: UNPAID',
    newState: 'STATUS: CRITICAL, PAYMENT: HELD (#WF-9042)',
    source: 'EnterPro Workflow Gateway',
    workflowRef: 'WF-9042',
    status: 'COMMITTED'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-08 09:14:25 IST',
    user: 'FIN-SHIELD Qwen Engine',
    role: 'AI_FORENSIC',
    action: 'ANOMALY_RECORDED',
    entity: 'Investigation AI-INV-2026-089',
    previousState: 'RISK_SCORE: NULL',
    newState: 'RISK_SCORE: 87/100 (CRITICAL)',
    source: 'Multi-Source Correlation Engine',
    workflowRef: 'WF-9042',
    status: 'VERIFIED'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-06 14:15:20 IST',
    user: 'Priya Narayanan',
    role: 'VP_ENGINEERING',
    action: 'PO_VARIANCE_REVIEW_REQUESTED',
    entity: 'Invoice INV-29014 (NexGen Cloud)',
    previousState: 'STATUS: PENDING',
    newState: 'STATUS: HIGH_RISK (BURST SURCHARGE)',
    source: 'EnterPro Orchestrator',
    workflowRef: 'WF-9110',
    status: 'COMMITTED'
  },
  {
    id: 'aud-004',
    timestamp: '2026-08-31 16:30:10 IST',
    user: 'Rajesh Sharma',
    role: 'DIRECTOR_OPERATIONS',
    action: 'DISBURSEMENT_AUTHORIZED',
    entity: 'Invoice INV-28412 (ABC Supplies)',
    previousState: 'STATUS: APPROVED',
    newState: 'STATUS: PAID, SETTLED RTGS',
    source: 'HDFC Banking Rail',
    workflowRef: 'WF-8891',
    status: 'VERIFIED'
  }
]

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  content: string
  citations?: { label: string; route: string }[]
  metrics?: { label: string; value: string }[]
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    timestamp: '11:15 AM',
    content: 'Greetings, Dr. Vance. I am the FIN-SHIELD Autonomous Financial Risk Assistant. I correlate invoice documents, counterparty banking baselines, purchase order commitments, and departmental budgets to provide actionable financial risk explanations. How may I assist your review today?',
    citations: [
      { label: 'Hero Case: INV-28491', route: '/investigations/inv-28491' },
      { label: 'Vendor Matrix', route: '/vendors' }
    ]
  }
]

export const SUGGESTED_PROMPTS = [
  'Why is INV-28491 risky?',
  'Which vendors are high risk?',
  'Show critical invoices',
  'Which budgets are close to being exceeded?',
  'Which payments are on hold?'
]

export const CANNED_RESPONSES: Record<string, { content: string; citations?: { label: string; route: string }[]; metrics?: { label: string; value: string }[] }> = {
  'Why is INV-28491 risky?': {
    content: 'Invoice INV-28491 from ABC Supplies Pvt Ltd (₹4,82,000) scored 87/100 (CRITICAL RISK) due to 4 correlated anomalies: (1) The amount is +311.9% higher than the vendor 90-day baseline (+3.42 Z-score); (2) Remittance bank IFSC was updated to HDFC0000128 just 4 days prior to submission without biometric 2FA; (3) It exhibits a 96.4% soft duplicate match with INV-28412 (₹4,78,000) settled 8 days prior; and (4) It causes an unapproved +18.5% deficit in the Q3 Operations budget. An automated EnterPro hold (#WF-9042) is currently in effect.',
    citations: [
      { label: 'Investigation Dossier', route: '/investigations/inv-28491' },
      { label: 'Invoice Record', route: '/invoices/inv-28491' },
      { label: 'Vendor Profile', route: '/vendors/ven-abc-001' }
    ],
    metrics: [
      { label: 'Risk Score', value: '87/100' },
      { label: 'Amount Z-Score', value: '+3.42' },
      { label: 'Duplicate Overlap', value: '96.4%' },
      { label: 'Preserved Capital', value: '₹4,82,000' }
    ]
  },
  'Which vendors are high risk?': {
    content: 'Currently, 3 vendors have elevated risk scores: (1) ABC Supplies Pvt Ltd (87/100, Critical) due to anomalous billing acceleration and unverified bank routing; (2) Quantum Logistics Global (72/100, High) due to offshore remittance modifications without 2FA; and (3) NexGen Cloud Infrastructure (68/100, High) due to out-of-scope GPU burst charges exceeding PO commitments by +31.05%.',
    citations: [
      { label: 'ABC Supplies Dossier', route: '/vendors/ven-abc-001' },
      { label: 'Vendor Intelligence Matrix', route: '/vendors' }
    ],
    metrics: [
      { label: 'High-Risk Counterparties', value: '3' },
      { label: 'Aggregate Exposure', value: '₹38.39L' }
    ]
  },
  'Show critical invoices': {
    content: 'Found 2 invoices in CRITICAL and HIGH risk tiers: INV-28491 (₹4,82,000, 87/100, EnterPro Hold Active) and INV-25109 (₹1,42,000, 82/100, Rejected duplicate travel expense). Additionally, INV-27890 (₹6,84,000, 72/100) is held for IFSC verification.',
    citations: [
      { label: 'View All Invoices', route: '/invoices' },
      { label: 'Open Payment Holds', route: '/holds' }
    ],
    metrics: [
      { label: 'Critical Invoices', value: '2' },
      { label: 'Active Holds', value: '₹12.42L' }
    ]
  },
  'Which budgets are close to being exceeded?': {
    content: 'The Operations Division has an active Overrun Hazard at 103.8% utilization (₹1,70,000 deficit if INV-28491 is settled). The Technology Division is also nearing its quarterly ceiling at 95.8% utilization (₹2,50,000 remaining) due to unbudgeted AI compute scaling.',
    citations: [
      { label: 'Operations Budget', route: '/budgets/bgt-ops' },
      { label: 'Technology Budget', route: '/budgets/bgt-tech' }
    ],
    metrics: [
      { label: 'Operations Deficit', value: '-₹1.70L' },
      { label: 'Technology Available', value: '₹2.50L' }
    ]
  },
  'Which payments are on hold?': {
    content: 'There are currently 2 active EnterPro escrow payment holds locking a total of ₹11,66,000: (1) INV-28491 (₹4,82,000) under hold #WF-9042 for multi-vector anomaly review; and (2) INV-27890 (₹6,84,000) under security hold for unverified banking destination alteration.',
    citations: [
      { label: 'Payment Holds Center', route: '/holds' }
    ],
    metrics: [
      { label: 'Locked in Escrow', value: '₹11.66L' },
      { label: 'Active Holds', value: '2' }
    ]
  }
}

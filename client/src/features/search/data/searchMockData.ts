export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  type: 'INVOICE' | 'VENDOR' | 'TRANSACTION' | 'BUDGET' | 'INVESTIGATION'
  amount?: number
  riskScore?: number
  severity?: 'critical' | 'high' | 'medium' | 'low'
  route: string
  badgeText: string
  highlights: string[]
}

export const SUGGESTED_SEARCHES = [
  'Show invoices above ₹5 lakh with high risk',
  'Find unusual vendor spending',
  'Which payments are currently on hold?',
  'Show transactions that exceeded budget'
]

export const RECENT_SEARCHES = [
  'INV-28491 ABC Supplies',
  'Operations budget deficit',
  'Held payments in EnterPro',
  'Vendors with altered routing'
]

export const SEARCH_RESULTS_BY_QUERY: Record<string, SearchResultItem[]> = {
  'Show invoices above ₹5 lakh with high risk': [
    {
      id: 'inv-29014',
      title: 'INV-29014 — NexGen Cloud Infrastructure',
      subtitle: 'Cloud computing burst surcharges (+31.05% above PO commitment)',
      type: 'INVOICE',
      amount: 1245000,
      riskScore: 68,
      severity: 'high',
      route: '/invoices/inv-29014',
      badgeText: 'PO VARIANCE +31%',
      highlights: ['Gross Amount: ₹12,45,000', 'Department: Technology', 'Status: High Risk']
    },
    {
      id: 'inv-27890',
      title: 'INV-27890 — Quantum Logistics Global',
      subtitle: 'International customs freight invoice with unverified offshore routing alteration',
      type: 'INVOICE',
      amount: 684000,
      riskScore: 72,
      severity: 'high',
      route: '/invoices/inv-27890',
      badgeText: 'IFSC CHANGED',
      highlights: ['Gross Amount: ₹6,84,000', 'Department: Procurement', 'Status: On Hold']
    },
    {
      id: 'inv-25910',
      title: 'INV-25910 — Stratosphere Media Corp',
      subtitle: 'Digital marketing agency retainer with fee inflation anomaly',
      type: 'INVOICE',
      amount: 540000,
      riskScore: 61,
      severity: 'high',
      route: '/invoices/inv-25910',
      badgeText: 'FEE INFLATION',
      highlights: ['Gross Amount: ₹5,40,000', 'Department: Marketing', 'Status: Flagged']
    }
  ],
  'Find unusual vendor spending': [
    {
      id: 'ven-abc-001',
      title: 'ABC Supplies Pvt Ltd (VEND-0042)',
      subtitle: 'Disproportionate +311.9% monthly expenditure surge and recent bank modification',
      type: 'VENDOR',
      amount: 960000,
      riskScore: 87,
      severity: 'critical',
      route: '/vendors/ven-abc-001',
      badgeText: 'SPEND SURGE +311%',
      highlights: ['Active Invoices: 2', 'Status: Watchlist', 'Remittance: Altered 4d ago']
    },
    {
      id: 'ven-nex-008',
      title: 'NexGen Cloud Infrastructure (VEND-0109)',
      subtitle: 'Burst compute usage out of scope of master services agreement',
      type: 'VENDOR',
      amount: 2195000,
      riskScore: 68,
      severity: 'high',
      route: '/vendors/ven-nex-008',
      badgeText: 'BURST EXPENSES',
      highlights: ['Active Invoices: 3', 'Monthly Spend: ₹12.45L', 'Trend: Increasing']
    }
  ],
  'Which payments are currently on hold?': [
    {
      id: 'inv-28491',
      title: 'INV-28491 — ABC Supplies Pvt Ltd',
      subtitle: 'EnterPro Hold #WF-9042 locked due to 87/100 risk score, altered bank routing & duplicate suspicion',
      type: 'INVOICE',
      amount: 482000,
      riskScore: 87,
      severity: 'critical',
      route: '/invoices/inv-28491',
      badgeText: 'HOLD #WF-9042',
      highlights: ['Amount Z=+3.42', 'Duplicate of INV-28412', 'Escrow Locked']
    },
    {
      id: 'inv-27890',
      title: 'INV-27890 — Quantum Logistics Global',
      subtitle: 'EnterPro Security Hold active pending phone verification with vendor CFO',
      type: 'INVOICE',
      amount: 684000,
      riskScore: 72,
      severity: 'high',
      route: '/invoices/inv-27890',
      badgeText: 'SECURITY HOLD',
      highlights: ['Offshore Clearing IFSC', 'Amount: ₹6,84,000', 'Escrow Locked']
    }
  ],
  'Show transactions that exceeded budget': [
    {
      id: 'bgt-ops',
      title: 'Operations Division (DEPT-OPS-01)',
      subtitle: 'Q3 Budget Deficit: -₹1,70,000 (103.8% utilization) driven by invoice INV-28491',
      type: 'BUDGET',
      amount: 4500000,
      riskScore: 82,
      severity: 'critical',
      route: '/budgets/bgt-ops',
      badgeText: 'DEFICIT -₹1.70L',
      highlights: ['Allocated: ₹45,00,000', 'Spent: ₹39,50,000', 'Committed: ₹7,20,000']
    },
    {
      id: 'bgt-tech',
      title: 'Technology Division (DEPT-ENG-02)',
      subtitle: 'Q3 Budget Consumption: 95.8% utilization nearing quarterly cap',
      type: 'BUDGET',
      amount: 6000000,
      riskScore: 65,
      severity: 'high',
      route: '/budgets/bgt-tech',
      badgeText: '95.8% UTILIZED',
      highlights: ['Allocated: ₹60,00,000', 'Available: ₹2,50,000', 'Burst Hazard']
    }
  ]
}

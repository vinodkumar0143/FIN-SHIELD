export interface BudgetRecord {
  id: string
  department: string
  code: string
  fiscalQuarter: string
  allocated: number
  spent: number
  committed: number
  remaining: number
  utilizationPct: number
  status: 'normal' | 'warning' | 'critical'
  overrunHazard: boolean
  manager: string
  monthlyTrend: { month: string; spent: number; budgetLimit: number }[]
  recentInvoices: { id: string; invoiceNumber: string; vendor: string; amount: number; date: string; flag?: string }[]
  alerts: string[]
}

export const MOCK_BUDGETS: BudgetRecord[] = [
  {
    id: 'bgt-ops',
    department: 'Operations',
    code: 'DEPT-OPS-01',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 4500000,
    spent: 3950000,
    committed: 720000,
    remaining: -170000,
    utilizationPct: 103.8,
    status: 'critical',
    overrunHazard: true,
    manager: 'Rajesh Sharma, Director of Operations',
    monthlyTrend: [
      { month: 'Jul', spent: 1100000, budgetLimit: 1500000 },
      { month: 'Aug', spent: 1350000, budgetLimit: 1500000 },
      { month: 'Sep', spent: 1500000, budgetLimit: 1500000 },
    ],
    recentInvoices: [
      { id: 'inv-28491', invoiceNumber: 'INV-28491', vendor: 'ABC Supplies Pvt Ltd', amount: 482000, date: '2026-09-08', flag: 'CRITICAL OVERRUN +18.5%' },
      { id: 'inv-28412', invoiceNumber: 'INV-28412', vendor: 'ABC Supplies Pvt Ltd', amount: 478000, date: '2026-08-31' },
      { id: 'inv-26992', invoiceNumber: 'INV-26992', vendor: 'Apex Advisory Services', amount: 320000, date: '2026-09-02' },
    ],
    alerts: [
      'Projected Q3 overrun of ₹1,70,000 (+3.8%) if pending invoice INV-28491 is settled',
      'Operations procurement velocity accelerated by 42% in past 14 days'
    ]
  },
  {
    id: 'bgt-tech',
    department: 'Technology',
    code: 'DEPT-ENG-02',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 6000000,
    spent: 5100000,
    committed: 650000,
    remaining: 250000,
    utilizationPct: 95.8,
    status: 'warning',
    overrunHazard: true,
    manager: 'Priya Narayanan, VP Engineering',
    monthlyTrend: [
      { month: 'Jul', spent: 1550000, budgetLimit: 2000000 },
      { month: 'Aug', spent: 1650000, budgetLimit: 2000000 },
      { month: 'Sep', spent: 1900000, budgetLimit: 2000000 },
    ],
    recentInvoices: [
      { id: 'inv-29014', invoiceNumber: 'INV-29014', vendor: 'NexGen Cloud Infrastructure', amount: 1245000, date: '2026-09-06', flag: 'PO VARIANCE +31%' },
      { id: 'inv-26440', invoiceNumber: 'INV-26440', vendor: 'Infinity Workspace Tech', amount: 195000, date: '2026-08-28' },
    ],
    alerts: [
      'Cloud compute on-demand burst charges increased consumption by 18% above forecast'
    ]
  },
  {
    id: 'bgt-mkt',
    department: 'Marketing',
    code: 'DEPT-MKT-03',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 3500000,
    spent: 3100000,
    committed: 250000,
    remaining: 150000,
    utilizationPct: 95.7,
    status: 'warning',
    overrunHazard: false,
    manager: 'Arjun Mehta, CMO',
    monthlyTrend: [
      { month: 'Jul', spent: 950000, budgetLimit: 1166666 },
      { month: 'Aug', spent: 1050000, budgetLimit: 1166666 },
      { month: 'Sep', spent: 1100000, budgetLimit: 1166666 },
    ],
    recentInvoices: [
      { id: 'inv-25910', invoiceNumber: 'INV-25910', vendor: 'Stratosphere Media Corp', amount: 540000, date: '2026-08-25', flag: 'FEE INFLATION' },
    ],
    alerts: [
      'Agency retainer line item requires Q4 contract renegotiation'
    ]
  },
  {
    id: 'bgt-proc',
    department: 'Procurement',
    code: 'DEPT-PRC-04',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 2800000,
    spent: 2150000,
    committed: 300000,
    remaining: 350000,
    utilizationPct: 87.5,
    status: 'normal',
    overrunHazard: false,
    manager: 'Sunita Rao, Head of Global Procurement',
    monthlyTrend: [
      { month: 'Jul', spent: 700000, budgetLimit: 933333 },
      { month: 'Aug', spent: 720000, budgetLimit: 933333 },
      { month: 'Sep', spent: 730000, budgetLimit: 933333 },
    ],
    recentInvoices: [
      { id: 'inv-27890', invoiceNumber: 'INV-27890', vendor: 'Quantum Logistics Global', amount: 684000, date: '2026-09-04', flag: 'BANK ROUTING HELD' }
    ],
    alerts: []
  },
  {
    id: 'bgt-trv',
    department: 'Travel',
    code: 'DEPT-TRV-05',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 1200000,
    spent: 850000,
    committed: 100000,
    remaining: 250000,
    utilizationPct: 79.2,
    status: 'normal',
    overrunHazard: false,
    manager: 'Vikram Bose, Corporate Services Director',
    monthlyTrend: [
      { month: 'Jul', spent: 250000, budgetLimit: 400000 },
      { month: 'Aug', spent: 310000, budgetLimit: 400000 },
      { month: 'Sep', spent: 290000, budgetLimit: 400000 },
    ],
    recentInvoices: [
      { id: 'inv-25109', invoiceNumber: 'INV-25109', vendor: 'Velocity Travel Solutions', amount: 142000, date: '2026-08-20', flag: 'REJECTED' }
    ],
    alerts: []
  },
  {
    id: 'bgt-hr',
    department: 'HR & People',
    code: 'DEPT-HR-06',
    fiscalQuarter: 'Q3 FY2026',
    allocated: 1800000,
    spent: 1220000,
    committed: 150000,
    remaining: 430000,
    utilizationPct: 76.1,
    status: 'normal',
    overrunHazard: false,
    manager: 'Deepa Krishnan, VP People',
    monthlyTrend: [
      { month: 'Jul', spent: 390000, budgetLimit: 600000 },
      { month: 'Aug', spent: 410000, budgetLimit: 600000 },
      { month: 'Sep', spent: 420000, budgetLimit: 600000 },
    ],
    recentInvoices: [],
    alerts: []
  }
]

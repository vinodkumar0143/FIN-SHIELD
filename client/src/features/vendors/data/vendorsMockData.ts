import { type RiskLevel } from '@/lib/utils'

export interface VendorRecord {
  id: string
  name: string
  code: string
  category: string
  contactEmail: string
  gstin: string
  bankName: string
  bankAccount: string
  bankIfsc: string
  bankRoutingChangedRecently: boolean
  riskScore: number
  riskLevel: RiskLevel
  totalExposure: number
  activeInvoices: number
  totalTransactions: number
  trend: 'increasing' | 'stable' | 'decreasing'
  status: 'ACTIVE' | 'WATCHLIST' | 'RESTRICTED'
  establishedYear: number
  monthlySpending: { month: string; amount: number; avgBenchmark: number }[]
  anomaliesSummary: string[]
}

export const MOCK_VENDORS: VendorRecord[] = [
  {
    id: 'ven-abc-001',
    name: 'ABC Supplies Pvt Ltd',
    code: 'VEND-0042',
    category: 'Industrial Supplies',
    contactEmail: 'accounts@abcsupplies.co.in',
    gstin: '27AABCA1234F1Z8',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '••••••••4892',
    bankIfsc: 'HDFC0000128',
    bankRoutingChangedRecently: true,
    riskScore: 87,
    riskLevel: 'critical',
    totalExposure: 960000,
    activeInvoices: 2,
    totalTransactions: 14,
    trend: 'increasing',
    status: 'WATCHLIST',
    establishedYear: 2021,
    monthlySpending: [
      { month: 'Apr', amount: 115000, avgBenchmark: 120000 },
      { month: 'May', amount: 122000, avgBenchmark: 120000 },
      { month: 'Jun', amount: 118000, avgBenchmark: 120000 },
      { month: 'Jul', amount: 125000, avgBenchmark: 120000 },
      { month: 'Aug', amount: 478000, avgBenchmark: 120000 },
      { month: 'Sep', amount: 482000, avgBenchmark: 120000 },
    ],
    anomaliesSummary: [
      'Unprecedented 311.9% spending surge in August-September',
      'Remittance IFSC altered 4 days prior to INV-28491',
      'Soft duplicate invoice pattern detected'
    ]
  },
  {
    id: 'ven-nex-008',
    name: 'NexGen Cloud Infrastructure',
    code: 'VEND-0109',
    category: 'Cloud Services',
    contactEmail: 'billing@nexgencloud.io',
    gstin: '29AABCN9928P1ZB',
    bankName: 'Axis Bank',
    bankAccount: '••••••••9942',
    bankIfsc: 'UTIB0000219',
    bankRoutingChangedRecently: false,
    riskScore: 68,
    riskLevel: 'high',
    totalExposure: 2195000,
    activeInvoices: 3,
    totalTransactions: 28,
    trend: 'increasing',
    status: 'ACTIVE',
    establishedYear: 2019,
    monthlySpending: [
      { month: 'Apr', amount: 720000, avgBenchmark: 750000 },
      { month: 'May', amount: 740000, avgBenchmark: 750000 },
      { month: 'Jun', amount: 750000, avgBenchmark: 750000 },
      { month: 'Jul', amount: 810000, avgBenchmark: 750000 },
      { month: 'Aug', amount: 950000, avgBenchmark: 750000 },
      { month: 'Sep', amount: 1245000, avgBenchmark: 750000 },
    ],
    anomaliesSummary: [
      'Burst compute surcharge +31.05% above purchase order commitments'
    ]
  },
  {
    id: 'ven-qnt-014',
    name: 'Quantum Logistics Global',
    code: 'VEND-0067',
    category: 'Freight & Logistics',
    contactEmail: 'customs@quantumlogistics.com',
    gstin: '33AABCQ4410K1ZC',
    bankName: 'State Bank of India',
    bankAccount: '••••••••7621',
    bankIfsc: 'SBIN0000412',
    bankRoutingChangedRecently: true,
    riskScore: 72,
    riskLevel: 'high',
    totalExposure: 684000,
    activeInvoices: 1,
    totalTransactions: 8,
    trend: 'increasing',
    status: 'WATCHLIST',
    establishedYear: 2023,
    monthlySpending: [
      { month: 'Apr', amount: 150000, avgBenchmark: 200000 },
      { month: 'May', amount: 180000, avgBenchmark: 200000 },
      { month: 'Jun', amount: 210000, avgBenchmark: 200000 },
      { month: 'Jul', amount: 190000, avgBenchmark: 200000 },
      { month: 'Aug', amount: 220000, avgBenchmark: 200000 },
      { month: 'Sep', amount: 684000, avgBenchmark: 200000 },
    ],
    anomaliesSummary: [
      'Remittance IFSC changed without biometric 2FA',
      'Foreign jurisdiction clearance discrepancy'
    ]
  },
  {
    id: 'ven-apex-003',
    name: 'Apex Advisory Services',
    code: 'VEND-0023',
    category: 'Consulting',
    contactEmail: 'invoices@apexadvisory.com',
    gstin: '07AABCA3310M1ZR',
    bankName: 'Kotak Mahindra Bank',
    bankAccount: '••••••••3318',
    bankIfsc: 'KKBK0000109',
    bankRoutingChangedRecently: false,
    riskScore: 48,
    riskLevel: 'medium',
    totalExposure: 320000,
    activeInvoices: 1,
    totalTransactions: 19,
    trend: 'stable',
    status: 'ACTIVE',
    establishedYear: 2018,
    monthlySpending: [
      { month: 'Apr', amount: 320000, avgBenchmark: 320000 },
      { month: 'May', amount: 320000, avgBenchmark: 320000 },
      { month: 'Jun', amount: 320000, avgBenchmark: 320000 },
      { month: 'Jul', amount: 320000, avgBenchmark: 320000 },
      { month: 'Aug', amount: 320000, avgBenchmark: 320000 },
      { month: 'Sep', amount: 320000, avgBenchmark: 320000 },
    ],
    anomaliesSummary: [
      'Milestone sign-off pending L2 digital signature'
    ]
  },
  {
    id: 'ven-inf-022',
    name: 'Infinity Workspace Tech',
    code: 'VEND-0089',
    category: 'Hardware & IT',
    contactEmail: 'enterprise@infinitytech.in',
    gstin: '24AABCI5512L1ZP',
    bankName: 'Axis Bank',
    bankAccount: '••••••••5519',
    bankIfsc: 'UTIB0000032',
    bankRoutingChangedRecently: false,
    riskScore: 16,
    riskLevel: 'low',
    totalExposure: 195000,
    activeInvoices: 1,
    totalTransactions: 42,
    trend: 'decreasing',
    status: 'ACTIVE',
    establishedYear: 2016,
    monthlySpending: [
      { month: 'Apr', amount: 280000, avgBenchmark: 250000 },
      { month: 'May', amount: 260000, avgBenchmark: 250000 },
      { month: 'Jun', amount: 240000, avgBenchmark: 250000 },
      { month: 'Jul', amount: 230000, avgBenchmark: 250000 },
      { month: 'Aug', amount: 210000, avgBenchmark: 250000 },
      { month: 'Sep', amount: 195000, avgBenchmark: 250000 },
    ],
    anomaliesSummary: []
  },
  {
    id: 'ven-str-005',
    name: 'Stratosphere Media Corp',
    code: 'VEND-0051',
    category: 'Marketing & PR',
    contactEmail: 'billing@stratospheremedia.com',
    gstin: '27AABCS8819J1ZQ',
    bankName: 'HDFC Bank',
    bankAccount: '••••••••8120',
    bankIfsc: 'HDFC0000018',
    bankRoutingChangedRecently: false,
    riskScore: 61,
    riskLevel: 'high',
    totalExposure: 540000,
    activeInvoices: 1,
    totalTransactions: 11,
    trend: 'increasing',
    status: 'WATCHLIST',
    establishedYear: 2022,
    monthlySpending: [
      { month: 'Apr', amount: 400000, avgBenchmark: 420000 },
      { month: 'May', amount: 410000, avgBenchmark: 420000 },
      { month: 'Jun', amount: 430000, avgBenchmark: 420000 },
      { month: 'Jul', amount: 420000, avgBenchmark: 420000 },
      { month: 'Aug', amount: 450000, avgBenchmark: 420000 },
      { month: 'Sep', amount: 540000, avgBenchmark: 420000 },
    ],
    anomaliesSummary: [
      'Line item inflation on ad performance management fee'
    ]
  }
]

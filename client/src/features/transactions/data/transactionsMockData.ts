import { type RiskLevel } from '@/lib/utils'

export interface TransactionRecord {
  id: string
  transactionRef: string
  invoiceNumber?: string
  poNumber?: string
  vendorId: string
  vendorName: string
  amount: number
  currency: string
  type: 'ACH' | 'WIRE' | 'RTGS' | 'NEFT' | 'CORPORATE_CARD' | 'ESCROW_HOLD'
  status: 'SETTLED' | 'PENDING' | 'HELD' | 'FLAGGED' | 'REVERSED'
  riskScore: number
  riskLevel: RiskLevel
  accountNumber: string
  accountName: string
  category: string
  department: string
  timestamp: string
  anomalies: string[]
  evidenceCount: number
}

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-9042',
    transactionRef: 'TX-2026-9042',
    invoiceNumber: 'INV-28491',
    poNumber: 'PO-2026-9042',
    vendorId: 'ven-abc-001',
    vendorName: 'ABC Supplies Pvt Ltd',
    amount: 482000,
    currency: 'INR',
    type: 'ESCROW_HOLD',
    status: 'HELD',
    riskScore: 87,
    riskLevel: 'critical',
    accountNumber: '••••••••4892',
    accountName: 'HDFC Corporate Outflow Acct 1',
    category: 'Industrial Equipment',
    department: 'Operations',
    timestamp: '2026-09-08 09:14:27',
    anomalies: [
      'EnterPro settlement hold locked: high anomaly probability',
      'Unverified beneficiary bank routing',
      'Amount Z-score: +3.42'
    ],
    evidenceCount: 5
  },
  {
    id: 'tx-8891',
    transactionRef: 'TX-2026-8891',
    invoiceNumber: 'INV-28412',
    poNumber: 'PO-2026-8891',
    vendorId: 'ven-abc-001',
    vendorName: 'ABC Supplies Pvt Ltd',
    amount: 478000,
    currency: 'INR',
    type: 'RTGS',
    status: 'SETTLED',
    riskScore: 24,
    riskLevel: 'low',
    accountNumber: '••••••••1104',
    accountName: 'HDFC Corporate Outflow Acct 1',
    category: 'Industrial Equipment',
    department: 'Operations',
    timestamp: '2026-08-31 16:30:10',
    anomalies: [],
    evidenceCount: 1
  },
  {
    id: 'tx-9110',
    transactionRef: 'TX-2026-9110',
    invoiceNumber: 'INV-29014',
    poNumber: 'PO-2026-9110',
    vendorId: 'ven-nex-008',
    vendorName: 'NexGen Cloud Infrastructure',
    amount: 1245000,
    currency: 'INR',
    type: 'WIRE',
    status: 'FLAGGED',
    riskScore: 68,
    riskLevel: 'high',
    accountNumber: '••••••••9942',
    accountName: 'Axis Cloud Spend Acct',
    category: 'Cloud Services',
    department: 'Technology',
    timestamp: '2026-09-06 14:15:00',
    anomalies: [
      'PO cap variance +31.05%',
      'Uncontracted burst surcharge'
    ],
    evidenceCount: 3
  },
  {
    id: 'tx-8974',
    transactionRef: 'TX-2026-8974',
    invoiceNumber: 'INV-27890',
    poNumber: 'PO-2026-8974',
    vendorId: 'ven-qnt-014',
    vendorName: 'Quantum Logistics Global',
    amount: 684000,
    currency: 'INR',
    type: 'NEFT',
    status: 'HELD',
    riskScore: 72,
    riskLevel: 'high',
    accountNumber: '••••••••7621',
    accountName: 'SBI Remittance Acct',
    category: 'Logistics',
    department: 'Procurement',
    timestamp: '2026-09-04 11:42:00',
    anomalies: [
      'Routing changed without biometric 2FA',
      'Foreign jurisdiction discrepancy'
    ],
    evidenceCount: 3
  },
  {
    id: 'tx-8800',
    transactionRef: 'TX-2026-8800',
    invoiceNumber: 'INV-26992',
    poNumber: 'PO-2026-8800',
    vendorId: 'ven-apex-003',
    vendorName: 'Apex Advisory Services',
    amount: 320000,
    currency: 'INR',
    type: 'NEFT',
    status: 'PENDING',
    riskScore: 48,
    riskLevel: 'medium',
    accountNumber: '••••••••3318',
    accountName: 'Kotak Operating Acct',
    category: 'Consulting',
    department: 'Operations',
    timestamp: '2026-09-02 10:20:15',
    anomalies: ['Pending second-level manager sign-off'],
    evidenceCount: 2
  },
  {
    id: 'tx-8650',
    transactionRef: 'TX-2026-8650',
    invoiceNumber: 'INV-26440',
    poNumber: 'PO-2026-8650',
    vendorId: 'ven-inf-022',
    vendorName: 'Infinity Workspace Tech',
    amount: 195000,
    currency: 'INR',
    type: 'ACH',
    status: 'SETTLED',
    riskScore: 16,
    riskLevel: 'low',
    accountNumber: '••••••••5519',
    accountName: 'Axis Hardware Acct',
    category: 'Hardware',
    department: 'Technology',
    timestamp: '2026-08-28 17:05:40',
    anomalies: [],
    evidenceCount: 1
  }
]

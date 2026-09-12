import { type RiskLevel } from '@/lib/utils'

export interface InvoiceLineItem {
  id: string
  description: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  poMatch: boolean
}

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  vendorId: string
  vendorName: string
  vendorCode: string
  amount: number
  taxAmount: number
  currency: string
  invoiceDate: string
  dueDate: string
  status: 'PENDING' | 'FLAGGED' | 'HIGH_RISK' | 'CRITICAL' | 'APPROVED' | 'ON_HOLD' | 'PAID' | 'REJECTED'
  paymentStatus: 'UNPAID' | 'PROCESSING' | 'PAID' | 'HELD' | 'CANCELLED'
  riskScore: number
  riskLevel: RiskLevel
  department: string
  poNumber?: string
  poAmount?: number
  bankRoutingNumber: string
  bankAccountNumber: string
  bankRoutingChangedRecently: boolean
  isDuplicateRisk: boolean
  duplicateMatchInvoice?: string
  anomalyCount: number
  anomalies: string[]
  lineItems: InvoiceLineItem[]
  notes?: string
}

export const MOCK_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-28491',
    invoiceNumber: 'INV-28491',
    vendorId: 'ven-abc-001',
    vendorName: 'ABC Supplies Pvt Ltd',
    vendorCode: 'VEND-0042',
    amount: 482000,
    taxAmount: 86760,
    currency: 'INR',
    invoiceDate: '2026-09-08',
    dueDate: '2026-09-22',
    status: 'CRITICAL',
    paymentStatus: 'HELD',
    riskScore: 87,
    riskLevel: 'critical',
    department: 'Operations',
    poNumber: 'PO-2026-9042',
    poAmount: 120000,
    bankRoutingNumber: 'HDFC0000128',
    bankAccountNumber: '••••••••4892',
    bankRoutingChangedRecently: true,
    isDuplicateRisk: true,
    duplicateMatchInvoice: 'INV-28412',
    anomalyCount: 4,
    anomalies: [
      'Amount is +311.9% above vendor 90-day baseline (Z-Score: +3.42)',
      'Bank routing number was modified 4 days prior to invoice submission',
      'Soft duplicate match (96.4% text similarity) with INV-28412 settled 8 days ago',
      'Exceeds departmental Q3 Operations remaining budget threshold by +18.5%'
    ],
    lineItems: [
      { id: 'li-1', description: 'Enterprise Grade Industrial Coolant (Drum 200L)', category: 'Raw Materials', quantity: 12, unitPrice: 22000, totalPrice: 264000, poMatch: false },
      { id: 'li-2', description: 'Emergency Valve Actuators - High Pressure', category: 'Equipment', quantity: 4, unitPrice: 38000, totalPrice: 152000, poMatch: false },
      { id: 'li-3', description: 'Expedited Express Freight & Handling', category: 'Logistics', quantity: 1, unitPrice: 66000, totalPrice: 66000, poMatch: false }
    ],
    notes: 'Flagged automatically by FIN-SHIELD multi-source correlation engine. Payment hold #WF-9042 applied in EnterPro.'
  },
  {
    id: 'inv-28412',
    invoiceNumber: 'INV-28412',
    vendorId: 'ven-abc-001',
    vendorName: 'ABC Supplies Pvt Ltd',
    vendorCode: 'VEND-0042',
    amount: 478000,
    taxAmount: 86040,
    currency: 'INR',
    invoiceDate: '2026-08-31',
    dueDate: '2026-09-14',
    status: 'PAID',
    paymentStatus: 'PAID',
    riskScore: 24,
    riskLevel: 'low',
    department: 'Operations',
    poNumber: 'PO-2026-8891',
    poAmount: 478000,
    bankRoutingNumber: 'ICIC0000041',
    bankAccountNumber: '••••••••1104',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: false,
    anomalyCount: 0,
    anomalies: [],
    lineItems: [
      { id: 'li-4', description: 'Enterprise Grade Industrial Coolant (Drum 200L)', category: 'Raw Materials', quantity: 12, unitPrice: 21500, totalPrice: 258000, poMatch: true },
      { id: 'li-5', description: 'Emergency Valve Actuators - Standard', category: 'Equipment', quantity: 4, unitPrice: 38000, totalPrice: 152000, poMatch: true },
      { id: 'li-6', description: 'Express Freight & Packaging', category: 'Logistics', quantity: 1, unitPrice: 68000, totalPrice: 68000, poMatch: true }
    ],
    notes: 'Settled via automated ACH transfer after 3-way match validation.'
  },
  {
    id: 'inv-29014',
    invoiceNumber: 'INV-29014',
    vendorId: 'ven-nex-008',
    vendorName: 'NexGen Cloud Infrastructure',
    vendorCode: 'VEND-0109',
    amount: 1245000,
    taxAmount: 224100,
    currency: 'INR',
    invoiceDate: '2026-09-06',
    dueDate: '2026-09-20',
    status: 'HIGH_RISK',
    paymentStatus: 'UNPAID',
    riskScore: 68,
    riskLevel: 'high',
    department: 'Technology',
    poNumber: 'PO-2026-9110',
    poAmount: 950000,
    bankRoutingNumber: 'HDFC0000219',
    bankAccountNumber: '••••••••9942',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: false,
    anomalyCount: 2,
    anomalies: [
      'Billed amount exceeds Purchase Order PO-2026-9110 commitment by +31.05%',
      'Unscheduled burst compute usage without pre-authorization change order'
    ],
    lineItems: [
      { id: 'li-7', description: 'Dedicated AI Inference Cluster - 8x H100 Instance Month', category: 'Cloud Computing', quantity: 1, unitPrice: 950000, totalPrice: 950000, poMatch: true },
      { id: 'li-8', description: 'Unreserved On-Demand Burst Compute Surcharge', category: 'Cloud Computing', quantity: 1, unitPrice: 295000, totalPrice: 295000, poMatch: false }
    ],
    notes: 'Escalated to VP of Engineering for out-of-scope compute reconciliation.'
  },
  {
    id: 'inv-27890',
    invoiceNumber: 'INV-27890',
    vendorId: 'ven-qnt-014',
    vendorName: 'Quantum Logistics Global',
    vendorCode: 'VEND-0067',
    amount: 684000,
    taxAmount: 123120,
    currency: 'INR',
    invoiceDate: '2026-09-04',
    dueDate: '2026-09-18',
    status: 'ON_HOLD',
    paymentStatus: 'HELD',
    riskScore: 72,
    riskLevel: 'high',
    department: 'Procurement',
    poNumber: 'PO-2026-8974',
    poAmount: 684000,
    bankRoutingNumber: 'SBIN0000412',
    bankAccountNumber: '••••••••7621',
    bankRoutingChangedRecently: true,
    isDuplicateRisk: false,
    anomalyCount: 2,
    anomalies: [
      'Bank IFSC/SWIFT code changed without 2FA biometric confirmation from vendor officer',
      'Geographical mismatch: Remittance account registered in foreign jurisdiction'
    ],
    lineItems: [
      { id: 'li-9', description: 'Cross-Border Freight Forwarding & Customs Clearance', category: 'Logistics', quantity: 1, unitPrice: 684000, totalPrice: 684000, poMatch: true }
    ],
    notes: 'EnterPro hold applied pending vendor verbal confirmation.'
  },
  {
    id: 'inv-26992',
    invoiceNumber: 'INV-26992',
    vendorId: 'ven-apex-003',
    vendorName: 'Apex Advisory Services',
    vendorCode: 'VEND-0023',
    amount: 320000,
    taxAmount: 57600,
    currency: 'INR',
    invoiceDate: '2026-09-02',
    dueDate: '2026-09-16',
    status: 'PENDING',
    paymentStatus: 'PROCESSING',
    riskScore: 48,
    riskLevel: 'medium',
    department: 'Operations',
    poNumber: 'PO-2026-8800',
    poAmount: 320000,
    bankRoutingNumber: 'KKBK0000109',
    bankAccountNumber: '••••••••3318',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: false,
    anomalyCount: 1,
    anomalies: [
      'Milestone sign-off document pending L2 Manager digital signature'
    ],
    lineItems: [
      { id: 'li-10', description: 'Financial Risk Model Validation Consultancy - Phase 2', category: 'Professional Services', quantity: 1, unitPrice: 320000, totalPrice: 320000, poMatch: true }
    ],
    notes: 'In review by Internal Audit team.'
  },
  {
    id: 'inv-26440',
    invoiceNumber: 'INV-26440',
    vendorId: 'ven-inf-022',
    vendorName: 'Infinity Workspace Tech',
    vendorCode: 'VEND-0089',
    amount: 195000,
    taxAmount: 35100,
    currency: 'INR',
    invoiceDate: '2026-08-28',
    dueDate: '2026-09-12',
    status: 'APPROVED',
    paymentStatus: 'UNPAID',
    riskScore: 16,
    riskLevel: 'low',
    department: 'Technology',
    poNumber: 'PO-2026-8650',
    poAmount: 195000,
    bankRoutingNumber: 'UTIB0000032',
    bankAccountNumber: '••••••••5519',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: false,
    anomalyCount: 0,
    anomalies: [],
    lineItems: [
      { id: 'li-11', description: 'Workstation Ergonomic Monitors & Peripherals (15 units)', category: 'IT Hardware', quantity: 15, unitPrice: 13000, totalPrice: 195000, poMatch: true }
    ],
    notes: '3-way match verified. Scheduled for Friday payment run.'
  },
  {
    id: 'inv-25910',
    invoiceNumber: 'INV-25910',
    vendorId: 'ven-str-005',
    vendorName: 'Stratosphere Media Corp',
    vendorCode: 'VEND-0051',
    amount: 540000,
    taxAmount: 97200,
    currency: 'INR',
    invoiceDate: '2026-08-25',
    dueDate: '2026-09-08',
    status: 'FLAGGED',
    paymentStatus: 'HELD',
    riskScore: 61,
    riskLevel: 'high',
    department: 'Marketing',
    poNumber: 'PO-2026-8512',
    poAmount: 450000,
    bankRoutingNumber: 'HDFC0000018',
    bankAccountNumber: '••••••••8120',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: false,
    anomalyCount: 2,
    anomalies: [
      'Line item inflation: Ad spend management fee +20% over contracted master agreement',
      'Marketing department budget utilization reached 96.2%'
    ],
    lineItems: [
      { id: 'li-12', description: 'Q3 Brand Awareness Digital Campaign Placement', category: 'Digital Ads', quantity: 1, unitPrice: 450000, totalPrice: 450000, poMatch: true },
      { id: 'li-13', description: 'Uncontracted Performance Retainer Overhead', category: 'Digital Ads', quantity: 1, unitPrice: 90000, totalPrice: 90000, poMatch: false }
    ],
    notes: 'Referred to Brand Director for confirmation.'
  },
  {
    id: 'inv-25109',
    invoiceNumber: 'INV-25109',
    vendorId: 'ven-vel-019',
    vendorName: 'Velocity Travel Solutions',
    vendorCode: 'VEND-0078',
    amount: 142000,
    taxAmount: 25560,
    currency: 'INR',
    invoiceDate: '2026-08-20',
    dueDate: '2026-09-03',
    status: 'REJECTED',
    paymentStatus: 'CANCELLED',
    riskScore: 82,
    riskLevel: 'critical',
    department: 'Travel',
    poNumber: undefined,
    poAmount: undefined,
    bankRoutingNumber: 'YESB0000015',
    bankAccountNumber: '••••••••6641',
    bankRoutingChangedRecently: false,
    isDuplicateRisk: true,
    duplicateMatchInvoice: 'INV-24890',
    anomalyCount: 3,
    anomalies: [
      'Zero matching Purchase Order (No prior procurement approval)',
      'Identical flight PNR charges already settled in invoice INV-24890',
      'VIP hotel suite booking violates corporate travel expense tier limits'
    ],
    lineItems: [
      { id: 'li-14', description: 'Executive Flight Bookings - Singapore FinTech Summit', category: 'Corporate Travel', quantity: 2, unitPrice: 71000, totalPrice: 142000, poMatch: false }
    ],
    notes: 'Rejected by VP Finance due to policy breach and duplicate ticket filing.'
  }
]

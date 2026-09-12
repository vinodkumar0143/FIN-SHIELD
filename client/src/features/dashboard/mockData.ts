import { type RiskLevel } from '@/lib/utils'

export interface KpiMetric {
  id: string
  title: string
  value: string
  subValue?: string
  delta: string
  deltaLabel: string
  isPositiveDelta: boolean
  badgeText: string
  badgeVariant: 'default' | 'success' | 'warning' | 'error' | 'info'
}

export interface RiskTier {
  level: RiskLevel
  label: string
  count: number
  percentage: number
  exposure: number
  color: string
}

export interface CashFlowPoint {
  period: string
  inflow: number
  outflow: number
  projectedInflow?: number
  projectedOutflow?: number
  isProjected?: boolean
}

export interface DepartmentBudget {
  department: string
  allocated: number
  spent: number
  committed: number
  utilizationPct: number
  status: 'normal' | 'warning' | 'critical'
}

export interface AnomalyTrendPoint {
  day: string
  amountAnomalies: number
  duplicateSuspicions: number
  bankChanges: number
  budgetOverruns: number
}

export interface HighRiskItem {
  id: string
  invoiceNumber: string
  vendor: string
  type: 'Invoice' | 'Disbursement' | 'Contract Variance' | 'Wire Transfer'
  amount: number
  riskScore: number
  riskLevel: RiskLevel
  reason: string
  status: 'ON_HOLD' | 'IN_REVIEW' | 'PENDING' | 'ESCALATED'
  dueDate: string
}

export interface RecentInvestigation {
  id: string
  investigationId: string
  entity: string
  invoiceNumber: string
  amount: number
  riskScore: number
  riskLevel: RiskLevel
  primaryFinding: string
  recommendation: string
  status: 'ANALYZING' | 'COMPLETED' | 'FLAGGED' | 'ACTION_TAKEN'
  timestamp: string
}

export interface PendingApproval {
  id: string
  invoiceNumber: string
  vendor: string
  amount: number
  department: string
  riskScore: number
  riskLevel: RiskLevel
  approvalLevel: 'L1 - Analyst' | 'L2 - Finance Manager' | 'L3 - CFO Executive'
  slaDeadline: string
  isUrgent: boolean
}

export interface PaymentHoldItem {
  id: string
  invoiceNumber: string
  vendor: string
  amount: number
  heldDate: string
  reason: string
  heldBy: string
  daysOnHold: number
  severity: RiskLevel
}

export interface VendorRiskItem {
  id: string
  vendorCode: string
  name: string
  riskScore: number
  riskLevel: RiskLevel
  totalExposure: number
  activeInvoices: number
  trend: 'increasing' | 'stable' | 'decreasing'
  status: 'ACTIVE' | 'WATCHLIST' | 'RESTRICTED'
}

export interface AttentionAlert {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  timestamp: string
  source: string
  targetRoute?: string
}

export const REPORTING_PERIODS = [
  'Q3 FY2026 (Current)',
  'Last 30 Days',
  'Month-to-Date (September 2026)',
  'Fiscal Year 2026 YTD',
]

export const KPI_METRICS: KpiMetric[] = [
  {
    id: 'total-exposure',
    title: 'Total Financial Exposure',
    value: '₹4.82Cr',
    subValue: '328 Active Invoices',
    delta: '+12.4%',
    deltaLabel: 'vs prior quarter',
    isPositiveDelta: true,
    badgeText: 'PORTFOLIO',
    badgeVariant: 'info',
  },
  {
    id: 'high-risk-exposure',
    title: 'High-Risk Exposure',
    value: '₹38.4L',
    subValue: '7 Flagged Items',
    delta: '+8.2%',
    deltaLabel: 'requires attention',
    isPositiveDelta: false,
    badgeText: 'ELEVATED',
    badgeVariant: 'error',
  },
  {
    id: 'pending-approvals',
    title: 'Pending Approvals',
    value: '9 Invoices',
    subValue: '₹28.9L Aggregate',
    delta: '2 Urgent',
    deltaLabel: 'approaching SLA',
    isPositiveDelta: false,
    badgeText: 'QUEUE',
    badgeVariant: 'warning',
  },
  {
    id: 'payment-holds',
    title: 'Payment Holds (Active)',
    value: '3 Items',
    subValue: '₹12.4L Preserved',
    delta: '100%',
    deltaLabel: 'capital protected',
    isPositiveDelta: true,
    badgeText: 'ENTERPRO',
    badgeVariant: 'warning',
  },
  {
    id: 'active-investigations',
    title: 'AI Investigations',
    value: '12 Active',
    subValue: '98.7% Precision',
    delta: '+4 Today',
    deltaLabel: 'autonomous scans',
    isPositiveDelta: true,
    badgeText: 'QWEN ENGINE',
    badgeVariant: 'info',
  },
  {
    id: 'budget-utilization',
    title: 'Budget Utilization',
    value: '78.4%',
    subValue: '₹5.1Cr of ₹6.5Cr',
    delta: '-3.2%',
    deltaLabel: 'within envelope',
    isPositiveDelta: true,
    badgeText: 'ON TRACK',
    badgeVariant: 'success',
  },
]

export const OVERALL_RISK = {
  score: 74,
  level: 'HIGH' as RiskLevel,
  previousScore: 68,
  deltaText: '+6 pts vs previous 7-day average',
  summary: 'Elevated anomaly density in Operations & Procurement accounts. 3 high-variance vendor disbursements triggered automatic EnterPro holds.',
}

export const RISK_DISTRIBUTION: RiskTier[] = [
  {
    level: 'LOW',
    label: 'Low / Nominal',
    count: 248,
    percentage: 75.6,
    exposure: 36400000,
    color: '#10B981',
  },
  {
    level: 'MEDIUM',
    label: 'Medium Caution',
    count: 52,
    percentage: 15.9,
    exposure: 7960000,
    color: '#F59E0B',
  },
  {
    level: 'HIGH',
    label: 'High Elevation',
    count: 21,
    percentage: 6.4,
    exposure: 2600000,
    color: '#F97316',
  },
  {
    level: 'CRITICAL',
    label: 'Critical Breach',
    count: 7,
    percentage: 2.1,
    exposure: 1242000,
    color: '#EF4444',
  },
]

export const CASH_FLOW_FORECAST: CashFlowPoint[] = [
  { period: 'Aug 01', inflow: 8500000, outflow: 6200000 },
  { period: 'Aug 08', inflow: 9200000, outflow: 7100000 },
  { period: 'Aug 15', inflow: 7800000, outflow: 6900000 },
  { period: 'Aug 22', inflow: 11000000, outflow: 8400000 },
  { period: 'Aug 29', inflow: 9500000, outflow: 7800000 },
  { period: 'Sep 05', inflow: 10400000, outflow: 8900000 },
  { period: 'Sep 12', inflow: 8800000, outflow: 7400000, isProjected: true },
  { period: 'Sep 19 (F)', inflow: 9600000, outflow: 8100000, projectedInflow: 9600000, projectedOutflow: 8100000, isProjected: true },
  { period: 'Sep 26 (F)', inflow: 11200000, outflow: 8600000, projectedInflow: 11200000, projectedOutflow: 8600000, isProjected: true },
  { period: 'Oct 03 (F)', inflow: 8900000, outflow: 7200000, projectedInflow: 8900000, projectedOutflow: 7200000, isProjected: true },
  { period: 'Oct 10 (F)', inflow: 9800000, outflow: 7900000, projectedInflow: 9800000, projectedOutflow: 7900000, isProjected: true },
]

export const DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  {
    department: 'Operations & Facilities',
    allocated: 2000000,
    spent: 1820000,
    committed: 482000,
    utilizationPct: 91.0,
    status: 'warning',
  },
  {
    department: 'Enterprise Technology',
    allocated: 1800000,
    spent: 1350000,
    committed: 210000,
    utilizationPct: 75.0,
    status: 'normal',
  },
  {
    department: 'Marketing & Growth',
    allocated: 1500000,
    spent: 1050000,
    committed: 180000,
    utilizationPct: 70.0,
    status: 'normal',
  },
  {
    department: 'Travel & Corporate Mobility',
    allocated: 400000,
    spent: 380000,
    committed: 35000,
    utilizationPct: 95.0,
    status: 'critical',
  },
  {
    department: 'Central Procurement',
    allocated: 800000,
    spent: 500000,
    committed: 120000,
    utilizationPct: 62.5,
    status: 'normal',
  },
]

export const ANOMALY_SUMMARY = {
  total: 42,
  critical: 7,
  newLast24h: 4,
  resolvedLast7d: 28,
}

export const ANOMALY_TREND: AnomalyTrendPoint[] = [
  { day: 'Mon', amountAnomalies: 2, duplicateSuspicions: 1, bankChanges: 0, budgetOverruns: 1 },
  { day: 'Tue', amountAnomalies: 3, duplicateSuspicions: 2, bankChanges: 1, budgetOverruns: 1 },
  { day: 'Wed', amountAnomalies: 1, duplicateSuspicions: 0, bankChanges: 0, budgetOverruns: 2 },
  { day: 'Thu', amountAnomalies: 4, duplicateSuspicions: 2, bankChanges: 1, budgetOverruns: 1 },
  { day: 'Fri', amountAnomalies: 6, duplicateSuspicions: 3, bankChanges: 2, budgetOverruns: 3 },
  { day: 'Sat', amountAnomalies: 2, duplicateSuspicions: 1, bankChanges: 0, budgetOverruns: 1 },
  { day: 'Sun', amountAnomalies: 5, duplicateSuspicions: 2, bankChanges: 1, budgetOverruns: 2 },
]

export const AI_FEATURED_INSIGHT = {
  title: 'Qwen Forensic Intelligence Synthesis • Hero Case INV-28491',
  summary: 'Disbursement INV-28491 (₹4,82,000) from ABC Supplies Pvt Ltd exceeds historical vendor average by +311.9% (Z=3.42). Multi-source correlation revealed identical line item amounts to INV-28412 processed 8 days ago, while registered vendor disbursement banking was altered 4 days prior to submission without procurement verified counter-signature.',
  recommendation: 'EXECUTE ENTERPRO PAYMENT HOLD AND TRIGGER FORMAL AUDIT INTERVIEW WITH VENDOR AP PROCUREMENT.',
  confidenceScore: 98.7,
  targetInvoiceId: 'INV-28491',
}

export const HIGH_RISK_ITEMS: HighRiskItem[] = [
  {
    id: 'hri-1',
    invoiceNumber: 'INV-28491',
    vendor: 'ABC Supplies Pvt Ltd',
    type: 'Invoice',
    amount: 482000,
    riskScore: 87,
    riskLevel: 'CRITICAL',
    reason: 'Amount Z=3.42 (+311.9%) • Soft Duplicate of INV-28412 • Unverified Bank Account Mod',
    status: 'ON_HOLD',
    dueDate: '2026-09-18',
  },
  {
    id: 'hri-2',
    invoiceNumber: 'INV-29044',
    vendor: 'Falcon Logistics Global',
    type: 'Invoice',
    amount: 745000,
    riskScore: 78,
    riskLevel: 'HIGH',
    reason: 'Discrepancy: PO authorized ₹6,50,000 (+14.6% mismatch without change order)',
    status: 'IN_REVIEW',
    dueDate: '2026-09-20',
  },
  {
    id: 'hri-3',
    invoiceNumber: 'TRX-94812',
    vendor: 'Tech Innovations Corp',
    type: 'Wire Transfer',
    amount: 1420000,
    riskScore: 74,
    riskLevel: 'HIGH',
    reason: 'Velocity Spike: 4 transfers totaling ₹38L processed within 48-hour window',
    status: 'IN_REVIEW',
    dueDate: '2026-09-15',
  },
  {
    id: 'hri-4',
    invoiceNumber: 'INV-28830',
    vendor: 'Delta Prime Materials',
    type: 'Invoice',
    amount: 320000,
    riskScore: 68,
    riskLevel: 'HIGH',
    reason: 'Causes Travel & Hospitality Q3 budget breach (+11.2% above threshold)',
    status: 'PENDING',
    dueDate: '2026-09-22',
  },
  {
    id: 'hri-5',
    invoiceNumber: 'INV-27710',
    vendor: 'Apex Media Solutions',
    type: 'Invoice',
    amount: 890000,
    riskScore: 64,
    riskLevel: 'HIGH',
    reason: 'Duplicate Tax ID / Sub-threshold structuring pattern detected',
    status: 'ESCALATED',
    dueDate: '2026-09-14',
  },
]

export const RECENT_INVESTIGATIONS: RecentInvestigation[] = [
  {
    id: 'invg-1',
    investigationId: 'INVG-2026-0941',
    entity: 'ABC Supplies Pvt Ltd',
    invoiceNumber: 'INV-28491',
    amount: 482000,
    riskScore: 87,
    riskLevel: 'CRITICAL',
    primaryFinding: 'Triple Anomaly: Amount Outlier, Duplicate Fingerprint, Routing Code Swap',
    recommendation: 'Place Payment Hold • Escalate to Finance Manager',
    status: 'ACTION_TAKEN',
    timestamp: '14m ago',
  },
  {
    id: 'invg-2',
    investigationId: 'INVG-2026-0938',
    entity: 'Falcon Logistics Global',
    invoiceNumber: 'INV-29044',
    amount: 745000,
    riskScore: 78,
    riskLevel: 'HIGH',
    primaryFinding: 'Line item quantity variance vs authorized Purchase Order #PO-8812',
    recommendation: 'Request PO Reconciliation from Vendor',
    status: 'FLAGGED',
    timestamp: '2h ago',
  },
  {
    id: 'invg-3',
    investigationId: 'INVG-2026-0929',
    entity: 'Prime Cloud Services',
    invoiceNumber: 'INV-27104',
    amount: 280000,
    riskScore: 24,
    riskLevel: 'LOW',
    primaryFinding: 'Predictable monthly subscription recurring rate matches historical schedule',
    recommendation: 'Auto-Clear for STP Disbursement',
    status: 'COMPLETED',
    timestamp: '5h ago',
  },
  {
    id: 'invg-4',
    investigationId: 'INVG-2026-0915',
    entity: 'Delta Prime Materials',
    invoiceNumber: 'INV-28830',
    amount: 320000,
    riskScore: 68,
    riskLevel: 'HIGH',
    primaryFinding: 'Exceeds remaining department Q3 travel and mobilization reserve',
    recommendation: 'Require Department Head Supplemental Approval',
    status: 'COMPLETED',
    timestamp: '1d ago',
  },
]

export const PENDING_APPROVALS: PendingApproval[] = [
  {
    id: 'appr-1',
    invoiceNumber: 'INV-28491',
    vendor: 'ABC Supplies Pvt Ltd',
    amount: 482000,
    department: 'Operations',
    riskScore: 87,
    riskLevel: 'CRITICAL',
    approvalLevel: 'L2 - Finance Manager',
    slaDeadline: '2h 15m',
    isUrgent: true,
  },
  {
    id: 'appr-2',
    invoiceNumber: 'INV-29044',
    vendor: 'Falcon Logistics Global',
    amount: 745000,
    department: 'Procurement',
    riskScore: 78,
    riskLevel: 'HIGH',
    approvalLevel: 'L2 - Finance Manager',
    slaDeadline: '5h 40m',
    isUrgent: true,
  },
  {
    id: 'appr-3',
    invoiceNumber: 'INV-28612',
    vendor: 'Zenith Equipment Services',
    amount: 195000,
    department: 'Technology',
    riskScore: 42,
    riskLevel: 'MEDIUM',
    approvalLevel: 'L1 - Analyst',
    slaDeadline: '18h 30m',
    isUrgent: false,
  },
  {
    id: 'appr-4',
    invoiceNumber: 'INV-28550',
    vendor: 'Apex Media Solutions',
    amount: 380000,
    department: 'Marketing',
    riskScore: 48,
    riskLevel: 'MEDIUM',
    approvalLevel: 'L1 - Analyst',
    slaDeadline: '24h 00m',
    isUrgent: false,
  },
]

export const PAYMENT_HOLDS: PaymentHoldItem[] = [
  {
    id: 'hold-1',
    invoiceNumber: 'INV-28491',
    vendor: 'ABC Supplies Pvt Ltd',
    amount: 482000,
    heldDate: '2026-09-12 10:14 IST',
    reason: 'Multi-source fraud indicators: Bank routing change + Soft duplicate',
    heldBy: 'FIN-SHIELD Autonomous Sentinel #WF-9042',
    daysOnHold: 0,
    severity: 'CRITICAL',
  },
  {
    id: 'hold-2',
    invoiceNumber: 'INV-27902',
    vendor: 'Quantum Hardware Labs',
    amount: 520000,
    heldDate: '2026-09-09 14:30 IST',
    reason: 'PO fulfillment missing delivery confirmation from warehouse',
    heldBy: 'Dr. Evelyn Vance (SecOps Lead)',
    daysOnHold: 3,
    severity: 'CRITICAL',
  },
  {
    id: 'hold-3',
    invoiceNumber: 'INV-27814',
    vendor: 'Global Star Logistics',
    amount: 240000,
    heldDate: '2026-09-08 11:20 IST',
    reason: 'Duplicate GSTIN submission under conflicting legal business name',
    heldBy: 'Rajesh Kumar (Finance Analyst)',
    daysOnHold: 4,
    severity: 'HIGH',
  },
]

export const VENDOR_RISK_SNAPSHOT: VendorRiskItem[] = [
  {
    id: 'v-1',
    vendorCode: 'VND-0012',
    name: 'ABC Supplies Pvt Ltd',
    riskScore: 87,
    riskLevel: 'CRITICAL',
    totalExposure: 1424000,
    activeInvoices: 3,
    trend: 'increasing',
    status: 'WATCHLIST',
  },
  {
    id: 'v-2',
    vendorCode: 'VND-0045',
    name: 'Falcon Logistics Global',
    riskScore: 78,
    riskLevel: 'HIGH',
    totalExposure: 2150000,
    activeInvoices: 4,
    trend: 'increasing',
    status: 'ACTIVE',
  },
  {
    id: 'v-3',
    vendorCode: 'VND-0089',
    name: 'Apex Media Solutions',
    riskScore: 54,
    riskLevel: 'MEDIUM',
    totalExposure: 890000,
    activeInvoices: 2,
    trend: 'stable',
    status: 'ACTIVE',
  },
  {
    id: 'v-4',
    vendorCode: 'VND-0023',
    name: 'Enterprise Cloud Systems',
    riskScore: 16,
    riskLevel: 'LOW',
    totalExposure: 3840000,
    activeInvoices: 6,
    trend: 'decreasing',
    status: 'ACTIVE',
  },
  {
    id: 'v-5',
    vendorCode: 'VND-0004',
    name: 'Global Stationery Corp',
    riskScore: 12,
    riskLevel: 'LOW',
    totalExposure: 450000,
    activeInvoices: 1,
    trend: 'stable',
    status: 'ACTIVE',
  },
]

export const ATTENTION_ALERTS: AttentionAlert[] = [
  {
    id: 'att-1',
    title: 'Disbursement Freeze Active: INV-28491 (₹4.82L)',
    description: 'Autonomous payment freeze executed following high anomaly score (87/100). Manager confirmation required within SLA.',
    severity: 'CRITICAL',
    timestamp: '12m ago',
    source: 'EnterPro Workflow Engine',
    targetRoute: '/investigations',
  },
  {
    id: 'att-2',
    title: 'Vendor Banking Verification Failure',
    description: 'Routing code for ABC Supplies Pvt Ltd differs from verified master record. Account active for only 96 hours.',
    severity: 'CRITICAL',
    timestamp: '25m ago',
    source: 'Bank Registry Sentinel',
    targetRoute: '/vendors',
  },
  {
    id: 'att-3',
    title: 'Operations Q3 Budget Threshold Breach',
    description: 'Cumulative committed expenditures exceed 90% allocated fiscal threshold for Q3 FY2026.',
    severity: 'WARNING',
    timestamp: '1h ago',
    source: 'Budget Variance Monitor',
    targetRoute: '/budgets',
  },
  {
    id: 'att-4',
    title: 'Purchase Order #PO-8812 Line Item Mismatch',
    description: 'Falcon Logistics invoice contains unapproved fuel surcharge line item (₹45,000).',
    severity: 'WARNING',
    timestamp: '3h ago',
    source: '3-Way Match Engine',
    targetRoute: '/invoices',
  },
  {
    id: 'att-5',
    title: 'Routine STP Batch Cleared: 18 Low-Risk Invoices',
    description: 'Straight-Through Processing batch settlement of ₹24.5L completed without policy exceptions.',
    severity: 'INFO',
    timestamp: '4h ago',
    source: 'Automated Disbursal Engine',
    targetRoute: '/transactions',
  },
]

import { type RiskLevel } from '@/lib/utils'

export interface ApprovalItem {
  id: string
  requestId: string
  invoiceNumber: string
  entityName: string
  vendorCode: string
  amount: number
  riskScore: number
  riskLevel: RiskLevel
  requester: string
  requesterRole: string
  department: string
  approvalLevel: 'L1 - Analyst' | 'L2 - Finance Manager' | 'L3 - CFO Executive'
  slaDeadline: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'HELD'
  submissionDate: string
  reason: string
  recommendation: string
}

export interface WorkflowItem {
  id: string
  workflowId: string
  triggerEvent: string
  targetEntity: string
  status: 'ACTIVE' | 'COMPLETED' | 'HOLD_PLACED' | 'FAILED'
  currentStep: string
  startTime: string
  duration: string
  steps: {
    name: string
    role: string
    timestamp: string
    status: 'completed' | 'in_progress' | 'pending'
  }[]
}

export interface PaymentHoldRecord {
  id: string
  holdRef: string
  invoiceNumber: string
  vendorName: string
  amount: number
  riskScore: number
  severity: RiskLevel
  reason: string
  heldDate: string
  durationDays: number
  heldBy: string
  workflowRef: string
  status: 'ACTIVE' | 'RELEASED' | 'ESCALATED'
}

export interface EscalationRecord {
  id: string
  escalationId: string
  entity: string
  severity: RiskLevel
  reason: string
  assignedRole: string
  assignedUser: string
  age: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED'
  priority: 'URGENT' | 'HIGH' | 'MEDIUM'
}

export const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: 'app-9042',
    requestId: 'REQ-2026-9042',
    invoiceNumber: 'INV-28491',
    entityName: 'ABC Supplies Pvt Ltd',
    vendorCode: 'VEND-0042',
    amount: 482000,
    riskScore: 87,
    riskLevel: 'critical',
    requester: 'Ramesh Patel, Procurement Specialist',
    requesterRole: 'Procurement Specialist',
    department: 'Operations',
    approvalLevel: 'L3 - CFO Executive',
    slaDeadline: '4 hours remaining',
    status: 'HELD',
    submissionDate: '2026-09-08 09:14',
    reason: 'Invoice amount is +311.9% above vendor baseline, bank routing altered 4 days ago, soft duplicate with INV-28412, and causes +18.5% budget overrun.',
    recommendation: 'Place payment on hold (#WF-9042) and obtain verbal counter-verification from ABC Supplies director.'
  },
  {
    id: 'app-9110',
    requestId: 'REQ-2026-9110',
    invoiceNumber: 'INV-29014',
    entityName: 'NexGen Cloud Infrastructure',
    vendorCode: 'VEND-0109',
    amount: 1245000,
    riskScore: 68,
    riskLevel: 'high',
    requester: 'Priya Narayanan, VP Engineering',
    requesterRole: 'VP Engineering',
    department: 'Technology',
    approvalLevel: 'L2 - Finance Manager',
    slaDeadline: '18 hours remaining',
    status: 'PENDING',
    submissionDate: '2026-09-06 14:15',
    reason: 'On-demand GPU burst compute surcharge exceeds Purchase Order PO-2026-9110 cap by +31.05%.',
    recommendation: 'Request engineering utilization telemetry before releasing disbursement.'
  },
  {
    id: 'app-8800',
    requestId: 'REQ-2026-8800',
    invoiceNumber: 'INV-26992',
    entityName: 'Apex Advisory Services',
    vendorCode: 'VEND-0023',
    amount: 320000,
    riskScore: 48,
    riskLevel: 'medium',
    requester: 'Rajesh Sharma, Director of Operations',
    requesterRole: 'Director Operations',
    department: 'Operations',
    approvalLevel: 'L1 - Analyst',
    slaDeadline: '2 days remaining',
    status: 'PENDING',
    submissionDate: '2026-09-02 10:20',
    reason: 'Phase 2 consulting milestone sign-off pending second reviewer confirmation.',
    recommendation: 'Approve upon verification of final deliverables artifact.'
  },
  {
    id: 'app-8650',
    requestId: 'REQ-2026-8650',
    invoiceNumber: 'INV-26440',
    entityName: 'Infinity Workspace Tech',
    vendorCode: 'VEND-0089',
    amount: 195000,
    riskScore: 16,
    riskLevel: 'low',
    requester: 'Kavita Joshi, IT Operations',
    requesterRole: 'IT Operations',
    department: 'Technology',
    approvalLevel: 'L1 - Analyst',
    slaDeadline: 'Completed',
    status: 'APPROVED',
    submissionDate: '2026-08-28 17:05',
    reason: 'Standard 3-way match verified against PO-2026-8650.',
    recommendation: 'Approved for automated disbursement.'
  }
]

export const MOCK_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf-9042',
    workflowId: 'WF-9042',
    triggerEvent: 'Critical Anomaly on Invoice INV-28491 (Score 87)',
    targetEntity: 'ABC Supplies Pvt Ltd',
    status: 'HOLD_PLACED',
    currentStep: 'Finance Manager Escalation',
    startTime: '2026-09-08 09:14:27',
    duration: '4d 2h active',
    steps: [
      { name: 'AI Anomaly Detection', role: 'FIN-SHIELD Rule Engine', timestamp: '09:14:22', status: 'completed' },
      { name: 'Multi-Source Correlation', role: 'Qwen Forensic Engine', timestamp: '09:14:25', status: 'completed' },
      { name: 'Automated EnterPro Hold', role: 'EnterPro Connector', timestamp: '09:14:27', status: 'completed' },
      { name: 'Finance Manager Review', role: 'Rajesh Sharma / Evelyn Vance', timestamp: 'In Progress', status: 'in_progress' },
      { name: 'Biometric Verbal Verification', role: 'Corporate Treasury', timestamp: 'Pending', status: 'pending' },
      { name: 'Settlement or Cancellation', role: 'ERP Ledger', timestamp: 'Pending', status: 'pending' }
    ]
  },
  {
    id: 'wf-9110',
    workflowId: 'WF-9110',
    triggerEvent: 'PO Cap Variance on INV-29014 (+31.05%)',
    targetEntity: 'NexGen Cloud Infrastructure',
    status: 'ACTIVE',
    currentStep: 'Engineering Sign-off',
    startTime: '2026-09-06 14:15:20',
    duration: '6d active',
    steps: [
      { name: '3-Way PO Variance Flagged', role: 'Matching Engine', timestamp: '14:15:10', status: 'completed' },
      { name: 'Engineering Review Route', role: 'EnterPro Orchestrator', timestamp: '14:15:20', status: 'completed' },
      { name: 'VP Engineering Sign-off', role: 'Priya Narayanan', timestamp: 'In Progress', status: 'in_progress' },
      { name: 'Budget Adjustment Order', role: 'Finance Planning', timestamp: 'Pending', status: 'pending' }
    ]
  }
]

export const MOCK_PAYMENT_HOLDS: PaymentHoldRecord[] = [
  {
    id: 'hold-1',
    holdRef: 'HOLD-2026-0089',
    invoiceNumber: 'INV-28491',
    vendorName: 'ABC Supplies Pvt Ltd',
    amount: 482000,
    riskScore: 87,
    severity: 'critical',
    reason: 'Multi-signal anomaly: Amount Z=+3.42, bank routing altered 4d prior, soft duplicate match with INV-28412, and Operations budget overrun.',
    heldDate: '2026-09-08 09:14',
    durationDays: 4,
    heldBy: 'EnterPro Autonomous Gateway',
    workflowRef: 'WF-9042',
    status: 'ACTIVE'
  },
  {
    id: 'hold-2',
    holdRef: 'HOLD-2026-0084',
    invoiceNumber: 'INV-27890',
    vendorName: 'Quantum Logistics Global',
    amount: 684000,
    riskScore: 72,
    severity: 'high',
    reason: 'Remittance bank routing updated to offshore transit desk without 2FA biometric confirmation.',
    heldDate: '2026-09-04 11:42',
    durationDays: 8,
    heldBy: 'FIN-SHIELD Security Engine',
    workflowRef: 'WF-8974',
    status: 'ACTIVE'
  }
]

export const MOCK_ESCALATIONS: EscalationRecord[] = [
  {
    id: 'esc-1',
    escalationId: 'ESC-2026-014',
    entity: 'INV-28491 (ABC Supplies Pvt Ltd)',
    severity: 'critical',
    reason: 'Unverified IFSC modification accompanied by 311% amount surge & duplicate suspect',
    assignedRole: 'CFO & Internal Audit',
    assignedUser: 'Dr. Evelyn Vance, Head of Risk',
    age: '4 days',
    status: 'ACTIVE',
    priority: 'URGENT'
  },
  {
    id: 'esc-2',
    escalationId: 'ESC-2026-012',
    entity: 'Operations Q3 Budget Deficit',
    severity: 'critical',
    reason: 'Departmental budget encumbrance exceeds approved cap by ₹1,70,000 (+3.8%)',
    assignedRole: 'Finance Planning & Analysis',
    assignedUser: 'Rajesh Sharma, Director of Operations',
    age: '6 days',
    status: 'UNDER_REVIEW',
    priority: 'HIGH'
  }
]

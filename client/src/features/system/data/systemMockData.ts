export type SystemRole = 'ADMIN' | 'FINANCE_MANAGER' | 'FINANCE_ANALYST' | 'EMPLOYEE'

export interface UserRecord {
  id: string
  name: string
  email: string
  role: SystemRole
  department: string
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED'
  lastActivity: string
  avatarInitials: string
}

export const MOCK_USERS: UserRecord[] = [
  {
    id: 'usr-001',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@finshield.corp',
    role: 'ADMIN',
    department: 'Risk Governance',
    status: 'ACTIVE',
    lastActivity: 'Active now',
    avatarInitials: 'EV'
  },
  {
    id: 'usr-002',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@finshield.corp',
    role: 'FINANCE_MANAGER',
    department: 'Operations',
    status: 'ACTIVE',
    lastActivity: '12 mins ago',
    avatarInitials: 'RS'
  },
  {
    id: 'usr-003',
    name: 'Priya Narayanan',
    email: 'priya.narayanan@finshield.corp',
    role: 'FINANCE_MANAGER',
    department: 'Technology',
    status: 'ACTIVE',
    lastActivity: '1 hour ago',
    avatarInitials: 'PN'
  },
  {
    id: 'usr-004',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@finshield.corp',
    role: 'FINANCE_ANALYST',
    department: 'Treasury & Audit',
    status: 'ACTIVE',
    lastActivity: '2 hours ago',
    avatarInitials: 'AD'
  },
  {
    id: 'usr-005',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@finshield.corp',
    role: 'EMPLOYEE',
    department: 'Procurement Specialist',
    status: 'ACTIVE',
    lastActivity: 'Yesterday',
    avatarInitials: 'RP'
  }
]

export interface IntegrationRecord {
  id: string
  name: string
  category: string
  status: 'CONNECTED' | 'STANDBY' | 'MAINTENANCE'
  description: string
  latencyMs: number
  lastSync: string
  configKeys: { key: string; value: string }[]
}

export const MOCK_INTEGRATIONS: IntegrationRecord[] = [
  {
    id: 'int-supabase',
    name: 'Supabase PostgreSQL & Storage',
    category: 'Relational Database & Vector Store',
    status: 'CONNECTED',
    description: 'Master operational database enforcing Row Level Security (RLS), ACID ledger transactions, and document storage.',
    latencyMs: 14,
    lastSync: 'Continuous Realtime (1s ago)',
    configKeys: [
      { key: 'PostgreSQL Version', value: 'v16.1' },
      { key: 'RLS Policies Active', value: '18 Tables Enforced' },
      { key: 'pgvector Index', value: 'HNSW Cosine Similarity' }
    ]
  },
  {
    id: 'int-qwen',
    name: 'Qwen AI Forensic Reasoning Engine',
    category: 'Large Language Model',
    status: 'CONNECTED',
    description: 'Forensic explainability engine synthesizing multi-source data signals into plain-English reasoning and prescriptive recommendations.',
    latencyMs: 380,
    lastSync: 'Continuous Inference',
    configKeys: [
      { key: 'Model Architecture', value: 'Qwen-Forensic-v4.2' },
      { key: 'Temperature', value: '0.15 (Deterministic)' },
      { key: 'Chain of Verification', value: 'Enabled' }
    ]
  },
  {
    id: 'int-enterpro',
    name: 'EnterPro Enterprise Workflow Engine',
    category: 'Operational Orchestration & Escrow',
    status: 'CONNECTED',
    description: 'Two-way integration engine executing payment holds, SLA escalation routing, and multi-tier approval states.',
    latencyMs: 42,
    lastSync: '5 mins ago',
    configKeys: [
      { key: 'Adapter Mode', value: 'Resilient Local Mock (100% SLA)' },
      { key: 'Active Workflows', value: '2 Pipelines Running' },
      { key: 'Escrow Lock Enforcement', value: 'Enabled' }
    ]
  },
  {
    id: 'int-banking',
    name: 'Corporate Banking Settlement Gateway',
    category: 'RTGS / NEFT / ACH Rails',
    status: 'STANDBY',
    description: 'Direct clearing rail integration with HDFC Bank and ICICI Bank for real-time automated disbursements.',
    latencyMs: 86,
    lastSync: '10 mins ago',
    configKeys: [
      { key: 'Clearing Protocol', value: 'ISO 20022' },
      { key: 'Hold Pre-Check Interceptor', value: 'Active' }
    ]
  }
]

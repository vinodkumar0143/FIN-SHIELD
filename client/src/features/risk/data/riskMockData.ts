import { type RiskLevel } from '@/lib/utils'

export interface RiskCategoryItem {
  name: string
  score: number
  exposure: number
  incidentCount: number
  trend: 'up' | 'stable' | 'down'
  severity: RiskLevel
}

export interface RiskEntityRecord {
  id: string
  entityName: string
  entityType: 'VENDOR' | 'INVOICE' | 'DEPARTMENT' | 'TRANSACTION'
  reference: string
  riskScore: number
  severity: RiskLevel
  exposure: number
  primarySignal: string
  status: string
}

export const MOCK_RISK_CATEGORIES: RiskCategoryItem[] = [
  { name: 'Amount Statistical Deviation', score: 88, exposure: 1845000, incidentCount: 4, trend: 'up', severity: 'critical' },
  { name: 'Remittance Banking Volatility', score: 84, exposure: 1166000, incidentCount: 2, trend: 'up', severity: 'critical' },
  { name: 'Soft Duplicate Invoicing', score: 79, exposure: 624000, incidentCount: 3, trend: 'stable', severity: 'high' },
  { name: 'Budget Overrun Deficit', score: 75, exposure: 1700000, incidentCount: 2, trend: 'up', severity: 'high' },
  { name: 'Purchase Order Scope Mismatch', score: 68, exposure: 1540000, incidentCount: 5, trend: 'down', severity: 'high' },
]

export const MOCK_HIGH_RISK_ENTITIES: RiskEntityRecord[] = [
  { id: 'inv-28491', entityName: 'ABC Supplies Pvt Ltd', entityType: 'INVOICE', reference: 'INV-28491', riskScore: 87, severity: 'critical', exposure: 482000, primarySignal: 'Amount Z=+3.42 + Bank Routing Altered + Duplicate Suspect', status: 'ON_HOLD' },
  { id: 'ven-abc-001', entityName: 'ABC Supplies Pvt Ltd', entityType: 'VENDOR', reference: 'VEND-0042', riskScore: 87, severity: 'critical', exposure: 960000, primarySignal: '+311.9% monthly spend velocity surge', status: 'WATCHLIST' },
  { id: 'bgt-ops', entityName: 'Operations Division', entityType: 'DEPARTMENT', reference: 'DEPT-OPS-01', riskScore: 82, severity: 'critical', exposure: 170000, primarySignal: 'Q3 budget overrun deficit (+3.8% above cap)', status: 'OVERRUN_HAZARD' },
  { id: 'inv-27890', entityName: 'Quantum Logistics Global', entityType: 'INVOICE', reference: 'INV-27890', riskScore: 72, severity: 'high', exposure: 684000, primarySignal: 'International clearing IFSC modified without 2FA', status: 'ON_HOLD' },
  { id: 'inv-29014', entityName: 'NexGen Cloud Infrastructure', entityType: 'INVOICE', reference: 'INV-29014', riskScore: 68, severity: 'high', exposure: 1245000, primarySignal: 'PO cap exceeded by +31.05% due to on-demand burst charges', status: 'ACTION_REQUIRED' },
]

export const MOCK_RISK_VELOCITY_TREND = [
  { week: 'W31', overallScore: 42, criticalIncidents: 0, flaggedExposure: 180000 },
  { week: 'W32', overallScore: 48, criticalIncidents: 1, flaggedExposure: 320000 },
  { week: 'W33', overallScore: 54, criticalIncidents: 1, flaggedExposure: 490000 },
  { week: 'W34', overallScore: 61, criticalIncidents: 2, flaggedExposure: 780000 },
  { week: 'W35', overallScore: 69, criticalIncidents: 3, flaggedExposure: 1420000 },
  { week: 'W36 (Current)', overallScore: 74, criticalIncidents: 4, flaggedExposure: 2950000 },
]

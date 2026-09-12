import { useState } from 'react'
import {
  Settings,
  Bell,
  Shield,
  Sliders,
  Sparkles,
  GitBranch,
  Save
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface SettingsPageProps {
  onNavigate?: (path: string) => void
}

type TabType = 'general' | 'notifications' | 'security' | 'financial' | 'ai' | 'workflows'

export function SettingsPage({ onNavigate: _ }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [currency, setCurrency] = useState('INR (₹)')
  const [anomalySensitivity, setAnomalySensitivity] = useState('High (Z > 2.5)')
  const [autoHoldThreshold, setAutoHoldThreshold] = useState('Score ≥ 80 (Critical)')

  const handleSave = () => {
    toast.success('System configuration preferences saved successfully')
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'financial', label: 'Financial Preferences', icon: Sliders },
    { id: 'ai', label: 'AI Forensic Core', icon: Sparkles },
    { id: 'workflows', label: 'Workflow Automation', icon: GitBranch },
    { id: 'security', label: 'Security & RLS', icon: Shield },
    { id: 'notifications', label: 'Alert Feeds', icon: Bell },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Settings className="w-3 h-3 text-cyan-400" />
              PREFERENCES
            </span>
            <span className="text-xs text-muted-foreground">Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FIN-SHIELD System Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure risk sensitivity thresholds, automated hold criteria, and forensic reasoning parameters.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
          onClick={handleSave}
        >
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/50 scrollbar-none text-xs">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-md transition-all font-medium border-b-2 -mb-px whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20 font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Settings Forms */}
      <Card className="p-6 bg-card/60 border-border/80 space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-foreground font-semibold">Tenant Organization Name</label>
              <input
                type="text"
                defaultValue="Apex Global Technologies Corp"
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Primary Reporting Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground"
              >
                <option value="INR (₹)">INR (₹) — Indian Rupee (Default Lakhs/Crores)</option>
                <option value="USD ($)">USD ($) — US Dollar</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-foreground font-semibold">Statistical Baseline Lookback Window</label>
              <select className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground">
                <option>90 Days (Recommended for quarterly budgets)</option>
                <option>180 Days</option>
                <option>365 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Automatic Payment Hold Trigger Threshold</label>
              <select
                value={autoHoldThreshold}
                onChange={e => setAutoHoldThreshold(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground"
              >
                <option>Score ≥ 80 (Critical Only)</option>
                <option>Score ≥ 70 (High & Critical)</option>
                <option>Manual Approval Only (No Auto-Hold)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-foreground font-semibold">Qwen Reasoning Temperature</label>
              <input
                type="text"
                defaultValue="0.15 (High determinism, verifiable math)"
                disabled
                className="w-full h-9 bg-secondary/20 border border-border rounded px-3 text-muted-foreground font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                FIN-SHIELD locks temperature low to eliminate hallucinations in financial dossiers.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Anomaly Sensitivity Bounds</label>
              <select
                value={anomalySensitivity}
                onChange={e => setAnomalySensitivity(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono"
              >
                <option value="High (Z > 2.5)">High (Z &gt; 2.5)</option>
                <option value="Strict (Z > 2.0)">Strict (Z &gt; 2.0)</option>
                <option value="Permissive (Z > 3.0)">Permissive (Z &gt; 3.0)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Duplicate Text Cosine Similarity Threshold</label>
              <select className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono">
                <option>≥ 0.85 (Catches soft re-phrased descriptions)</option>
                <option>≥ 0.95 (Exact matches only)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Auto-Apply EnterPro Escrow Lock</div>
                <div className="text-[11px] text-muted-foreground">Automatically lock disbursements when risk score ≥ 80</div>
              </div>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Escalate on Altered Bank Routing</div>
                <div className="text-[11px] text-muted-foreground">Route to CFO immediately if remittance account changed &lt; 14 days ago</div>
              </div>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Supabase Row Level Security (RLS)</div>
                <div className="text-[11px] text-muted-foreground">18 PostgreSQL tables protected with cryptographic tenant isolation</div>
              </div>
              <Badge variant="success" size="sm">ENFORCED</Badge>
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Immutable Audit Ledger Logging</div>
                <div className="text-[11px] text-muted-foreground">All state modifications logged with cryptographic hashes</div>
              </div>
              <Badge variant="success" size="sm">ENFORCED</Badge>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Critical Anomaly Push Notifications</div>
                <div className="text-[11px] text-muted-foreground">Instant alerts for risk scores &gt; 80 or hold placements</div>
              </div>
              <Badge variant="success" size="sm">ENABLED</Badge>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

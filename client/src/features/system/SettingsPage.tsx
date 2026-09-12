import { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  Bell,
  Shield,
  Sliders,
  Sparkles,
  GitBranch,
  Save,
  RefreshCw,
  Lock,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { settingsService, type SystemSettings } from '@/services/settingsService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface SettingsPageProps {
  onNavigate?: (path: string) => void
}

type TabType = 'general' | 'financial' | 'ai' | 'workflows' | 'security' | 'notifications'

export function SettingsPage({ onNavigate: _ }: SettingsPageProps) {
  const { hasPermission } = useAuth()
  const canManage = hasPermission('settings.manage')

  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Form local state
  const [orgName, setOrgName] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const [riskThresholdHigh, setRiskThresholdHigh] = useState(60)
  const [riskThresholdCritical, setRiskThresholdCritical] = useState(80)
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(85)
  const [autoHoldEnabled, setAutoHoldEnabled] = useState(true)

  const [aiModelPreference] = useState('qwen-plus-financial-v2')
  const [forecastHorizon, setForecastHorizon] = useState<'7D' | '30D' | '90D' | '1Y'>('30D')

  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [slackAlertsEnabled, setSlackAlertsEnabled] = useState(false)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await settingsService.getSettings()
      setSettings(data)

      setOrgName(data.orgName || 'FIN-SHIELD Enterprise')
      setCurrency(data.currency || 'INR')
      setTimezone(data.timezone || 'Asia/Kolkata')

      setRiskThresholdHigh(data.riskThresholdHigh ?? 60)
      setRiskThresholdCritical(data.riskThresholdCritical ?? 80)
      setBudgetAlertThreshold(data.budgetAlertThreshold ?? 85)
      setAutoHoldEnabled(data.autoHoldEnabled ?? true)

      setForecastHorizon(data.forecastDefaultHorizon || '30D')
      setEmailAlertsEnabled(data.emailAlertsEnabled ?? true)
      setSlackAlertsEnabled(data.slackAlertsEnabled ?? false)
    } catch (err: any) {
      console.error('Failed to load settings:', err)
      toast.error('Failed to load system settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!canManage) {
      toast.error('Permission denied: You require settings.manage authority to save configuration.')
      return
    }

    if (riskThresholdHigh >= riskThresholdCritical) {
      toast.error('High risk threshold must be strictly lower than Critical threshold.')
      return
    }

    setIsSaving(true)
    try {
      const res = await settingsService.updateSettings({
        orgName,
        currency,
        timezone,
        riskThresholdHigh: Number(riskThresholdHigh),
        riskThresholdCritical: Number(riskThresholdCritical),
        budgetAlertThreshold: Number(budgetAlertThreshold),
        autoHoldEnabled,
        forecastDefaultHorizon: forecastHorizon,
        emailAlertsEnabled,
        slackAlertsEnabled,
      })

      if (res.data) {
        setSettings(res.data)
      }
      toast.success('System configuration saved and synced across cluster')
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      toast.error(err.response?.data?.error || err.message || 'Failed to update system settings')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'financial', label: 'Financial Preferences', icon: Sliders },
    { id: 'ai', label: 'AI Forensic Core', icon: Sparkles },
    { id: 'workflows', label: 'Workflow Automation', icon: GitBranch },
    { id: 'security', label: 'Security & RLS', icon: Shield },
    { id: 'notifications', label: 'Alert Feeds', icon: Bell },
  ]

  if (isLoading && !settings) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-cyan-400 animate-spin opacity-70" />
        <p className="text-sm font-mono">Loading enterprise parameters from PostgreSQL...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              SYSTEM PREFERENCES
            </span>
            <span className="text-xs text-muted-foreground">Persisted Configuration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FIN-SHIELD System Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure risk sensitivity thresholds, automated payment hold criteria, and AI forensic reasoning parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canManage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              Read-Only Mode
            </div>
          )}

          <Button
            variant="default"
            size="sm"
            disabled={!canManage || isSaving}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs gap-1.5"
            onClick={handleSave}
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* Settings Tab Content */}
      <Card className="p-6 bg-card/60 border-border/80 space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-foreground font-semibold">Tenant Organization Name</label>
              <input
                type="text"
                value={orgName}
                disabled={!canManage}
                onChange={e => setOrgName(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-sans disabled:opacity-60"
              />
              <span className="text-[11px] text-muted-foreground">Identifies organization in reports and exported audits.</span>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Primary Reporting Currency</label>
              <select
                value={currency}
                disabled={!canManage}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground disabled:opacity-60 font-mono"
              >
                <option value="INR">INR (₹) — Indian Rupee (Default Lakhs/Crores)</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">System Timezone</label>
              <select
                value={timezone}
                disabled={!canManage}
                onChange={e => setTimezone(e.target.value)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground disabled:opacity-60 font-mono"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">UTC (+00:00)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-foreground font-semibold">Default Cash-Flow Forecast Horizon</label>
              <select
                value={forecastHorizon}
                disabled={!canManage}
                onChange={e => setForecastHorizon(e.target.value as any)}
                className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground disabled:opacity-60 font-mono"
              >
                <option value="7D">7 Days (Short-term operational)</option>
                <option value="30D">30 Days (Monthly trend analysis)</option>
                <option value="90D">90 Days (Quarterly forecasting)</option>
                <option value="1Y">1 Year (Annual fiscal projection)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-foreground font-semibold">High Risk Threshold (1–100)</label>
                <input
                  type="number"
                  min={10}
                  max={90}
                  value={riskThresholdHigh}
                  disabled={!canManage}
                  onChange={e => setRiskThresholdHigh(Number(e.target.value))}
                  className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono disabled:opacity-60"
                />
                <span className="text-[11px] text-muted-foreground">Invoices &ge; {riskThresholdHigh} flagged for L1 review.</span>
              </div>

              <div className="space-y-1">
                <label className="text-foreground font-semibold">Critical Risk Threshold (1–100)</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={riskThresholdCritical}
                  disabled={!canManage}
                  onChange={e => setRiskThresholdCritical(Number(e.target.value))}
                  className="w-full h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono disabled:opacity-60"
                />
                <span className="text-[11px] text-muted-foreground">Invoices &ge; {riskThresholdCritical} placed under escrow hold.</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Budget Warning Trigger Threshold (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={budgetAlertThreshold}
                  disabled={!canManage}
                  onChange={e => setBudgetAlertThreshold(Number(e.target.value))}
                  className="w-32 h-9 bg-secondary/40 border border-border rounded px-3 text-foreground font-mono disabled:opacity-60"
                />
                <span className="text-[11px] text-muted-foreground">
                  Alert dispatched when department spend breaches {budgetAlertThreshold}% of monthly allocation.
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-foreground font-semibold">AI Reasoning Model Engine</label>
                <Badge variant="info" size="sm">ACTIVE</Badge>
              </div>
              <input
                type="text"
                value={aiModelPreference}
                disabled
                className="w-full h-9 bg-secondary/20 border border-border rounded px-3 text-muted-foreground font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                FIN-SHIELD utilizes Alibaba Cloud Qwen Plus with deterministic financial reasoning parameters.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-foreground font-semibold">Forensic Reasoning Temperature</label>
              <input
                type="text"
                value="0.15 (Locked Low for Zero Hallucinations)"
                disabled
                className="w-full h-9 bg-secondary/20 border border-border rounded px-3 text-muted-foreground font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Auto-Apply EnterPro Escrow Lock</div>
                <div className="text-[11px] text-muted-foreground">Immediately hold disbursements when invoice risk score breaches threshold</div>
              </div>
              <input
                type="checkbox"
                checked={autoHoldEnabled}
                disabled={!canManage}
                onChange={e => setAutoHoldEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Escalate on Altered Vendor Bank Account</div>
                <div className="text-[11px] text-muted-foreground">Trigger immediate CFO escalation if vendor IBAN/routing changed &lt; 14 days ago</div>
              </div>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Supabase Row Level Security (RLS)
                </div>
                <div className="text-[11px] text-muted-foreground">All database tables protected with tenant and role-based policies</div>
              </div>
              <Badge variant="success" size="sm">ENFORCED</Badge>
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Immutable Audit Ledger Logging
                </div>
                <div className="text-[11px] text-muted-foreground">Append-only audit ledger rejects client-side mutations</div>
              </div>
              <Badge variant="success" size="sm">ENFORCED</Badge>
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Privilege Elevation Protections
                </div>
                <div className="text-[11px] text-muted-foreground">Strict defense blocking self-promotions and unauthorized role transfers</div>
              </div>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Email Security Dispatch Notifications</div>
                <div className="text-[11px] text-muted-foreground">Send real-time alerts to Finance Managers for critical risk events</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                disabled={!canManage}
                onChange={e => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
            </div>

            <div className="p-3 bg-secondary/30 rounded border border-border/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Slack Enterprise Webhook Integration</div>
                <div className="text-[11px] text-muted-foreground">Forward payment hold notices to secure compliance channel</div>
              </div>
              <input
                type="checkbox"
                checked={slackAlertsEnabled}
                disabled={!canManage}
                onChange={e => setSlackAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Lock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface FinShieldDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DemoScene {
  id: number
  stage: string
  title: string
  subtitle: string
  accentColor: string
}

const DEMO_SCENES: DemoScene[] = [
  {
    id: 0,
    stage: 'DETECT',
    title: 'Financial Transaction Ingestion',
    subtitle: 'High-throughput stream ingestion and baseline profiling',
    accentColor: '#06B6D4'
  },
  {
    id: 1,
    stage: 'DETECT',
    title: 'Statistical Anomaly Detection',
    subtitle: 'Immediate identification of extreme amount deviation',
    accentColor: '#38BDF8'
  },
  {
    id: 2,
    stage: 'INVESTIGATE',
    title: 'Multi-Factor Evidence Correlation',
    subtitle: 'Correlating duplicate invoice, vendor mod, and PO signals',
    accentColor: '#818CF8'
  },
  {
    id: 3,
    stage: 'SCORE',
    title: 'Multi-Dimensional Risk Scoring',
    subtitle: 'Synthesizing statistical divergence and entity history into risk score',
    accentColor: '#F43F5E'
  },
  {
    id: 4,
    stage: 'EXPLAIN',
    title: 'Explainable AI Investigation Brief',
    subtitle: 'Clear, auditable qualitative synthesis of risk factors',
    accentColor: '#A855F7'
  },
  {
    id: 5,
    stage: 'RESPOND',
    title: 'Controlled Action & Audit Workflow',
    subtitle: 'Automated gateway hold and multi-signature escalation queue',
    accentColor: '#10B981'
  }
]

export const FinShieldDemoModal: React.FC<FinShieldDemoModalProps> = ({ isOpen, onClose }) => {
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [sceneProgress, setSceneProgress] = useState(0)

  const SCENE_DURATION = 4200 // 4.2 seconds per scene

  const handleNext = useCallback(() => {
    setCurrentScene((prev) => (prev < DEMO_SCENES.length - 1 ? prev + 1 : 0))
    setSceneProgress(0)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentScene((prev) => (prev > 0 ? prev - 1 : DEMO_SCENES.length - 1))
    setSceneProgress(0)
  }, [])

  // Auto playback timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return

    const interval = 50
    const step = (interval / SCENE_DURATION) * 100

    const timer = setInterval(() => {
      setSceneProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [isOpen, isPlaying, handleNext])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((p) => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleNext, handlePrev])

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentScene(0)
      setSceneProgress(0)
      setIsPlaying(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeScene = DEMO_SCENES[currentScene]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#030712]/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Container: 75–90% Viewport */}
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#080E1A] border border-slate-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden z-10 my-auto text-slate-100 max-h-[92vh]">
        {/* 1. Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0A1122]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              FINSHIELD DEMO
            </div>
            <div>
              <h2 id="demo-modal-title" className="text-sm font-semibold text-white font-sans">
                AI Financial Investigation Walkthrough
              </h2>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Interactive Demonstration • Case INV-28491
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close demo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. Scene Selector Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto text-[11px] font-mono scrollbar-none">
          {DEMO_SCENES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentScene(idx)
                setSceneProgress(0)
              }}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                idx === currentScene
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  idx === currentScene ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              />
              <span>{idx + 1}. {s.stage}</span>
            </button>
          ))}
        </div>

        {/* 3. Main Stage / Screen Content */}
        <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-6 overflow-y-auto">
          {/* Stage Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                  style={{
                    backgroundColor: `${activeScene.accentColor}20`,
                    color: activeScene.accentColor,
                    borderColor: `${activeScene.accentColor}40`,
                    borderWidth: '1px'
                  }}
                >
                  Stage {currentScene + 1}: {activeScene.stage}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Case ID: <strong className="text-slate-200">INV-28491</strong> (ABC Supplies Pvt Ltd)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeScene.title}
              </h3>
              <p className="text-xs text-slate-400">
                {activeScene.subtitle}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Simulation Time: T+0.{currentScene * 4}s</span>
            </div>
          </div>

          {/* Interactive Scene Renderers */}
          <div className="min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {/* SCENE 0: Ingestion */}
                {currentScene === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-700/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                          <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                            Disbursement Request Ingested
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          ERP Gateway Feed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">Vendor Name</span>
                          <div className="text-sm font-semibold text-white">ABC Supplies Pvt Ltd</div>
                          <div className="text-[11px] font-mono text-slate-400">Vendor ID: VEND-9821</div>
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">Invoice Value</span>
                          <div className="text-xl font-bold font-mono text-cyan-300">₹4,82,000</div>
                          <div className="text-[11px] font-mono text-slate-400">INR / Net 30</div>
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">Reference PO</span>
                          <div className="text-xs font-mono text-slate-200">PO-2026-8841</div>
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">Beneficiary Account</span>
                          <div className="text-xs font-mono text-slate-200">HDFC •••• 9102</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Ingestion Timestamp: 14:32:08 UTC</span>
                        <span className="text-cyan-400">Parsing Complete (18ms)</span>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3 flex flex-col justify-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Historical Baseline Context
                      </span>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">180-Day Avg:</span>
                          <span className="text-slate-200 font-semibold">₹2,10,000</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Max Prior:</span>
                          <span className="text-slate-200 font-semibold">₹2,45,000</span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Frequency:</span>
                          <span className="text-slate-200 font-semibold">2x / Month</span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                        Historical profile loaded for baseline comparison.
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 1: Anomaly Detection */}
                {currentScene === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-rose-900/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="h-4 w-4 text-rose-400" />
                          <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                            Threshold Breach: Amount Anomaly Detected
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          +129.5% Surge
                        </span>
                      </div>

                      {/* Visual Waveform Graph */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                          <span>Vendor Transaction History vs Current Invoice</span>
                          <span className="text-rose-400 font-bold">Deviation: +129.5%</span>
                        </div>
                        <div className="h-28 w-full bg-slate-950/80 rounded-lg p-3 border border-slate-800 flex items-center">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80">
                            <rect x="0" y="45" width="400" height="25" fill="#06B6D4" opacity="0.08" />
                            <line x1="0" y1="58" x2="400" y2="58" stroke="#334155" strokeDasharray="4 4" />
                            <path
                              d="M 10 56 Q 50 54, 90 58 T 170 55 T 250 59 T 320 56 L 390 14"
                              fill="none"
                              stroke="#06B6D4"
                              strokeWidth="2.5"
                            />
                            <circle cx="90" cy="58" r="3" fill="#06B6D4" />
                            <circle cx="170" cy="55" r="3" fill="#06B6D4" />
                            <circle cx="250" cy="59" r="3" fill="#06B6D4" />
                            <circle cx="320" cy="56" r="3" fill="#06B6D4" />
                            <circle cx="390" cy="14" r="5" fill="#F43F5E" className="animate-pulse" />
                            <text x="310" y="16" fill="#F43F5E" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              ₹4,82,000 (Current)
                            </text>
                          </svg>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Historical Avg:</span>
                          <div className="text-white font-bold text-sm">₹2,10,000</div>
                        </div>
                        <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/60">
                          <span className="text-rose-300">Delta from Mean:</span>
                          <div className="text-rose-400 font-bold text-sm">+ ₹2,72,000 (+129.5%)</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3 flex flex-col justify-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Surveillance Trigger
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Amount exceeds the dynamic 3.8-sigma confidence interval established by FinShield's statistical profiling model.
                      </p>
                      <div className="p-2.5 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] font-mono text-amber-300">
                        Triggered Phase 2: Correlating multi-factor evidence.
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 2: Evidence Correlation */}
                {currentScene === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Vector 1: Soft Duplicate */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Duplicate Match</span>
                        <span className="text-xs font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-950">88.4%</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-mono">Soft Duplicate Signal</h4>
                      <p className="text-[11px] text-slate-400">
                        Near-identical line items and amounts matched with invoice <strong className="text-slate-200">INV-28412</strong> cleared 4 days ago.
                      </p>
                    </div>

                    {/* Vector 2: PO Mismatch */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">PO Discrepancy</span>
                        <span className="text-xs font-mono font-bold text-rose-300 px-1.5 py-0.5 rounded bg-rose-950">MISMATCH</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-mono">Unsigned Purchase Order</h4>
                      <p className="text-[11px] text-slate-400">
                        PO-2026-8841 lacks approved departmental counter-signature in ERP authorization register.
                      </p>
                    </div>

                    {/* Vector 3: Vendor Bank Modification */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Credential Shift</span>
                        <span className="text-xs font-mono font-bold text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950">48h Prior</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-mono">Beneficiary Routing Change</h4>
                      <p className="text-[11px] text-slate-400">
                        Vendor disbursement account IFSC &amp; account updated 48 hours prior to invoice submission.
                      </p>
                    </div>

                    {/* Vector 4: Budget Envelope */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">Budget Strain</span>
                        <span className="text-xs font-mono font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-950">EXCEEDED</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white font-mono">Q3 OpEx Envelope</h4>
                      <p className="text-[11px] text-slate-400">
                        Disbursement exceeds the remaining operational budget allocation for cost center CC-402.
                      </p>
                    </div>
                  </div>
                )}

                {/* SCENE 3: Risk Scoring */}
                {currentScene === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Big Gauge */}
                    <div className="p-6 rounded-xl bg-slate-900/80 border border-rose-900/50 flex flex-col items-center justify-center text-center space-y-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Synthesized Risk Score
                      </span>
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#1E293B" strokeWidth="9" />
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#F43F5E"
                            strokeWidth="9"
                            strokeDasharray="264"
                            strokeDashoffset={264 - (264 * 87) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black font-mono text-rose-400">87</span>
                          <span className="text-[10px] font-mono text-slate-400">OUT OF 100</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
                        CRITICAL / HIGH RISK
                      </span>
                    </div>

                    {/* Weight Breakdown */}
                    <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
                      <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                        Component Score Breakdown
                      </span>

                      <div className="space-y-2.5 font-mono text-xs">
                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Amount Baseline Deviation (+129.5%)</span>
                            <span className="text-rose-400 font-bold">92 / 100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Soft Duplicate Fingerprint (88.4% Match)</span>
                            <span className="text-amber-400 font-bold">88 / 100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Beneficiary Credential Velocity (&lt;48h Change)</span>
                            <span className="text-cyan-400 font-bold">84 / 100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '84%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Automated Escalation Rule: Score &gt;= 75</span>
                        <span className="text-rose-400 font-semibold">Immediate Hold Mandated</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE 4: AI Explanation */}
                {currentScene === 4 && (
                  <div className="p-6 rounded-xl bg-slate-900/80 border border-purple-900/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                          AI Autonomous Investigation Brief
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Simulated LLM Synthesis
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-200 space-y-2">
                      <div className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                        Investigator Summary:
                      </div>
                      <p>
                        "Transaction <span className="text-white font-semibold">INV-28491</span> for{' '}
                        <span className="text-cyan-300 font-semibold">₹4,82,000</span> deviates significantly{' '}
                        <span className="text-rose-400 font-semibold">(+129.5%)</span> from historical vendor average{' '}
                        <span className="text-slate-400">(₹2,10,000)</span>.
                      </p>
                      <p>
                        Correlated with an <span className="text-amber-300 font-semibold">88.4% soft duplicate match</span> against recent disbursement{' '}
                        <span className="text-slate-200">INV-28412</span>, missing departmental PO sign-off, and an unverified vendor bank account modification within 48 hours prior to billing.
                      </p>
                      <p className="text-rose-300 font-semibold">
                        Assessment: High probability of duplicate or unauthorized disbursement. Immediate payment hold recommended pending vendor authentication.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span>Model: FinShield-Reasoner-v3</span>
                      <span className="text-purple-400">100% Explainable &amp; Audit-Logged</span>
                    </div>
                  </div>
                )}

                {/* SCENE 5: Action & Response */}
                {currentScene === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Action Execution */}
                    <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-emerald-900/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                            Autonomous Action: HOLD PAYMENT &amp; VERIFY
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Hold Active
                        </span>
                      </div>

                      {/* Workflow Stepper */}
                      <div className="space-y-3 font-mono text-xs">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Investigation Workflow Progression</span>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2.5 rounded bg-slate-950 border border-emerald-800/40">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            <div className="flex-1 flex justify-between">
                              <span className="text-slate-200 font-semibold">1. Payment Hold</span>
                              <span className="text-emerald-400 font-bold">EXECUTED</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-2.5 rounded bg-slate-950 border border-cyan-800/40">
                            <span className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                            <div className="flex-1 flex justify-between">
                              <span className="text-slate-200 font-semibold">2. Out-of-Band Vendor Verification</span>
                              <span className="text-cyan-400 font-bold">IN PROGRESS</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-2.5 rounded bg-slate-950/60 border border-slate-800/60 opacity-60">
                            <span className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                            <div className="flex-1 flex justify-between">
                              <span className="text-slate-400">3. Finance Manager Review &amp; Sign-off</span>
                              <span className="text-slate-500">PENDING</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between">
                        <span>Ledger Hash: #FS-98214-AUDIT</span>
                        <span className="text-emerald-400">Protected ₹4,82,000 from Loss</span>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3 flex flex-col justify-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Enterprise Outcome
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        The unauthorized disbursement was intercepted at the banking gateway before settlement, averting potential capital loss.
                      </p>
                      <Button
                        onClick={() => {
                          setCurrentScene(0)
                          setSceneProgress(0)
                          setIsPlaying(true)
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-mono border-slate-700 hover:border-cyan-500 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3 mr-1.5" /> Replay Demo
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 4. Bottom Controls Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0A1122] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Previous / Play / Next Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-mono border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Previous scene"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Prev</span>
            </Button>

            <Button
              onClick={() => setIsPlaying((p) => !p)}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-mono border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer"
              aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 mr-1 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1 text-cyan-400 fill-cyan-400" />
                  <span>Play</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleNext}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-mono border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 cursor-pointer"
              aria-label="Next scene"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          {/* Scene Indicator & Disclaimer */}
          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Scene {currentScene + 1} of {DEMO_SCENES.length}:</span>
              <strong className="text-slate-200">{activeScene.title}</strong>
            </div>
          </div>
        </div>

        {/* Playback Progress Indicator Line */}
        <div className="h-1 w-full bg-slate-900">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-75"
            style={{ width: `${sceneProgress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

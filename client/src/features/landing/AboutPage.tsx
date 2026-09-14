import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FinShieldDemoModal } from './FinShieldDemoModal'
import {
  ArrowRight,
  Play,
  Search,
  FileSearch,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Cpu,
  Landmark,
  Scale,
  Lock,
  KeyRound,
  History,
  FileCheck,
  HeartHandshake,
  Lightbulb,
  Target,
  Users,
  Database,
  GitMerge,
  Bot,
  UserCheck,
  SlidersHorizontal,
  Workflow,
  CheckSquare
} from 'lucide-react'

export interface AboutPageProps {
  onNavigate: (path: string) => void
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const shouldReduceMotion = useReducedMotion()
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Support direct hash URLs like /about#product, /about#solutions, etc.
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace('#', '')
        const targetElement = document.getElementById(id)
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })
          }, 100)
        }
      }
    }

    handleHashScroll()
    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [shouldReduceMotion])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    window.history.pushState(null, '', `#${id}`)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })
    }
  }

  const handleStart = () => {
    onNavigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-[#061120] text-[#F7F9FC] flex flex-col selection:bg-[#00B87C]/30 selection:text-[#00B87C] overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#00B87C]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[450px] bg-[#0EA5E9]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[450px] bg-[#0B1F3A]/60 rounded-full blur-[160px]" />
        {/* Subtle dot matrix grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#0EA5E9 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 1. Header / Navigation */}
      <header className="relative z-30 w-full border-b border-[#16365C] bg-[#061120]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2.5"
            role="button"
            aria-label="FinShield Home"
          >
            <FinShieldLogo variant="compact" size="sm" />
            <span className="text-sm font-mono font-bold tracking-wider text-white">FinShield</span>
          </div>

          {/* Nav Links: Product, Solutions, Security, About */}
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-slate-300">
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Product
            </a>
            <a
              href="#solutions"
              onClick={(e) => scrollToSection(e, 'solutions')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Solutions
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-[#00B87C] transition-colors"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* 2. Hero Section */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden lg:overflow-visible">
          {/* Bottom Digital Mesh & Data Beacon Landscape */}
          <div className="absolute -bottom-4 left-0 right-0 w-full h-44 sm:h-56 pointer-events-none overflow-hidden z-0">
            <svg
              className="w-full h-full opacity-60"
              viewBox="0 0 1440 220"
              fill="none"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="meshGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.05" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="meshGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.05" />
                  <stop offset="50%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              <path
                d="M 0 190 Q 360 170, 720 185 T 1440 140"
                stroke="url(#meshGradientCyan)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M 0 205 Q 400 180, 800 195 T 1440 155"
                stroke="url(#meshGradientBlue)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M 100 215 Q 500 160, 920 175 T 1440 120"
                stroke="url(#meshGradientCyan)"
                strokeWidth="1"
                strokeDasharray="2 3"
                fill="none"
              />
              <path
                d="M 300 220 Q 650 145, 1050 165 T 1440 110"
                stroke="url(#meshGradientCyan)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M 450 220 Q 800 130, 1180 150 T 1440 95"
                stroke="url(#meshGradientCyan)"
                strokeWidth="1.5"
                fill="none"
              />

              <line x1="880" y1="178" x2="880" y2="120" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />
              <circle cx="880" cy="120" r="3.5" fill="#38BDF8" className="drop-shadow-[0_0_8px_#38bdf8]" />
              <circle cx="880" cy="178" r="2" fill="#06B6D4" />

              <line x1="1020" y1="168" x2="1020" y2="90" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />
              <circle cx="1020" cy="90" r="4" fill="#38BDF8" className="drop-shadow-[0_0_8px_#38bdf8]" />
              <circle cx="1020" cy="168" r="2" fill="#06B6D4" />

              <line x1="1160" y1="152" x2="1160" y2="110" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />
              <circle cx="1160" cy="110" r="3" fill="#38BDF8" className="drop-shadow-[0_0_6px_#38bdf8]" />
              <circle cx="1160" cy="152" r="2" fill="#06B6D4" />

              <line x1="1300" y1="130" x2="1300" y2="70" stroke="#06B6D4" strokeWidth="1.5" opacity="0.8" />
              <circle cx="1300" cy="70" r="4.5" fill="#38BDF8" className="drop-shadow-[0_0_10px_#38bdf8]" />
              <circle cx="1300" cy="130" r="2" fill="#06B6D4" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Official Compact Logo Mark & Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-3.5">
                <FinShieldLogo
                  variant="compact"
                  size="md"
                />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1F3A] border border-[#16365C] text-[#00B87C] text-[11px] font-mono font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(0,184,124,0.15)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00B87C] shadow-[0_0_8px_#00B87C] animate-pulse" />
                  <span>DETECT. INVESTIGATE. EXPLAIN. RESPOND.</span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                AI-Powered <br />
                Financial <span className="text-white">Investigation.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl font-sans">
                Connect fragmented financial evidence. Detect risk, investigate why it happened, explain the findings with AI, and move to controlled action with human oversight.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-[#00B87C] hover:bg-[#009E6A] text-[#061120] font-bold px-7 h-12 rounded-xl shadow-[0_0_24px_rgba(0,184,124,0.35)] cursor-pointer text-sm tracking-wide transition-all flex items-center justify-center"
                >
                  <span>Start Investigation</span>
                  <ArrowRight className="h-4 w-4 ml-2 text-[#061120]" />
                </Button>

                <Button
                  onClick={() => setShowDemoModal(true)}
                  variant="outline"
                  size="lg"
                  className="border-[#16365C] hover:border-[#0EA5E9]/60 bg-[#0B1F3A]/80 text-[#F7F9FC] hover:text-white h-12 px-6 rounded-xl backdrop-blur-md cursor-pointer text-sm font-medium transition-all flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>Watch Demo</span>
                </Button>
              </div>

              {/* Trust Tagline */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 lg:gap-5 pt-3 text-[11px] sm:text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-[#00B87C] shrink-0" /> Enterprise-Grade Security
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-[#00B87C] shrink-0" /> Multi-Role Access Control
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-[#00B87C] shrink-0" /> Append-Only Audit Trail
                </span>
              </div>
            </div>

            {/* Right Column: Financial Investigation Cockpit */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
                transition={shouldReduceMotion ? { duration: 0.5 } : { y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.8 } }}
                className="relative w-full max-w-lg lg:max-w-xl"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-[#00B87C]/20 via-[#0B1F3A] to-[#0EA5E9]/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

                <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#00B87C]/30 via-[#16365C] to-[#0EA5E9]/30 shadow-[0_0_50px_rgba(0,184,124,0.12)]">
                  <div className="rounded-[22px] bg-[#0B1F3A]/95 border border-[#16365C] p-6 sm:p-7 backdrop-blur-2xl space-y-5 shadow-2xl">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                        </span>
                        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                          SUSPICIOUS TRANSACTION
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#3B0715]/85 border border-rose-800/80 text-rose-400 font-bold tracking-wide">
                        HIGH RISK
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="text-3xl sm:text-4xl font-extrabold font-sans text-white tracking-tight">
                          ₹4,82,000
                        </div>
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-slate-300 font-semibold">INV-28491</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300">ABC Supplies Pvt Ltd</span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#061120] border border-[#16365C] flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="21" fill="none" stroke="#16365C" strokeWidth="4.5" />
                            <circle
                              cx="26"
                              cy="26"
                              r="21"
                              fill="none"
                              stroke="#EF4444"
                              strokeWidth="4.5"
                              strokeDasharray="132"
                              strokeDashoffset={132 - (132 * 87) / 100}
                              strokeLinecap="round"
                              className="drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]"
                            />
                          </svg>
                          <span className="absolute text-base font-bold font-mono text-white">87</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">87/100</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Historical Baseline Divergence</span>
                        <span className="text-rose-400 font-bold font-mono text-xs">+129.5%</span>
                      </div>

                      <div className="h-14 w-full bg-[#061120] rounded-xl px-4 border border-[#16365C] flex items-center relative overflow-hidden">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 320 40" preserveAspectRatio="none">
                          <path
                            d="M 10 26 L 140 26 C 180 26, 220 24, 255 18 C 280 13, 295 10, 310 8"
                            fill="none"
                            stroke="#0EA5E9"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="310" cy="8" r="4" fill="#EF4444" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[#081528] border border-[#16365C] flex items-center gap-2.5">
                        <TrendingUp className="h-4 w-4 text-rose-400 shrink-0" />
                        <div className="truncate font-mono text-xs">
                          <span className="text-slate-300 font-medium">Outlier: </span>
                          <span className="text-rose-400 font-bold">+129.5%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#081528] border border-[#16365C] flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <div className="truncate font-mono text-xs">
                          <span className="text-slate-300 font-medium">Duplicate: </span>
                          <span className="text-amber-400 font-bold">94%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#16365C] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Surveillance: Active Rules Engine</span>
                      <span className="text-[#00B87C] font-medium">Continuous Audit</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CORE PRODUCT PIPELINE: THE FIN-SHIELD INVESTIGATION LOOP               */}
        {/* CONNECT -> DETECT -> INVESTIGATE -> EXPLAIN -> ACT -> AUDIT              */}
        {/* ========================================================================= */}
        <section className="relative py-20 border-t border-[#16365C] bg-gradient-to-b from-[#081528] via-[#061120] to-[#081528]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1F3A] border border-[#16365C] text-[#00B87C] text-xs font-mono font-semibold uppercase tracking-widest">
                <Workflow className="h-3.5 w-3.5 text-[#00B87C]" />
                <span>The FinShield Investigation Loop</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                From Fragmented Evidence to Controlled Action
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                FIN-SHIELD connects fragmented financial evidence, determines risk, investigates why the risk exists, explains the evidence using AI, recommends the next action, routes that action through human control, and preserves the audit trail.
              </p>
            </div>

            {/* 6 Step Visual Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
              {/* Step 1: CONNECT */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-[#0EA5E9]/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-[#0EA5E9] border border-[#16365C]">
                      STAGE 01
                    </span>
                    <Database className="h-4 w-4 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    CONNECT
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Invoices, POs, vendors, transactions, budgets
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Data Layer Fusion
                </div>
              </div>

              {/* Step 2: DETECT */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-amber-500/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-amber-400 border border-[#16365C]">
                      STAGE 02
                    </span>
                    <Search className="h-4 w-4 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    DETECT
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Duplicates, anomalies, mismatches, vendor risk
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Deterministic Scoring
                </div>
              </div>

              {/* Step 3: INVESTIGATE */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-[#0EA5E9]/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-[#0EA5E9] border border-[#16365C]">
                      STAGE 03
                    </span>
                    <GitMerge className="h-4 w-4 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    INVESTIGATE
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Connect related financial evidence across systems
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Relational Correlation
                </div>
              </div>

              {/* Step 4: EXPLAIN */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-[#D4AF37] border border-[#16365C]">
                      STAGE 04
                    </span>
                    <Bot className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    EXPLAIN
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Qwen AI explains the evidence and reasoning
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Forensic Synthesis
                </div>
              </div>

              {/* Step 5: ACT */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-[#00B87C]/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-[#00B87C] border border-[#16365C]">
                      STAGE 05
                    </span>
                    <CheckSquare className="h-4 w-4 text-[#00B87C]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    ACT
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Recommend controlled next steps &amp; payment holds
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Human Sign-Off
                </div>
              </div>

              {/* Step 6: AUDIT */}
              <div className="p-5 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] hover:border-[#0EA5E9]/50 transition-all flex flex-col justify-between group relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#061120] text-[#0EA5E9] border border-[#16365C]">
                      STAGE 06
                    </span>
                    <History className="h-4 w-4 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono tracking-wide">
                    AUDIT
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Record the resulting decision and workflow permanently
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#16365C]/80 text-[10px] font-mono text-slate-400">
                  Immutable Record
                </div>
              </div>
            </div>

            {/* Loop Visual Indicator Footer */}
            <div className="mt-8 p-3 rounded-xl bg-[#0B1F3A]/50 border border-[#16365C] flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-slate-300">
              <span className="text-[#0EA5E9] font-bold">CONNECT</span>
              <span className="text-slate-600">→</span>
              <span className="text-amber-400 font-bold">DETECT</span>
              <span className="text-slate-600">→</span>
              <span className="text-[#0EA5E9] font-bold">INVESTIGATE</span>
              <span className="text-slate-600">→</span>
              <span className="text-[#D4AF37] font-bold">EXPLAIN</span>
              <span className="text-slate-600">→</span>
              <span className="text-[#00B87C] font-bold">ACT</span>
              <span className="text-slate-600">→</span>
              <span className="text-[#0EA5E9] font-bold">AUDIT</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. KILLER INVESTIGATION — REAL PRODUCT SCENARIO (INV-28491)                */}
        {/* ========================================================================= */}
        <section className="relative py-20 border-t border-[#16365C] bg-[#061120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1F3A] border border-[#16365C] text-[#00B87C] text-xs font-mono font-semibold uppercase tracking-widest">
                <FileSearch className="h-3.5 w-3.5 text-[#00B87C]" />
                <span>See FinShield Investigate</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Risk Becomes Visible When Financial Evidence Is Connected
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                A single invoice viewed in isolation often passes basic accounting checks. But when FinShield connects the invoice to historical vendor baselines, purchase orders, duplicate records, and budget allocations, the full financial risk becomes undeniable.
              </p>
            </div>

            {/* Real Product Investigation Case Study Box */}
            <div className="rounded-3xl border border-[#16365C] bg-[#0B1F3A]/80 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
              {/* Header Row: Case ID, Vendor, Risk Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#16365C]">
                <div>
                  <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                    <span>LIVE INVESTIGATION SCENARIO</span>
                    <span>•</span>
                    <span className="text-white font-semibold">CASE #INV-28491</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    ABC Supplies Pvt Ltd
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400 uppercase">Deterministic Risk Score</div>
                    <div className="text-xl font-bold font-mono text-rose-400">87 / 100</div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold tracking-wider uppercase">
                    HIGH RISK
                  </span>
                </div>
              </div>

              {/* The Connected Evidence Chain */}
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase tracking-widest text-[#00B87C] font-semibold flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-[#00B87C]" />
                  <span>Connected Financial Evidence Network</span>
                </div>

                {/* 7 Connected Evidence Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
                  {/* Node 1: INVOICE */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-[#16365C] space-y-2 hover:border-[#0EA5E9]/50 transition-colors">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">01 • INVOICE</div>
                    <div className="text-lg font-bold font-sans text-white">₹4,82,000</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      INV-28491 submitted
                    </div>
                  </div>

                  {/* Node 2: PO */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-amber-500/30 space-y-2 hover:border-amber-500/60 transition-colors">
                    <div className="text-[10px] font-mono text-amber-400 uppercase">02 • PURCHASE ORDER</div>
                    <div className="text-lg font-bold font-sans text-white">₹3,20,000</div>
                    <div className="text-[11px] font-mono text-rose-400 font-semibold">
                      Mismatch: ₹1.62L
                    </div>
                  </div>

                  {/* Node 3: VENDOR */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-[#16365C] space-y-2 hover:border-[#0EA5E9]/50 transition-colors">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">03 • VENDOR BASELINE</div>
                    <div className="text-lg font-bold font-sans text-white">₹2,10,000</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Historical 12-mo avg
                    </div>
                  </div>

                  {/* Node 4: TRANSACTION */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-rose-500/30 space-y-2 hover:border-rose-500/60 transition-colors">
                    <div className="text-[10px] font-mono text-rose-400 uppercase">04 • TRANSACTION</div>
                    <div className="text-lg font-bold font-sans text-rose-400">+129.5%</div>
                    <div className="text-[11px] font-mono text-rose-300">
                      Amount deviation
                    </div>
                  </div>

                  {/* Node 5: DUPLICATE */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-amber-500/30 space-y-2 hover:border-amber-500/60 transition-colors">
                    <div className="text-[10px] font-mono text-amber-400 uppercase">05 • DUPLICATE CANDIDATE</div>
                    <div className="text-lg font-bold font-sans text-amber-400">94% Match</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Similar to INV-28177
                    </div>
                  </div>

                  {/* Node 6: BUDGET */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-rose-500/30 space-y-2 hover:border-rose-500/60 transition-colors">
                    <div className="text-[10px] font-mono text-rose-400 uppercase">06 • BUDGET CAP</div>
                    <div className="text-lg font-bold font-sans text-white">₹3.50L Left</div>
                    <div className="text-[11px] font-mono text-rose-400 font-semibold">
                      Exposure: ₹1.32L
                    </div>
                  </div>

                  {/* Node 7: RISK */}
                  <div className="p-4 rounded-xl bg-[#061120] border border-rose-500/50 bg-rose-500/5 space-y-2 hover:border-rose-500 transition-colors">
                    <div className="text-[10px] font-mono text-rose-400 uppercase">07 • RISK ENGINE</div>
                    <div className="text-lg font-bold font-mono text-rose-400">87 / 100</div>
                    <div className="text-[11px] font-mono text-rose-400 font-bold">
                      HIGH RISK ALERT
                    </div>
                  </div>
                </div>

                {/* Connected Flow Arrow Indicator */}
                <div className="p-3 rounded-xl bg-[#061120] border border-[#16365C] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold">INVOICE (₹4.82L)</span>
                    <span>↓</span>
                    <span className="text-amber-400 font-semibold">PO (₹3.20L)</span>
                    <span>↓</span>
                    <span className="text-white font-semibold">VENDOR</span>
                    <span>↓</span>
                    <span className="text-rose-400 font-semibold">TRANSACTION (+129.5%)</span>
                    <span>↓</span>
                    <span className="text-amber-400 font-semibold">DUPLICATE (94%)</span>
                    <span>↓</span>
                    <span className="text-rose-400 font-semibold">BUDGET EXPOSURE</span>
                    <span>↓</span>
                    <span className="text-rose-400 font-bold">RISK (87 HIGH)</span>
                  </div>
                  <div className="text-[#00B87C] font-semibold flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Evidence Fully Corroborated</span>
                  </div>
                </div>
              </div>

              {/* Core Purpose Takeaway Banner */}
              <div className="p-4 rounded-2xl bg-[#081528] border border-[#16365C] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#00B87C]/10 border border-[#00B87C]/30 flex items-center justify-center text-[#00B87C] shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    <span className="text-[#00B87C] font-semibold">Core Principle:</span> Risk becomes visible when financial evidence is connected. FinShield brings all five data sources into one coherent case.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. AI INVESTIGATION SECTION + HYBRID AI MODEL                            */}
        {/* ========================================================================= */}
        <section className="relative py-20 border-t border-[#16365C] bg-[#081528]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Part 1: Explicit AI Investigation Stage (Powered by Qwen) */}
            <div>
              <div className="max-w-3xl mb-12 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1F3A] border border-[#16365C] text-[#D4AF37] text-xs font-mono font-semibold uppercase tracking-widest">
                  <Bot className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Qwen AI Forensic Synthesis</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Four Explicit Investigation Questions
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  The AI investigator does not generate generic narrative. It answers four structured forensic questions grounded in the deterministic evidence collected from your ERP and bank files:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question 1: WHAT HAPPENED? */}
                <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] space-y-3 hover:border-[#0EA5E9]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#0EA5E9] font-bold tracking-wider uppercase">
                      QUESTION 01
                    </span>
                    <Search className="h-4 w-4 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">
                    WHAT HAPPENED?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#061120] p-4 rounded-xl border border-[#16365C]">
                    "Invoice <span className="text-white font-semibold">INV-28491</span> was submitted for <span className="text-white font-semibold">₹4,82,000</span> by <span className="text-white font-semibold">ABC Supplies</span>, exceeding authorized Purchase Order PO-9042 by <span className="text-amber-400 font-semibold">₹1.62L</span> with an off-cycle payment date."
                  </p>
                </div>

                {/* Question 2: WHY IS IT RISKY? */}
                <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] space-y-3 hover:border-rose-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-rose-400 font-bold tracking-wider uppercase">
                      QUESTION 02
                    </span>
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">
                    WHY IS IT RISKY?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#061120] p-4 rounded-xl border border-[#16365C]">
                    "Vendor historical baseline is ₹2,10,000 (<span className="text-rose-400 font-semibold">+129.5% deviation</span>). A duplicate candidate (INV-28177) has <span className="text-amber-400 font-semibold">94% similarity</span>, and remaining departmental budget is exceeded by <span className="text-rose-400 font-semibold">₹1.32L</span>."
                  </p>
                </div>

                {/* Question 3: WHAT EVIDENCE SUPPORTS THE FINDING? */}
                <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] space-y-3 hover:border-[#0EA5E9]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#0EA5E9] font-bold tracking-wider uppercase">
                      QUESTION 03
                    </span>
                    <GitMerge className="h-4 w-4 text-[#0EA5E9]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">
                    WHAT EVIDENCE SUPPORTS THE FINDING?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#061120] p-4 rounded-xl border border-[#16365C]">
                    "Cross-system telemetry: ERP line-item mismatch, vendor ledger variance log, fuzzy text similarity score (94%) on invoice items, and GL budget allocation depletion logs."
                  </p>
                </div>

                {/* Question 4: WHAT SHOULD HAPPEN NEXT? */}
                <div className="p-6 rounded-2xl bg-[#0B1F3A]/90 border border-[#16365C] space-y-3 hover:border-[#00B87C]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00B87C] font-bold tracking-wider uppercase">
                      QUESTION 04
                    </span>
                    <CheckSquare className="h-4 w-4 text-[#00B87C]" />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono">
                    WHAT SHOULD HAPPEN NEXT?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-[#061120] p-4 rounded-xl border border-[#16365C]">
                    "Initiate an immediate <span className="text-[#00B87C] font-semibold">payment hold</span> on INV-28491. Request PO amendment confirmation from procurement, and route for finance controller dual-approval."
                  </p>
                </div>
              </div>
            </div>

            {/* Part 2: Visual Distinction & Hybrid Intelligence Model */}
            <div className="p-8 rounded-3xl border border-[#16365C] bg-[#061120] space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                  Core Technical Differentiator
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Why FinShield Uses Hybrid Intelligence
                </h3>
                <p className="text-sm text-slate-300">
                  We distinguish deterministic calculation from AI interpretation.
                </p>
              </div>

              {/* The Golden Rule Callout */}
              <div className="text-center p-4 rounded-2xl bg-[#0B1F3A] border border-[#00B87C]/40 max-w-xl mx-auto">
                <span className="text-base sm:text-lg font-bold font-mono text-[#00B87C]">
                  "Rules determine risk. AI interprets the evidence."
                </span>
              </div>

              {/* Hybrid Model Visual Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Column 1: DETERMINISTIC ENGINE */}
                <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-rose-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-mono text-slate-400 uppercase">STEP 1 • CALCULATION</div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    DETERMINISTIC RISK ENGINE
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00B87C] shrink-0" />
                      Rules + financial evidence
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00B87C] shrink-0" />
                      Amount standard-deviation checks
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      Produces deterministic score: 87/100
                    </li>
                  </ul>
                </div>

                {/* Column 2: QWEN AI */}
                <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-[#D4AF37]/40 space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#D4AF37]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-mono text-[#D4AF37] uppercase">STEP 2 • INTERPRETATION</div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    QWEN AI INVESTIGATOR
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                      Connects cross-system context
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                      Explains why the risk exists
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                      Recommends next operational action
                    </li>
                  </ul>
                </div>

                {/* Column 3: HUMAN DECISION */}
                <div className="p-5 rounded-2xl bg-[#0B1F3A]/70 border border-[#00B87C]/40 space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-mono text-[#00B87C] uppercase">STEP 3 • CONTROL</div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    HUMAN DECISION WORKFLOW
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00B87C] shrink-0" />
                      Investigator reviews AI case brief
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00B87C] shrink-0" />
                      Approves, holds, or escalates
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00B87C] shrink-0" />
                      Preserves audit trail of decision
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. HUMAN-IN-THE-LOOP CONTROL & ENTERPRO WORKFLOW                          */}
        {/* ========================================================================= */}
        <section className="relative py-20 border-t border-[#16365C] bg-[#061120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1F3A] border border-[#16365C] text-[#00B87C] text-xs font-mono font-semibold uppercase tracking-widest">
                <UserCheck className="h-3.5 w-3.5 text-[#00B87C]" />
                <span>Human-In-The-Loop Control</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                AI-Assisted. Human-Controlled. Fully Auditable.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                AI supports the investigator—it does not get unrestricted authority over financial decisions. Every action flows through verified human review before any controlled operational response occurs.
              </p>
            </div>

            {/* Controlled Workflow Graphic */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {/* Flow Stage 1 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#D4AF37]">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-xs font-mono text-[#D4AF37]">STAGE 01</div>
                <h3 className="text-base font-bold text-white font-mono">AI RECOMMENDATION</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Qwen synthesizes evidence and proposes specific operational action: Place payment hold on INV-28491.
                </p>
              </div>

              {/* Flow Stage 2 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#0EA5E9]">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="text-xs font-mono text-[#0EA5E9]">STAGE 02</div>
                <h3 className="text-base font-bold text-white font-mono">HUMAN REVIEW</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Authorized compliance or finance officer inspects corroborated evidence, PO mismatch, and vendor baseline.
                </p>
              </div>

              {/* Flow Stage 3 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div className="text-xs font-mono text-[#00B87C]">STAGE 03</div>
                <h3 className="text-base font-bold text-white font-mono">APPROVE / HOLD / ESCALATE</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Officer exercises sovereign authority to execute or suspend transaction. Dual-approval required for high risk.
                </p>
              </div>

              {/* Flow Stage 4 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#0EA5E9]">
                  <History className="h-5 w-5" />
                </div>
                <div className="text-xs font-mono text-[#0EA5E9]">STAGE 04</div>
                <h3 className="text-base font-bold text-white font-mono">AUDIT TRAIL</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Decision, timestamp, reason, and officer ID are preserved in the permanent, append-only audit ledger.
                </p>
              </div>
            </div>

            {/* EnterPro Simulation Transparency Banner */}
            <div className="mt-8 p-5 rounded-2xl bg-[#0B1F3A]/50 border border-[#16365C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] shrink-0">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    EnterPro Workflow Simulation
                  </h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Prototype enterprise response workflow demonstrating multi-role approval routing, payment hold toggling, and audit event dispatch.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#061120] text-slate-400 border border-[#16365C] whitespace-nowrap">
                Controlled Simulation Mode
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. PRODUCT SECTION: FOUR MAJOR CAPABILITIES (<section id="product">)     */}
        {/* ========================================================================= */}
        <section id="product" className="relative py-20 border-t border-[#16365C] bg-[#081528]/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                Product Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Four Core Capabilities
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                FinShield delivers an institutional-grade financial risk investigation and decision workflow platform engineered around four primary engines:
              </p>
            </div>

            {/* 4 Primary Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Capability 01 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] hover:border-[#0EA5E9]/50 transition-all space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0EA5E9] bg-[#061120] px-2.5 py-1 rounded border border-[#16365C]">
                    CAPABILITY 01
                  </span>
                  <Database className="h-5 w-5 text-[#0EA5E9]" />
                </div>
                <h3 className="text-base font-bold text-white font-mono pt-1">
                  EVIDENCE FUSION ENGINE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Connects invoices, purchase orders, vendors, ledger transactions, and departmental budgets into a unified relational evidence graph.
                </p>
              </div>

              {/* Capability 02 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] hover:border-[#D4AF37]/50 transition-all space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#061120] px-2.5 py-1 rounded border border-[#16365C]">
                    CAPABILITY 02
                  </span>
                  <Bot className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <h3 className="text-base font-bold text-white font-mono pt-1">
                  AI FINANCIAL INVESTIGATOR
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Explains what happened, why it is risky, and what forensic evidence supports the finding using Qwen AI case synthesis.
                </p>
              </div>

              {/* Capability 03 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] hover:border-[#00B87C]/50 transition-all space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00B87C] bg-[#061120] px-2.5 py-1 rounded border border-[#16365C]">
                    CAPABILITY 03
                  </span>
                  <SlidersHorizontal className="h-5 w-5 text-[#00B87C]" />
                </div>
                <h3 className="text-base font-bold text-white font-mono pt-1">
                  HYBRID RISK ENGINE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Deterministic mathematical scoring (0–100) paired with AI interpretation to eliminate false alerts and black-box opacity.
                </p>
              </div>

              {/* Capability 04 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#16365C] hover:border-[#0EA5E9]/50 transition-all space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0EA5E9] bg-[#061120] px-2.5 py-1 rounded border border-[#16365C]">
                    CAPABILITY 04
                  </span>
                  <Workflow className="h-5 w-5 text-[#0EA5E9]" />
                </div>
                <h3 className="text-base font-bold text-white font-mono pt-1">
                  HUMAN-IN-THE-LOOP CONTROL
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  AI recommendation → human decision → controlled workflow → permanent, append-only audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. SHOW DIFFERENTIATION (TRADITIONAL VS FINSHIELD)                        */}
        {/* ========================================================================= */}
        <section className="relative py-20 border-t border-[#16365C] bg-[#061120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                Platform Differentiation
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                How FinShield Differs From Legacy Tools
              </h2>
              <p className="text-base sm:text-lg text-slate-200 font-medium italic">
                "We don't replace financial systems. We connect their evidence and turn risk signals into controlled decisions."
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Traditional Approach */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1F3A]/40 border border-[#16365C] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#16365C]">
                  <h3 className="text-lg font-bold font-mono text-slate-300">
                    TRADITIONAL APPROACH
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Fragmented &amp; Reactive
                  </span>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-400 font-sans">
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Rule-based alerts:</strong> Simple static thresholds that generate overwhelming false alarms.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Single-source checks:</strong> Invoices inspected in isolation from POs, vendor modifications, or budget limits.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Detection only:</strong> Tells you that an alert fired, but offers no context or root-cause reasoning.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Manual investigation:</strong> Analysts waste days cross-referencing ERP tables, spreadsheets, and emails.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Manual response:</strong> Disconnected phone calls and uncoordinated emails attempt to pause payments.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">✕</span>
                    <div>
                      <strong className="text-slate-300">Scattered records:</strong> No central audit trail of who approved, modified, or overrode transactions.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right: FinShield Approach */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1F3A]/90 border border-[#00B87C]/50 space-y-5 shadow-[0_0_30px_rgba(0,184,124,0.1)]">
                <div className="flex items-center justify-between pb-3 border-b border-[#16365C]">
                  <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
                    <span className="text-[#00B87C]">FIN-SHIELD</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#00B87C]/10 text-[#00B87C] border border-[#00B87C]/30">
                    Connected &amp; Controlled
                  </span>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Rules + AI:</strong> Deterministic rule calculations combined with contextual Qwen AI reasoning.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Multi-source evidence:</strong> Seamlessly fuses invoices, purchase orders, counterparty telemetry, and budget caps.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Detection + investigation:</strong> Not just an alert—an autonomous, deep-dive forensic case folder.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">AI-assisted investigation:</strong> Natural-language briefs explain what happened, why it is risky, and what evidence supports it.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Controlled workflow:</strong> Structured approval, hold, and escalation dispatch with human oversight.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#00B87C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Complete audit trail:</strong> Chronologically sealed records of every signal, review note, and final decision.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. SOLUTIONS SECTION (<section id="solutions">)                            */}
        {/* ========================================================================= */}
        <section id="solutions" className="relative py-20 border-t border-[#16365C] bg-[#081528]/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                Solutions Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Built for Every Financial Team
              </h2>
              <p className="text-sm text-slate-400">
                Tailored surveillance and investigation architecture crafted for distinct institutional risk landscapes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Solution 1: Banks */}
              <Card className="p-6 bg-[#0B1F3A]/80 border-[#16365C] hover:border-[#00B87C]/50 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Banks</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Surveillance for core wire clearing, real-time gross settlement (RTGS/NEFT), and counterparty velocity monitoring.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-[#16365C]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#00B87C] shrink-0" /> High-volume wire screening
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#00B87C] shrink-0" /> Counterparty network analysis
                  </li>
                </ul>
              </Card>

              {/* Solution 2: Fintechs */}
              <Card className="p-6 bg-[#0B1F3A]/80 border-[#16365C] hover:border-[#0EA5E9]/50 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#0EA5E9]">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Fintechs</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rapid-response fraud interception for digital wallets, API rails, merchant payouts, and instant consumer lending.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-[#16365C]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#0EA5E9] shrink-0" /> Sub-second anomaly alerts
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#0EA5E9] shrink-0" /> Automated API hold triggers
                  </li>
                </ul>
              </Card>

              {/* Solution 3: Enterprises */}
              <Card className="p-6 bg-[#0B1F3A]/80 border-[#16365C] hover:border-[#D4AF37]/50 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#D4AF37]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Enterprises</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Internal controls preventing procurement fraud, unauthorized vendor bank switches, duplicate invoicing, and ERP anomalies.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-[#16365C]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#D4AF37] shrink-0" /> Soft duplicate invoice defense
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#D4AF37] shrink-0" /> Dual-signature authorization
                  </li>
                </ul>
              </Card>

              {/* Solution 4: Regulators */}
              <Card className="p-6 bg-[#0B1F3A]/80 border-[#16365C] hover:border-[#00B87C]/50 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Regulators</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Supervisory oversight, forensic data governance, compliance reporting, and reproducible financial examination tools.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-[#16365C]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#00B87C] shrink-0" /> Complete evidence provenance
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[#00B87C] shrink-0" /> Standardized audit packaging
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. SECURITY SECTION (<section id="security">)                            */}
        {/* ========================================================================= */}
        <section id="security" className="relative py-20 border-t border-[#16365C] bg-[#061120] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                Institutional Defense
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Enterprise Security &amp; Compliance Architecture
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                FinShield is engineered from the ground up for zero-trust environments, ensuring confidential financial telemetry remains encrypted, segmented, and fully auditable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Security Pillar 1 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Data Encryption</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographic protection using AES-256 for data at rest and enforced TLS 1.3 encryption across all communication pipelines and client sessions.
                </p>
              </div>

              {/* Security Pillar 2 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#0EA5E9]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Access Control</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict multi-role authorization (RBAC) enforcing granular permissions across executive, audit, finance, and security departments.
                </p>
              </div>

              {/* Security Pillar 3 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#D4AF37]">
                  <FileCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Auditability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Comprehensive, append-only audit logs record every detection trigger, investigation note, and manual release decision for forensic integrity.
                </p>
              </div>

              {/* Security Pillar 4 */}
              <div className="p-6 rounded-2xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[#061120] border border-[#16365C] flex items-center justify-center text-[#00B87C]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Compliance Support</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Designed to support enterprise compliance frameworks, regulatory disclosure standards, and institutional risk management mandates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. ABOUT SECTION (<section id="about">)                                  */}
        {/* ========================================================================= */}
        <section id="about" className="relative py-20 border-t border-[#16365C] bg-[#081528]/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00B87C]">
                  Our Purpose
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Our Mission
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  FinShield was created to shield modern economies from systemic financial risk, procurement fraud, and unauthorized capital disbursement.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                  Traditional financial controls are slow, siloed, and reactive. We empower compliance and finance teams with transparent, explainable AI that illuminates risks in milliseconds—enabling confident, decisive operational intervention before capital leaves the perimeter.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-2">
                  <div className="flex items-center gap-2 text-[#00B87C]">
                    <Lightbulb className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Innovation</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Advancing high-precision machine learning and evidence correlation to stay ahead of sophisticated financial crime patterns.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-2">
                  <div className="flex items-center gap-2 text-[#0EA5E9]">
                    <HeartHandshake className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Integrity</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every algorithmic scoring decision is 100% explainable, traceable, and subject to human oversight with zero black-box obscurity.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-2">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Target className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Impact</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Preventing irreversible monetary losses and securing institutional stability across banks, enterprises, and public treasuries.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#0B1F3A]/70 border border-[#16365C] space-y-2">
                  <div className="flex items-center gap-2 text-[#00B87C]">
                    <Users className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">People</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Augmenting human analysts, finance managers, and investigators rather than replacing them with opaque autonomous systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 12. INSTITUTIONAL VALUE PILLARS (REPLACED UNVERIFIED PERCENTAGES)         */}
        {/* ========================================================================= */}
        <section className="relative py-14 border-t border-b border-[#16365C] bg-[#061120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center pb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00B87C] font-semibold">
                Institutional Principles &amp; Forensic Integrity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {/* Pillar 1 */}
              <div className="p-4 rounded-xl bg-[#0B1F3A]/40 border border-[#16365C] space-y-2">
                <div className="text-base font-bold font-mono text-white tracking-tight">
                  Zero Black-Box Opacity
                </div>
                <div className="text-xs text-slate-400 leading-relaxed font-sans">
                  Every risk score is deterministically computed from verified rule criteria and source evidence.
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-xl bg-[#0B1F3A]/40 border border-[#16365C] space-y-2">
                <div className="text-base font-bold font-mono text-[#0EA5E9] tracking-tight">
                  Multi-Source Fusion
                </div>
                <div className="text-xs text-slate-400 leading-relaxed font-sans">
                  Correlates invoices, purchase orders, vendor telemetry, and general ledger accounts in real time.
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-xl bg-[#0B1F3A]/40 border border-[#16365C] space-y-2">
                <div className="text-base font-bold font-mono text-[#00B87C] tracking-tight">
                  Dual-Custody Governance
                </div>
                <div className="text-xs text-slate-400 leading-relaxed font-sans">
                  Zero autonomous disbursements; all critical operational holds and releases require human approval.
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-xl bg-[#0B1F3A]/40 border border-[#16365C] space-y-2">
                <div className="text-base font-bold font-mono text-[#D4AF37] tracking-tight">
                  Append-Only Audit Trail
                </div>
                <div className="text-xs text-slate-400 leading-relaxed font-sans">
                  Chronological, immutable record of every detection signal, investigator note, and workflow action.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 13. BOTTOM CTA SECTION                                                    */}
        {/* ========================================================================= */}
        <section className="relative py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="rounded-3xl border border-[#16365C] bg-gradient-to-b from-[#0B1F3A] to-[#061120] p-8 sm:p-14 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#00B87C]/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight max-w-xl mx-auto">
              Ready to investigate financial risk with confidence?
            </h2>

            <p className="text-sm text-slate-400 max-w-md mx-auto font-sans">
              Deploy autonomous surveillance, multi-factor evidence correlation, and controlled hold workflows across your enterprise.
            </p>

            <div className="pt-2">
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-[#00B87C] hover:bg-[#009E6A] text-[#061120] font-bold px-8 h-12 shadow-[0_0_25px_rgba(0,184,124,0.4)] cursor-pointer text-sm"
              >
                <span>Start Investigation →</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 14. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-[#16365C] py-8 bg-[#061120] text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FinShieldLogo variant="compact" size="xs" />
            <span className="text-slate-600">|</span>
            <span>Enterprise Financial Investigation Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleStart} className="hover:text-[#00B87C] transition-colors cursor-pointer">
              Sign In
            </button>
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Product
            </a>
            <a
              href="#solutions"
              onClick={(e) => scrollToSection(e, 'solutions')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Solutions
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-[#00B87C] transition-colors"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-[#00B87C] transition-colors"
            >
              About
            </a>
            <span>&copy; {new Date().getFullYear()} FinShield AI.</span>
          </div>
        </div>
      </footer>

      {/* Self-Contained FinShield Demo Modal */}
      <FinShieldDemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </div>
  )
}

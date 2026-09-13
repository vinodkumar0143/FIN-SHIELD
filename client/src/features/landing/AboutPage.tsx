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
  Users
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
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-0 w-[550px] h-[450px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[450px] bg-indigo-950/15 rounded-full blur-[160px]" />
        {/* Subtle dot matrix grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#38BDF8 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* 1. Header / Navigation */}
      <header className="relative z-30 w-full border-b border-slate-800/80 bg-[#030712]/85 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('/')}
            className="cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2.5"
            role="button"
            aria-label="FinShield Home"
          >
            <div className="sm:hidden">
              <FinShieldLogo variant="compact" size="sm" />
            </div>
            <div className="hidden sm:block">
              <FinShieldLogo variant="full" size="sm" />
            </div>
            <span className="text-sm font-mono font-bold tracking-wider text-white">FinShield</span>
          </div>

          {/* Nav Links: Product, Solutions, Security, About (NO Get Started button) */}
          <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-slate-300">
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-cyan-400 transition-colors"
            >
              Product
            </a>
            <a
              href="#solutions"
              onClick={(e) => scrollToSection(e, 'solutions')}
              className="hover:text-cyan-400 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-cyan-400 transition-colors"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-cyan-400 transition-colors"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* 2. Hero Section (Matches Uploaded Reference Image) */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden lg:overflow-visible">
          {/* Bottom Digital Mesh & Data Beacon Landscape (Matching Reference Image) */}
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
              
              {/* Perspective undulating mesh curves */}
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

              {/* Vertical Data Beacons / Pins (Matching reference image) */}
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
              {/* Official Full Brand Lockup & Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-3.5">
                <FinShieldLogo
                  variant="full"
                  size="md"
                  className="shadow-[0_0_24px_rgba(6,182,212,0.25)] border-cyan-500/30"
                />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#081326] border border-cyan-800/70 text-cyan-400 text-[11px] font-mono font-semibold tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                  <span>DETECT. INVESTIGATE. EXPLAIN. RESPOND.</span>
                </div>
              </div>

              {/* Main Heading — Matches exact headline specification */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                AI-Powered <br />
                Financial <span className="text-white">I</span><span className="text-cyan-400">nvestigation.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl font-sans">
                FinShield helps financial teams detect suspicious transactions,
                investigate financial risk with multi-factor evidence and AI, and respond faster with
                controlled, audit-ready workflows.
              </p>

              {/* Hero Action Buttons: [ Start Now → ] and [ ▶ Watch Demo ] beside each other */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold px-7 h-12 rounded-xl shadow-[0_0_24px_rgba(6,182,212,0.45)] cursor-pointer text-sm tracking-wide transition-all flex items-center justify-center"
                >
                  <span>Start Now</span>
                  <ArrowRight className="h-4 w-4 ml-2 text-slate-950" />
                </Button>

                <Button
                  onClick={() => setShowDemoModal(true)}
                  variant="outline"
                  size="lg"
                  className="border-slate-700/80 hover:border-cyan-500/60 bg-[#0A1224]/80 text-slate-100 hover:text-white h-12 px-6 rounded-xl backdrop-blur-md cursor-pointer text-sm font-medium transition-all flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2 text-cyan-400 fill-cyan-400" />
                  <span>Watch Demo</span>
                </Button>
              </div>

              {/* Trust Tagline (Single row on desktop) */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 lg:gap-5 pt-3 text-[11px] sm:text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Enterprise-Grade Security
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Multi-Role Access Control
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" /> Tamper-Evident Audit Logs
                </span>
              </div>
            </div>

            {/* Right Column: High-Fidelity Financial Investigation Cockpit (Matches Reference Image) */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
                transition={shouldReduceMotion ? { duration: 0.5 } : { y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.8 } }}
                className="relative w-full max-w-lg lg:max-w-xl"
              >
                {/* Subtle ambient backdrop lighting */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/10 to-indigo-500/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

                {/* Outer High-Tech Outline Frame */}
                <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-blue-500/30 shadow-[0_0_50px_rgba(6,182,212,0.18)]">
                  {/* Inner Cockpit Glass Panel */}
                  <div className="rounded-[22px] bg-[#070E1E]/95 border border-slate-700/70 p-6 sm:p-7 backdrop-blur-2xl space-y-5 shadow-2xl">
                    
                    {/* Header Row: Status Indicator & HIGH RISK Badge */}
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

                    {/* Transaction Highlight Row: Amount & Circular Risk Score */}
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

                      {/* Circular Risk Score Module */}
                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0C1527] border border-slate-800/90 flex flex-col items-center justify-center shrink-0 shadow-inner">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="21" fill="none" stroke="#1E293B" strokeWidth="4.5" />
                            <circle
                              cx="26"
                              cy="26"
                              r="21"
                              fill="none"
                              stroke="#F43F5E"
                              strokeWidth="4.5"
                              strokeDasharray="132"
                              strokeDashoffset={132 - (132 * 87) / 100}
                              strokeLinecap="round"
                              className="drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]"
                            />
                          </svg>
                          <span className="absolute text-base font-bold font-mono text-white">87</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">87/100</span>
                      </div>
                    </div>

                    {/* Historical Baseline Divergence Graph Row */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Historical Baseline Divergence</span>
                        <span className="text-rose-400 font-bold font-mono text-xs">+129.5%</span>
                      </div>

                      {/* Sunken waveform strip */}
                      <div className="h-14 w-full bg-[#050A14] rounded-xl px-4 border border-slate-800/80 flex items-center relative overflow-hidden">
                        <svg className="w-full h-10 overflow-visible" viewBox="0 0 320 40" preserveAspectRatio="none">
                          <path
                            d="M 10 26 L 140 26 C 180 26, 220 24, 255 18 C 280 13, 295 10, 310 8"
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="310" cy="8" r="4" fill="#F43F5E" className="drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                        </svg>
                      </div>
                    </div>

                    {/* Micro Evidence Pills */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[#091122] border border-slate-800/90 flex items-center gap-2.5">
                        <TrendingUp className="h-4 w-4 text-rose-400 shrink-0" />
                        <div className="truncate font-mono text-xs">
                          <span className="text-slate-300 font-medium">Outlier: </span>
                          <span className="text-rose-400 font-bold">+129.5%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#091122] border border-slate-800/90 flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        <div className="truncate font-mono text-xs">
                          <span className="text-slate-300 font-medium">Duplicate: </span>
                          <span className="text-amber-400 font-bold">88.4%</span>
                        </div>
                      </div>
                    </div>

                    {/* Footnote / Status Strip */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Surveillance: Active Rules Engine</span>
                      <span className="text-cyan-400 font-medium">Continuous Audit</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Core Capabilities Section */}
        <section className="relative py-14 border-t border-slate-800/80 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
                Core Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Four Pillars of Financial Surveillance
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Pillar 1: Detect */}
              <Card className="p-5 bg-[#0F172A]/70 border-slate-800 hover:border-cyan-500/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                  Detect
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identify suspicious financial transactions in real time with continuous algorithmic surveillance.
                </p>
              </Card>

              {/* Pillar 2: Investigate */}
              <Card className="p-5 bg-[#0F172A]/70 border-slate-800 hover:border-cyan-500/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                  <FileSearch className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                  Investigate
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uncover the full financial context, vendor history, and transaction networks with AI-driven correlation.
                </p>
              </Card>

              {/* Pillar 3: Explain */}
              <Card className="p-5 bg-[#0F172A]/70 border-slate-800 hover:border-cyan-500/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                  Explain
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn multi-factor evidence into clear, qualitative, and transparent quantitative risk scores.
                </p>
              </Card>

              {/* Pillar 4: Respond */}
              <Card className="p-5 bg-[#0F172A]/70 border-slate-800 hover:border-cyan-500/40 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 font-sans">
                  Respond
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Execute immediate, controlled financial action through multi-level approval workflows.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 4. Product Section: <section id="product"> */}
        <section id="product" className="relative py-20 border-t border-slate-800/80 bg-[#050B17] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
                Product Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Comprehensive Financial Investigation Capabilities
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                FinShield combines continuous transaction surveillance, behavioral baselines, and explainable AI to protect your organization from disbursements that fail integrity checks.
              </p>
            </div>

            {/* 8 Product Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Capability 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Transaction Monitoring</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time streaming ingestion parses payment instructions, invoice files, and ERP batches with sub-second latency.
                </p>
              </div>

              {/* Capability 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Anomaly Detection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dynamic statistical modeling flags volume surges, amount standard-deviation spikes, and timing divergences against vendor baselines.
                </p>
              </div>

              {/* Capability 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <FileSearch className="h-4 w-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Financial Investigation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomous workspace aggregates historical counterparty telemetry, past payment patterns, and contracts into unified case folders.
                </p>
              </div>

              {/* Capability 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Evidence Correlation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discovers hidden links across soft duplicate invoices, sudden routing number modifications, and missing purchase-order authorizations.
                </p>
              </div>

              {/* Capability 5 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Lightbulb className="h-4 w-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">AI-Assisted Reasoning</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesizes multi-factor telemetry into natural-language briefs explaining precisely why a transaction represents institutional risk.
                </p>
              </div>

              {/* Capability 6 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Target className="h-4 w-4 text-rose-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Risk Scoring</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculates calibrated 0–100 risk composite scores with transparent weight attributions, eliminating black-box opacity.
                </p>
              </div>

              {/* Capability 7 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Controlled Response</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Triggers automated payment holds, dual-custody verification requests, and structured approvals before cash departs accounts.
                </p>
              </div>

              {/* Capability 8 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <History className="h-4 w-4 text-sky-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Auditability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every signal, reasoning step, reviewer comment, and disbursement override is stamped into an immutable audit trail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Solutions Section: <section id="solutions"> */}
        <section id="solutions" className="relative py-20 border-t border-slate-800/80 bg-[#070D1A] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
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
              <Card className="p-6 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Banks</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Surveillance for core wire clearing, real-time gross settlement (RTGS/NEFT), and counterparty velocity monitoring.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" /> High-volume wire screening
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" /> Counterparty network analysis
                  </li>
                </ul>
              </Card>

              {/* Solution 2: Fintechs */}
              <Card className="p-6 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Fintechs</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rapid-response fraud interception for digital wallets, API rails, merchant payouts, and instant consumer lending.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" /> Sub-second anomaly alerts
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" /> Automated API hold triggers
                  </li>
                </ul>
              </Card>

              {/* Solution 3: Enterprises */}
              <Card className="p-6 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-950/70 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Enterprises</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Internal controls preventing procurement fraud, unauthorized vendor bank switches, duplicate invoicing, and ERP anomalies.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0" /> Soft duplicate invoice defense
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0" /> Dual-signature authorization
                  </li>
                </ul>
              </Card>

              {/* Solution 4: Regulators */}
              <Card className="p-6 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-950/70 border border-purple-800/60 flex items-center justify-center text-purple-400">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Regulators</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Supervisory oversight, forensic data governance, compliance reporting, and reproducible financial examination tools.
                  </p>
                </div>
                <ul className="text-[11px] font-mono text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" /> Complete evidence provenance
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-purple-400 shrink-0" /> Standardized audit packaging
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* 6. Security Section: <section id="security"> */}
        <section id="security" className="relative py-20 border-t border-slate-800/80 bg-[#040813] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
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
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Data Encryption</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographic protection using AES-256 for data at rest and enforced TLS 1.3 encryption across all communication pipelines and client sessions.
                </p>
              </div>

              {/* Security Pillar 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="h-9 w-9 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Access Control</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict multi-role authorization (RBAC) enforcing granular permissions across executive, audit, finance, and security departments.
                </p>
              </div>

              {/* Security Pillar 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <FileCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Auditability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Comprehensive, tamper-evident audit logs record every detection trigger, investigation note, and manual release decision for forensic integrity.
                </p>
              </div>

              {/* Security Pillar 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="h-9 w-9 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
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

        {/* 7. About Section: <section id="about"> */}
        <section id="about" className="relative py-20 border-t border-slate-800/80 bg-[#060C1B] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Mission Narrative */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-cyan-400">
                  Our Purpose
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Our Mission
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  FinShield was created to shield modern economies from systemic financial risk, procurement fraud, and unauthorized capital disbursement.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Traditional financial controls are slow, siloed, and reactive. We empower compliance and finance teams with transparent, explainable AI that illuminates risks in milliseconds—enabling confident, decisive operational intervention before capital leaves the perimeter.
                </p>
              </div>

              {/* Right Column: 4 Core Values */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Lightbulb className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Innovation</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Advancing high-precision machine learning and evidence correlation to stay ahead of sophisticated financial crime patterns.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <HeartHandshake className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Integrity</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every algorithmic scoring decision is 100% explainable, traceable, and subject to human oversight with zero black-box obscurity.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Target className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-white">Impact</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Preventing irreversible monetary losses and securing institutional stability across banks, enterprises, and public treasuries.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
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

        {/* 8. Operational Focus & Impact (Metrics Strip) */}
        <section className="relative py-14 border-t border-b border-slate-800/80 bg-[#070B14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center pb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Operational Focus &amp; Impact
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {/* Metric 1 */}
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  99.7%
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Detection Accuracy
                </div>
              </div>

              {/* Metric 2 */}
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  60%
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Faster Investigations
                </div>
              </div>

              {/* Metric 3 */}
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  4×
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Operational Efficiency
                </div>
              </div>

              {/* Metric 4 */}
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                  24/7
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Continuous Surveillance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Bottom CTA Section */}
        <section className="relative py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0F172A]/90 to-[#070B14] p-8 sm:p-14 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight max-w-xl mx-auto">
              Ready to investigate financial risk with confidence?
            </h2>

            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Deploy autonomous surveillance, multi-factor evidence correlation, and controlled hold workflows across your enterprise.
            </p>

            <div className="pt-2">
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 h-12 shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer text-sm"
              >
                <span>Start FinShield →</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 bg-[#030712] text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FinShieldLogo variant="full" size="xs" />
            <span className="text-slate-600">|</span>
            <span>Enterprise Financial Investigation Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleStart} className="hover:text-cyan-400 transition-colors cursor-pointer">
              Sign In
            </button>
            <a
              href="#product"
              onClick={(e) => scrollToSection(e, 'product')}
              className="hover:text-cyan-400 transition-colors"
            >
              Product
            </a>
            <a
              href="#solutions"
              onClick={(e) => scrollToSection(e, 'solutions')}
              className="hover:text-cyan-400 transition-colors"
            >
              Solutions
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-cyan-400 transition-colors"
            >
              Security
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-cyan-400 transition-colors"
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

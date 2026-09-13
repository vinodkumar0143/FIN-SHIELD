import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

export interface SplashScreenProps {
  onNavigate: (path: string) => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/dashboard')
    }
  }, [isAuthenticated, onNavigate])

  // Progress animation & auto-transition
  useEffect(() => {
    if (shouldReduceMotion) {
      const timer = setTimeout(() => {
        onNavigate('/about')
      }, 500)
      return () => clearTimeout(timer)
    }

    const startTime = Date.now()
    const totalDuration = 3200 // 3.2 seconds total sequence

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          onNavigate('/about')
        }, 150)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [onNavigate, shouldReduceMotion])

  const handleSkip = () => {
    onNavigate('/about')
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 select-none overflow-hidden"
      role="region"
      aria-label="FinShield Introduction"
    >
      {/* 1. Ambient Background Glows & Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle radial cyan glow behind center logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-950/20 rounded-full blur-[140px]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-950/15 rounded-full blur-[160px]" />

        {/* Ambient star points */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #38BDF8, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 120px, #94A3B8, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 160px 70px, #06B6D4, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 240px 190px, #60A5FA, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 320px 90px, #CBD5E1, rgba(0,0,0,0))`,
            backgroundSize: '360px 360px'
          }}
        />

        {/* 2. Curved Digital Globe Wireframe Horizon at Lower Half (as in reference image) */}
        <div className="absolute bottom-[-180px] left-1/2 -translate-x-1/2 w-[1100px] h-[580px] rounded-[100%] border border-cyan-500/25 bg-gradient-to-t from-cyan-950/30 to-transparent pointer-events-none shadow-[0_0_80px_rgba(6,182,212,0.18)_inset]">
          {/* Wireframe latitude arcs */}
          <div className="absolute inset-x-8 top-8 bottom-0 rounded-[100%] border-t border-cyan-400/20" />
          <div className="absolute inset-x-20 top-20 bottom-0 rounded-[100%] border-t border-cyan-400/15" />
          <div className="absolute inset-x-36 top-36 bottom-0 rounded-[100%] border-t border-cyan-400/10" />

          {/* Longitude vertical meridian arcs */}
          <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 1100 580" fill="none">
            <ellipse cx="550" cy="290" rx="480" ry="240" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="4 6" />
            <ellipse cx="550" cy="290" rx="360" ry="240" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="3 5" />
            <ellipse cx="550" cy="290" rx="200" ry="240" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="550" y1="50" x2="550" y2="530" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
            {/* Pulsing data points along globe horizon */}
            <circle cx="340" cy="180" r="3" fill="#38BDF8" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="550" cy="65" r="4" fill="#06B6D4" />
            <circle cx="760" cy="180" r="3" fill="#38BDF8" className="animate-ping" style={{ animationDuration: '4s' }} />
          </svg>
        </div>
      </div>

      {/* Top Header Controls: Subtle Skip Action */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20">
        <button
          onClick={handleSkip}
          type="button"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Skip introduction to product page"
        >
          <span>Skip intro</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-slate-500 group-hover:text-cyan-400" />
        </button>
      </div>

      {/* Center Branding Showcase */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-6">
        {/* Animated Brand Showcase: FULL BRAND LOCKUP */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Subtle logo back-glow */}
          <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-3xl scale-125 pointer-events-none" />
          <FinShieldLogo variant="full" size="xl" className="relative z-10 shadow-[0_0_40px_rgba(6,182,212,0.3)] border-cyan-500/30" />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="space-y-1.5"
        >
          <p className="text-xs sm:text-sm font-mono tracking-[0.24em] uppercase text-slate-400 font-semibold max-w-md mx-auto">
            Autonomous Financial Risk &amp; Operations Intelligence
          </p>
        </motion.div>

        {/* Sleek Progress Bar & Status Text */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="pt-8 w-full max-w-xs sm:max-w-sm space-y-3 flex flex-col items-center"
        >
          {/* Progress Track */}
          <div className="w-full h-1 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800/80 p-[0.5px]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-300 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.7)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Institutional Status Text */}
          <span className="text-[11px] font-mono tracking-wider text-slate-400/90 font-medium">
            Securing a safer financial tomorrow...
          </span>
        </motion.div>
      </div>
    </div>
  )
}

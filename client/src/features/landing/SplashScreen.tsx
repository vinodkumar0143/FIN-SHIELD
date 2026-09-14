import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FinShieldLogo } from '@/components/ui/FinShieldLogo'
import { FinancialGlobe } from './FinancialGlobe'
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
      className="relative min-h-screen w-full bg-[#061120] text-[#F7F9FC] flex flex-col justify-between items-center p-4 sm:p-6 select-none overflow-hidden"
      role="region"
      aria-label="FinShield Introduction"
    >
      {/* 1. Ambient Background Glows & Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Subtle radial navy glow behind upper branding */}
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#0B1F3A]/50 rounded-full blur-[140px]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0EA5E9]/10 rounded-full blur-[160px]" />

        {/* Ambient star points */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #0EA5E9, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 120px, #94A3B8, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 160px 70px, #00B87C, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 240px 190px, #0EA5E9, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 320px 90px, #CBD5E1, rgba(0,0,0,0))`,
            backgroundSize: '360px 360px'
          }}
        />
      </div>

      {/* Top Header Controls: Subtle Skip Action */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-10 z-20">
        <button
          onClick={handleSkip}
          type="button"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-[#00B87C] hover:bg-[#0B1F3A]/80 border border-[#16365C] hover:border-[#00B87C]/50 transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Skip introduction to product page"
        >
          <span>Skip intro</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform text-slate-500 group-hover:text-[#00B87C]" />
        </button>
      </div>

      {/* 2. Protected Upper Content Layer (Clear visual priority) */}
      <div className="relative z-10 w-full max-w-xl mx-auto pt-6 sm:pt-10 md:pt-14 flex flex-col items-center text-center space-y-4 sm:space-y-6">
        {/* Animated Brand Showcase: COMPACT LOGO MARK */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center gap-3 sm:gap-4"
        >
          {/* Subtle logo back-glow */}
          <div className="absolute inset-0 bg-[#00B87C]/15 rounded-full blur-3xl scale-125 pointer-events-none" />
          <FinShieldLogo variant="compact" size="xl" className="relative z-10" />
          <span className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-white relative z-10">
            FinShield
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="space-y-1.5 px-2"
        >
          <p className="text-xs sm:text-sm font-mono tracking-[0.22em] uppercase text-slate-400 font-semibold max-w-md mx-auto">
            Autonomous Financial Risk &amp; Operations Intelligence
          </p>
        </motion.div>

        {/* Sleek Progress Bar & Status Text */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="pt-4 sm:pt-6 w-full max-w-xs sm:max-w-sm space-y-3 flex flex-col items-center"
        >
          {/* Progress Track */}
          <div className="w-full h-1 bg-[#071322] rounded-full overflow-hidden border border-[#16365C] p-[0.5px]">
            <div
              className="h-full bg-gradient-to-r from-[#0B1F3A] via-[#0EA5E9] to-[#00B87C] rounded-full shadow-[0_0_12px_rgba(0,184,124,0.6)] transition-all duration-75 ease-out"
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

      {/* 3. Dedicated Lower Globe Layer (Occupies lower ~38-45% of viewport, naturally cropped at bottom) */}
      <div className="absolute inset-x-0 bottom-0 h-[38vh] sm:h-[42vh] md:h-[45vh] pointer-events-none z-0 overflow-hidden flex items-end justify-center">
        <FinancialGlobe reducedMotion={Boolean(shouldReduceMotion)} />
      </div>
    </div>
  )
}

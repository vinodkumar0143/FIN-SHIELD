import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical'

export function getRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 30) return 'MEDIUM'
  return 'LOW'
}

export function getRiskTheme(levelOrScore: RiskLevel | number) {
  const rawLevel = typeof levelOrScore === 'number' ? getRiskLevelFromScore(levelOrScore) : levelOrScore
  const level = String(rawLevel).toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  switch (level) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL BREACH',
        level: 'CRITICAL',
        color: '#EF4444',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/35',
        badge: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
        ring: 'stroke-rose-500',
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
      }
    case 'HIGH':
      return {
        label: 'HIGH ELEVATION',
        level: 'HIGH',
        color: '#F97316',
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/35',
        badge: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
        ring: 'stroke-orange-500',
        dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
      }
    case 'MEDIUM':
      return {
        label: 'MEDIUM CAUTION',
        level: 'MEDIUM',
        color: '#F59E0B',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/35',
        badge: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        ring: 'stroke-amber-500',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      }
    case 'LOW':
    default:
      return {
        label: 'LOW / CLEAR',
        level: 'LOW',
        color: '#10B981',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/35',
        badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        ring: 'stroke-emerald-500',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      }
  }
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const sign = includeSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical'

export function getRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 85) return 'CRITICAL'
  if (score >= 70) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

export function getRiskTheme(levelOrScore: RiskLevel | number) {
  const rawLevel = typeof levelOrScore === 'number' ? getRiskLevelFromScore(levelOrScore) : levelOrScore
  const level = String(rawLevel).toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  switch (level) {
    case 'CRITICAL':
      return {
        label: 'CRITICAL RISK',
        level: 'CRITICAL',
        color: '#EF4444',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        ring: 'stroke-rose-500',
        dot: 'bg-rose-500',
      }
    case 'HIGH':
      return {
        label: 'HIGH RISK',
        level: 'HIGH',
        color: '#EF4444',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        ring: 'stroke-rose-500',
        dot: 'bg-rose-500',
      }
    case 'MEDIUM':
      return {
        label: 'MEDIUM RISK',
        level: 'MEDIUM',
        color: '#F59E0B',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        ring: 'stroke-amber-500',
        dot: 'bg-amber-500',
      }
    case 'LOW':
    default:
      return {
        label: 'LOW RISK',
        level: 'LOW',
        color: '#10B981',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        ring: 'stroke-emerald-500',
        dot: 'bg-emerald-500',
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

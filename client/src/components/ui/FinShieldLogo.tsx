import React from 'react'
import { cn } from '@/lib/utils'

export type LogoVariant = 'compact' | 'full'

export interface FinShieldLogoProps {
  variant?: LogoVariant
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  showWordmark?: boolean
  wordmarkClassName?: string
  className?: string
  imgClassName?: string
  alt?: string
  onClick?: () => void
  animated?: boolean
}

const COMPACT_IMG = '/logos/finshield-compact.png'
const FULL_IMG = '/logos/finshield-full.png'

export const FinShieldLogo: React.FC<FinShieldLogoProps> = ({
  variant,
  size = 'md',
  showWordmark,
  wordmarkClassName: _wordmarkClassName,
  className,
  imgClassName,
  alt = 'FinShield',
  onClick,
}) => {
  // Determine variant: explicit variant prop takes priority; fallback to showWordmark flag if present
  const resolvedVariant: LogoVariant = variant
    ? variant
    : showWordmark === false
    ? 'compact'
    : 'full'

  const compactSizeMap: Record<string, { box: string; img: string }> = {
    xs: { box: 'w-6 h-6 rounded-md', img: 'w-6 h-6' },
    sm: { box: 'w-8 h-8 rounded-lg', img: 'w-8 h-8' },
    md: { box: 'w-11 h-11 rounded-xl', img: 'w-11 h-11' },
    lg: { box: 'w-16 h-16 rounded-2xl', img: 'w-16 h-16' },
    xl: { box: 'w-24 h-24 rounded-3xl', img: 'w-24 h-24' },
  }

  const fullSizeMap: Record<string, { box: string; img: string }> = {
    xs: { box: 'h-8 w-8 rounded-lg', img: 'h-8 w-8' },
    sm: { box: 'h-10 w-10 rounded-xl', img: 'h-10 w-10' },
    md: { box: 'h-16 w-16 rounded-xl', img: 'h-16 w-16' },
    lg: { box: 'h-24 w-24 sm:h-28 sm:w-28 rounded-2xl', img: 'h-24 w-24 sm:h-28 sm:w-28' },
    xl: { box: 'h-48 w-48 sm:h-64 sm:w-64 rounded-3xl', img: 'h-48 w-48 sm:h-64 sm:w-64' },
  }

  const isNumeric = typeof size === 'number'
  const src = resolvedVariant === 'compact' ? COMPACT_IMG : FULL_IMG

  if (isNumeric) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center shrink-0 bg-white shadow-md border border-slate-700/60 p-1 overflow-hidden select-none',
          resolvedVariant === 'compact' ? 'rounded-xl' : 'rounded-2xl',
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full object-contain', imgClassName)}
          loading="eager"
        />
      </div>
    )
  }

  const currentMap = resolvedVariant === 'compact'
    ? (compactSizeMap[size] || compactSizeMap.md)
    : (fullSizeMap[size] || fullSizeMap.md)

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center shrink-0 bg-white shadow-md border border-slate-700/60 overflow-hidden select-none',
        currentMap.box,
        resolvedVariant === 'compact' ? 'p-0.5' : 'p-1',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn(currentMap.img, 'object-contain', imgClassName)}
        loading="eager"
      />
    </div>
  )
}

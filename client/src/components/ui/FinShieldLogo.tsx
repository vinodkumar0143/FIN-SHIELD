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

export const FinShieldLogo: React.FC<FinShieldLogoProps> = ({
  variant: _variant,
  size = 'md',
  showWordmark: _showWordmark,
  wordmarkClassName: _wordmarkClassName,
  className,
  imgClassName,
  alt = 'FinShield',
  onClick,
}) => {
  const sizeMap: Record<string, { box: string; img: string }> = {
    xs: { box: 'w-6 h-6', img: 'w-6 h-6' },
    sm: { box: 'w-8 h-8', img: 'w-8 h-8' },
    md: { box: 'w-10 h-10', img: 'w-10 h-10' },
    lg: { box: 'w-14 h-14', img: 'w-14 h-14' },
    xl: { box: 'w-24 h-24 sm:w-28 sm:h-28', img: 'w-24 h-24 sm:w-28 sm:h-28' },
  }

  const isNumeric = typeof size === 'number'

  if (isNumeric) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center shrink-0 bg-transparent select-none',
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={COMPACT_IMG}
          alt={alt}
          className={cn(
            'w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(11,31,58,0.5)]',
            imgClassName
          )}
          loading="eager"
        />
      </div>
    )
  }

  const currentMap = sizeMap[size] || sizeMap.md

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center shrink-0 bg-transparent select-none',
        currentMap.box,
        className
      )}
    >
      <img
        src={COMPACT_IMG}
        alt={alt}
        className={cn(
          currentMap.img,
          'object-contain filter drop-shadow-[0_2px_12px_rgba(11,31,58,0.5)]',
          imgClassName
        )}
        loading="eager"
      />
    </div>
  )
}

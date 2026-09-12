import React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'

export interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

/**
 * Smooth, subtle page transition wrapper.
 * Respects system prefers-reduced-motion to avoid vestibular triggers.
 */
export const PageTransition: React.FC<AnimatedContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Standard card/panel fade in.
 */
export const FadeIn: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0,
  duration = 0.2,
  className = '',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered container for lists of cards/metrics
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}> = ({ children, className = '', staggerDelay = 0.04 }) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child item inside StaggerContainer
 */
export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

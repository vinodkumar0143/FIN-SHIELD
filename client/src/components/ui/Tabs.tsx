import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  activeTab: string
  setActiveTab: (val: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue)
  const activeTab = value !== undefined ? value : internalTab

  const setActiveTab = (val: string) => {
    if (value === undefined) {
      setInternalTab(val)
    }
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'inline-flex items-center gap-1 rounded bg-[#111827] border border-[#1E293B] p-1 text-slate-400',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = ctx.activeTab === value

  return (
    <button
      type="button"
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        'px-3 py-1.5 rounded text-xs font-medium transition-all select-none',
        isActive
          ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm border border-slate-700/60'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')

  if (ctx.activeTab !== value) return null

  return (
    <div className={cn('mt-4 animate-in fade-in-50 duration-200', className)} {...props}>
      {children}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Search, ArrowRight, ShieldAlert, FileText, Building2, Workflow, Bot, X } from 'lucide-react'

export interface CommandItem {
  id: string
  title: string
  category: 'Navigation' | 'Invoices' | 'Vendors' | 'AI Operations' | 'Workflows'
  shortcut?: string
  action: () => void
  icon?: React.ReactNode
}

export interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectRoute?: (path: string) => void
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  open,
  onOpenChange,
  onSelectRoute,
}) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  const defaultCommands: CommandItem[] = [
    {
      id: 'inv-high-risk',
      title: 'Show High-Risk Flagged Invoices',
      category: 'Invoices',
      shortcut: 'G I',
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
      action: () => {
        onSelectRoute?.('/invoices')
        onOpenChange(false)
      },
    },
    {
      id: 'inv-hero',
      title: 'Investigate Invoice INV-28491 (ABC Supplies • ₹4,82,000)',
      category: 'AI Operations',
      shortcut: 'AI',
      icon: <Bot className="h-4 w-4 text-cyan-400" />,
      action: () => {
        onSelectRoute?.('/investigations')
        onOpenChange(false)
      },
    },
    {
      id: 'wf-holds',
      title: 'Active Payment Holds Queue (3 Pending)',
      category: 'Workflows',
      shortcut: 'G W',
      icon: <Workflow className="h-4 w-4 text-amber-400" />,
      action: () => {
        onSelectRoute?.('/workflows')
        onOpenChange(false)
      },
    },
    {
      id: 'vendors-risk',
      title: 'Vendor Risk Profiles & Bank Hash Registry',
      category: 'Vendors',
      shortcut: 'G V',
      icon: <Building2 className="h-4 w-4 text-indigo-400" />,
      action: () => {
        onSelectRoute?.('/vendors')
        onOpenChange(false)
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Go to Executive Risk Dashboard',
      category: 'Navigation',
      shortcut: 'G D',
      icon: <FileText className="h-4 w-4 text-slate-400" />,
      action: () => {
        onSelectRoute?.('/dashboard')
        onOpenChange(false)
      },
    },
  ]

  const filteredCommands = query
    ? defaultCommands.filter((cmd) =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : defaultCommands

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0F19]/85 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Floating Command Palette (Level 3 Elevation) */}
      <div className="relative w-full max-w-xl rounded-lg bg-[#111827] border border-cyan-500/40 shadow-command overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1E293B]">
          <Search className="h-4 w-4 text-cyan-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search risk alerts, vendors, transaction hashes, or prompt AI... (Esc to exit)"
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 select-none">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No matching commands or entities found for &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-slate-800/70 hover:border-slate-700 cursor-pointer group transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:text-cyan-400 transition-colors">
                    {cmd.icon}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {cmd.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {cmd.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cmd.shortcut && (
                    <span className="px-1.5 py-0.5 rounded bg-[#0B0F19] border border-slate-800 text-[10px] font-mono text-slate-400">
                      {cmd.shortcut}
                    </span>
                  )}
                  <ArrowRight className="h-3 w-3 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-[#1E293B] bg-[#0B0F19] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Navigate: ↑↓ • Execute: Enter</span>
          <span className="text-cyan-400/80">FIN-SHIELD Spotlight v4.2</span>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import {
  Search,
  ArrowRight,
  ShieldAlert,
  FileText,
  Building2,
  Bot,
  X,
  Lock,
  Receipt,
  History,
  CheckSquare
} from 'lucide-react'

export interface CommandItem {
  id: string
  title: string
  category: 'Investigations' | 'Invoices' | 'Vendors' | 'Workflows' | 'Discovery' | 'Navigation'
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
      id: 'inv-hero',
      title: 'Investigate Hero Case: Invoice INV-28491 (ABC Supplies • ₹4,82,000)',
      category: 'Investigations',
      shortcut: 'AI',
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
      action: () => {
        onSelectRoute?.('/investigations')
        onOpenChange(false)
      },
    },
    {
      id: 'inv-invoices',
      title: 'Invoices Ledger & Ingestion Queue',
      category: 'Invoices',
      shortcut: 'G I',
      icon: <Receipt className="h-4 w-4 text-brand-cyan" />,
      action: () => {
        onSelectRoute?.('/invoices')
        onOpenChange(false)
      },
    },
    {
      id: 'wf-approvals',
      title: 'Approvals Queue (9 Pending Authorization)',
      category: 'Workflows',
      shortcut: 'G A',
      icon: <CheckSquare className="h-4 w-4 text-amber-400" />,
      action: () => {
        onSelectRoute?.('/approvals')
        onOpenChange(false)
      },
    },
    {
      id: 'wf-holds',
      title: 'Active Payment Holds & Escrow Freezes',
      category: 'Workflows',
      shortcut: 'G H',
      icon: <Lock className="h-4 w-4 text-amber-400" />,
      action: () => {
        onSelectRoute?.('/holds')
        onOpenChange(false)
      },
    },
    {
      id: 'vendors-risk',
      title: 'Vendors Risk Profiles & Registry',
      category: 'Vendors',
      shortcut: 'G V',
      icon: <Building2 className="h-4 w-4 text-slate-300" />,
      action: () => {
        onSelectRoute?.('/vendors')
        onOpenChange(false)
      },
    },
    {
      id: 'disc-assistant',
      title: 'Ask FinShield AI Financial Copilot',
      category: 'Discovery',
      shortcut: 'AI ?',
      icon: <Bot className="h-4 w-4 text-brand-cyan" />,
      action: () => {
        onSelectRoute?.('/assistant')
        onOpenChange(false)
      },
    },
    {
      id: 'nav-dashboard',
      title: 'Command Center Overview',
      category: 'Navigation',
      shortcut: 'G D',
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      action: () => {
        onSelectRoute?.('/dashboard')
        onOpenChange(false)
      },
    },
    {
      id: 'sys-audit',
      title: 'Audit Trail & Compliance Records',
      category: 'Navigation',
      shortcut: 'G L',
      icon: <History className="h-4 w-4 text-muted-foreground" />,
      action: () => {
        onSelectRoute?.('/audit')
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Floating Command Palette */}
      <div className="relative w-full max-w-xl rounded-xl bg-surface border border-border shadow-command overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface-subtle">
          <Search className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search financial records, invoices, vendors, workflows... (Esc to exit)"
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground p-1 mr-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border text-[10px] font-mono text-muted-foreground select-none">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground font-mono">
              No matching commands or entities found for &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-elevated cursor-pointer group transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="p-1.5 rounded-lg bg-surface-subtle border border-border/80 text-muted-foreground group-hover:text-brand-cyan transition-colors flex-shrink-0">
                    {cmd.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground group-hover:text-slate-100 transition-colors truncate">
                      {cmd.title}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {cmd.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {cmd.shortcut && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-[10px] font-mono text-muted-foreground">
                      {cmd.shortcut}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-brand-cyan transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Guidance */}
        <div className="px-4 py-2.5 border-t border-border bg-surface-subtle flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>Navigate: ↑↓ • Open: ↵ • Exit: Esc</span>
          <span className="text-muted-foreground/70">FINSHIELD Spotlight</span>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Building2,
  PieChart,
  ShieldAlert
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import {
  SUGGESTED_SEARCHES,
  SEARCH_RESULTS_BY_QUERY,
  type SearchResultItem
} from './data/searchMockData'

interface SearchPageProps {
  onNavigate: (path: string) => void
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('Show invoices above ₹5 lakh with high risk')
  const [results, setResults] = useState<SearchResultItem[]>(
    SEARCH_RESULTS_BY_QUERY['Show invoices above ₹5 lakh with high risk']
  )

  const handleExecuteSearch = (searchStr: string) => {
    const q = searchStr.trim()
    if (!q) return
    setActiveQuery(q)
    setQuery(q)

    if (SEARCH_RESULTS_BY_QUERY[q]) {
      setResults(SEARCH_RESULTS_BY_QUERY[q])
    } else {
      // Fuzzy search across all items
      const allItems = Object.values(SEARCH_RESULTS_BY_QUERY).flat()
      const lower = q.toLowerCase()
      const matched = allItems.filter(item =>
        item.title.toLowerCase().includes(lower) ||
        item.subtitle.toLowerCase().includes(lower) ||
        item.highlights.some(h => h.toLowerCase().includes(lower))
      )
      setResults(matched.length > 0 ? matched : SEARCH_RESULTS_BY_QUERY['Show invoices above ₹5 lakh with high risk'])
    }
  }

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'INVOICE': return <FileText className="w-4 h-4 text-cyan-400" />
      case 'VENDOR': return <Building2 className="w-4 h-4 text-cyan-400" />
      case 'BUDGET': return <PieChart className="w-4 h-4 text-cyan-400" />
      default: return <ShieldAlert className="w-4 h-4 text-cyan-400" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            NATURAL LANGUAGE QUERY
          </span>
          <span className="text-xs text-muted-foreground">Universal Semantic Search</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Intelligence Search</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask questions in natural English across invoices, counterparties, banking modifications, and departmental ledgers.
        </p>
      </div>

      {/* Big Search Bar */}
      <Card className="p-3 bg-card/80 border-cyan-700/50 shadow-xl ring-1 ring-cyan-500/20">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />
          <input
            type="text"
            placeholder="Ask anything about your financial data (e.g. 'Show invoices above ₹5 lakh with high risk')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleExecuteSearch(query)
            }}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            variant="default"
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs px-4"
            onClick={() => handleExecuteSearch(query)}
          >
            Search
          </Button>
        </div>
      </Card>

      {/* Suggested & Recent Searches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground font-medium">Suggested queries:</span>
          {SUGGESTED_SEARCHES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteSearch(s)}
              className="px-2.5 py-1 rounded bg-secondary/50 hover:bg-cyan-950/40 text-muted-foreground hover:text-cyan-300 border border-border/60 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Summary */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
        <span className="text-muted-foreground">
          Showing results for: <strong className="text-foreground font-medium">"{activeQuery}"</strong>
        </span>
        <Badge variant="neutral" size="sm">{results.length} Matches Found</Badge>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map(item => (
          <Card
            key={item.id}
            onClick={() => onNavigate(item.route)}
            className="p-4 bg-card/60 border-border/70 hover:border-cyan-500/40 hover:bg-card/90 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-secondary/60 flex items-center justify-center shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    {item.title}
                    <Badge variant="neutral" size="sm">{item.badgeText}</Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {item.amount && (
                  <span className="font-mono font-bold text-foreground text-sm">
                    {formatCurrency(item.amount)}
                  </span>
                )}
                {item.riskScore && item.severity && (
                  <RiskBadge level={item.severity} score={item.riskScore} size="sm" />
                )}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>

            {/* Highlights Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 font-mono text-[11px] text-muted-foreground">
              {item.highlights.map((h, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-secondary/40 border border-border/30">
                  {h}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

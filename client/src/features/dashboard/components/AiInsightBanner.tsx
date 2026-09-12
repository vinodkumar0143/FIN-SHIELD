import React from 'react'
import { AI_FEATURED_INSIGHT } from '../mockData'
import { Bot, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const AiInsightBanner: React.FC<{ onInspectInvestigation: (id: string) => void }> = ({
  onInspectInvestigation,
}) => {
  return (
    <div className="rounded-lg border border-indigo-500/40 bg-gradient-to-r from-[#14182E] via-[#111827] to-[#121626] p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wide">
                {AI_FEATURED_INSIGHT.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  Qwen LLM Neural Verification
                </span>
                <span>• Confidence: {AI_FEATURED_INSIGHT.confidenceScore}%</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed max-w-4xl">
            {AI_FEATURED_INSIGHT.summary}
          </p>

          <div className="p-2.5 rounded bg-[#0B0F19]/90 border border-indigo-500/30 flex items-start gap-2 max-w-3xl">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                Autonomous Action Prescribed:{' '}
              </span>
              <span className="text-slate-200 font-semibold">
                {AI_FEATURED_INSIGHT.recommendation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-center gap-2 flex-shrink-0">
          <Button
            variant="primary"
            onClick={() => onInspectInvestigation(AI_FEATURED_INSIGHT.targetInvoiceId)}
            rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Investigate Hero INV-28491
          </Button>
          <span className="text-[10px] font-mono text-slate-500 text-center md:text-right">
            Disbursement frozen via EnterPro #WF-9042
          </span>
        </div>
      </div>
    </div>
  )
}

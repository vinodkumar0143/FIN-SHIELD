import { useState } from 'react'
import {
  Sparkles,
  Send,
  Bot,
  User,
  ExternalLink,
  RefreshCw,
  HelpCircle
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  INITIAL_CHAT_MESSAGES,
  SUGGESTED_PROMPTS,
  CANNED_RESPONSES,
  type ChatMessage
} from './data/assistantMockData'
import { toast } from 'sonner'

interface AssistantPageProps {
  onNavigate: (path: string) => void
}

export function AssistantPage({ onNavigate }: AssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim()
    if (!query) return

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI synthesis
    setTimeout(() => {
      let matchedResponse = CANNED_RESPONSES[query]
      if (!matchedResponse) {
        // Fallback matching
        const lower = query.toLowerCase()
        if (lower.includes('28491') || lower.includes('abc')) {
          matchedResponse = CANNED_RESPONSES['Why is INV-28491 risky?']
        } else if (lower.includes('vendor')) {
          matchedResponse = CANNED_RESPONSES['Which vendors are high risk?']
        } else if (lower.includes('invoice') || lower.includes('critical')) {
          matchedResponse = CANNED_RESPONSES['Show critical invoices']
        } else if (lower.includes('budget')) {
          matchedResponse = CANNED_RESPONSES['Which budgets are close to being exceeded?']
        } else if (lower.includes('hold')) {
          matchedResponse = CANNED_RESPONSES['Which payments are on hold?']
        } else {
          matchedResponse = {
            content: `Regarding your query "${query}": Deterministic scans over the verified ledger indicate all other transactions are within standard normal distribution boundaries (p > 0.05). For in-depth investigation of flagged outliers, refer to the AI Investigation Center.`,
            citations: [{ label: 'AI Investigations', route: '/investigations' }]
          }
        }
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: matchedResponse.content,
        citations: matchedResponse.citations,
        metrics: matchedResponse.metrics
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 850)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              AI ASSISTANT
            </span>
            <span className="text-xs text-muted-foreground">Autonomous Financial Copilot</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FIN-SHIELD Forensic Copilot</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages(INITIAL_CHAT_MESSAGES)
            toast.info('Chat context reset')
          }}
          className="text-xs gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Clear Session
        </Button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3.5 h-3.5" />
          Try asking:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs px-3 py-1 rounded-full bg-secondary/60 hover:bg-cyan-950/40 text-muted-foreground hover:text-cyan-300 border border-border/60 hover:border-cyan-700/60 transition-all shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <Card className="flex-1 overflow-y-auto p-4 md:p-6 bg-card/50 border-border/80 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2.5 ${isUser ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed text-left ${
                    isUser
                      ? 'bg-cyan-950/40 border border-cyan-800/80 text-cyan-100 rounded-tr-none'
                      : 'bg-secondary/40 border border-border/70 text-foreground rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Metrics Badges */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/50">
                      {msg.metrics.map((m, idx) => (
                        <div key={idx} className="p-2 bg-background/50 rounded border border-border/40 font-mono">
                          <span className="text-[10px] text-muted-foreground block">{m.label}</span>
                          <span className="font-bold text-cyan-300 text-xs">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Citations / Links */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Source Dossiers:</span>
                    {msg.citations.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigate(c.route)}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition-colors font-mono"
                      >
                        {c.label}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-muted-foreground font-mono">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-secondary/30 rounded-xl rounded-tl-none border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Synthesizing multi-source ledger data...</span>
            </div>
          </div>
        )}
      </Card>

      {/* Input Bar */}
      <div className="shrink-0 flex items-center gap-2 bg-card/80 p-2 rounded-xl border border-border/80 shadow-lg">
        <input
          type="text"
          placeholder="Ask FIN-SHIELD Copilot about invoices, vendors, anomalies, holds..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs px-4 gap-1.5"
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </Button>
      </div>
    </div>
  )
}

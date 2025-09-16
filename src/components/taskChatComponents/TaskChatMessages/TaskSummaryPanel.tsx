import React, { useEffect, useRef, useState, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { CheckCircle2, Bot, Sparkles } from "lucide-react"
import mermaid from "mermaid"

const mermaidCache = new Map<string, string>()
const MermaidComponent = React.memo(({ children }: { children: string }) => {
  const chart = String(children).replace(/\n$/, '')
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    if (!ref.current || isRendering) return

    // Check cache first
    if (mermaidCache.has(chart)) {
      ref.current.innerHTML = mermaidCache.get(chart)!
      return
    }
    
    setIsRendering(true)
    const renderChart = async () => {
      try {
        setError(null)
        mermaid.parse(chart)
        
        const id = "mermaid-" + Math.random().toString(36).substr(2, 9)
        const result = await mermaid.render(id, chart)
        
        // Cache the result
        mermaidCache.set(chart, result.svg)
        
        if (ref.current) {
          ref.current.innerHTML = result.svg
        }
      } catch (e: any) {
        setError("Invalid Mermaid syntax")
      } finally {
        setIsRendering(false)
      }
    }

    renderChart()
  }, [chart, isRendering])

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg my-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="mermaid-container bg-white p-4 rounded-lg overflow-x-auto my-4">
      <div ref={ref} />
    </div>
  )
})

// Memoized markdown component to prevent re-rendering
const MemoizedMarkdown = React.memo(({ content, index }: { content: string; index: number }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-700 text-sm leading-relaxed">{children}</p>,
      strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
      em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
      ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="text-slate-700 text-sm leading-relaxed">{children}</li>,
      h1: ({ children }) => <h1 className="text-lg font-bold text-slate-800 mb-2 mt-4 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-semibold text-slate-800 mb-2 mt-3 first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-800 mb-2 mt-3 first:mt-0">{children}</h3>,

      code: ({ node, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '')
        const language = match ? match[1] : ''
        
        if (language === 'mermaid') {
          return <MermaidComponent >{String(children).replace(/\n$/, '')}</MermaidComponent>
        }
        
        return (
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800" {...props}>
            {children}
          </code>
        )
      },
      a: ({ children, href }) => (
        <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
))

export const TaskSummaryPanel = React.memo(({ 
  agentOutput, 
  summary 
}: { 
  agentOutput: string[]; 
  summary: string[] 
}) => {
  // Stabilize the arrays with deep comparison and filter out empty/whitespace strings
  const stableAgentOutput = useMemo(() => {
    if (!agentOutput || !Array.isArray(agentOutput)) return []
    return Array.from(new Set(agentOutput.filter(item => item && item.trim().length > 0)))
  }, [JSON.stringify(agentOutput)])
  
  const stableSummary = useMemo(() => {
    if (!summary || !Array.isArray(summary)) return []
    return Array.from(new Set(summary.filter(item => item && item.trim().length > 0)))
  }, [JSON.stringify(summary)])

  // Check if both arrays are effectively empty
  const hasAgentOutput = stableAgentOutput.length > 0
  
  // Don't render if both arrays are empty
  if (!hasAgentOutput) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 border-t border-slate-200/60 rounded-xl p-5 mt-4 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      <div className="relative flex flex-col gap-4">
        {/* Agent Output Section */}
        {hasAgentOutput && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex items-center justify-center w-6 h-6 bg-slate-300 rounded-full">
                <Bot className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <span className="font-semibold text-xs tracking-wide uppercase text-slate-600">Agent Output</span>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border-t border-slate-200/50">
              <div className="prose prose-sm max-w-none ">
                {stableAgentOutput.map((output, idx) => (
                  <div key={`agent-output-${idx}`} className={idx > 0 ? " border-t border-slate-200/50 mt-4 pt-4" : ""}>
                    <MemoizedMarkdown content={output} index={idx} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {/* <div>
        {hasSummary && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-semibold text-xs tracking-wide uppercase text-indigo-700">Summary</span>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                {stableSummary.map((summaryItem, idx) => (
                  <div key={`summary-${idx}`} className="text-slate-700 text-sm leading-relaxed">
                    <MemoizedMarkdown content={summaryItem} index={idx + 1000} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div> */}
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  const prevAgentStr = JSON.stringify(prevProps.agentOutput)
  const nextAgentStr = JSON.stringify(nextProps.agentOutput)
  const prevSummaryStr = JSON.stringify(prevProps.summary)
  const nextSummaryStr = JSON.stringify(nextProps.summary)
  
  return prevAgentStr === nextAgentStr && prevSummaryStr === nextSummaryStr
})
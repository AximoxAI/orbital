import ReactMarkdown from "react-markdown"
import { CheckCircle2, Bot, Sparkles } from "lucide-react"

export const TaskSummaryPanel = ({ summary }: { summary: string[] }) => {
  const uniqueSummary = Array.from(new Set(summary))
  if (!uniqueSummary || uniqueSummary.length === 0) return null

  // The last element is the "actual summary", the rest (if any) is "output"
  const output = uniqueSummary.slice(0, -1)
  const actualSummary = uniqueSummary[uniqueSummary.length - 1]

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 border border-slate-200/60 rounded-xl p-5 mt-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

      <div className="relative flex flex-col gap-4">
        {output.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="font-semibold text-sm tracking-wide uppercase text-blue-700">Agent Output</span>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-slate-200/50">
              <div className="space-y-2">
                {output.map((s, idx) => (
                  <div key={idx} className="text-slate-700 text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ),
                      }}
                    >
                      {s}
                    </ReactMarkdown>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
    </div>
  )
}
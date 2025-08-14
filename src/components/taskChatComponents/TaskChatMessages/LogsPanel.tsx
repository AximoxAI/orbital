import React from "react"

type LogsPanelProps = {
  logs: string[],
  logsOpen: boolean,
  setLogsOpen: (open: boolean) => void,
  title: string
}

export const LogsPanel = ({ logs, logsOpen, setLogsOpen, title }: LogsPanelProps) => (
  <div className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden mt-3">
    <div
      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white transition-colors border-b border-slate-200 bg-white"
      onClick={() => setLogsOpen(!logsOpen)}
    >
      <div className="flex items-center space-x-2 ">
        <span className="text-slate-600">▶</span>
        <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide font-inter">{title}</span>
        <span className="bg-slate-400 text-white px-1.5 py-0.5 rounded text-xs font-jetbrains font-medium">
          {logs.length}
        </span>
      </div>
    </div>
    {logsOpen && (
      <div className="p-3">
        <div className="bg-slate-100 rounded border border-slate-100 p-3 font-jetbrains text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto scrollbar-thin font-normal">
          {logs.map((log, index) => (
            <div key={index} className="mb-1 flex items-start gap-2">
              <span className="text-slate-500 flex-shrink-0 font-medium font-jetbrains">
                {log.match(/\[([^\]]+)\]/) ? log.match(/\[([^\]]+)\]/)?.[1] : `[${index + 1}]`}
              </span>
              <span className="flex-1 font-normal font-jetbrains">
                {log.replace(/\[([^\]]+)\]\s*/, '')}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)
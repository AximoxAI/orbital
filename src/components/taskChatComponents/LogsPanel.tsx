// import { ChevronDown, ChevronRight } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import React from "react"

// interface LogsPanelProps {
//   logs: string[]
//   logsOpen: boolean
//   setLogsOpen: (open: boolean) => void
//   showMonacoCanvas?: boolean
//   title?: string
// }

// const LogsPanel: React.FC<LogsPanelProps> = ({ 
//   logs, 
//   logsOpen, 
//   setLogsOpen, 
//   showMonacoCanvas = true, 
//   title = "EXECUTION LOGS" 
// }) => {
//   if (!showMonacoCanvas || logs.length === 0) return null

//   return (
//     <div className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden mt-3">
//       <div 
//         className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white transition-colors border-b border-slate-200 bg-white"
//         onClick={() => setLogsOpen(!logsOpen)}
//       >
//         <div className="flex items-center gap-2">
//           <span className="text-slate-600 text-xs">▶</span>
//           <span className="font-semibold text-slate-600 text-xs uppercase tracking-wide font-['Inter']">{title}</span>
//           <span className="bg-slate-400 text-white px-1.5 py-0.5 rounded text-xs font-['JetBrains_Mono']">
//             {logs.length}
//           </span>
//         </div>
//       </div>
//       {logsOpen && (
//         <div className="p-3">
//           <div className="bg-white rounded border border-slate-100 p-3 font-['JetBrains_Mono'] text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
//             {logs.map((log, index) => (
//               <div key={index} className="mb-1 flex items-start gap-2">
//                 <span className="text-slate-400 flex-shrink-0">
//                   {log.match(/\[([^\]]+)\]/) ? log.match(/\[([^\]]+)\]/)?.[1] : `[${index + 1}]`}
//                 </span>
//                 <span className="flex-1">
//                   {log.replace(/\[([^\]]+)\]\s*/, '')}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default LogsPanel
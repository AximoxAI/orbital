import React from "react"
import ReactMarkdown from "react-markdown"
import { Code } from 'lucide-react'
import { availableBots, getBotStyles } from "./botStyles"
import { LogsPanel } from "./LogsPanel"
import { TaskSummaryPanel } from "./TaskSummaryPanel"
import { TaskExecutionLog, MessageType } from "./types"

interface MessageContentProps {
  message: MessageType
  isFullPage: boolean
  onShowGeneratedFiles: (id: string) => void
  messageIndex: number
  latestHumanIdx: number | undefined
  followingBotIdx: number
  logs: string[]
  logsOpen: boolean
  setLogsOpen: (open: boolean) => void
  showMonacoCanvas: boolean
  summary: string[]
  agentOutput: string[]
  executionLogs: TaskExecutionLog[]
  executionLogsOpen: boolean
  setExecutionLogsOpen?: (open: boolean) => void
  executionLogsMessageId?: string
  activeRetrieveProjectId?: string
  liveRetrieveProjectLogs?: string[]
  liveRetrieveProjectSummary?: string[]
  liveAgentOutput?: string[]
}

const extractSummaryFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const summaryLogs = logs.filter(log => log.type === "summary" && log.status === "agent" )
  return summaryLogs.map(log => log.content)
}

const extractAgentOutputFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const agentOutputLogs = logs.filter(log => log.type === "agent_output" && log.status === "agent" )
  return agentOutputLogs.map(log => log.content)
}

const filterExecutionLogsWithoutSummaryAndAgentOutput = (logs: TaskExecutionLog[]) => {
  return logs.filter(log => !(log.type === "summary" || log.type === "agent_output"))
}

const renderMessageContent = (content: string) => {
  const botMentionRegex = /(@orbital_cli|@goose|@gemini_cli|@claude_code)/g
  const parts = content.split(botMentionRegex)
  const elements: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (availableBots.includes(part)) {
      const styles = getBotStyles(part)
      elements.push(
        <span
          key={index}
          className={`inline-flex  items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm mr-2 ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`}
        >
          {/* You may import Bot icon here if needed */}
          {part}
        </span>
      )
    } else if (part.trim()) {
      elements.push(
        <span key={index} className="text-sm text-slate-900 font-inter font-medium ">
          {part}
        </span>
      )
    }
  })

  return <>{elements}</>
}

export const MessageContent = ({
  message,
  isFullPage,
  onShowGeneratedFiles,
  messageIndex,
  latestHumanIdx,
  followingBotIdx,
  logs,
  logsOpen,
  setLogsOpen,
  showMonacoCanvas,
  summary,
  agentOutput,
  executionLogs,
  executionLogsOpen,
  setExecutionLogsOpen,
  executionLogsMessageId,
  activeRetrieveProjectId,
  liveRetrieveProjectLogs,
  liveRetrieveProjectSummary = [],
  liveAgentOutput = [],
}: MessageContentProps) => {
  const isLatestHumanMessage = latestHumanIdx === messageIndex
  const isFollowingBotMessage = followingBotIdx === messageIndex
  const hasConsoleLogs = isLatestHumanMessage && logs.length > 0
  const hasExecutionLogsForThisMessage =
    message.id === executionLogsMessageId && executionLogs.length > 0 && setExecutionLogsOpen

  const executionSummary = hasExecutionLogsForThisMessage ? extractSummaryFromExecutionLogs(executionLogs) : []
  const executionAgentOutput = hasExecutionLogsForThisMessage ? extractAgentOutputFromExecutionLogs(executionLogs) : []
  const filteredExecutionLogs = hasExecutionLogsForThisMessage ? filterExecutionLogsWithoutSummaryAndAgentOutput(executionLogs) : []

  const isRetrieveProjectBlock = message.type === "ai" && message.content === "Generating Project"
  const isActiveRetrieveProjectBlock = activeRetrieveProjectId && message.id === activeRetrieveProjectId

  if (message.isCode) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200">
          <Code className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide font-inter">Code suggestion</span>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-slate-800 font-normal font-jetbrains">{message.content}</pre>
      </div>
    )
  }

  if (isRetrieveProjectBlock) {
    const isExpanded = isActiveRetrieveProjectBlock
      ? (liveRetrieveProjectLogs && liveRetrieveProjectLogs.length > 0) ||
        (Array.isArray(liveRetrieveProjectSummary) && liveRetrieveProjectSummary.length > 0) ||
        (Array.isArray(liveAgentOutput) && liveAgentOutput.length > 0)
      : hasConsoleLogs ||
        (Array.isArray(summary) && summary.length > 0) ||
        (Array.isArray(agentOutput) && agentOutput.length > 0) ||
        (hasExecutionLogsForThisMessage && !hasConsoleLogs) ||
        (hasExecutionLogsForThisMessage &&
          !hasConsoleLogs &&
          (Array.isArray(executionSummary) && executionSummary.length > 0 ||
           Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0));

    return (
      <div
        className="border border-slate-200 rounded-xl w-full max-w-2xl h-[110px] bg-slate-100 shadow-lg p-4"
        style={isExpanded ? { height: "auto", minHeight: 120 } : {}}
      >
        <div
          className={`flex gap-2 cursor-pointer ${isExpanded ? "" : "items-center h-full"}`}
          onClick={() => onShowGeneratedFiles(message.id)}
        >
          <span className="text-sm font-medium text-slate-900 font-inter">📄 Open in Editor</span>
          <span className="ml-auto bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-jetbrains font-medium w-[70px] h-[70px] flex justify-center items-center">
            {'<code></code>'}
          </span>
        </div>
        {isActiveRetrieveProjectBlock ? (
          <>
            {liveRetrieveProjectLogs && liveRetrieveProjectLogs.length > 0 && (
              <LogsPanel
                logs={liveRetrieveProjectLogs}
                logsOpen={logsOpen}
                setLogsOpen={setLogsOpen}
                title="EXECUTION LOGS"
              />
            )}
            {((Array.isArray(liveAgentOutput) && liveAgentOutput.length > 0) || 
              (Array.isArray(liveRetrieveProjectSummary) && liveRetrieveProjectSummary.length > 0)) && (
              <TaskSummaryPanel 
                agentOutput={liveAgentOutput || []} 
                summary={liveRetrieveProjectSummary || []} 
              />
            )}
          </>
        ) : (
          <>
            {hasConsoleLogs && (
              <LogsPanel
                logs={logs}
                logsOpen={logsOpen}
                setLogsOpen={setLogsOpen}
                title="EXECUTION LOGS"
              />
            )}
            {(hasConsoleLogs && 
              ((Array.isArray(agentOutput) && agentOutput.length > 0) || 
               (Array.isArray(summary) && summary.length > 0))) && (
              <TaskSummaryPanel 
                agentOutput={agentOutput || []} 
                summary={summary || []} 
              />
            )}
            {hasExecutionLogsForThisMessage && !hasConsoleLogs && (
              <LogsPanel
                logs={filteredExecutionLogs.map(
                  (log) =>
                    `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.status.toUpperCase()} (${log.type}): ${log.content}`
                )}
                logsOpen={executionLogsOpen}
                setLogsOpen={setExecutionLogsOpen!}
                title="EXECUTION LOGS"
              />
            )}
            {(hasExecutionLogsForThisMessage &&
              !hasConsoleLogs &&
              ((Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0) ||
               (Array.isArray(executionSummary) && executionSummary.length > 0))) && (
              <TaskSummaryPanel 
                agentOutput={executionAgentOutput || []} 
                summary={executionSummary || []} 
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl w-fit bg-white p-2 flex items-center h-auto">
      <div className="text-slate-900 font-normal font-inter p-2 m-0 leading-tight flex items-center">
        {renderMessageContent(message.content)}
      </div>
    </div>
  )
}
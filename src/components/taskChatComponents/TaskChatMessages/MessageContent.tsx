import React, { useMemo } from "react"
import { Code } from 'lucide-react'
import { availableBots, getBotStyles, getUserMentionStyle } from "./botStyles"
import { LogsPanel } from "./LogsPanel"
import { TaskSummaryPanel } from "./TaskSummaryPanel"
import { TaskExecutionLog, MessageType } from "./types"
import { TaskExecutionLogStatusEnum, TaskExecutionLogTypeEnum } from "@/api-client";

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
  hasFilesForMessage?: boolean

  // NEW: provide all users in the chat for mention highlighting
  chatUsers?: { id: string; name: string; email?: string }[]
}

const extractSummaryFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const summaryLogs = logs.filter(log => log.type === TaskExecutionLogTypeEnum.Summary && log.status ===  TaskExecutionLogStatusEnum.Agent )
  return summaryLogs.map(log => log.content)
}

const extractAgentOutputFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const agentOutputLogs = logs.filter(log => log.type === TaskExecutionLogTypeEnum.AgentOutput && log.status === TaskExecutionLogStatusEnum.Agent )
  return agentOutputLogs.map(log => log.content)
}

const filterExecutionLogsWithoutSummaryAndAgentOutput = (logs: TaskExecutionLog[]) => {
  return logs.filter(log => !(log.type === TaskExecutionLogTypeEnum.Summary || log.type === TaskExecutionLogTypeEnum.AgentOutput))
}

// Utility for deterministic user colors (tailwind palette)
const USER_COLOR_PAIRS = [
  // Each is [bg, text, border]
  ["bg-gradient-to-r from-indigo-50 to-blue-50", "text-indigo-800", "border-indigo-200"],
  ["bg-gradient-to-r from-amber-50 to-yellow-50", "text-amber-800", "border-amber-200"],
  ["bg-gradient-to-r from-purple-50 to-fuchsia-50", "text-fuchsia-800", "border-fuchsia-200"],
  ["bg-gradient-to-r from-emerald-50 to-green-50", "text-emerald-800", "border-emerald-200"],
  ["bg-gradient-to-r from-pink-50 to-rose-50", "text-pink-800", "border-pink-200"],
  ["bg-gradient-to-r from-sky-50 to-cyan-50", "text-sky-800", "border-sky-200"],
  ["bg-gradient-to-r from-slate-50 to-gray-50", "text-slate-800", "border-slate-200"],
]

// Deterministically assign a color by user id or name
function getUserColorStyle(userIdOrName: string) {
  let hash = 0
  for (let i = 0; i < userIdOrName.length; i++) {
    hash = userIdOrName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % USER_COLOR_PAIRS.length
  const [bgColor, textColor, borderColor] = USER_COLOR_PAIRS[idx]
  return {
    bgColor,
    textColor,
    selectedBg: bgColor,
    selectedText: textColor,
    iconColor: textColor,
    borderColor
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// --- MAIN CONTENT RENDERER ---
const renderMessageContent = (
  content: string,
  chatUsers: { id: string; name: string; email?: string }[] | undefined
) => {
  // Mention syntax is @username (by name), and bots by their handle
  const userMentions =
    chatUsers?.map(
      (u) => "@" + (u.name || u.email || u.id)
    ) ?? []
  const allKnownMentions = [...availableBots, ...userMentions]
  if (allKnownMentions.length === 0) {
    return <span className="text-sm text-slate-900 font-inter font-medium ">{content}</span>
  }
  const escapedMentions = allKnownMentions.map(mention => escapeRegExp(mention))
  const mentionRegex = new RegExp(`(${escapedMentions.join('|')})`, 'g')

  const parts = content.split(mentionRegex)
  const elements: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (availableBots.includes(part)) {
      // Bot mention
      const styles = getBotStyles(part)
      elements.push(
        <span
          key={index}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm mr-2 ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`}
        >
          {part.replace(/^@/, "")}
        </span>
      )
    } else if (
      chatUsers &&
      part.startsWith("@") &&
      chatUsers.some(
        (u) =>
          "@" + (u.name || u.email || u.id) === part
      )
    ) {
      // Real user mention
      const user = chatUsers.find(
        (u) => "@" + (u.name || u.email || u.id) === part
      )
      const colorStyle = user ? getUserColorStyle(user.id || user.name || user.email || "")
        : getUserMentionStyle()
      elements.push(
        <span
          key={index}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm mr-2 ${colorStyle.bgColor} ${colorStyle.textColor} border ${colorStyle.borderColor}`}
        >
          {part.replace(/^@/, "")}
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
  hasFilesForMessage = false,
  chatUsers // <--- NEW PROP
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

  // Memoize for perf
  const renderedContent = useMemo(
    () => renderMessageContent(message.content, chatUsers),
    [message.content, chatUsers]
  )

  if (message.isCode) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 ">
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

    // Check if there are actual generated files for THIS specific message
    const hasGeneratedFiles = hasFilesForMessage

    return (
      <div
        className="border border-slate-200 rounded-xl w-full max-w-2xl h-[110px] bg-slate-100  p-4"
        style={isExpanded ? { height: "auto", minHeight: 120 } : {}}
      >
        <div
          className="flex items-center w-full bg-slate-100 rounded-2xl cursor-pointer transition p-3 sm:p-4"
          style={{
            minHeight: 60,
            margin: "0 auto",
            gap: "0.75rem",
            maxWidth: "100%",
          }}
          onClick={() => onShowGeneratedFiles(message.id)}
        >
          <span
            className="flex justify-center items-center rounded-xl flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #5C6DF7 0%, #8F54FF 100%)",
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 32 32" className="sm:w-6 sm:h-6">
              <g>
                <rect x="8" y="13" width="16" height="10" rx="4" fill="#fff" />
                <rect x="13" y="8" width="6" height="3" rx="1.5" fill="#fff" />
                <circle cx="11.5" cy="18" r="1.5" fill="#8F54FF" />
                <circle cx="20.5" cy="18" r="1.5" fill="#8F54FF" />
              </g>
            </svg>
          </span>
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {hasGeneratedFiles ? (
              <>
                <span 
                  className="font-semibold text-sm sm:text-md text-slate-600 truncate" 
                  style={{ fontFamily: "Inter" }}
                >
                  Code Generated Successfully
                </span>
                <span 
                  className="text-slate-400 text-xs sm:text-sm truncate" 
                  style={{ fontFamily: "Inter" }}
                >
                  Click to open in editor
                </span>
              </>
            ) : (
              <span 
                className="font-semibold text-sm sm:text-md text-slate-600 truncate" 
                style={{ fontFamily: "Inter" }}
              >
                Check execution logs
              </span>
            )}
          </div>
          <span
            className="flex justify-center items-center rounded-xl flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #5C6DF7 0%, #8F54FF 100%)",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 26 26" className="sm:w-5 sm:h-5">
              <g>
                <path
                  d="M7.2 17.8l1.03-4.12a.5.5 0 01.13-.22l6.7-6.7a1.41 1.41 0 112 2l-6.7 6.7a.5.5 0 01-.22.13L7.2 17.8z"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M15.1 7.8l2.1 2.1"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </svg>
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
    <div className="border border-slate-200 rounded-xl w-fit bg-white p-2 flex items-center h-auto ">
      <div className="text-slate-900 font-normal font-inter p-2 m-0 leading-tight flex items-center">
        {renderedContent}
      </div>
    </div>
  )
}
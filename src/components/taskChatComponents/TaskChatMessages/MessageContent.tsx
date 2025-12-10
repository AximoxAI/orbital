import type React from "react"
import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react"
import { Code, Phone, PhoneOff } from "lucide-react"
import { LogsPanel } from "./LogsPanel"
import { TaskSummaryPanel } from "./TaskSummaryPanel"
import type { TaskExecutionLog, MessageType } from "./types"
import { TaskExecutionLogStatusEnum, TaskExecutionLogTypeEnum } from "@/api-client"
import { availableBots, getBotStyles, getUserMentionStyle } from "./botStyles"
import { MessageActions } from "./MessageActions"
import { TasksApi } from "@/api-client/api"
import { Configuration as OpenApiConfiguration } from "@/api-client/configuration"
import FileAttachmentCard from "./FileAttachmentCard"
import { GRAPH_DATA } from "../Preview"

const configuration = new OpenApiConfiguration({
  basePath: import.meta.env.VITE_BACKEND_API_KEY,
})
const tasksApi = new TasksApi(configuration)

interface AttachedFile {
  name: string
  size: number
  type: string
  url?: string
  id?: string
}

interface MessageContentProps {
  message: MessageType & { attachedFiles?: AttachedFile[] }
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
  chatUsers?: { id: string; name: string; email?: string }[]
  onSuggestionClick: (suggestion: string, parentAgentName?: string) => void
  onRetryClick?: (parentMessageContent: string) => void
  parentMessageContent?: string
  parentAgentName?: string
  onContentHeightChange?: () => void
  onFileClick?: (file: AttachedFile) => void
}

const extractSummaryFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const summaryLogs = logs.filter(
    (log) => log.type === TaskExecutionLogTypeEnum.Summary && log.status === TaskExecutionLogStatusEnum.Agent,
  )
  return summaryLogs.map((log) => log.content)
}

const extractAgentOutputFromExecutionLogs = (logs: TaskExecutionLog[]) => {
  const agentOutputLogs = logs.filter(
    (log) => log.type === TaskExecutionLogTypeEnum.AgentOutput && log.status === TaskExecutionLogStatusEnum.Agent,
  )
  return agentOutputLogs.map((log) => log.content)
}

const filterExecutionLogsWithoutSummaryAndAgentOutput = (logs: TaskExecutionLog[]) => {
  return logs.filter(
    (log) => !(log.type === TaskExecutionLogTypeEnum.Summary || log.type === TaskExecutionLogTypeEnum.AgentOutput),
  )
}

const USER_COLOR_PAIRS = [
  ["bg-gradient-to-r from-indigo-50 to-blue-50", "text-indigo-800", "border-indigo-200"],
  ["bg-gradient-to-r from-amber-50 to-yellow-50", "text-amber-800", "border-amber-200"],
  ["bg-gradient-to-r from-purple-50 to-fuchsia-50", "text-fuchsia-800", "border-fuchsia-200"],
  ["bg-gradient-to-r from-emerald-50 to-green-50", "text-emerald-800", "border-emerald-200"],
  ["bg-gradient-to-r from-pink-50 to-rose-50", "text-pink-800", "border-pink-200"],
  ["bg-gradient-to-r from-sky-50 to-cyan-50", "text-sky-800", "border-sky-200"],
  ["bg-gradient-to-r from-slate-50 to-gray-50", "text-slate-800", "border-slate-200"],
]

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
    borderColor,
  }
}

// --- Styles for Nodes, Templates, and Connections (No Icons) ---
const ENTITY_STYLES = {
  Node: {
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
  },
  Template: {
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
  },
  Connection: {
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
  },
} as const;

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// 1. Create a Set of valid node labels for O(1) lookup
const VALID_NODE_LABELS = new Set<string>();

if (Array.isArray(GRAPH_DATA)) {
  GRAPH_DATA.forEach((el: any) => {
    // We only care about nodes that have a label
    if (el.data && !el.data.source && el.data.label) {
      // Normalize: The chat uses spaces replaced by underscores often, 
      // but let's store both the original and the underscore version to be safe.
      VALID_NODE_LABELS.add(el.data.label);
      VALID_NODE_LABELS.add(el.data.label.replace(/\s+/g, '_'));
    }
  });
}

const renderMessageContent = (
  content: string,
  chatUsers: { id: string; name: string; email?: string }[] | undefined,
) => {
  const userMentions = chatUsers?.map((u) => "@" + (u.name || u.email || u.id)) ?? []
  const allKnownMentions = [...availableBots, ...userMentions]

  // 1. Process Bots and User Mentions first
  let parts: string[] = [content];
  if (allKnownMentions.length > 0) {
    const escapedMentions = allKnownMentions.map((mention) => escapeRegExp(mention))
    const mentionRegex = new RegExp(`(${escapedMentions.join("|")})`, "g")
    parts = content.split(mentionRegex)
  }

  const elements: React.ReactNode[] = []

  parts.forEach((part, index) => {
    // Check for Bot
    if (availableBots.includes(part)) {
      const styles = getBotStyles(part)
      elements.push(
        <span
          key={`bot-${index}`}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-semibold shadow-sm mx-1 align-middle ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`}
        >
          {part.replace(/^@/, "")}
        </span>,
      )
    // Check for User
    } else if (chatUsers && part.startsWith("@") && chatUsers.some((u) => "@" + (u.name || u.email || u.id) === part)) {
      const user = chatUsers.find((u) => "@" + (u.name || u.email || u.id) === part)
      const colorStyle = user
        ? getUserColorStyle(user.id || user.name || user.email || "unknown")
        : getUserMentionStyle()
      elements.push(
        <span
          key={`user-${index}`}
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-semibold shadow-sm mx-1 align-middle ${colorStyle.bgColor} ${colorStyle.textColor} border ${colorStyle.borderColor}`}
        >
          {part.replace(/^@/, "")}
        </span>,
      )
    } else if (part.trim()) {
      // 2. Process Nodes, Templates, and Connections inside normal text blocks
      const entityRegex = /(Node:[^\s]+|Connection:[^\s]+\s(?:->|<-|→|←)\s[^\s]+|Template:[^\s]+)/g;
      
      const subParts = part.split(entityRegex);
      
      subParts.forEach((subPart, subIndex) => {
        let matched = false;

        // --- VALIDATION LOGIC START ---
        if (subPart.startsWith("Node:")) {
            const label = subPart.substring(5); // Remove "Node:"
            // Only render as pill if it exists in the graph
            if (VALID_NODE_LABELS.has(label)) {
                matched = true;
                const styles = ENTITY_STYLES.Node;
                elements.push(
                  <span key={`node-${index}-${subIndex}`} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mx-1 align-middle ${styles.bgColor} ${styles.textColor} ${styles.borderColor}`}>
                     {subPart}
                  </span>
                );
            }
        } else if (subPart.startsWith("Connection:")) {
             // Connection:RELATION -> NodeLabel
             // We extract the last part (NodeLabel) and check if it is valid
             const segments = subPart.split(/\s(?:->|<-|→|←)\s/);
             if (segments.length > 1) {
                 const targetLabel = segments[segments.length - 1];
                 if (VALID_NODE_LABELS.has(targetLabel)) {
                    matched = true;
                    const styles = ENTITY_STYLES.Connection;
                    elements.push(
                        <span key={`conn-${index}-${subIndex}`} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mx-1 align-middle ${styles.bgColor} ${styles.textColor} ${styles.borderColor}`}>
                           {subPart}
                        </span>
                      );
                 }
             }
        } else if (subPart.startsWith("Template:")) {
            const styles = ENTITY_STYLES.Template;
            elements.push(
                <span key={`tpl-${index}-${subIndex}`} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border mx-1 align-middle ${styles.bgColor} ${styles.textColor} ${styles.borderColor}`}>
                   {subPart}
                </span>
              );
             matched = true;
        } 
        
        // --- FALLBACK ---
        if (!matched) {
             // Normal text (or invalid node/connection)
             elements.push(
                <span key={`text-${index}-${subIndex}`} className="text-sm text-slate-900 font-inter font-medium leading-relaxed">
                  {subPart}
                </span>
              )
        }
      });
    } else {
        // Whitespace preservation
        if (part) elements.push(<span key={index}>{part}</span>)
    }
  })

  return <div className="leading-relaxed">{elements}</div>
}

async function fetchExecutionLogs(messageId: string): Promise<TaskExecutionLog[]> {
  try {
    const res = await tasksApi.tasksControllerGetExecutionLogs(messageId)
    return Array.isArray(res.data) ? res.data : [res.data]
  } catch (err) {
    return []
  }
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
  chatUsers,
  onSuggestionClick,
  onRetryClick,
  parentMessageContent,
  parentAgentName,
  onContentHeightChange,
  onFileClick
}: MessageContentProps) => {
  const [hasAgentSummary, setHasAgentSummary] = useState<boolean>(false)
  const [isLoadingAgentSummary, setIsLoadingAgentSummary] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevHeightRef = useRef<number>(0)

  const isLatestHumanMessage = latestHumanIdx === messageIndex
  const isFollowingBotMessage = followingBotIdx === messageIndex
  const hasConsoleLogs = isLatestHumanMessage && logs.length > 0
  const hasExecutionLogsForThisMessage =
    message.id === executionLogsMessageId && executionLogs.length > 0 && setExecutionLogsOpen

  const executionSummary = hasExecutionLogsForThisMessage ? extractSummaryFromExecutionLogs(executionLogs) : []
  const executionAgentOutput = hasExecutionLogsForThisMessage ? extractAgentOutputFromExecutionLogs(executionLogs) : []
  const filteredExecutionLogs = hasExecutionLogsForThisMessage
    ? filterExecutionLogsWithoutSummaryAndAgentOutput(executionLogs)
    : []

  const isRetrieveProjectBlock = message.type === "ai" && !message.isCallEvent
  const isActiveRetrieveProjectBlock = activeRetrieveProjectId && message.id === activeRetrieveProjectId

  const getAgentOutputText = () => {
    if (Array.isArray(liveAgentOutput) && liveAgentOutput.length > 0) {
      return liveAgentOutput.join("\n")
    }
    if (Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0) {
      return executionAgentOutput.join("\n")
    }
    if (Array.isArray(agentOutput) && agentOutput.length > 0) {
      return agentOutput.join("\n")
    }
    return ""
  }

  useEffect(() => {
    let ignore = false
    async function checkAgentSummary() {
      if (isFollowingBotMessage && message.id) {
        setIsLoadingAgentSummary(true)
        const logs = await fetchExecutionLogs(message.id)
        const found = logs.some(
          (log) => log.type === TaskExecutionLogTypeEnum.Summary && log.status === TaskExecutionLogStatusEnum.Agent,
        )
        if (!ignore) {
          setHasAgentSummary(found)
          setIsLoadingAgentSummary(false)
        }
      }
    }
    checkAgentSummary()
    return () => {
      ignore = true
    }
  }, [isFollowingBotMessage, message.id])

  useLayoutEffect(() => {
    if (containerRef.current) {
      const currentHeight = containerRef.current.offsetHeight
      if (currentHeight !== prevHeightRef.current && prevHeightRef.current > 0) {
        onContentHeightChange?.()
      }
      prevHeightRef.current = currentHeight
    }
  })

  useEffect(() => {
    if (hasAgentSummary && !isLoadingAgentSummary) {
      const timer = setTimeout(() => {
        onContentHeightChange?.()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [hasAgentSummary, isLoadingAgentSummary, onContentHeightChange])

  const hasExecutionData =
    (Array.isArray(liveAgentOutput) && liveAgentOutput.length > 0) ||
    (Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0) ||
    (Array.isArray(agentOutput) && agentOutput.length > 0) ||
    (Array.isArray(liveRetrieveProjectSummary) && liveRetrieveProjectSummary.length > 0) ||
    (Array.isArray(executionSummary) && executionSummary.length > 0) ||
    (Array.isArray(summary) && summary.length > 0) ||
    hasAgentSummary;
  const hasFinishedGenerating = !isActiveRetrieveProjectBlock;

  const shouldShowActions = 
    message.type === "ai" && 
    (hasExecutionData || (hasFinishedGenerating && message.content && message.content.trim().length > 0));

  const shouldShowSuggestions = isFollowingBotMessage && shouldShowActions;

  const renderedContent = useMemo(
    () => renderMessageContent(message.content, chatUsers),
    [message.content, chatUsers],
  )

  if (message.isCallEvent) {
    const isCallStarted = message.callEventType === "started"
    const Icon = isCallStarted ? Phone : PhoneOff
    const bgColor = isCallStarted ? "bg-emerald-50" : "bg-slate-50"
    const iconColor = isCallStarted ? "text-emerald-600" : "text-slate-600"
    const textColor = isCallStarted ? "text-emerald-900" : "text-slate-900"
    const borderColor = isCallStarted ? "border-emerald-200" : "border-slate-200"
    const timestampColor = isCallStarted ? "text-emerald-700" : "text-slate-700"

    return (
      <div ref={containerRef} className="w-full flex justify-center my-2">
        <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl ${bgColor} border ${borderColor} shadow-sm`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <span className={`text-xs font-medium ${textColor}`}>
              {isCallStarted ? "Video call started" : "Video call ended"}
            </span>
          </div>
          {message.timestamp && (
            <span className={`text-[10px] font-normal ${timestampColor} opacity-70`}>
              {message.timestamp}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (message.isCode) {
    return (
      <div ref={containerRef} className="bg-slate-100 border border-slate-200 rounded-xl p-3 ">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200">
          <Code className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide font-inter">
            Code suggestion
          </span>
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
          ((Array.isArray(executionSummary) && executionSummary.length > 0) ||
            (Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0)))

    const hasGeneratedFiles = hasFilesForMessage

    return (
      <div ref={containerRef} className="w-full max-w-2xl">
        <div
          className="border border-slate-200 rounded-xl bg-slate-100 p-4"
          style={isExpanded ? { height: "auto", minHeight: 120 } : { height: 110 }}
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
                  <span className="font-semibold text-sm sm:text-md text-slate-600 truncate" style={{ fontFamily: "Inter" }}>
                    Code Generated Successfully
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm truncate" style={{ fontFamily: "Inter" }}>
                    Click to open in editor
                  </span>
                </>
              ) : (
                <span className="font-semibold text-sm sm:text-md text-slate-600 truncate" style={{ fontFamily: "Inter" }}>
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
                  <path d="M15.1 7.8l2.1 2.1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>
              </svg>
            </span>
          </div>
          {isActiveRetrieveProjectBlock ? (
            <>
              {liveRetrieveProjectLogs && liveRetrieveProjectLogs.length > 0 && (
                <LogsPanel logs={liveRetrieveProjectLogs} logsOpen={logsOpen} setLogsOpen={setLogsOpen} title="EXECUTION LOGS" />
              )}
              {((Array.isArray(liveAgentOutput) && liveAgentOutput.length > 0) ||
                (Array.isArray(liveRetrieveProjectSummary) && liveRetrieveProjectSummary.length > 0)) && (
                <TaskSummaryPanel agentOutput={liveAgentOutput || []} summary={liveRetrieveProjectSummary || []} />
              )}
            </>
          ) : (
            <>
              {hasConsoleLogs && (
                <LogsPanel logs={logs} logsOpen={logsOpen} setLogsOpen={setLogsOpen} title="EXECUTION LOGS" />
              )}
              {hasConsoleLogs &&
                ((Array.isArray(agentOutput) && agentOutput.length > 0) ||
                  (Array.isArray(summary) && summary.length > 0)) && (
                  <TaskSummaryPanel agentOutput={agentOutput || []} summary={summary || []} />
                )}
              {hasExecutionLogsForThisMessage && !hasConsoleLogs && (
                <LogsPanel
                  logs={filteredExecutionLogs.map(
                    (log) =>
                      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.status.toUpperCase()} (${log.type}): ${log.content}`,
                  )}
                  logsOpen={executionLogsOpen}
                  setLogsOpen={setExecutionLogsOpen!}
                  title="EXECUTION LOGS"
                />
              )}
              {hasExecutionLogsForThisMessage &&
                !hasConsoleLogs &&
                ((Array.isArray(executionAgentOutput) && executionAgentOutput.length > 0) ||
                  (Array.isArray(executionSummary) && executionSummary.length > 0)) && (
                  <TaskSummaryPanel agentOutput={executionAgentOutput || []} summary={executionSummary || []} />
                )}
            </>
          )}
        </div>
        <MessageActions
          messageId={message.id}
          shouldShowActions={shouldShowActions}
          shouldShowSuggestions={shouldShowSuggestions}
          parentMessageContent={parentMessageContent}
          parentAgentName={parentAgentName}
          messageContent={message.content}
          onSuggestionClick={onSuggestionClick}
          onRetryClick={onRetryClick}
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      {/* Claude-like cards for attachments */}
      {message.attachedFiles && message.attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {message.attachedFiles.map((file, idx) => (
            <FileAttachmentCard key={`${file.id || file.name}-${idx}`} file={file} onClick={onFileClick} />
          ))}
        </div>
      )}

      {message.content && message.content.trim() && (
        <div className="border border-slate-200 rounded-xl w-fit bg-white p-2 flex items-center h-auto ">
          <div className="text-slate-900 font-normal font-inter p-2 m-0 leading-tight flex flex-wrap items-center">
            {renderedContent}
          </div>
        </div>
      )}
      <MessageActions
        messageId={message.id}
        shouldShowActions={shouldShowActions}
        shouldShowSuggestions={shouldShowSuggestions}
        parentMessageContent={parentMessageContent}
        parentAgentName={parentAgentName}
        messageContent={message.content}
        onSuggestionClick={onSuggestionClick}
        onRetryClick={onRetryClick}
      />
    </div>
  )
}
import React from "react"
import { Bot, Code, Plus, FileText, Check, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

const BOT_STYLES = {
  "@goose": {
    bgColor: "bg-gradient-to-r from-pink-50 to-rose-50",
    textColor: "text-pink-800",
    selectedBg: "bg-gradient-to-r from-pink-100 to-rose-100",
    selectedText: "text-pink-900",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  "@orbital_cli": {
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    textColor: "text-purple-800",
    selectedBg: "bg-gradient-to-r from-purple-100 to-violet-100",
    selectedText: "text-purple-900",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  "@gemini_cli": {
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    textColor: "text-blue-800",
    selectedBg: "bg-gradient-to-r from-blue-100 to-cyan-100",
    selectedText: "text-blue-900",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  "@claude_code": {
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    textColor: "text-green-800",
    selectedBg: "bg-gradient-to-r from-green-100 to-emerald-100",
    selectedText: "text-green-900",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
} as const

const DEFAULT_BOT_STYLE = {
  bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
  textColor: "text-gray-800",
  selectedBg: "bg-gradient-to-r from-gray-100 to-slate-100",
  selectedText: "text-gray-900",
  iconColor: "text-gray-600",
  borderColor: "border-gray-200",
}

const getBotStyles = (bot: string) => BOT_STYLES[bot as keyof typeof BOT_STYLES] || DEFAULT_BOT_STYLE

interface TaskExecutionLog {
  id: string
  timestamp: string
  type: string
  status: string
  content: string
}

interface MessagesListProps {
  messages: any[]
  loading: boolean
  isFullPage: boolean
  logs: string[]
  logsOpen: boolean
  setLogsOpen: (open: boolean) => void
  showMonacoCanvas: boolean
  summary: string
  onShowGeneratedFiles: (messageId: string) => void
  executionLogs?: TaskExecutionLog[]
  executionLogsOpen?: boolean
  setExecutionLogsOpen?: (open: boolean) => void
  executionLogsMessageId?: string
}

const MessagesList = ({
  messages,
  loading,
  isFullPage,
  logs,
  logsOpen,
  setLogsOpen,
  showMonacoCanvas,
  summary,
  onShowGeneratedFiles,
  executionLogs = [],
  executionLogsOpen = false,
  setExecutionLogsOpen,
  executionLogsMessageId,
}: MessagesListProps) => {
  
  const extractSummaryFromExecutionLogs = (logs: TaskExecutionLog[]) => {
    const summaryLog = logs.find(log => log.type === "summary" && log.status === "completed")
    return summaryLog ? summaryLog.content : ""
  }

  const filterExecutionLogsWithoutSummary = (logs: TaskExecutionLog[]) => {
    return logs.filter(log => !(log.type === "summary"))
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
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${styles.bgColor} ${styles.textColor} border ${styles.borderColor}`}
          >
            <Bot className={`w-4 h-4 mr-1.5 ${styles.iconColor}`} />
            {part}
          </span>
        )
        // Add line break after bot mention
        if (index < parts.length - 1 && parts[index + 1].trim()) {
          elements.push(<br key={`br-${index}`} />)
          elements.push(<br key={`br2-${index}`} />)
        }
      } else if (part.trim()) {
        elements.push(
          <span key={index} className="text-sm text-slate-900 font-inter font-normal">
            {part}
          </span>
        )
      }
    })

    return <>{elements}</>
  }

  const MessageAvatar = ({ type }: { type: "ai" | "human" }) => {
    if (type === "human") {
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src="https://randomuser.me/api/portraits/men/40.jpg" 
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-inter bg-gradient-to-br from-slate-600 to-slate-700 text-white font-semibold">
        🤖
      </div>
    )
  }

  const TaskSuggestion = ({ taskSuggestion, isFullPage }: { taskSuggestion: any; isFullPage: boolean }) => (
    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1 font-inter">Task Suggestion</h4>
          <p className="text-sm text-blue-800 font-medium mb-2 font-inter">{taskSuggestion.name}</p>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700 font-medium font-inter">
              {taskSuggestion.priority} priority
            </Badge>
            <span className="text-xs text-blue-600 font-medium font-inter">{taskSuggestion.project}</span>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md transition-all duration-200 font-medium font-inter"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>
    </div>
  )

  const LogsPanel = ({ logs, logsOpen, setLogsOpen, title }: { 
    logs: string[], 
    logsOpen: boolean, 
    setLogsOpen: (open: boolean) => void,
    title: string 
  }) => (
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

  const TaskSummaryPanel = ({ summary }: { summary: string }) => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-3">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-green-600">✅</span>
        <span className="font-semibold text-green-600 text-sm uppercase tracking-wide font-inter">TASK SUMMARY</span>
      </div>
      <div className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-normal font-inter">
        {summary || "Task completed successfully!"}
      </div>
    </div>
  )

  const MessageContent = ({
    message,
    isFullPage,
    onShowGeneratedFiles,
    messageIndex,
  }: {
    message: any
    isFullPage: boolean
    onShowGeneratedFiles: (id: string) => void
    messageIndex: number
  }) => {
    const isLatestHumanMessage = latestHumanIdx === messageIndex
    const isFollowingBotMessage = followingBotIdx === messageIndex
    const hasConsoleLogs = isLatestHumanMessage && logs.length > 0
    const hasExecutionLogsForThisMessage = message.id === executionLogsMessageId && executionLogs.length > 0 && setExecutionLogsOpen
    
    const executionSummary = hasExecutionLogsForThisMessage ? extractSummaryFromExecutionLogs(executionLogs) : ""
    const filteredExecutionLogs = hasExecutionLogsForThisMessage ? filterExecutionLogsWithoutSummary(executionLogs) : []

    // Check if this is a "Retrieve Project" block
    const isRetrieveProjectBlock = message.type === "ai" && message.content === "Generating Project"

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

    return (
      <div className={`border border-slate-200 rounded-xl p-4 shadow-sm w-fit max-w-[75%] ${
        isRetrieveProjectBlock ? "bg-slate-100" : "bg-white"
      }`}>
        <div className="leading-relaxed">
          {isRetrieveProjectBlock ? (
            <div>
              <div className="flex items-center gap-2 cursor-pointer mb-3"
                   onClick={() => onShowGeneratedFiles(message.id)}>
                <span className="text-sm font-medium text-slate-900 font-inter">📄 Retrieve Project</span>
                <span className="ml-auto bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-jetbrains font-medium">
                  Code
                </span>
              </div>
              
              {/* Console Logs for latest interaction */}
              {hasConsoleLogs && (
                <LogsPanel 
                  logs={logs} 
                  logsOpen={logsOpen} 
                  setLogsOpen={setLogsOpen}
                  title="EXECUTION LOGS"
                />
              )}
              
              {/* Execution Logs for specific message */}
              {hasExecutionLogsForThisMessage && !hasConsoleLogs && (
                <LogsPanel 
                  logs={filteredExecutionLogs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.status.toUpperCase()} (${log.type}): ${log.content}`)} 
                  logsOpen={executionLogsOpen} 
                  setLogsOpen={setExecutionLogsOpen}
                  title="EXECUTION LOGS"
                />
              )}
              
              {/* Task Summary */}
              {(hasConsoleLogs && summary && summary.trim()) && (
                <TaskSummaryPanel summary={summary} />
              )}
              
              {/* Execution Summary */}
              {(hasExecutionLogsForThisMessage && !hasConsoleLogs && executionSummary && executionSummary.trim()) && (
                <TaskSummaryPanel summary={executionSummary} />
              )}
            </div>
          ) : (
            <div className="text-slate-900 font-normal font-inter">
              {renderMessageContent(message.content)}
            </div>
          )}
        </div>
      </div>
    )
  }

  const allMessages = messages
    .filter((msg) => !msg.status && msg.type !== "system")
    .sort((a, b) => {
      const timeA =
        a.timestamp && a.timestamp !== "Just now" ? new Date(a.timestamp).getTime() : Number(a.id.split(".")[0])
      const timeB =
        b.timestamp && b.timestamp !== "Just now" ? new Date(b.timestamp).getTime() : Number(b.id.split(".")[0])
      return timeA - timeB
    })

  const latestHumanIdx = allMessages
    .map((msg, idx) => (msg.type === "human" ? idx : -1))
    .filter((idx) => idx !== -1)
    .pop()

  const followingBotIdx = allMessages.findIndex(
    (msg, idx) => latestHumanIdx !== undefined && idx > latestHumanIdx && msg.type === "ai",
  )

  const renderMessage = (message: any, idx: number) => {
    return (
      <React.Fragment key={message.id}>
        <div className="flex gap-3 animate-slide-in">
          <MessageAvatar type={message.type} />
          <div className="flex-1 min-w-0 max-w-[75%]">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 font-inter">
                {message.type === "human" ? "You" : "Bot"}
              </span>
              <span className="text-xs text-slate-400 font-medium font-inter">
                {message.timestamp}
              </span>
            </div>
            <MessageContent 
              message={message} 
              isFullPage={isFullPage} 
              onShowGeneratedFiles={onShowGeneratedFiles}
              messageIndex={idx}
            />
            {message.taskSuggestion && (
              <TaskSuggestion taskSuggestion={message.taskSuggestion} isFullPage={isFullPage} />
            )}
          </div>
        </div>
      </React.Fragment>
    )
  }

  if (isFullPage) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter">
        <div className="flex justify-center w-full h-full">
          <div className="w-[80%] max-w-6xl px-6 py-5 space-y-4">
            {loading ? (
              <div className="text-center text-slate-500 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <span className="font-medium font-inter">Loading messages...</span>
              </div>
            ) : (
              allMessages.map(renderMessage)
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin font-inter">
      <div className="px-6 py-5 space-y-4">
        {loading ? (
          <div className="text-center text-slate-500 py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <span className="font-medium font-inter">Loading messages...</span>
          </div>
        ) : (
          allMessages.map(renderMessage)
        )}
      </div>
    </div>
  )
}

export default MessagesList
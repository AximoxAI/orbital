import React from "react"
import { Bot, Code, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import LogsPanel from "./LogsPanel"

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
  executionLogs?: any[]
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
  // Extract summary from execution logs
  const extractSummaryFromExecutionLogs = (logs: any[]) => {
    const summaryLog = logs.find(log => log.type === "summary" && log.status === "completed")
    return summaryLog ? summaryLog.content : ""
  }

  // Filter execution logs to exclude summary entries
  const filterExecutionLogsWithoutSummary = (logs: any[]) => {
    return logs.filter(log => !(log.type === "summary"))
  }

  const renderMessageContent = (content: string) => {
    const botMentionRegex = /(@orbital_cli|@goose|@gemini_cli|@claude_code)/g
    const parts = content.split(botMentionRegex)

    return parts.map((part, index) => {
      if (availableBots.includes(part)) {
        const styles = getBotStyles(part)
        return (
          <span
            key={index}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${styles.bgColor} ${styles.textColor} border ${styles.borderColor} shadow-sm`}
          >
            <Bot className={`w-4 h-4 mr-1.5 ${styles.iconColor}`} />
            {part}
          </span>
        )
      }
      return part
    })
  }

  const MessageAvatar = ({ type }: { type: "ai" | "human" }) => (
    <Avatar className="w-10 h-10 shadow-md">
      <AvatarFallback className="text-white text-sm shadow-inner">
        <img
          src={
            type === "ai"
              ? "https://cdn-icons-png.flaticon.com/128/14223/14223927.png"
              : "https://randomuser.me/api/portraits/men/40.jpg"
          }
          alt={type === "ai" ? "Bot" : "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  )

  const TaskSuggestion = ({ taskSuggestion, isFullPage }: { taskSuggestion: any; isFullPage: boolean }) => (
    <div
      className={`mt-${isFullPage ? "4" : "3"} p-${isFullPage ? "4" : "3"} bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-${isFullPage ? "xl" : "lg"} shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Task Suggestion</h4>
          <p className="text-sm text-blue-800 font-medium mb-2">{taskSuggestion.name}</p>
          <div className={`flex items-center space-x-${isFullPage ? "3" : "2"}`}>
            <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
              {taskSuggestion.priority} priority
            </Badge>
            <span className="text-xs text-blue-600 font-medium">{taskSuggestion.project}</span>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>
    </div>
  )

  const MessageContent = ({
    message,
    isFullPage,
    onShowGeneratedFiles,
  }: {
    message: any
    isFullPage: boolean
    onShowGeneratedFiles: (id: string) => void
  }) => {
    if (message.isCode) {
      return (
        <div
          className={`bg-gradient-to-r from-gray-50 to-gray-100 p-${isFullPage ? "4" : "3"} rounded-${isFullPage ? "xl" : "lg"} font-mono border border-gray-200 shadow-sm`}
        >
          <div className="flex items-center space-x-2 mb-${isFullPage ? '3' : '2'} pb-2 border-b border-gray-200">
            <Code className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Code suggestion</span>
          </div>
          <pre className={`whitespace-pre-wrap text-${isFullPage ? "sm" : "xs"} text-gray-800`}>{message.content}</pre>
        </div>
      )
    }

    return (
      <div className={`text-sm text-gray-800 font-medium text-${isFullPage ? "base" : "sm"} leading-relaxed`}>
        <div className="flex flex-wrap items-center gap-2">
          {message.type === "ai" && message.content === "Generating Project" ? (
            <div className="w-full flex items-center px-6 py-3  rounded-lg bg-slate-50 hover:shadow-lg transition-all duration-300 cursor-pointer group border"
                 onClick={() => onShowGeneratedFiles(message.id)}>
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-6 h-6 bg-white rounded border flex items-center justify-center shadow-inner">
                  <FileText className="w-4 h-4 text-black" />
                </div>
                <span className="text-base font-medium text-black">Retrieve Project</span>
              </div>
              <div className="ml-4 px-3 py-1.5 bg-white rounded text-sm font-mono text-black border shadow-sm">
                Code
              </div>
            </div>
          ) : (
            renderMessageContent(message.content)
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

  const shouldShowLogsAndSummary = (idx: number) =>
    latestHumanIdx !== undefined && followingBotIdx !== -1 && idx === latestHumanIdx && logs.length > 0

  // Updated logic to show execution logs after the specific message that triggered them
  const shouldShowExecutionLogs = (message: any, idx: number) => {
    return message.id === executionLogsMessageId && 
           executionLogs.length > 0 && 
           setExecutionLogsOpen
  }

  const renderMessage = (message: any, idx: number) => {
    // Extract summary and filtered logs for this specific message
    const executionSummary = message.id === executionLogsMessageId ? extractSummaryFromExecutionLogs(executionLogs) : ""
    const filteredExecutionLogs = message.id === executionLogsMessageId ? filterExecutionLogsWithoutSummary(executionLogs) : []

    return (
      <React.Fragment key={message.id}>
        <div className="flex flex-col space-y-2 opacity-100 animate-fadeIn">
          <div className={`flex space-x-${isFullPage ? "4" : "3"}`}>
            <MessageAvatar type={message.type} />
            <div className="flex-1 min-w-0">
              <div className={`flex items-center space-x-${isFullPage ? "3" : "2"} mb-2`}>
                <span className="text-sm font-bold text-gray-900">{message.author}</span>
                <span className={`text-xs text-gray-500 px-2 py-${isFullPage ? "1" : "0.5"} rounded-full`}>
                  {message.timestamp}
                </span>
              </div>
              <MessageContent 
                message={message} 
                isFullPage={isFullPage} 
                onShowGeneratedFiles={onShowGeneratedFiles}
              />
              {message.taskSuggestion && (
                <TaskSuggestion taskSuggestion={message.taskSuggestion} isFullPage={isFullPage} />
              )}
            </div>
          </div>
        </div>
        {shouldShowLogsAndSummary(idx) && (
          <div className={`space-y-${isFullPage ? "4" : "3"}`}>
            <LogsPanel 
              logs={logs} 
              logsOpen={logsOpen} 
              setLogsOpen={setLogsOpen} 
              showMonacoCanvas={showMonacoCanvas}
              title="Console Logs"
            />
            {summary && summary.trim() && (
              <div
                className={`w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-${isFullPage ? "xl" : "lg"} p-${isFullPage ? "4" : "3"} shadow-sm`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <strong className="text-amber-800 font-bold text-sm uppercase tracking-wide">Summary</strong>
                </div>
                <div className="text-gray-800 font-mono text-sm leading-relaxed">{summary}</div>
              </div>
            )}
          </div>
        )}
        {shouldShowExecutionLogs(message, idx) && setExecutionLogsOpen && (
          <div className={`space-y-${isFullPage ? "4" : "3"}`}>
            {/* Execution Logs Panel (without summary entries) */}
            <LogsPanel 
              logs={filteredExecutionLogs.map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.status.toUpperCase()} (${log.type}): ${log.content}`)} 
              logsOpen={executionLogsOpen} 
              setLogsOpen={setExecutionLogsOpen} 
              showMonacoCanvas={showMonacoCanvas}
              title="Execution Logs"
            />
            {/* Execution Summary Component */}
            {executionSummary && executionSummary.trim() && (
               <div
               className={`w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-${isFullPage ? "xl" : "lg"} p-${isFullPage ? "4" : "3"} shadow-sm`}
             >
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  <strong className="text-amber-800 font-bold text-sm uppercase tracking-wide">Task Summary</strong>
                </div>
                <div className="text-gray-800 font-mono text-sm leading-relaxed whitespace-pre-wrap">{executionSummary}</div>
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    )
  }

  if (isFullPage) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="flex justify-center w-full h-full">
          <div className="w-[65%] max-w-4xl px-6 py-8 space-y-6">
            {loading ? (
              <div className="text-center text-gray-500 py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                Loading messages...
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-3"></div>
            Loading messages...
          </div>
        ) : (
          allMessages.map(renderMessage)
        )}
      </div>
    </div>
  )
}

export default MessagesList
import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, User, Bot, Code, Maximize2, Minimize2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import LeftPanel from "./LeftPanel"
import MonacoCanvas from "./MonacoCanvas"
import { useUser } from "@clerk/clerk-react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ChatApi, Configuration } from "@/api-client"
import { TasksApi } from "@/api-client"
import { io, type Socket } from "socket.io-client"
import LogsPanel from "./LogsPanel"

interface TaskChatProps {
  isOpen: boolean
  onClose: () => void
  taskName: string
  taskId: string
  onCreateTask?: (taskName: string, projectName: string) => void
}

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
}

const mockUsers: UserType[] = [
  { id: "1", name: "James Adams", avatar: "https://randomuser.me/api/portraits/men/11.jpg", isOnline: true },
  { id: "2", name: "Sam Acer", avatar: "https://randomuser.me/api/portraits/men/22.jpg", isOnline: true },
  { id: "3", name: "Erin Reyes", avatar: "https://randomuser.me/api/portraits/women/33.jpg", isOnline: true },
  { id: "4", name: "Holt Andrey", avatar: "https://randomuser.me/api/portraits/men/44.jpg", isOnline: true },
]

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]
const getBotStyles = (bot: string) => {
  const styles = {
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
  }
  return (
    styles[bot as keyof typeof styles] || {
      bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
      textColor: "text-gray-800",
      selectedBg: "bg-gradient-to-r from-gray-100 to-slate-100",
      selectedText: "text-gray-900",
      iconColor: "text-gray-600",
      borderColor: "border-gray-200",
    }
  )
}

function formatDateTime(datetime: string) {
  if (!datetime) return ""
  const d = new Date(datetime)
  if (isNaN(d.getTime())) return datetime
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const SOCKET_URL = "http://localhost:3000/chat"

const TaskChat = ({ isOpen, onClose, taskName: propTaskName, taskId, onCreateTask }: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [editorValue, setEditorValue] = useState("// Type your code here...")
  const [loading, setLoading] = useState(false)

  const [showBotSuggestions, setShowBotSuggestions] = useState(false)
  const [filteredBots, setFilteredBots] = useState<string[]>([])
  const [selectedBotIndex, setSelectedBotIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)

  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)

  const [generatedFiles, setGeneratedFiles] = useState<any[]>([])

  const [logs, setLogs] = useState<string[]>([])
  const [logsOpen, setLogsOpen] = useState(true)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);
  const handleCloseMonacoCanvas = useCallback(() => {
    setShowMonacoCanvas(false)
  }, [])


  const [summary, setSummary] = useState<string>("")

  const chatApi = new ChatApi(new Configuration({ basePath: "http://localhost:3000" }))
  const tasksApi = new TasksApi(new Configuration({ basePath: "http://localhost:3000" }))

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { user } = useUser()

  const navigate = useNavigate()
  const location = useLocation()
  const { taskId: routeTaskId } = useParams<{ taskId?: string }>()

  const isFullPage = !!routeTaskId

  let taskName = propTaskName
  if (isFullPage && location.state?.taskName) {
    taskName = location.state.taskName
  }

  const socketRef = useRef<Socket | null>(null)

  const mapBackendMsg = (msg: any) => {
    let type: "ai" | "human"
    if (msg.sender_type) {
      type = msg.sender_type === "human" ? "human" : "ai"
    } else if (msg.type) {
      type = msg.type === "human" ? "human" : msg.type === "text" ? "human" : "ai"
    } else {
      type = "ai"
    }
    let author = msg.sender_id === user?.username ? "You" : msg.sender_id || "Bot"
    if (type === "ai") author = "Bot"
    return {
      id: msg.id || String(Date.now()),
      type,
      sender_id: msg.sender_id,
      author,
      content: msg.content,
      timestamp: msg.timestamp ? formatDateTime(msg.timestamp) : "Just now",
      isCode: !!msg.isCode,
      taskSuggestion: msg.taskSuggestion || undefined,
    }
  }

  useEffect(() => {
    if (!isOpen || !taskId) return

    const socket = io(SOCKET_URL, { transports: ["websocket"] })
    socketRef.current = socket

    socket.on("connect", () => {
      setSocketConnected(true)
      socket.emit("joinTaskRoom", { taskId })
    })

    socket.on("disconnect", () => {
      setSocketConnected(false)
    })

    socket.on("newMessage", (msg: any) => {
      setMessages((prev) => [...prev, mapBackendMsg(msg)])
    })

    return () => {
      socket.emit("leaveTaskRoom", { taskId })
      socket.disconnect()
    }
  }, [isOpen, taskId, user?.username])

  useEffect(() => {
    if (!isOpen || !taskId) return
    setLoading(true)
    const fetchMessages = async () => {
      try {
        const response = await chatApi.chatControllerFindAll(taskId)
        const apiMessages = Array.isArray(response.data) ? response.data : []
        const mapped: any = apiMessages.map((msg: any) => mapBackendMsg(msg))
        setMessages(mapped)
      } catch (error) {
        setMessages([
          {
            id: "error",
            type: "ai",
            author: "System",
            content: "Failed to load messages from the server.",
            timestamp: "Now",
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [isOpen, taskId, user?.username])

  const handleShowGeneratedFiles = async (messageId: string) => {
    try {
      const response = await tasksApi.tasksControllerGetGeneratedFiles(messageId)
      if (Array.isArray(response.data) && response.data.length > 0) {
        setGeneratedFiles(response.data)
        setShowMonacoCanvas(true)
      }
    } catch (error) {
      // Optionally, show an error somewhere in the UI
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNewMessage(value)

    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const filtered = availableBots.filter((bot) => bot.toLowerCase().includes(textAfterAt.toLowerCase()))
        if (filtered.length > 0) {
          setFilteredBots(filtered)
          setShowBotSuggestions(true)
          setSelectedBotIndex(0)
          setMentionStartPos(lastAtIndex)
          return
        }
      }
    }
    setShowBotSuggestions(false)
  }

  const selectBot = (bot: string) => {
    if (!textareaRef.current) return

    const beforeMention = newMessage.substring(0, mentionStartPos)
    const afterCursor = newMessage.substring(textareaRef.current.selectionStart)
    const newValue = beforeMention + bot + " " + afterCursor

    setNewMessage(newValue)
    setShowBotSuggestions(false)

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + bot.length + 1
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showBotSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedBotIndex((prev) => (prev < filteredBots.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedBotIndex((prev) => (prev > 0 ? prev - 1 : filteredBots.length - 1))
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault()
          selectBot(filteredBots[selectedBotIndex])
          return
        }
      } else if (e.key === "Escape") {
        setShowBotSuggestions(false)
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showBotSuggestions) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const sendMessageViaSocket = (content: string) => {
    if (!taskId || !socketRef.current) return
    const message = {
      senderType: "human",
      senderId: user?.username || "unknown_user",
      content,
      timestamp: new Date().toISOString(),
      taskId,
    }
    socketRef.current.emit("sendMessage", message)
  }

  const executeTaskRef = useRef<(() => void) | null>(null)

  const handleSocketConnected = (connected: boolean) => {
    setSocketConnected(connected)
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageViaSocket(newMessage)

      const trimmedMessage = newMessage.trim()
      const shouldExecuteTask =
        trimmedMessage.startsWith("@goose") ||
        trimmedMessage.startsWith("@orbital_cli") ||
        trimmedMessage.startsWith("@gemini_cli") ||
        trimmedMessage.startsWith("@claude_code")

      if (shouldExecuteTask) {
        setShowMonacoCanvas(true)
        setGeneratedFiles([])
      }

      setNewMessage("")
      setShowBotSuggestions(false)

      if (shouldExecuteTask && executeTaskRef.current) {
        executeTaskRef.current()
      }
    }
  }

  // const getAuthorColor = (author: string) => {
  //   const colors = {
  //     MainBot: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  //     CodeBot: "bg-gradient-to-br from-blue-500 to-blue-600",
  //     ArchitectBot: "bg-gradient-to-br from-purple-500 to-purple-600",
  //     TestBot: "bg-gradient-to-br from-green-500 to-green-600",
  //     ReviewBot: "bg-gradient-to-br from-orange-500 to-orange-600",
  //     You: "bg-gradient-to-br from-gray-600 to-gray-700",
  //   }
  //   return colors[author as keyof typeof colors] || "bg-gradient-to-br from-gray-500 to-gray-600"
  // }

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

  const handleMaximize = () => {
    if (!isFullPage && taskId) {
      navigate(`/tasks/${taskId}`, { state: { taskName } })
    }
  }
  const handleMinimize = () => {
    if (isFullPage) {
      navigate("/project-board")
    }
  }

  const handleLogsUpdate = useCallback((newLogs: string[]) => {
    setLogs(newLogs)
    if (newLogs.length > 0) setLogsOpen(true)
  }, [])

  const handleSummaryUpdate = useCallback((summaryValue: string) => {
    setSummary(summaryValue)
  }, [])

  if (!isOpen) return null

  const containerClasses = isFullPage
    ? "fixed inset-0 bg-gradient-to-br from-gray-50 to-white z-50 flex flex-row"
    : "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"

  const chatWidthClass =
    isFullPage && showMonacoCanvas
      ? "flex flex-col w-[70%] min-w-[384px] h-full bg-white border-r border-gray-100 shadow-sm"
      : isFullPage
        ? "flex flex-col flex-1 h-full bg-white"
        : "flex flex-col w-full h-full"

  const allMessages = messages.filter(msg => !msg.status && msg.type !== "system").sort((a, b) => {
    const timeA =
      a.timestamp && a.timestamp !== "Just now"
        ? new Date(a.timestamp).getTime()
        : Number(a.id.split(".")[0]);
    const timeB =
      b.timestamp && b.timestamp !== "Just now"
        ? new Date(b.timestamp).getTime()
        : Number(b.id.split(".")[0]);
    return timeA - timeB;
  });

  const latestHumanIdx = allMessages
    .map((msg, idx) => (msg.type === "human" ? idx : -1))
    .filter((idx) => idx !== -1)
    .pop()

  const followingBotIdx = allMessages.findIndex(
    (msg, idx) => latestHumanIdx !== undefined && idx > latestHumanIdx && msg.type === "ai",
  )

  return (
    <div className={containerClasses}>
      {isFullPage && (
      <LeftPanel
    collapsed={leftPanelCollapsed}
    onToggleCollapse={() => setLeftPanelCollapsed((c) => !c)}
   />
   )}
      <div className={chatWidthClass}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex flex-wrap items-center gap-y-2 gap-x-4">
  <div className="flex-1 min-w-0">
    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate">Task Discussion</h3>
    <p className="text-xs sm:text-sm text-gray-600 truncate font-medium">{taskName}</p>
  </div>
  <div className="flex items-center space-x-2 flex-shrink-0">
    <Button
      variant="ghost"
      size="sm"
      onClick={isFullPage ? handleMinimize : handleMaximize}
      className="hover:bg-gray-100 transition-colors duration-200"
      aria-label={isFullPage ? "Minimize" : "Maximize"}
    >
      {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="hover:bg-gray-100 transition-colors duration-200"
      aria-label="Close"
    >
      <X className="w-4 h-4" />
    </Button>
  </div>
</div>

        {/* User Avatars Section */}
        <div className="w-full max-w-6xl  px-8 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 ">
          <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide justify-start">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center justify-center min-w-[90px] cursor-pointer group transition-all duration-200 hover:scale-105"
              >
                <div className="relative mb-3">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-3 border-white shadow-lg group-hover:shadow-xl transition-all duration-200"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-3 border-white rounded-full shadow-sm "></div>
                  )}
                </div>
                <span className="text-sm text-gray-700 text-center max-w-[90px] truncate font-medium group-hover:text-gray-900 transition-colors duration-200">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        {isFullPage ? (
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white flex flex-col justify-center items-center">
            <div className="flex-1 w-[65%] max-w-4xl overflow-y-auto px-6 py-8 space-y-6">
              {loading ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  Loading messages...
                </div>
              ) : (
                allMessages.map((message, idx) => (
                  <React.Fragment key={message.id}>
                    <div className="flex flex-col space-y-2 opacity-100 animate-fadeIn">
                      <div className="flex space-x-4">
                        <Avatar className="w-10 h-10 shadow-md">
                          <AvatarFallback
                            className={`text-white text-sm shadow-inner`}
                          >
                            {message.type === "ai" ? <img
      src={   "https://cdn-icons-png.flaticon.com/128/14223/14223927.png"}
      alt="Bot"
      className="w-10 h-10 rounded-full object-cover"
    />: <img
    src={   "https://randomuser.me/api/portraits/men/40.jpg"}
    alt="Bot"
    className="w-10 h-10 rounded-full object-cover"/>
    }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-bold text-gray-900">{message.author}</span>
                            <span className="text-xs text-gray-500  px-2 py-1 rounded-full">
                              {message.timestamp}
                            </span>
                          </div>
                          <div
                            className={`text-sm text-gray-800 ${
                              message.isCode
                                ? "bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl font-mono border border-gray-200 shadow-sm"
                                : "font-medium text-base leading-relaxed"
                            }`}
                          >
                            {message.isCode ? (
                              <div>
                                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-200">
                                  <Code className="w-4 h-4 text-gray-600" />
                                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                                    Code suggestion
                                  </span>
                                </div>
                                <pre className="whitespace-pre-wrap text-sm text-gray-800">{message.content}</pre>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {message.type === "ai" && message.content === "Generating Project" ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleShowGeneratedFiles(message.id)}
                                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm"
                                    >
                                      Retrieve Project
                                    </Button>
                                  </>
                                ) : (
                                  renderMessageContent(message.content)
                                )}
                              </div>
                            )}
                          </div>
                          {message.taskSuggestion && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-blue-900 mb-1">Task Suggestion</h4>
                                  <p className="text-sm text-blue-800 font-medium mb-2">
                                    {message.taskSuggestion.name}
                                  </p>
                                  <div className="flex items-center space-x-3">
                                    <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                                      {message.taskSuggestion.priority} priority
                                    </Badge>
                                    <span className="text-xs text-blue-600 font-medium">
                                      {message.taskSuggestion.project}
                                    </span>
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
                          )}
                        </div>
                      </div>
                    </div>
                    {latestHumanIdx !== undefined &&
followingBotIdx !== -1 &&
idx === latestHumanIdx &&
logs.length > 0 && (
    <div className="space-y-4">
      <LogsPanel
        logs={logs}
        logsOpen={logsOpen}
        setLogsOpen={setLogsOpen}
        showMonacoCanvas={showMonacoCanvas}
      />
      {summary && summary.trim() && (
        <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
            <strong className="text-amber-800 font-bold text-sm uppercase tracking-wide">
              Summary
            </strong>
          </div>
          <div className="text-gray-800 font-mono text-sm leading-relaxed">{summary}</div>
        </div>
      )}
    </div>
  )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-3"></div>
                Loading messages...
              </div>
            ) : (
              allMessages.map((message, idx) => (
                <React.Fragment key={message.id}>
                  <div className="flex flex-col space-y-2 opacity-100 animate-fadeIn">
                    <div className="flex space-x-3">
                    <Avatar className="w-10 h-10 shadow-md">
                          <AvatarFallback
                            className={`text-white text-sm shadow-inner`}
                          >
                            {message.type === "ai" ? <img
      src={   "https://cdn-icons-png.flaticon.com/128/14223/14223927.png"}
      alt="Bot"
      className="w-10 h-10 rounded-full object-cover"
    />: <img
    src={   "https://randomuser.me/api/portraits/men/40.jpg"}
    alt="Bot"
    className="w-10 h-10 rounded-full object-cover"/>
    }
                          </AvatarFallback>
                        </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">{message.author}</span>
                          <span className="text-xs text-gray-500  px-2 py-0.5 rounded-full">
                            {message.timestamp}
                          </span>
                        </div>
                        <div
                          className={`text-sm text-gray-800 ${
                            message.isCode
                              ? "bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg font-mono border border-gray-200 shadow-sm"
                              : "font-medium text-sm leading-relaxed"
                          }`}
                        >
                          {message.isCode ? (
                            <div>
                              <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                                <Code className="w-4 h-4 text-gray-600" />
                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                                  Code suggestion
                                </span>
                              </div>
                              <pre className="whitespace-pre-wrap text-xs text-gray-800">{message.content}</pre>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1">
                              {message.type === "ai" && message.content === "Generating Project" ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShowGeneratedFiles(message.id)}
                                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm"
                                  >
                                    Retrieve Project
                                  </Button>
                                </>
                              ) : (
                                renderMessageContent(message.content)
                              )}
                            </div>
                          )}
                        </div>
                        {message.taskSuggestion && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">Task Suggestion</h4>
                                <p className="text-sm text-blue-800 font-medium mb-2">{message.taskSuggestion.name}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                                    {message.taskSuggestion.priority} priority
                                  </Badge>
                                  <span className="text-xs text-blue-600 font-medium">
                                    {message.taskSuggestion.project}
                                  </span>
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
                        )}
                      </div>
                    </div>
                  </div>
                  {latestHumanIdx !== undefined &&
  followingBotIdx !== -1 &&
  idx === latestHumanIdx &&
  logs.length > 0 && (
    <div className="space-y-3">
      <LogsPanel
        logs={logs}
        logsOpen={logsOpen}
        setLogsOpen={setLogsOpen}
        showMonacoCanvas={showMonacoCanvas}
      />
      {summary && summary.trim() && (
        <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center mb-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
            <strong className="text-amber-800 font-bold text-xs uppercase tracking-wide">
              Summary
            </strong>
          </div>
          <div className="text-gray-800 font-mono text-sm leading-relaxed">{summary}</div>
        </div>
      )}
    </div>
  )}
                </React.Fragment>
              ))
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-5 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 relative">
          {showBotSuggestions && (
            <div className="absolute bottom-full left-6 right-6 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
              {filteredBots.map((bot, index) => {
                const styles = getBotStyles(bot)
                return (
                  <div
                    key={bot}
                    className={`px-4 py-3 cursor-pointer text-sm font-semibold flex items-center space-x-3 transition-all duration-150 ${
                      index === selectedBotIndex
                        ? `${styles.selectedBg} ${styles.selectedText} border-l-4 ${styles.borderColor}`
                        : `hover:${styles.bgColor} ${styles.textColor}`
                    }`}
                    onClick={() => selectBot(bot)}
                  >
                    <Bot className={`w-4 h-4 ${styles.iconColor}`} />
                    <span>{bot}</span>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex space-x-4 items-center">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about the task or discuss implementation..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 text-base resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm transition-all duration-200"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 shadow-md transition-all duration-200 px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      {isFullPage && (
        <MonacoCanvas
          value={editorValue}
          taskId={taskId}
          setValue={setEditorValue}
          executeTaskRef={executeTaskRef}
          isVisible={showMonacoCanvas}
          onSocketConnected={handleSocketConnected}
          filesFromApi={generatedFiles}
          onLogsUpdate={handleLogsUpdate}
          onSummaryUpdate={handleSummaryUpdate}
          onClose={handleCloseMonacoCanvas} 
        />
      )}
    </div>
  )
}

export default TaskChat
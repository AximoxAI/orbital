import { useState, useEffect, useRef, useCallback } from "react"
import LeftPanel from "./LeftPanel"
import MonacoCanvas from "./MonacoCanvas"
import { useUser, useAuth } from "@clerk/clerk-react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import TaskChatHeader from "./TaskChatHeader"
import MessagesList from "./TaskChatMessages"
import ChatInput from "./TaskChatInput"
import { createTaskChatAPI, TaskChatAPI } from "../apiComponents/TaskChatApi"

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

const TaskChat = ({
  isOpen,
  onClose,
  taskName: propTaskName,
  taskId,
  onCreateTask,
}: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentInputMessage, setCurrentInputMessage] = useState("")
  const [editorValue, setEditorValue] = useState("// Type your code here...")
  const [loading, setLoading] = useState(false)
  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [logsOpen, setLogsOpen] = useState(true)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true)
  const [summary, setSummary] = useState<string>("")

  const [executionLogs, setExecutionLogs] = useState<any[]>([])
  const [executionLogsOpen, setExecutionLogsOpen] = useState(true)
  const [executionLogsMessageId, setExecutionLogsMessageId] = useState<string | undefined>()

  // --- LIVE RETRIEVE PROJECT STATE ---
  const [activeRetrieveProjectId, setActiveRetrieveProjectId] = useState<string | undefined>()
  const [liveRetrieveProjectLogs, setLiveRetrieveProjectLogs] = useState<string[]>([])
  const [liveRetrieveProjectSummary, setLiveRetrieveProjectSummary] = useState<string>("")

  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { taskId: routeTaskId } = useParams<{ taskId?: string }>()

  const isFullPage = !!routeTaskId
  const executeTaskRef = useRef<((message?: string) => void) | null>(null)

  let taskName = propTaskName
  if (isFullPage && location.state?.taskName) {
    taskName = location.state.taskName
  }

  const handleCloseMonacoCanvas = useCallback(() => {
    setShowMonacoCanvas(false)
  }, [])

  // New callback to handle when files are generated via socket
  const handleFilesGenerated = useCallback((files: any[]) => {
    if (files && files.length > 0) {
      setGeneratedFiles(files)
      setShowMonacoCanvas(true) // Show canvas when files are generated
    }
  }, [])

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

  // SOCKET: Use one instance for socket (does not need accessToken)
  const [socketApiInstance] = useState(() => new TaskChatAPI())

  useEffect(() => {
    if (!isOpen || !taskId) return

    const socket = socketApiInstance.connectSocket(taskId, {
      onConnect: () => setSocketConnected(true),
      onDisconnect: () => setSocketConnected(false),
      onNewMessage: (msg: any) => {
        setMessages((prev) => {
          // Bind the first AI "Retrieve Project" block for live logs/summary
          if (
            msg.sender_type !== "human" &&
            msg.content === "Generating Project" &&
            activeRetrieveProjectId === undefined
          ) {
            setActiveRetrieveProjectId(msg.id || String(Date.now()))
          }
          return [...prev, mapBackendMsg(msg)]
        })
        setCurrentInputMessage(msg)
      },
    })

    return () => {
      socketApiInstance.disconnectSocket(taskId)
    }
    // eslint-disable-next-line
  }, [isOpen, taskId, user?.username, activeRetrieveProjectId, socketApiInstance])

  const fetchMessages = useCallback(
    async (taskId: string) => {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      return api.fetchMessages(taskId)
    },
    [getToken]
  )

  const getGeneratedFiles = useCallback(
    async (messageId: string) => {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      return api.getGeneratedFiles(messageId)
    },
    [getToken]
  )

  const getExecutionLogs = useCallback(
    async (messageId: string) => {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      return api.getExecutionLogs(messageId)
    },
    [getToken]
  )

  useEffect(() => {
    if (!isOpen || !taskId) return
    setLoading(true)

    fetchMessages(taskId)
      .then(apiMessages => {
        const mapped = apiMessages.map((msg: any) => mapBackendMsg(msg))
        setMessages(mapped)
      })
      .catch(() => {
        setMessages([
          {
            id: "error",
            type: "ai",
            author: "System",
            content: "Failed to load messages from the server.",
            timestamp: "Now",
          },
        ])
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line
  }, [isOpen, taskId, user?.username, fetchMessages])

  const handleShowGeneratedFiles = async (messageId: string) => {
    try {
      const [files, logs] = await Promise.all([
        getGeneratedFiles(messageId),
        getExecutionLogs(messageId).catch(() => [])
      ])

      if (files.length > 0) {
        setGeneratedFiles(files)
        setShowMonacoCanvas(true)
      }

      if (logs.length > 0) {
        setExecutionLogs(logs)
        setExecutionLogsOpen(true)
        setExecutionLogsMessageId(messageId)
      }
    } catch (error) {
      console.error("Failed to fetch generated files:", error)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        senderType: "human",
        senderId: user?.username || "unknown_user",
        content: newMessage,
        timestamp: new Date().toISOString(),
        taskId,
      }

      socketApiInstance.sendMessage(message)

      const trimmedMessage = newMessage.trim()
      const shouldExecuteTask =
        trimmedMessage.startsWith("@goose") ||
        trimmedMessage.startsWith("@orbital_cli") ||
        trimmedMessage.startsWith("@gemini_cli") ||
        trimmedMessage.startsWith("@claude_code")

      if (shouldExecuteTask) {
        // Reset state when starting new execution
        setGeneratedFiles([])
        setExecutionLogs([])
        setExecutionLogsMessageId(undefined)
        setActiveRetrieveProjectId(undefined)
        setLiveRetrieveProjectLogs([])
        setLiveRetrieveProjectSummary("")
        // Don't set showMonacoCanvas to false here, let handleFilesGenerated control it
      }

      setNewMessage("")

      if (shouldExecuteTask && executeTaskRef.current) {
        executeTaskRef.current(newMessage)
      }
    }
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
    if (activeRetrieveProjectId) setLiveRetrieveProjectLogs(newLogs)
  }, [activeRetrieveProjectId])

  const handleSummaryUpdate = useCallback((summaryValue: string) => {
    setSummary(summaryValue)
    if (activeRetrieveProjectId) setLiveRetrieveProjectSummary(summaryValue)
  }, [activeRetrieveProjectId])

  const handleSocketConnected = (connected: boolean) => {
    setSocketConnected(connected)
  }

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

  return (
    <div className={containerClasses}>
      {isFullPage && (
        <LeftPanel collapsed={leftPanelCollapsed} onToggleCollapse={() => setLeftPanelCollapsed((c) => !c)} />
      )}
      <div className={chatWidthClass}>
        <TaskChatHeader
          taskName={taskName}
          isFullPage={isFullPage}
          onClose={onClose}
          onMaximize={handleMaximize}
          onMinimize={handleMinimize}
          users={mockUsers}
        />

        <MessagesList
          messages={messages}
          loading={loading}
          isFullPage={isFullPage}
          logs={logs}
          logsOpen={logsOpen}
          setLogsOpen={setLogsOpen}
          showMonacoCanvas={showMonacoCanvas}
          summary={summary}
          onShowGeneratedFiles={handleShowGeneratedFiles}
          executionLogs={executionLogs}
          executionLogsOpen={executionLogsOpen}
          setExecutionLogsOpen={setExecutionLogsOpen}
          executionLogsMessageId={executionLogsMessageId}
          activeRetrieveProjectId={activeRetrieveProjectId}
          liveRetrieveProjectLogs={liveRetrieveProjectLogs}
          liveRetrieveProjectSummary={liveRetrieveProjectSummary}
        />

        <ChatInput newMessage={newMessage} setNewMessage={setNewMessage} onSendMessage={handleSendMessage} isFullPage={isFullPage} />
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
          inputMessage={currentInputMessage}
          onFilesGenerated={handleFilesGenerated}
        />
      )}
    </div>
  )
}

export default TaskChat
import { useState, useEffect, useRef, useCallback } from "react"
import LeftPanel from "./LeftPanel"
import MonacoCanvas from "./MonacoCanvas"
import { useUser, useAuth } from "@clerk/clerk-react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import TaskChatHeader from "./TaskChatHeader"
import ChatInput from "./TaskChatInput"
import { createTaskChatAPI, TaskChatAPI } from "../apiComponents/TaskChatApi"
import MessagesList from "./TaskChatMessages/index"
import { UsersApi, UserResponseDto } from "@/api-client"

// UserType interface
interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}

interface TaskChatProps {
  isOpen: boolean
  onClose: () => void
  taskName: string
  taskId: string
  onCreateTask?: (taskName: string, projectName: string) => void
}

// Helper to format date/time display
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_KEY // <--- pass backend url like TaskChatApi

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
  const [summary, setSummary] = useState<string[]>([])
  const [agentOutput, setAgentOutput] = useState<string[]>([])

  const [executionLogs, setExecutionLogs] = useState<any[]>([])
  const [executionLogsOpen, setExecutionLogsOpen] = useState(true)
  const [executionLogsMessageId, setExecutionLogsMessageId] = useState<string | undefined>()

  // --- LIVE RETRIEVE PROJECT STATE ---
  const [activeRetrieveProjectId, setActiveRetrieveProjectId] = useState<string | undefined>()
  const [liveRetrieveProjectLogs, setLiveRetrieveProjectLogs] = useState<string[]>([])
  const [liveRetrieveProjectSummary, setLiveRetrieveProjectSummary] = useState<string[]>([])
  const [liveAgentOutput, setLiveAgentOutput] = useState<string[]>([])

  // NEW state for skeleton loading
  const [isUserSkeletonVisible, setIsUserSkeletonVisible] = useState(false)

  // NEW state to track which messages have files
  const [messagesWithFiles, setMessagesWithFiles] = useState<Set<string>>(new Set())

  // --- Manage chat users ---
  const [chatUsers, setChatUsers] = useState<UserType[]>([])
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([])

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

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const sessionToken = await getToken();
        const api = new UsersApi(undefined, BACKEND_URL, undefined);
        const res = await api.usersControllerFindAll({
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        const users: UserResponseDto[] = res.data;
        const mapped: UserType[] = users.map((u) => ({
          id: u.id,
          name: u.name || u.email || u.id,
          avatar: u.avatar,
          isOnline: u.status === "online",
          email: u.email,
        }));
        setAvailableUsers(mapped);

        setChatUsers(prev => {
          if (prev.length > 0) return prev;
          if (user) {
            const self = mapped.find(
              (u) => u.email === user.primaryEmailAddress?.emailAddress || u.id === user.id
            );
            if (self) return [self];
          }
          if (mapped.length > 0) return [mapped[0]];
          return [];
        });
      } catch (err) {
        if (user) {
          const fallbackUser: UserType = {
            id: user.id,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username || user.id,
            avatar: user.imageUrl,
            isOnline: true,
            email: user.primaryEmailAddress?.emailAddress || user.username,
          };
          setAvailableUsers([fallbackUser]);
          setChatUsers(prev => (prev.length > 0 ? prev : [fallbackUser]));
        }
      }
    }
    fetchAllUsers();
  }, [user, getToken]);

  const handleAddUser = (userId: string) => {
    const toAdd = availableUsers.find(u => u.id === userId)
    if (toAdd && !chatUsers.some(u => u.id === userId)) {
      setChatUsers(prev => [...prev, toAdd])
    }
  }

  const handleRemoveUser = (userId: string) => {
    if (chatUsers.length <= 1) return
    setChatUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleCloseMonacoCanvas = useCallback(() => {
    setShowMonacoCanvas(false)
  }, [])

  const handleFilesGenerated = useCallback((files: any[]) => {
    if (files && files.length > 0) {
      setGeneratedFiles(files)
      setShowMonacoCanvas(true)
    } else {
      setShowMonacoCanvas(false)
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
    if (type === "ai") author = msg.sender_id || "Bot"
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

  const socketApiInstanceRef = useRef<TaskChatAPI | null>(null)
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    if (!isOpen || !taskId) return

    getToken().then(sessionToken => {
      if (cancelled) return

      socketApiInstanceRef.current = new TaskChatAPI(sessionToken)
      const socketInstance = socketApiInstanceRef.current.connectChatSocket(taskId, {
        onConnect: () => setSocketConnected(true),
        onDisconnect: () => setSocketConnected(false),
        onNewMessage: (msg: any) => {
          setMessages(prev => {
            setIsUserSkeletonVisible(false)
            if (
              msg.sender_type !== "human" &&
              activeRetrieveProjectId === undefined
            ) {
              setActiveRetrieveProjectId(msg.id || String(Date.now()))
            }
            return [...prev, mapBackendMsg(msg)]
          })
          setCurrentInputMessage(msg)
        },
      })
      setSocket(socketInstance)
    })

    return () => {
      cancelled = true
      if (socketApiInstanceRef.current) {
        socketApiInstanceRef.current.disconnectChatSocket(taskId)
      }
      setSocket(null)
    }
  }, [isOpen, taskId, user?.username, activeRetrieveProjectId, getToken])

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
        const mapped = apiMessages.map(mapBackendMsg)
        setMessages(mapped)
        const checkFilesForMessages = async () => {
          const messagesWithFilesSet = new Set<string>()
          for (const msg of mapped) {
            if (msg.type === "ai") {
              try {
                const files = await getGeneratedFiles(msg.id)
                if (files && files.length > 0) {
                  messagesWithFilesSet.add(msg.id)
                }
              } catch {}
            }
          }
          setMessagesWithFiles(messagesWithFilesSet)
        }
        checkFilesForMessages()
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
  }, [isOpen, taskId, user?.username, fetchMessages, getGeneratedFiles])

  const handleShowGeneratedFiles = async (messageId: string) => {
    try {
      const [files, logs] = await Promise.all([
        getGeneratedFiles(messageId),
        getExecutionLogs(messageId).catch(() => [])
      ])
      if (files.length > 0) {
        setGeneratedFiles(files)
        setShowMonacoCanvas(true)
        setMessagesWithFiles(prev => new Set(prev).add(messageId))
      } else {
        setGeneratedFiles([])
        setShowMonacoCanvas(false)
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
      setIsUserSkeletonVisible(true)
      const message = {
        senderType: "human",
        senderId: user?.username || "unknown_user",
        content: newMessage,
        timestamp: new Date().toISOString(),
        taskId,
      }
      socketApiInstanceRef.current?.sendMessage(message)
      const trimmedMessage = newMessage.trim()
      const shouldExecuteTask =
        trimmedMessage.startsWith("@goose") ||
        trimmedMessage.startsWith("@orbital_cli") ||
        trimmedMessage.startsWith("@gemini_cli") ||
        trimmedMessage.startsWith("@claude_code")
      if (shouldExecuteTask) {
        setGeneratedFiles([])
        setExecutionLogs([])
        setExecutionLogsMessageId(undefined)
        setActiveRetrieveProjectId(undefined)
        setLiveRetrieveProjectLogs([])
        setLiveRetrieveProjectSummary([])
        setLiveAgentOutput([])
        setShowMonacoCanvas(false)
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

  const handleSummaryUpdate = useCallback((summaryValue: string[]) => {
    setSummary(summaryValue)
    if (activeRetrieveProjectId) setLiveRetrieveProjectSummary(summaryValue)
  }, [activeRetrieveProjectId])

  const handleAgentOutputUpdate = useCallback((agentOutputValue: string[]) => {
    setAgentOutput(agentOutputValue)
    if (activeRetrieveProjectId) setLiveAgentOutput(agentOutputValue)
  }, [activeRetrieveProjectId])

  const handleSocketConnected = (connected: boolean) => {
    setSocketConnected(connected)
  }

  useEffect(() => {
    if (generatedFiles.length === 0) {
      setShowMonacoCanvas(false)
    }
  }, [generatedFiles])

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
          users={chatUsers}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
          availableUsers={availableUsers}
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
          agentOutput={agentOutput}
          onShowGeneratedFiles={handleShowGeneratedFiles}
          executionLogs={executionLogs}
          executionLogsOpen={executionLogsOpen}
          setExecutionLogsOpen={setExecutionLogsOpen}
          executionLogsMessageId={executionLogsMessageId}
          activeRetrieveProjectId={activeRetrieveProjectId}
          liveRetrieveProjectLogs={liveRetrieveProjectLogs}
          liveRetrieveProjectSummary={liveRetrieveProjectSummary}
          liveAgentOutput={liveAgentOutput}
          isUserSkeletonVisible={isUserSkeletonVisible}
          messagesWithFiles={messagesWithFiles}
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
          onAgentOutputUpdate={handleAgentOutputUpdate}
          onClose={handleCloseMonacoCanvas}
          inputMessage={currentInputMessage}
          onFilesGenerated={handleFilesGenerated}
        />
      )}
    </div>
  )
}

export default TaskChat
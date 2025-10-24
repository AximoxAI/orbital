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
import Preview from "./Preview"

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

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_KEY 

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
  const [activeRetrieveProjectId, setActiveRetrieveProjectId] = useState<string | undefined>()
  const [liveRetrieveProjectLogs, setLiveRetrieveProjectLogs] = useState<string[]>([])
  const [liveRetrieveProjectSummary, setLiveRetrieveProjectSummary] = useState<string[]>([])
  const [liveAgentOutput, setLiveAgentOutput] = useState<string[]>([])
  const [isUserSkeletonVisible, setIsUserSkeletonVisible] = useState(false)
  const [messagesWithFiles, setMessagesWithFiles] = useState<Set<string>>(new Set())
  const [chatUsers, setChatUsers] = useState<UserType[]>([])
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([])
  const [repoUrl, setRepoUrl] = useState<string | null>(null)

  const [showRepoGraphPreview, setShowRepoGraphPreview] = useState(false)

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

  // ---- Fetch all users ----
  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const sessionToken = await getToken()
        const api = new UsersApi(undefined, BACKEND_URL, undefined)
        const res = await api.usersControllerFindAll({
          headers: { Authorization: `Bearer ${sessionToken}` }
        })
        const users: UserResponseDto[] = res.data
        const mapped: UserType[] = users.map((u) => ({
          id: u.id,
          name: u.name || u.email || u.id,
          avatar: u.avatar,
          isOnline: u.status === "online",
          email: u.email,
        }))
        setAvailableUsers(mapped)
      } catch (err) {
        setAvailableUsers([])
      }
    }
    fetchAllUsers()
  }, [user, getToken])

  // ---- Fetch task assignees and show them directly ----
  useEffect(() => {
    async function fetchTaskAssignees() {
      if (!taskId) return
      try {
        const sessionToken = await getToken()
        const api = createTaskChatAPI(sessionToken)
        const task = await api.fetchTask(taskId)
        // If already full user objects, just show them
        if (Array.isArray(task.assignees) && typeof task.assignees[0] === "object") {
          setChatUsers(task.assignees)
        } else if (Array.isArray(task.assignees)) {
          // If only ids, fallback to mapping
          const mappedAssignees = task.assignees
            .map((aid: string) => availableUsers.find(u => u.id === aid))
            .filter(Boolean) as UserType[]
          setChatUsers(mappedAssignees)
        } else {
          setChatUsers([])
        }
      } catch (err) {
        setChatUsers([])
      }
    }
    fetchTaskAssignees()
  }, [taskId, getToken, availableUsers])

  // ---- Fetch repoUrl from project ----
  useEffect(() => {
    async function fetchRepoUrl() {
      if (!taskId) {
        setRepoUrl(null)
        return
      }
      try {
        const sessionToken = await getToken()
        const api = createTaskChatAPI(sessionToken)
        const task = await api.fetchTask(taskId)
        if (task.project_id) {
          const project = await api.fetchProject(task.project_id)
          setRepoUrl(project.repoUrl || null)
        } else {
          setRepoUrl(null)
        }
      } catch (err) {
        setRepoUrl(null)
      }
    }
    fetchRepoUrl()
  }, [taskId, getToken])

  // ---- Add user to chat and update backend ----
  const handleAddUser = async (userId: string) => {
    if (!userId || chatUsers.some(u => u.id === userId)) return
    const toAdd = availableUsers.find(u => u.id === userId)
    if (!toAdd) return
    const updatedUsers = [...chatUsers, toAdd]
    setChatUsers(updatedUsers)
    try {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      await api.updateTaskAssignees(
        taskId,
        updatedUsers.map(u => u.id)
      )
    } catch (err) {}
  }

  const handleRemoveUser = async (userId: string) => {
    const updatedUsers = chatUsers.filter(u => u.id !== userId)
    setChatUsers(updatedUsers)
    try {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      await api.updateTaskAssignees(
        taskId,
        updatedUsers.map(u => u.id)
      )
    } catch (err) {}
  }

  const handleCloseMonacoCanvas = useCallback(() => {
    setShowMonacoCanvas(false)
    setShowRepoGraphPreview(false) 
  }, [])

  const handleFilesGenerated = useCallback((files: any[]) => {
    if (files && files.length > 0) {
      setGeneratedFiles(files)
      setShowRepoGraphPreview(false) 
      setShowMonacoCanvas(true)
    } else {
      setGeneratedFiles([])
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
              } catch (error) {
                console.error("Failed to get generated files for message", msg.id, error)
              }
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
      setShowRepoGraphPreview(false) 
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
        setShowRepoGraphPreview(false) 
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
    if (generatedFiles.length === 0 && !showRepoGraphPreview) {
      setShowMonacoCanvas(false)
    }
  }, [generatedFiles, showRepoGraphPreview])

  // ---- Suggestion Click Handler ----
  const handleSuggestionClick = (suggestionText: string, parentAgentName?: string) => {
    if (parentAgentName && parentAgentName !== "Bot") {
      setNewMessage(`@${parentAgentName} ${suggestionText}`)
    } else {
      setNewMessage(suggestionText)
    }
  }

  const handleRetryClick = (parentMessageContent: string) => {
    if (parentMessageContent) setNewMessage(parentMessageContent)
  }

  const handleOpenRepoGraph = () => {
    setGeneratedFiles([])
    setExecutionLogs([])
    setExecutionLogsMessageId(undefined)
    setShowRepoGraphPreview(true)
    setShowMonacoCanvas(true)
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
        <LeftPanel
          collapsed={leftPanelCollapsed}
          onToggleCollapse={() => setLeftPanelCollapsed((c) => !c)}
          repoUrl={repoUrl}
        />
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
          onOpenRepoGraph={handleOpenRepoGraph}
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
          chatUsers={availableUsers}
          onSuggestionClick={handleSuggestionClick}
          onRetryClick={handleRetryClick}
        />

       <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          isFullPage={isFullPage}
          availableUsers={chatUsers}
        />
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
          onLogsUpdate={setLogs}
          onSummaryUpdate={setSummary}
          onAgentOutputUpdate={setAgentOutput}
          onClose={handleCloseMonacoCanvas}
          inputMessage={currentInputMessage}
          onFilesGenerated={handleFilesGenerated}
          customPreview={<Preview />}
          showCustomPreview={showRepoGraphPreview}
        />
      )}
    </div>
  )
}

export default TaskChat
import { useState, useEffect, useRef, useCallback } from "react"
import LeftPanel from "./LeftPanel"
import MonacoCanvas from "./MonacoCanvas"
import { useUser, useAuth } from "@clerk/clerk-react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import TaskChatHeader from "./TaskChatHeader"
import ChatInput from "./TaskChatInput"
import { createTaskChatAPI, TaskChatAPI } from "../apiComponents/TaskChatApi"
import MessagesList from "./TaskChatMessages"
import {
  UsersApi,
  UserResponseDto,
  Configuration,
  UploadsApi,
  PresignRequestDtoContentTypeEnum,
} from "@/api-client"
import Preview from "./Preview"
import GlobalDocsModal from "./GlobalDocsModal"
import { FileItem } from "./AttachFileButton"
import axios from "axios"

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_KEY

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
  uploadedAt: string
  id: string
  url: string
}

export interface MonacoFileItem {
  path: string
  content?: string
  contentUrl?: string
  isPdf?: boolean
  timestamp: string
}

interface TaskChatProps {
  isOpen: boolean
  onClose: () => void
  taskName: string
  taskId: string
  onCallStart?: (taskId: string) => void
  onCallEnd?: (taskId: string) => void
  globalDocs?: UploadedFile[]
  projectDocs?: UploadedFile[]
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

const TaskChat = ({
  isOpen,
  onClose,
  taskName: propTaskName,
  taskId,
  onCallStart,
  onCallEnd,
  globalDocs = [],
  projectDocs = [],
}: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentInputMessage, setCurrentInputMessage] = useState("")
  const [editorValue, setEditorValue] = useState("// Type your code here...")
  const [loading, setLoading] = useState(false)
  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<MonacoFileItem[]>([])
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
  const [files, setFiles] = useState<FileItem[]>([])
  const [showGlobalDocsModal, setShowGlobalDocsModal] = useState(false)
  const [showRepoGraphPreview, setShowRepoGraphPreview] = useState(false)

  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { taskId: routeTaskId } = useParams<{ taskId?: string }>()
  const isFullPage = !!routeTaskId
  const executeTaskRef = useRef<((message?: string) => void) | null>(null)
  const socketApiInstanceRef = useRef<TaskChatAPI | null>(null)
  const hasLoadedMessagesRef = useRef(false)

  const mergedGlobalDocs: UploadedFile[] = [
    ...(projectDocs || []),
    ...(isFullPage && location.state?.globalDocs ? location.state.globalDocs : globalDocs),
  ]

  let taskName = propTaskName
  if (isFullPage && location.state?.taskName) {
    taskName = location.state.taskName
  }

  const mapBackendMsg = useCallback(
    (msg: any) => {
      let type: "ai" | "human" | "system"
      if (msg.sender_type) {
        type =
          msg.sender_type === "human" || msg.sender_type === "user"
            ? "human"
            : msg.sender_type === "system"
            ? "system"
            : "ai"
      } else if (msg.type) {
        type =
          msg.type === "human"
            ? "human"
            : msg.type === "text"
            ? "human"
            : msg.type === "system"
            ? "system"
            : "ai"
      } else {
        type = "ai"
      }

      let author = msg.sender_id === user?.username ? "You" : msg.sender_id || "Bot"
      if (type === "ai") author = msg.sender_id || "Bot"

      const isSystemMessage = msg.sender_type === "system" && msg.sender_id === "system"
      const isCallStartMessage = isSystemMessage && msg.content === "Video call started"
      const isCallEndMessage =
        isSystemMessage &&
        (msg.content === "Video call ended" || msg.content?.startsWith("Video call ended"))

      const attachedFiles: UploadedFile[] | undefined =
        msg.files?.map((f: any) => ({
          id: f.fileId,
          name: f.filename,
          url: "",
          uploadedAt: msg.timestamp || new Date().toISOString(),
          size: 0,
          type: "",
        })) ?? undefined

      return {
        id: msg.id || String(Date.now()),
        type,
        sender_id: msg.sender_id,
        author,
        content: msg.content,
        timestamp: msg.timestamp ? formatDateTime(msg.timestamp) : "Just now",
        isCode: !!msg.isCode,
        taskSuggestion: msg.taskSuggestion || undefined,
        isCallEvent: isCallStartMessage || isCallEndMessage,
        callEventType: isCallStartMessage ? "started" : isCallEndMessage ? "ended" : undefined,
        attachedFiles,
      }
    },
    [user?.username],
  )

  const addCallEventMessage = useCallback(
    (eventType: "started" | "ended") => {
      const content = eventType === "started" ? "Video call started" : "Video call ended"
      if (socketApiInstanceRef.current) {
        socketApiInstanceRef.current.sendMessage({
          senderType: "system",
          senderId: "system",
          content,
          timestamp: new Date().toISOString(),
          taskId,
        })
      }
    },
    [taskId],
  )

  const uploadFilesWithMessageId = useCallback(
    async (messageId: string, items: FileItem[]): Promise<UploadedFile[]> => {
      const token = await getToken()
      const configuration = new Configuration({
        basePath: BACKEND_URL,
        accessToken: token || undefined,
      })
      const uploadsApi = new UploadsApi(configuration)

      const uploadedFiles: UploadedFile[] = []

      for (const item of items) {
        try {
          const presignResponse = await uploadsApi.uploadControllerPresign({
            filename: item.file.name,
            contentType: item.file.type as PresignRequestDtoContentTypeEnum,
            messageId,
          })

          const presignData = presignResponse.data

          await axios.put(presignData.uploadUrl, item.file, {
            headers: {
              "Content-Type": item.file.type || "application/octet-stream",
            },
          })

          uploadedFiles.push({
            name: item.file.name,
            size: item.file.size,
            type: item.file.type,
            uploadedAt: new Date().toISOString(),
            id: presignData.fileId,
            url: presignData.viewUrl,
          })
        } catch {
        }
      }

      return uploadedFiles
    },
    [getToken],
  )

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const sessionToken = await getToken()
        const api = new UsersApi(undefined, BACKEND_URL, undefined)
        const res = await api.usersControllerFindAll({
          headers: { Authorization: `Bearer ${sessionToken}` },
        })
        const users: UserResponseDto[] = res.data
        const mapped: UserType[] = users.map((u) => ({
          id: u.id!,
          name: u.name || u.email || u.id!,
          avatar: u.avatar || "",
          isOnline: u.status === "online",
          email: u.email,
        }))
        setAvailableUsers(mapped)
      } catch {
        setAvailableUsers([])
      }
    }
    if (isOpen) fetchAllUsers()
  }, [isOpen, getToken])

  useEffect(() => {
    async function fetchTaskAssignees() {
      if (!taskId) return
      try {
        const sessionToken = await getToken()
        const api = createTaskChatAPI(sessionToken)
        const task = await api.fetchTask(taskId)
        if (Array.isArray(task.assignees) && typeof task.assignees[0] === "object") {
          setChatUsers(task.assignees)
        } else if (Array.isArray(task.assignees)) {
          const mappedAssignees = task.assignees
            .map((aid: string) => availableUsers.find((u) => u.id === aid))
            .filter(Boolean) as UserType[]
          setChatUsers(mappedAssignees)
        } else {
          setChatUsers([])
        }
      } catch {
        setChatUsers([])
      }
    }
    if (isOpen && availableUsers.length > 0) fetchTaskAssignees()
  }, [taskId, isOpen, availableUsers, getToken])

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
      } catch {
        setRepoUrl(null)
      }
    }
    if (isOpen && taskId) fetchRepoUrl()
  }, [taskId, isOpen, getToken])

  useEffect(() => {
    let cancelled = false
    if (!isOpen || !taskId) return

    getToken().then((sessionToken) => {
      if (cancelled) return

      socketApiInstanceRef.current = new TaskChatAPI(sessionToken)
      socketApiInstanceRef.current.connectChatSocket(taskId, {
        onConnect: () => setSocketConnected(true),
        onDisconnect: () => setSocketConnected(false),
        onNewMessage: (msg: any) => {
          setMessages((prev) => {
            setIsUserSkeletonVisible(false)
            if (prev.some((m) => m.id === msg.id)) return prev

            if (
              msg.sender_type !== "human" &&
              msg.sender_type !== "user" &&
              activeRetrieveProjectId === undefined
            ) {
              setActiveRetrieveProjectId(msg.id || String(Date.now()))
            }
            return [...prev, mapBackendMsg(msg)]
          })
          setCurrentInputMessage(msg)
        },
      })
    })

    return () => {
      cancelled = true
      if (socketApiInstanceRef.current) {
        socketApiInstanceRef.current.disconnectChatSocket(taskId)
      }
    }
  }, [isOpen, taskId, getToken, activeRetrieveProjectId, mapBackendMsg])

  useEffect(() => {
    if (!isOpen || !taskId || hasLoadedMessagesRef.current) return

    setLoading(true)
    hasLoadedMessagesRef.current = true

    const fetchData = async () => {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      const apiMessages = await api.fetchMessages(taskId)

      const mapped = apiMessages.map(mapBackendMsg)
      const generatedFilesSet = new Set<string>()
      const attachedFilesSet = new Set<string>()

      for (const msg of mapped) {
        if (msg.type === "ai") {
          try {
            const filesForMsg = await api.getGeneratedFiles(msg.id)
            if (filesForMsg && filesForMsg.length > 0) generatedFilesSet.add(msg.id)
          } catch {
          }
        }
        if (msg.attachedFiles && msg.attachedFiles.length > 0) {
          attachedFilesSet.add(msg.id)
        }
      }

      const union = new Set<string>([...generatedFilesSet, ...attachedFilesSet])
      setMessagesWithFiles(union)
      setMessages(mapped)
    }

    fetchData()
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
  }, [isOpen, taskId, getToken, mapBackendMsg])

  const handleAddUser = async (userId: string) => {
    if (!userId || chatUsers.some((u) => u.id === userId)) return
    const toAdd = availableUsers.find((u) => u.id === userId)
    if (!toAdd) return
    const updatedUsers = [...chatUsers, toAdd]
    setChatUsers(updatedUsers)
    try {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      await api.updateTaskAssignees(
        taskId,
        updatedUsers.map((u) => u.id),
      )
    } catch {
    }
  }

  const handleRemoveUser = async (userId: string) => {
    const updatedUsers = chatUsers.filter((u) => u.id !== userId)
    setChatUsers(updatedUsers)
    try {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      await api.updateTaskAssignees(
        taskId,
        updatedUsers.map((u) => u.id),
      )
    } catch {
    }
  }

  const handleCloseMonacoCanvas = useCallback(() => {
    setShowMonacoCanvas(false)
    setShowRepoGraphPreview(false)
  }, [])

  const handleFilesGenerated = useCallback((filesFromApi: any[]) => {
    if (filesFromApi && filesFromApi.length > 0) {
      setGeneratedFiles(
        filesFromApi.map((f) => ({
          path: f.path || f.filename || "file",
          content: f.content,
          timestamp: new Date().toISOString(),
        })),
      )
      setShowRepoGraphPreview(false)
      setShowMonacoCanvas(true)
    } else {
      setGeneratedFiles([])
      setShowMonacoCanvas(false)
    }
  }, [])

  const handleShowGeneratedFiles = async (messageId: string) => {
    try {
      const sessionToken = await getToken()
      const api = createTaskChatAPI(sessionToken)
      const [filesFromApi, logsFromApi] = await Promise.all([
        api.getGeneratedFiles(messageId),
        api.getExecutionLogs(messageId).catch(() => []),
      ])
      setShowRepoGraphPreview(false)
      if (filesFromApi.length > 0) {
        setGeneratedFiles(
          filesFromApi.map((f) => ({
            path: f.path || f.filename || "file",
            content: f.content,
            timestamp: new Date().toISOString(),
          })),
        )
        setShowMonacoCanvas(true)
        setMessagesWithFiles((prev) => new Set(prev).add(messageId))
      } else {
        setGeneratedFiles([])
        setShowMonacoCanvas(false)
      }
      if (logsFromApi.length > 0) {
        setExecutionLogs(logsFromApi)
        setExecutionLogsOpen(true)
        setExecutionLogsMessageId(messageId)
      }
    } catch {
    }
  }

  // Text / code vs PDF viewer inside MonacoCanvas
  const handleAttachedFileClick = useCallback(
    async (file: UploadedFile) => {
      try {
        const token = await getToken()
        const configuration = new Configuration({
          basePath: BACKEND_URL,
          accessToken: token || undefined,
        })
        const uploadsApi = new UploadsApi(configuration)

        const res = await uploadsApi.uploadControllerGetFile(file.id)
        const url = res.data.view_url
        if (!url) return

        const isPdfByType = file.type === "application/pdf"
        const isPdfByName = file.name.toLowerCase().endsWith(".pdf")

        if (isPdfByType || isPdfByName) {
          const resp = await fetch(url)
          const blob = await resp.blob()
          const objectUrl = URL.createObjectURL(blob)

          const fileItem: MonacoFileItem = {
            path: file.name,
            contentUrl: objectUrl,
            isPdf: true,
            timestamp: file.uploadedAt || new Date().toISOString(),
          }

          setGeneratedFiles([fileItem])
          setShowMonacoCanvas(true)
          setShowRepoGraphPreview(false)
          return
        }

        const response = await fetch(url)
        const content = await response.text()

        const fileItem: MonacoFileItem = {
          path: file.name,
          content,
          timestamp: file.uploadedAt || new Date().toISOString(),
        }

        setGeneratedFiles([fileItem])
        setShowMonacoCanvas(true)
        setShowRepoGraphPreview(false)
        setEditorValue(content)
      } catch {
      }
    },
    [getToken],
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() && files.length === 0) return

    setIsUserSkeletonVisible(true)

    try {
      const createdMessage = await socketApiInstanceRef.current?.sendMessage({
        taskId,
        senderType: "user",
        senderId: user?.username || "unknown_user",
        content: newMessage,
      })

      if (files.length > 0 && createdMessage?.id) {
        const uploadedFiles = await uploadFilesWithMessageId(createdMessage.id, files)

        setMessages((prev) =>
          prev.map((m) =>
            m.id === createdMessage.id ? { ...m, attachedFiles: uploadedFiles } : m,
          ),
        )
        setMessagesWithFiles((prev) => new Set(prev).add(createdMessage.id))
      }

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
      setFiles([])

      if (shouldExecuteTask && executeTaskRef.current) {
        executeTaskRef.current(newMessage)
      }
    } catch {
      setIsUserSkeletonVisible(false)
    }
  }

  const handleMaximize = () => {
    if (!isFullPage && taskId) {
      navigate(`/tasks/${taskId}`, {
        state: { taskName, globalDocs: mergedGlobalDocs },
      })
    }
  }

  const handleMinimize = () => {
    if (isFullPage) navigate("/project-board")
  }

  const handleLogsUpdate = useCallback(
    (newLogs: string[]) => {
      setLogs(newLogs)
      if (newLogs.length > 0) setLogsOpen(true)
      if (activeRetrieveProjectId) setLiveRetrieveProjectLogs(newLogs)
    },
    [activeRetrieveProjectId],
  )

  const handleSummaryUpdate = useCallback(
    (summaryValue: string[]) => {
      setSummary(summaryValue)
      if (activeRetrieveProjectId) setLiveRetrieveProjectSummary(summaryValue)
    },
    [activeRetrieveProjectId],
  )

  const handleAgentOutputUpdate = useCallback(
    (agentOutputValue: string[]) => {
      setAgentOutput(agentOutputValue)
      if (activeRetrieveProjectId) setLiveAgentOutput(agentOutputValue)
    },
    [activeRetrieveProjectId],
  )

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

  const handleAttachDocToTask = (doc: UploadedFile) => {
    const item: FileItem = {
      file: new File([], doc.name, { type: doc.type || "" }),
      id: doc.id,
    }
    if (!files.some((d) => d.id === doc.id)) {
      setFiles((prev) => [...prev, item])
    }
    setShowGlobalDocsModal(false)
  }

  useEffect(() => {
    if (generatedFiles.length === 0 && !showRepoGraphPreview) {
      setShowMonacoCanvas(false)
    }
  }, [generatedFiles, showRepoGraphPreview])

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
          onOpenGlobalDocs={() => setShowGlobalDocsModal(true)}
          onCallStart={() => {
            addCallEventMessage("started")
            onCallStart?.(taskId)
          }}
          onCallEnd={() => {
            addCallEventMessage("ended")
            onCallEnd?.(taskId)
          }}
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
          onFileClick={handleAttachedFileClick}
        />

        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          isFullPage={isFullPage}
          availableUsers={chatUsers}
          files={files}
          setFiles={setFiles}
        />
      </div>

      {isFullPage && (
        <MonacoCanvas
          value={editorValue}
          taskId={taskId}
          setValue={setEditorValue}
          executeTaskRef={executeTaskRef}
          isVisible={showMonacoCanvas}
          onSocketConnected={setSocketConnected}
          filesFromApi={generatedFiles}
          onLogsUpdate={handleLogsUpdate}
          onSummaryUpdate={handleSummaryUpdate}
          onAgentOutputUpdate={handleAgentOutputUpdate}
          onClose={handleCloseMonacoCanvas}
          inputMessage={currentInputMessage}
          onFilesGenerated={handleFilesGenerated}
          customPreview={<Preview />}
          showCustomPreview={showRepoGraphPreview}
        />
      )}

      {showGlobalDocsModal && (
        <GlobalDocsModal
          open={showGlobalDocsModal}
          onClose={() => setShowGlobalDocsModal(false)}
          globalDocs={mergedGlobalDocs}
          attachedDocs={[]}
          onAttach={handleAttachDocToTask}
        />
      )}
    </div>
  )
}

export default TaskChat
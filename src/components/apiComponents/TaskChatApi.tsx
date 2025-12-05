import { ChatApi, Configuration, TasksApi, ProjectsApi } from "@/api-client"
import { io, type Socket } from "socket.io-client"

const CHAT_SOCKET_URL = `${import.meta.env.VITE_BACKEND_API_KEY}/chat`
const EXECUTION_SOCKET_URL = `${import.meta.env.VITE_BACKEND_API_KEY}/ws/v1/tasks`

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

export class TaskChatAPI {
  private chatApi: ChatApi
  private tasksApi: TasksApi
  private projectsApi: ProjectsApi
  private chatSocket: Socket | null = null
  private executionSocket: Socket | null = null
  private sessionToken?: string

  constructor(sessionToken?: string) {
    const config = new Configuration({
      basePath: import.meta.env.VITE_BACKEND_API_KEY,
      accessToken: sessionToken || undefined,
    })
    this.chatApi = new ChatApi(config)
    this.tasksApi = new TasksApi(config)
    this.projectsApi = new ProjectsApi(config)
    this.sessionToken = sessionToken
  }

  async fetchMessages(taskId: string) {
    try {
      const response = await this.chatApi.chatControllerFindAll(taskId)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      throw new Error("Failed to load messages from the server.")
    }
  }

  async getGeneratedFiles(messageId: string) {
    try {
      const response = await this.tasksApi.tasksControllerGetGeneratedFiles(messageId)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      throw error
    }
  }

  async getExecutionLogs(messageId: string) {
    try {
      const response = await this.tasksApi.tasksControllerGetExecutionLogs(messageId)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      throw error
    }
  }

  async fetchTask(taskId: string) {
    try {
      const response = await this.tasksApi.tasksControllerFindOne(taskId)
      return response.data
    } catch (error) {
      throw new Error("Failed to load task details from server.")
    }
  }

  async fetchProject(projectId: string) {
    try {
      const response = await this.projectsApi.projectsControllerFindOne(projectId)
      return response.data
    } catch (error) {
      throw new Error("Failed to load project details from server.")
    }
  }

  async updateTaskAssignees(taskId: string, assignees: string[]) {
    try {
      const task = await this.fetchTask(taskId)
      const status = task.status || "to_do"
      await this.tasksApi.tasksControllerUpdateStatus(taskId, { status, assignees })
    } catch (error) {
      throw new Error("Failed to update task assignees.")
    }
  }

  connectChatSocket(
    taskId: string,
    callbacks: {
      onConnect: () => void
      onDisconnect: () => void
      onNewMessage: (msg: any) => void
    },
  ) {
    if (this.chatSocket) {
      this.disconnectChatSocket(taskId)
    }
    this.chatSocket = io(CHAT_SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: this.sessionToken,
      },
    })

    this.chatSocket.on("connect", () => {
      callbacks.onConnect()
      this.chatSocket?.emit("joinTaskRoom", { taskId })
    })

    this.chatSocket.on("disconnect", callbacks.onDisconnect)
    this.chatSocket.on("newMessage", callbacks.onNewMessage)

    return this.chatSocket
  }

  disconnectChatSocket(taskId: string) {
    if (this.chatSocket) {
      this.chatSocket.emit("leaveTaskRoom", { taskId })
      this.chatSocket.disconnect()
      this.chatSocket = null
    }
  }

  sendMessage(message: {
    taskId: string
    senderType: string
    senderId: string
    content: string
    timestamp?: string
    mentions?: string[]
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.chatSocket || !this.chatSocket.connected) {
        reject(new Error("Socket not connected"))
        return
      }

      const mentionedBots = availableBots.filter((bot) =>
        message.content.includes(bot),
      )

      const messagePayload = {
        ...message,
        mentions: mentionedBots.length > 0 ? mentionedBots : message.mentions,
      }

      this.chatSocket.emit("sendMessage", messagePayload, (response: any) => {
        resolve(response)
      })
    })
  }

  connectExecutionSocket(
    callbacks: {
      onConnect: () => void
      onDisconnect: () => void
      onExecutionResult: (data: any) => void
    },
  ) {
    if (this.executionSocket) {
      this.disconnectExecutionSocket()
    }

    this.executionSocket = io(EXECUTION_SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
      auth: {
        token: this.sessionToken,
      },
    })

    this.executionSocket.on("connect", callbacks.onConnect)
    this.executionSocket.on("disconnect", callbacks.onDisconnect)
    this.executionSocket.on("connect_error", callbacks.onDisconnect)
    this.executionSocket.on("execution_result", callbacks.onExecutionResult)

    return this.executionSocket
  }

  disconnectExecutionSocket() {
    if (this.executionSocket) {
      this.executionSocket.disconnect()
      this.executionSocket = null
    }
  }

  executeTask(payload: {
    taskId: string;
    agentId: string;
    message: string;
    mentions: string[];
  }) {
    if (this.executionSocket && this.executionSocket.connected) {
      this.executionSocket.emit("execute", payload)
    }
  }
}

export const createTaskChatAPI = (sessionToken?: string) => new TaskChatAPI(sessionToken)
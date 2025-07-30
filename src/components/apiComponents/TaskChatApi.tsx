import { ChatApi, Configuration, TasksApi } from "@/api-client"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = "http://localhost:3000/chat"

export class TaskChatAPI {
  private chatApi: ChatApi
  private tasksApi: TasksApi
  private socket: Socket | null = null

  constructor() {
    const config = new Configuration({ basePath: import.meta.env.VITE_BACKEND_API_KEY })
    this.chatApi = new ChatApi(config)
    this.tasksApi = new TasksApi(config)
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
      console.error("Error fetching execution logs:", error)
      throw error
    }
  }

  connectSocket(
    taskId: string,
    callbacks: {
      onConnect: () => void
      onDisconnect: () => void
      onNewMessage: (msg: any) => void
    },
  ) {
    this.socket = io(SOCKET_URL, { transports: ["websocket"] })

    this.socket.on("connect", () => {
      callbacks.onConnect()
      this.socket?.emit("joinTaskRoom", { taskId })
    })

    this.socket.on("disconnect", callbacks.onDisconnect)
    this.socket.on("newMessage", callbacks.onNewMessage)

    return this.socket
  }

  disconnectSocket(taskId: string) {
    if (this.socket) {
      this.socket.emit("leaveTaskRoom", { taskId })
      this.socket.disconnect()
      this.socket = null
    }
  }

  sendMessage(message: {
    senderType: string
    senderId: string
    content: string
    timestamp: string
    taskId: string
  }) {
    if (this.socket) {
      this.socket.emit("sendMessage", message)
    }
  }
}

export const taskChatAPI = new TaskChatAPI()

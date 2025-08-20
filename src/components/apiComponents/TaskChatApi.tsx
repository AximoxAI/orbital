import { ChatApi, Configuration, TasksApi } from "@/api-client"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = `${import.meta.env.VITE_BACKEND_API_KEY}/chat`;
const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

export class TaskChatAPI {
  private chatApi: ChatApi
  private tasksApi: TasksApi
  private socket: Socket | null = null
  private sessionToken?: string

  /**
   * Pass sessionToken for HTTP API calls. If sessionToken is not supplied,
   * API calls will be unauthenticated.
   */
  constructor(sessionToken?: string) {
    const config = new Configuration({
      basePath: import.meta.env.VITE_BACKEND_API_KEY,
      accessToken: sessionToken || undefined,
    })
    this.chatApi = new ChatApi(config)
    this.tasksApi = new TasksApi(config)
    this.sessionToken = sessionToken
  }

  // HTTP API calls
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

  // Socket connection (pass sessionToken for sockets as well)
  connectSocket(
    taskId: string,
    callbacks: {
      onConnect: () => void
      onDisconnect: () => void
      onNewMessage: (msg: any) => void
    },
  ) {

    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token: this.sessionToken,
      },
    })

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
    mentions?: string[]
  }) {
    // Check for mentions of any of the 4 bots and log their names if mentioned
    const mentionedBots = availableBots.filter((bot) => message.content.includes(bot))
    mentionedBots.forEach((bot) => {
      console.log(`Bot mentioned: ${bot}`)
    })

    // Add the mentions field to the message if any bots are mentioned
    const messageWithMentions = {
      ...message,
      mentions: mentionedBots.length > 0 ? mentionedBots : message.mentions,
    }

    if (this.socket) {
      this.socket.emit("sendMessage", messageWithMentions)
    }
  }

  // Optionally, handle mention extraction for other socket events
  sendExecuteMessage(payload: {
    senderType: string
    senderId: string
    content: string
    taskId: string
    agentId: string
    mentions?: string
  }) {
    // Extract bot mentions from the content
    const mentionedBots = availableBots.filter((bot) => payload.content.includes(bot))
    mentionedBots.forEach((bot) => {
      console.log(`Bot mentioned in execute: ${bot}`)
    })

    const payloadWithMentions = {
      ...payload,
      mentions: mentionedBots.length > 0 ? mentionedBots : payload.mentions,
    }

    if (this.socket) {
      this.socket.emit("execute", payloadWithMentions)
    }
  }
}

/**
 * Factory function to create a TaskChatAPI instance with a sessionToken.
 * For HTTP API calls, always create a fresh instance with the latest sessionToken.
 */
export const createTaskChatAPI = (sessionToken?: string) => new TaskChatAPI(sessionToken)
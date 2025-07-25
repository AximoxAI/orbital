import { useEffect, useRef, useState } from "react";
import { ChatApi, Configuration } from "@/api-client";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";

export const SOCKET_URL = "http://localhost:3000/chat";

export function useTaskChatApi(taskId: string, isOpen: boolean) {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [canvasLogMessages, setCanvasLogMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const chatApi = new ChatApi(new Configuration({ basePath: "http://localhost:3000" }));

  function formatDateTime(datetime: string) {
    if (!datetime) return "";
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return datetime;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function mapBackendMsg(msg: any) {
    let type: "ai" | "human";
    if (msg.sender_type) {
      type = msg.sender_type === "human" ? "human" : "ai";
    } else if (msg.type) {
      type = msg.type === "human" ? "human" : (msg.type === "text" ? "human" : "ai");
    } else {
      type = "ai";
    }
    let author = msg.sender_id === user?.username ? "You" : (msg.sender_id || "Bot");
    if (type === "ai") author = "Bot";
    return {
      id: msg.id || String(Date.now()),
      type,
      sender_id: msg.sender_id,
      author,
      content: msg.content,
      timestamp: msg.timestamp ? formatDateTime(msg.timestamp) : "Just now",
      isCode: !!msg.isCode,
      taskSuggestion: msg.taskSuggestion || undefined,
    };
  }

  function collectSystemLogs(msgs: any[], canvasLogs: any[]) {
    return [
      ...msgs.filter(msg => msg.status || msg.type === "system")
        .map(msg => ({
          id: msg.id || String(Date.now()),
          status: msg.status || "info",
          message: msg.content || "",
          summary: msg.summary,
          timestamp: msg.timestamp,
          filePath: msg.filePath
        })),
      ...canvasLogs
    ].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : Number(a.id.split(".")[0]);
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : Number(b.id.split(".")[0]);
      return timeA - timeB;
    });
  }

  useEffect(() => {
    if (!isOpen || !taskId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("joinTaskRoom", { taskId });
    });
    socket.on("newMessage", (msg: any) => {
      setMessages(prev => [...prev, mapBackendMsg(msg)]);
      if (msg.status || msg.type === "system") {
        setSystemLogs(prev => [
          ...prev,
          {
            id: msg.id || String(Date.now()),
            status: msg.status || "info",
            message: msg.content || "",
            summary: msg.summary,
            timestamp: msg.timestamp,
            filePath: msg.filePath
          }
        ]);
      }
    });
    return () => {
      socket.emit("leaveTaskRoom", { taskId });
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [isOpen, taskId, user?.username]);

  useEffect(() => {
    if (!isOpen || !taskId) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const response = await chatApi.chatControllerFindAll(taskId);
        const apiMessages = Array.isArray(response.data) ? response.data : [];
        const mapped: any = apiMessages.map((msg: any) => mapBackendMsg(msg));
        setMessages(mapped);
        setSystemLogs(collectSystemLogs(apiMessages, canvasLogMessages));
      } catch (error) {
        setMessages([{
          id: "error",
          type: "ai",
          author: "System",
          content: "Failed to load messages from the server.",
          timestamp: "Now"
        }]);
        setSystemLogs([{
          id: "error",
          status: "error",
          message: "Failed to load logs from the server.",
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [isOpen, taskId, user?.username]);

  return {
    messages,
    setMessages,
    systemLogs,
    setSystemLogs,
    loading,
    socketRef,
    chatApi,
    canvasLogMessages,
    setCanvasLogMessages,
    formatDateTime,
    mapBackendMsg,
    collectSystemLogs,
  };
}
import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Send, User, Bot, Code, Maximize2, Minimize2, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LeftPanel from "./LeftPanel";
import MonacoCanvas from "./MonacoCanvas";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChatApi, Configuration } from "@/api-client";
import { TasksApi } from "@/api-client";
import { io, Socket } from "socket.io-client";
import LogsPanel from "./LogsPanel";

interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  taskId: string;
  onCreateTask?: (taskName: string, projectName: string) => void;
}

interface UserType {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const mockUsers: UserType[] = [
  { id: "1", name: "James Adams", avatar: "https://randomuser.me/api/portraits/men/11.jpg", isOnline: true },
  { id: "2", name: "Sam Acer", avatar: "https://randomuser.me/api/portraits/men/22.jpg", isOnline: true },
  { id: "3", name: "Erin Reyes", avatar: "https://randomuser.me/api/portraits/women/33.jpg", isOnline: true },
  { id: "4", name: "Holt Andrey", avatar: "https://randomuser.me/api/portraits/men/44.jpg", isOnline: true },
  { id: "5", name: "Simon Steel", avatar: "https://randomuser.me/api/portraits/men/55.jpg", isOnline: true },
  { id: "6", name: "Regina Nov", avatar: "https://randomuser.me/api/portraits/women/66.jpg", isOnline: true },
  { id: "7", name: "Ethan Annie", avatar: "https://randomuser.me/api/portraits/men/77.jpg", isOnline: true },
  { id: "8", name: "Maria Garcia", avatar: "https://randomuser.me/api/portraits/women/88.jpg", isOnline: false },
  { id: "9", name: "David Chen", avatar: "https://randomuser.me/api/portraits/men/99.jpg", isOnline: true },
  { id: "10", name: "Lisa Turner", avatar: "https://randomuser.me/api/portraits/women/90.jpg", isOnline: false },
  { id: "11", name: "Michael Brown", avatar: "https://randomuser.me/api/portraits/men/91.jpg", isOnline: true },
  { id: "12", name: "Angela White", avatar: "https://randomuser.me/api/portraits/women/92.jpg", isOnline: true },
  { id: "13", name: "Chris Green", avatar: "https://randomuser.me/api/portraits/men/93.jpg", isOnline: false },
  { id: "14", name: "Nina Patel", avatar: "https://randomuser.me/api/portraits/women/94.jpg", isOnline: true },
  { id: "15", name: "Raj Singh", avatar: "https://randomuser.me/api/portraits/men/95.jpg", isOnline: false },
];

const availableBots = ["@orbital_cli", "@gemini_cli", "@claude_code"];
const getBotStyles = (bot: string) => {
  const styles = {
    "@orbital_cli": {
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      selectedBg: "bg-purple-50",
      selectedText: "text-purple-900",
      iconColor: "text-purple-600"
    },
    "@gemini_cli": {
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      selectedBg: "bg-blue-50",
      selectedText: "text-blue-900",
      iconColor: "text-blue-600"
    },
    "@claude_code": {
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      selectedBg: "bg-green-50",
      selectedText: "text-green-900",
      iconColor: "text-green-600"
    }
  };
  return styles[bot as keyof typeof styles] || {
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    selectedBg: "bg-gray-50",
    selectedText: "text-gray-900",
    iconColor: "text-gray-600"
  };
};

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

const SOCKET_URL = "http://localhost:3000/chat";

const TaskChat = ({
  isOpen,
  onClose,
  taskName: propTaskName,
  taskId,
  onCreateTask
}: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editorValue, setEditorValue] = useState("// Type your code here...");
  const [loading, setLoading] = useState(false);

  const [showBotSuggestions, setShowBotSuggestions] = useState(false);
  const [filteredBots, setFilteredBots] = useState<string[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);

  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);

  // NEW: logs state and open/close
  const [logs, setLogs] = useState<string[]>([]);
  const [logsOpen, setLogsOpen] = useState(true);

  const chatApi = new ChatApi(new Configuration({ basePath: "http://localhost:3000" }));
  const tasksApi = new TasksApi(new Configuration({ basePath: "http://localhost:3000" }));

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const { taskId: routeTaskId } = useParams<{ taskId?: string }>();

  // Fullscreen if in /tasks/:taskId route
  const isFullPage = !!routeTaskId;

  // --- TASK NAME LOGIC: Take prop, and in fullscreen take state if present ---
  let taskName = propTaskName;
  if (isFullPage && location.state?.taskName) {
    taskName = location.state.taskName;
  }

  // --- SOCKET.IO SETUP ---
  const socketRef = useRef<Socket | null>(null);

  const mapBackendMsg = (msg: any) => {
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
  };

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinTaskRoom", { taskId });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("newMessage", (msg: any) => {
      setMessages(prev => [...prev, mapBackendMsg(msg)]);
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
      } catch (error) {
        setMessages([{
          id: "error",
          type: "ai",
          author: "System",
          content: "Failed to load messages from the server.",
          timestamp: "Now"
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [isOpen, taskId, user?.username]);

  // Handler for loading generated files and showing them in MonacoCanvas
  const handleShowGeneratedFiles = async (messageId: string) => {
    try {
      const response = await tasksApi.tasksControllerGetGeneratedFiles(messageId);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setGeneratedFiles(response.data);
        setShowMonacoCanvas(true);
      }
    } catch (error) {
      // Optionally, show an error somewhere in the UI
    }
  };

  // Bot mention detection and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewMessage(value);

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const filtered = availableBots.filter(bot =>
          bot.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        if (filtered.length > 0) {
          setFilteredBots(filtered);
          setShowBotSuggestions(true);
          setSelectedBotIndex(0);
          setMentionStartPos(lastAtIndex);
          return;
        }
      }
    }
    setShowBotSuggestions(false);
  };

  const selectBot = (bot: string) => {
    if (!textareaRef.current) return;

    const beforeMention = newMessage.substring(0, mentionStartPos);
    const afterCursor = newMessage.substring(textareaRef.current.selectionStart);
    const newValue = beforeMention + bot + " " + afterCursor;

    setNewMessage(newValue);
    setShowBotSuggestions(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + bot.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showBotSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedBotIndex((prev) =>
          prev < filteredBots.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedBotIndex((prev) =>
          prev > 0 ? prev - 1 : filteredBots.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault();
          selectBot(filteredBots[selectedBotIndex]);
          return;
        }
      } else if (e.key === "Escape") {
        setShowBotSuggestions(false);
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !showBotSuggestions) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Send message via WebSocket
  const sendMessageViaSocket = (content: string) => {
    if (!taskId || !socketRef.current) return;
    const message = {
      senderType: "human",
      senderId: user?.username || "unknown_user",
      content,
      timestamp: new Date().toISOString(),
      taskId
    };
    socketRef.current.emit("sendMessage", message);
  };

  // Reference for MonacoCanvas execute
  const executeTaskRef = useRef<(() => void) | null>(null);

  const handleSocketConnected = (connected: boolean) => {
    setSocketConnected(connected);
  };

  // Use socket send only, no optimistic update
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageViaSocket(newMessage);

      const trimmedMessage = newMessage.trim();
      const shouldExecuteTask =
        trimmedMessage.startsWith("@orbital_cli") ||
        trimmedMessage.startsWith("@gemini_cli") ||
        trimmedMessage.startsWith("@claude_code");

      if (shouldExecuteTask) {
        setShowMonacoCanvas(true);
        setGeneratedFiles([]); // clear any loaded files if executing new task
      }

      setNewMessage("");
      setShowBotSuggestions(false);

      if (shouldExecuteTask && executeTaskRef.current) {
        executeTaskRef.current();
      }
    }
  };

  const getAuthorColor = (author: string) => {
    const colors = {
      MainBot: "bg-indigo-500",
      CodeBot: "bg-blue-500",
      ArchitectBot: "bg-purple-500",
      TestBot: "bg-green-500",
      ReviewBot: "bg-orange-500",
      You: "bg-gray-600"
    };
    return colors[author as keyof typeof colors] || "bg-gray-500";
  };

  const renderMessageContent = (content: string) => {
    const botMentionRegex = /(@orbital_cli|@gemini_cli|@claude_code)/g;
    const parts = content.split(botMentionRegex);

    return parts.map((part, index) => {
      if (availableBots.includes(part)) {
        const styles = getBotStyles(part);
        return (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-md text-base font-semibold ${styles.bgColor} ${styles.textColor}`}
          >
            <Bot className={`w-4 h-4 mr-1 ${styles.iconColor}`} />
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Maximize/minimize handlers
  const handleMaximize = () => {
    if (!isFullPage && taskId) {
      navigate(`/tasks/${taskId}`, { state: { taskName } });
    }
  };
  const handleMinimize = () => {
    if (isFullPage) {
      navigate("/project-board");
    }
  };

  // Handler for logs from MonacoCanvas
  const handleLogsUpdate = useCallback((newLogs: string[]) => {
    setLogs(newLogs);
    if (newLogs.length > 0) setLogsOpen(true);
  }, []);

  if (!isOpen) return null;

  const containerClasses = isFullPage
    ? "fixed inset-0 bg-white z-50 flex flex-row"
    : "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col";

  const chatWidthClass = isFullPage && showMonacoCanvas
    ? "flex flex-col w-[70%] min-w-[384px] h-full bg-white border-r border-gray-100"
    : isFullPage
    ? "flex flex-col flex-1 h-full bg-white"
    : "flex flex-col w-full h-full";

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

  return (
    <div className={containerClasses}>
      {isFullPage && <LeftPanel />}
      <div className={chatWidthClass}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Task Discussion</h3>
            <p className="text-sm text-gray-500 truncate">{taskName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={isFullPage ? handleMinimize : handleMaximize}
            >
              {isFullPage ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="w-full max-w-6xl mx-auto p-6">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide justify-start">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex flex-col items-center justify-evenly min-w-[80px] cursor-pointer group">
                <div className="relative mb-2">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <span className="text-sm text-gray-700 text-center max-w-[80px] truncate">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

                {/* --- LOGS PANEL, new addition --- */}
          {showMonacoCanvas && logs.length > 0 && (
          <LogsPanel
          logs={logs}
          logsOpen={logsOpen}
          setLogsOpen={setLogsOpen}
          showMonacoCanvas={showMonacoCanvas}
        />
        )}
        {/* --- END LOGS PANEL --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-400">Loading messages...</div>
          ) : (
            allMessages.map((message) => (
              <div key={message.id} className="flex space-x-3 opacity-100">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`${getAuthorColor(message.author)} text-white text-xs`}>
                    {message.type === "ai" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{message.author}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div
                    className={`text-sm text-gray-700 ${message.isCode ? "bg-gray-50 p-3 rounded-lg font-mono" : ""}`}
                  >
                    {message.isCode ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Code className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500">Code suggestion</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs">{message.content}</pre>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1">
                        {message.type === "ai" && message.content === "Generating Project" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowGeneratedFiles(message.id)}
                          >
                            Retrieve Project
                          </Button>
                        ) : (
                          renderMessageContent(message.content)
                        )}
                      </div>
                    )}
                  </div>
                  {message.taskSuggestion && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Task Suggestion</h4>
                          <p className="text-sm text-blue-700">{message.taskSuggestion.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {message.taskSuggestion.priority} priority
                            </Badge>
                            <span className="text-xs text-blue-600">{message.taskSuggestion.project}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-1" />
                          Create
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Chat Input Bar */}
        <div className="p-4 border-t border-gray-200 relative">
          {showBotSuggestions && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {filteredBots.map((bot, index) => {
                const styles = getBotStyles(bot);
                return (
                  <div
                    key={bot}
                    className={`px-3 py-2 cursor-pointer text-base font-semibold flex items-center space-x-2 ${
                      index === selectedBotIndex
                        ? `${styles.selectedBg} ${styles.selectedText}`
                        : `hover:${styles.bgColor} ${styles.textColor}`
                    }`}
                    onClick={() => selectBot(bot)}
                  >
                    <Bot className={`w-4 h-4 ${styles.iconColor}`} />
                    <span>{bot}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex space-x-2">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about the task or discuss implementation..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 text-base"
              rows={2}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
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
        />
      )}
    </div>
  );
};

export default TaskChat;
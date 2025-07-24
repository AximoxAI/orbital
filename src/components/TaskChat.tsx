import { useState, useEffect, useRef } from "react";
import { X, Send, User, Bot, Code, Maximize2, Minimize2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LeftPanel from "./LeftPanel";
import MonacoCanvas from "./MonacoCanvas";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";

import { ChatApi, Configuration } from "@/api-client";

interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  taskId: string;
  onCreateTask?: (taskName: string, projectName: string) => void;
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

// Available bots for mention autocomplete with color configurations
const availableBots = ["@orbital_cli", "@gemini_cli", "@claude_code"];

// Bot color configurations
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

// --- Helper: Format datetime to readable ---
function formatDateTime(datetime: string) {
  if (!datetime) return "";
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return datetime;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TaskChat = ({ isOpen, onClose, taskName, taskId, onCreateTask }: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editorValue, setEditorValue] = useState('// Type your code here...');
  const [loading, setLoading] = useState(false);
  
  // Bot mention autocomplete states
  const [showBotSuggestions, setShowBotSuggestions] = useState(false);
  const [filteredBots, setFilteredBots] = useState<string[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);

  // MonacoCanvas visibility states
  const [showMonacoCanvas, setShowMonacoCanvas] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const chatApi = new ChatApi(new Configuration({ basePath: "http://localhost:3000" }));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const [isFullPage, setIsFullPage] = useState(false);
  const [prevPath, setPrevPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (isFullPage) {
      if (!prevPath) setPrevPath(location.pathname + location.search + location.hash);
      if (location.pathname !== `/tasks/${taskId}`) {
        navigate(`/tasks/${taskId}`, { replace: false });
      }
    } else {
      if (prevPath && location.pathname === `/tasks/${taskId}`) {
        navigate(prevPath, { replace: false });
        setPrevPath(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullPage, isOpen, taskId]);

  useEffect(() => {
    if (isOpen && location.pathname === `/tasks/${taskId}`) {
      setIsFullPage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, location.pathname, taskId]);

  useEffect(() => {
    if (!isOpen || !taskId) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const response = await chatApi.chatControllerFindAll(taskId);
        const apiMessages = Array.isArray(response.data) ? response.data : [];
        const mapped: any = apiMessages.map((msg: any) => ({
          id: msg.id || String(Date.now()),
          type: msg.type === "human" ? "human" : "ai",
          author: user?.username ,
          content: msg.content,
          timestamp: msg.timestamp ? formatDateTime(msg.timestamp) : "Just now",
          isCode: !!msg.isCode,
          taskSuggestion: msg.taskSuggestion || undefined,
        }));
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
  }, [isOpen, taskId]);

  // Handle bot mention detection and filtering
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setNewMessage(value);
    
    // Find the last @ symbol before cursor position
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if we're still typing a mention (no spaces after @)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
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

  // Handle bot selection from dropdown
  const selectBot = (bot: string) => {
    if (!textareaRef.current) return;
    
    const beforeMention = newMessage.substring(0, mentionStartPos);
    const afterCursor = newMessage.substring(textareaRef.current.selectionStart);
    const newValue = beforeMention + bot + ' ' + afterCursor;
    
    setNewMessage(newValue);
    setShowBotSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + bot.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation for bot suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showBotSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedBotIndex((prev) => 
          prev < filteredBots.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedBotIndex((prev) => 
          prev > 0 ? prev - 1 : filteredBots.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          selectBot(filteredBots[selectedBotIndex]);
          return;
        }
      } else if (e.key === 'Escape') {
        setShowBotSuggestions(false);
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey && !showBotSuggestions) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendMessageToApi = async (content: string) => {
    if (!taskId) return;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      type: "human",
      author: user?.username,
      sender_id: user?.username,
      content,
      timestamp: "Just now",
      isCode: false,
      pending: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Only include @CodeBot in mentions if "@codebot" is typed in the message (case-insensitive)
      const mentions = /@codebot/i.test(content) ? ["@CodeBot"] : [];
      const body = {
        content,
        type: "text",
        mentions,
      };
      const response = await chatApi.chatControllerCreate(taskId, body);
      let apiMessage = (response.data as any) || {};
      if (apiMessage && apiMessage.id) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? {
                  id: apiMessage.id,
                  type: apiMessage.type === "human" ? "human" : "ai",
                  author: user?.username,
                  content: apiMessage.content,
                  timestamp: apiMessage.timestamp ? formatDateTime(apiMessage.timestamp) : "Just now",
                  isCode: !!apiMessage.isCode,
                  taskSuggestion: apiMessage.taskSuggestion || undefined,
                  pending: false,
                }
              : msg
          )
        );
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? {
                  ...msg,
                  type: "ai",
                  author: "System",
                  content: "No response from server.",
                  pending: false
                }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? {
                ...msg,
                type: "ai",
                author: "System",
                content: "Sorry, I couldn't send your message to the server.",
                pending: false
              }
            : msg
        )
      );
    }
  };

  // Reference to store the execute task function from MonacoCanvas
  const executeTaskRef = useRef<(() => void) | null>(null);

  // Handle socket connection status from MonacoCanvas
  const handleSocketConnected = (connected: boolean) => {
    setSocketConnected(connected);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageToApi(newMessage);
      
      // Check if message starts with "@orbital_cli" or "@gemini_cli" to trigger task execution
      const trimmedMessage = newMessage.trim();
      const shouldExecuteTask = trimmedMessage.startsWith("@orbital_cli") || trimmedMessage.startsWith("@gemini_cli") || trimmedMessage.startsWith("@claude_code");
      
      // Show MonacoCanvas when a bot is mentioned
      if (shouldExecuteTask) {
        setShowMonacoCanvas(true);
      }
      
      setNewMessage('');
      setShowBotSuggestions(false);
      
      // Execute task after sending message if executeTaskRef is available and message starts with trigger words
      if (shouldExecuteTask && executeTaskRef.current) {
        executeTaskRef.current();
      }
    }
  };

  const getAuthorColor = (author: string) => {
    const colors = {
      'MainBot': 'bg-indigo-500',
      'CodeBot': 'bg-blue-500',
      'ArchitectBot': 'bg-purple-500',
      'TestBot': 'bg-green-500',
      'ReviewBot': 'bg-orange-500',
      'You': 'bg-gray-600'
    };
    return colors[author as keyof typeof colors] || 'bg-gray-500';
  };

  // Function to render message content with styled bot mentions
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

  if (!isOpen) return null;

  const containerClasses = isFullPage
    ? "fixed inset-0 bg-white z-50 flex flex-row"
    : "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col";

  // Determine chat width based on MonacoCanvas visibility
  const chatWidthClass = isFullPage && showMonacoCanvas 
    ? "flex flex-col w-[70%] min-w-[384px] h-full bg-white border-r border-gray-100" 
    : isFullPage 
    ? "flex flex-col flex-1 h-full bg-white" 
    : "flex flex-col w-full h-full";

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
              onClick={() => setIsFullPage(!isFullPage)}
            >
              {isFullPage ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto p-6">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide justify-start">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex flex-col items-center justify-evenly  min-w-[80px] cursor-pointer group">
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

        {/* FULL WIDTH MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-400">Loading messages...</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3 opacity-100" style={message.pending ? { opacity: 0.6 } : {}}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`${getAuthorColor(message.author)} text-white text-xs`}>
                    {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{message.author}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {message.pending && <span className="text-xs text-blue-400 animate-pulse ml-2">Sending...</span>}
                  </div>
                  <div className={`text-sm text-gray-700 ${message.isCode ? 'bg-gray-50 p-3 rounded-lg font-mono' : ''}`}>
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
                        {renderMessageContent(message.content)}
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
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
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

        {/* FULL WIDTH INPUT BOX */}
        <div className="p-4 border-t border-gray-200 relative">
          {/* Bot suggestions dropdown */}
          {showBotSuggestions && (
            <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {filteredBots.map((bot, index) => {
                const styles = getBotStyles(bot);
                return (
                  <div
                    key={bot}
                    className={`px-3 py-2 cursor-pointer text-base font-semibold flex items-center space-x-2 ${
                      index === selectedBotIndex ? `${styles.selectedBg} ${styles.selectedText}` : `hover:${styles.bgColor} ${styles.textColor}`
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
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim()}
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
        />
      )}
    </div>
  );
};

export default TaskChat;
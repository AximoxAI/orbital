import { useState, useEffect } from "react";
import { X, Send, User, Bot, Code, Maximize2, Minimize2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LeftPanel from "./LeftPanel";
import MonacoCanvas from "./MonacoCanvas";

import { ChatApi, Configuration } from "@/api-client";

interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  taskId: string;
  onCreateTask?: (taskName: string, projectName: string) => void;
}

// Re-add static mock users/avatars
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

const TaskChat = ({ isOpen, onClose, taskName, taskId, onCreateTask }: TaskChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editorValue, setEditorValue] = useState('// Type your code here...');
  const [loading, setLoading] = useState(false);

  // ChatApi instance
  const chatApi = new ChatApi(new Configuration({ basePath: "http://localhost:3000" }));

  // Fetch messages when chat opens or when taskId changes
  useEffect(() => {
    if (!isOpen || !taskId) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const response = await chatApi.chatControllerFindAll(taskId);
        const apiMessages = Array.isArray(response.data)
          ? response.data
          : [];
        // Map API response to Message[]
        const mapped: any = apiMessages.map((msg: any) => ({
          id: msg.id || String(Date.now()),
          type: msg.type === "human" ? "human" : "ai",
          author: msg.sender_id || (msg.type === "human" ? "You" : "Bot"),
          content: msg.content,
          timestamp: msg.timestamp || "Just now",
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

  const sendMessageToApi = async (content: string) => {
    if (!taskId) return;
    try {
      const body = {
        content,
        type: "text",
        mentions: ["@CodeBot"]
      };
      const response = await chatApi.chatControllerCreate(taskId, body);
      let apiMessage = (response.data as any) || {};
      if (apiMessage && apiMessage.id) {
        setMessages(prev => [
          ...prev,
          {
            id: apiMessage.id,
            type: apiMessage.type === "human" ? "human" : "ai",
            author: apiMessage.author,
            content: apiMessage.content,
            timestamp: apiMessage.timestamp,
            isCode: !!apiMessage.isCode,
            taskSuggestion: apiMessage.taskSuggestion || undefined
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            type: "ai",
            author: "System",
            content: "No response from server.",
            timestamp: "Just now"
          }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          type: "ai",
          author: "System",
          content: "Sorry, I couldn't send your message to the server.",
          timestamp: "Just now"
        }
      ]);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageToApi(newMessage);
      setNewMessage('');
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

  const [isFullPage, setIsFullPage] = useState(false);

  if (!isOpen) return null;

  const containerClasses = isFullPage
    ? "fixed inset-0 bg-white z-50 flex flex-row"
    : "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col";

  return (
    <div className={containerClasses}>
      {isFullPage && <LeftPanel />}
      <div className={isFullPage ? "flex flex-col w-[49%] min-w-[384px] h-full bg-white border-r border-gray-100" : "flex flex-col w-full h-full"}>
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

        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isFullPage ? 'max-w-4xl mx-auto w-full' : ''}`}>
          {loading ? (
            <div className="text-center text-gray-400">Loading messages...</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={`${getAuthorColor(message.author)} text-white text-xs`}>
                    {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{message.author}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
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
                      message.content
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

        <div className={`p-4 border-t border-gray-200 ${isFullPage ? 'max-w-4xl mx-auto w-full' : ''}`}>
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask about the task or discuss implementation..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      {isFullPage && (
        <MonacoCanvas value={editorValue} setValue={setEditorValue} />
      )}
    </div>
  );
};

export default TaskChat;
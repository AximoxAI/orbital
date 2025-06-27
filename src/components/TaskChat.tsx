
import { useState } from "react";
import { X, Send, User, Bot, Code, Maximize2, Minimize2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: 'human' | 'ai';
  author: string;
  content: string;
  timestamp: string;
  isCode?: boolean;
  taskSuggestion?: {
    name: string;
    project: string;
    priority: 'high' | 'medium' | 'low';
  };
}

interface TaskChatProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  onCreateTask?: (taskName: string, projectName: string) => void;
}

const TaskChat = ({ isOpen, onClose, taskName, onCreateTask }: TaskChatProps) => {
  const [isFullPage, setIsFullPage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      author: 'MainBot',
      content: `Hello! I'm the main bot that helps coordinate all tasks. I can analyze your project and suggest new tasks to improve your workflow. Currently discussing: "${taskName}".`,
      timestamp: '5 minutes ago'
    },
    {
      id: '2',
      type: 'ai',
      author: 'CodeBot',
      content: `I'll help you with "${taskName}". Let me analyze the requirements and suggest an approach.`,
      timestamp: '4 minutes ago'
    },
    {
      id: '3',
      type: 'human',
      author: 'You',
      content: 'What would be the best way to structure this feature?',
      timestamp: '3 minutes ago'
    },
    {
      id: '4',
      type: 'ai',
      author: 'ArchitectBot',
      content: 'Based on the requirements, I recommend a modular approach with separate components for data handling and UI rendering.',
      timestamp: '2 minutes ago'
    },
    {
      id: '5',
      type: 'ai',
      author: 'MainBot',
      content: 'I notice this task might benefit from additional supporting tasks. Would you like me to create some related tasks?',
      timestamp: '1 minute ago',
      taskSuggestion: {
        name: 'Create unit tests for new feature',
        project: 'Current Project',
        priority: 'medium'
      }
    },
    {
      id: '6',
      type: 'ai',
      author: 'CodeBot',
      content: 'Here\'s a starter template:\n\n```typescript\nconst TaskComponent = () => {\n  const [data, setData] = useState([]);\n  \n  return (\n    <div className="task-container">\n      {/* Implementation here */}\n    </div>\n  );\n};\n```',
      timestamp: 'Just now',
      isCode: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        type: 'human',
        author: 'You',
        content: newMessage,
        timestamp: 'Just now'
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate AI response with possible task suggestions
      setTimeout(() => {
        const responses = [
          {
            author: 'MainBot',
            content: 'I can help you break this down into smaller tasks. Let me suggest some actionable items.',
            taskSuggestion: {
              name: 'Implement error handling',
              project: 'Current Project',
              priority: 'high' as const
            }
          },
          {
            author: 'CodeBot',
            content: 'That\'s a great point! Let me work on implementing that suggestion.',
          },
          {
            author: 'ArchitectBot',
            content: 'I recommend we also consider the database schema for this feature.',
          }
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          author: randomResponse.author,
          content: randomResponse.content,
          timestamp: 'Just now',
          taskSuggestion: randomResponse.taskSuggestion
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleCreateTask = (taskSuggestion: Message['taskSuggestion']) => {
    if (taskSuggestion && onCreateTask) {
      onCreateTask(taskSuggestion.name, taskSuggestion.project);
      
      // Add confirmation message
      const confirmMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        author: 'MainBot',
        content: `✅ Task "${taskSuggestion.name}" has been created successfully!`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, confirmMessage]);
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

  if (!isOpen) return null;

  const containerClasses = isFullPage 
    ? "fixed inset-0 bg-white z-50 flex flex-col"
    : "fixed inset-y-0 left-0 w-96 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col";

  return (
    <div className={containerClasses}>
      {/* Header */}
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

      {/* Active Agents */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-medium text-gray-500">ACTIVE AGENTS</span>
          <Badge variant="secondary" className="text-xs">5 online</Badge>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">MainBot</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">CodeBot</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">ArchitectBot</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">TestBot</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">ReviewBot</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isFullPage ? 'max-w-4xl mx-auto w-full' : ''}`}>
        {messages.map((message) => (
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
              
              {/* Task Suggestion */}
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
                      onClick={() => handleCreateTask(message.taskSuggestion)}
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
        ))}
      </div>

      {/* Input */}
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
  );
};

export default TaskChat;

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Send, User, Bot, Code, Maximize2, Minimize2, Plus } from "lucide-react";
import SystemLogsCard from "./SystemLogs";
import LeftPanel from "./LeftPanel";
import { useRef } from "react";

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

function renderMessageContent(content: string) {
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
}

function getAuthorColor(author: string) {
  const colors = {
    MainBot: "bg-indigo-500",
    CodeBot: "bg-blue-500",
    ArchitectBot: "bg-purple-500",
    TestBot: "bg-green-500",
    ReviewBot: "bg-orange-500",
    You: "bg-gray-600"
  };
  return colors[author as keyof typeof colors] || "bg-gray-500";
}

const mockUsers = [
  // ... same mockUsers array as before ...
  { id: "1", name: "James Adams", avatar: "https://randomuser.me/api/portraits/men/11.jpg", isOnline: true },
  // ... etc ...
];

export function TaskChatPanel({
  isFullPage,
  taskName,
  onMaximize,
  onMinimize,
  onClose,
  mockUsers,
  systemLogs,
  allMessages,
  loading,
  newMessage,
  showBotSuggestions,
  filteredBots,
  selectedBotIndex,
  selectBot,
  textareaRef,
  handleInputChange,
  handleKeyDown,
  handleSendMessage,
  mentionStartPos,
  taskId,
  showMonacoCanvas,
}) {
  const containerClasses = isFullPage
    ? "fixed inset-0 bg-white z-50 flex flex-row"
    : "fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col";

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
              onClick={isFullPage ? onMinimize : onMaximize}
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

        {/* System Logs Card */}
        <div className="px-6 pb-2">
          <SystemLogsCard logs={systemLogs} taskId={taskId} taskName={taskName} />
        </div>

        {/* Chat messages */}
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
    </div>
  );
}
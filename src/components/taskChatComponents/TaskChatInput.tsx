import type React from "react"
import { useRef, useState } from "react"
import { Send, Bot, User, LayoutTemplate, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import TaskChatTemplateDialog from "./TaskChatTemplateDialog"
import FileUploadDialog from "./FileUploadDialog"

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]

const BOT_STYLES = {
  "@goose": {
    bgColor: "bg-gradient-to-r from-pink-50 to-rose-50",
    textColor: "text-pink-800",
    selectedBg: "bg-gradient-to-r from-pink-100 to-rose-100",
    selectedText: "text-pink-900",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  "@orbital_cli": {
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    textColor: "text-purple-800",
    selectedBg: "bg-gradient-to-r from-purple-100 to-violet-100",
    selectedText: "text-purple-900",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  "@gemini_cli": {
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    textColor: "text-blue-800",
    selectedBg: "bg-gradient-to-r from-blue-100 to-cyan-100",
    selectedText: "text-blue-900",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  "@claude_code": {
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    textColor: "text-green-800",
    selectedBg: "bg-gradient-to-r from-green-100 to-emerald-100",
    selectedText: "text-green-900",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
} as const

const DEFAULT_BOT_STYLE = {
  bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
  textColor: "text-gray-800",
  selectedBg: "bg-gradient-to-r from-gray-100 to-slate-100",
  selectedText: "text-gray-900",
  iconColor: "text-gray-600",
  borderColor: "border-gray-200",
}

const USER_STYLE = {
  bgColor: "bg-gradient-to-r from-orange-50 to-amber-50",
  textColor: "text-orange-800",
  selectedBg: "bg-gradient-to-r from-orange-100 to-amber-100",
  selectedText: "text-orange-900",
  iconColor: "text-orange-600",
  borderColor: "border-orange-200",
}

const getBotStyles = (bot: string) => BOT_STYLES[bot as keyof typeof BOT_STYLES] || DEFAULT_BOT_STYLE

interface UserType {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  email?: string
}

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isFullPage?: boolean
  availableUsers: UserType[]
  attachedFiles: File[]
  setAttachedFiles: (files: File[]) => void
}

const ChatInput = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  isFullPage = false,
  availableUsers,
  attachedFiles,
  setAttachedFiles,
}: ChatInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const [suggestionType, setSuggestionType] = useState<'bot' | 'user'>('bot')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
  const [isRemoving, setIsRemoving] = useState<number | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const userSuggestions = availableUsers.map(u => "@" + (u.name || u.email || u.id));

  const handleFilesSelect = (files: File[]) => {
    setAttachedFiles(files)
  }

  const removeAttachedFile = (index: number) => {
    setIsRemoving(index)
    setTimeout(() => {
      setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
      setIsRemoving(null)
    }, 150)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNewMessage(value)

    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'

    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const filteredBots = availableBots.filter((bot) =>
          bot.toLowerCase().includes(textAfterAt.toLowerCase())
        )

        const filteredUsers = userSuggestions.filter((user) =>
          user.toLowerCase().includes(textAfterAt.toLowerCase())
        )

        const allFiltered = [...filteredBots, ...filteredUsers]

        if (allFiltered.length > 0) {
          setFilteredSuggestions(allFiltered)
          setShowSuggestions(true)
          setSelectedSuggestionIndex(0)
          setMentionStartPos(lastAtIndex)
          setSuggestionType(filteredBots.length > 0 ? 'bot' : 'user')
          return
        }
      }
    }
    setShowSuggestions(false)
  }

  const selectSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return

    const beforeMention = newMessage.substring(0, mentionStartPos)
    const afterCursor = newMessage.substring(textareaRef.current.selectionStart)
    const newValue = beforeMention + suggestion + " " + afterCursor

    setNewMessage(newValue)
    setShowSuggestions(false)

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + suggestion.length + 1
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault()
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex])
          return
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }

    if (e.key === "Enter" && !showSuggestions) {
      if ((e.ctrlKey || e.metaKey) || (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey)) {
        if (
          (!e.ctrlKey && !e.metaKey && (newMessage.includes('\n') || e.shiftKey || e.altKey))
        ) {
          return
        }
        e.preventDefault()
        onSendMessage()
      }
    }
  }

  const suggestionsLeftClass = isFullPage
    ? "left-1/2 transform -translate-x-1/2 w-[80%] max-w-6xl"
    : "left-6 right-6"

  const getSuggestionStyles = (suggestion: string, index: number) => {
    const isBot = availableBots.includes(suggestion)
    const styles = isBot ? getBotStyles(suggestion) : USER_STYLE
    const icon = isBot ? Bot : User

    return { styles, icon }
  }

  return (
    <>
      <TaskChatTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onSelect={() => setShowTemplateDialog(false)}
      />
      <FileUploadDialog
        open={showFileUploadDialog}
        onOpenChange={setShowFileUploadDialog}
        onFilesSelect={handleFilesSelect}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 ${isFullPage ? "flex justify-center" : ""} border-t border-gray-200 bg-white relative z-20`}
      >
        {showSuggestions && (
          <div
            className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden ${suggestionsLeftClass}`}
          >
            {filteredSuggestions.map((suggestion, index) => {
              const { styles, icon: IconComponent } = getSuggestionStyles(suggestion, index)
              return (
                <div
                  key={suggestion}
                  className={`px-4 py-3 cursor-pointer text-sm font-semibold flex items-center space-x-3 transition-all duration-150 ${
                    index === selectedSuggestionIndex
                      ? `${styles.selectedBg} ${styles.selectedText} border-l-4 ${styles.borderColor}`
                      : `hover:${styles.bgColor} ${styles.textColor}`
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <IconComponent className={`w-4 h-4 ${styles.iconColor}`} />
                  <span>{suggestion}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className={`${isFullPage ? "w-[60%]" : "w-full"} p-4`}>
          {attachedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 transition-all duration-200">
              {attachedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={`flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all duration-150 ${
                    isRemoving === index ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                  }`}
                  style={{
                    animation: isRemoving === index ? 'none' : 'slideIn 0.2s ease-out'
                  }}
                >
                  <span className="text-slate-700 text-xs max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-slate-500 hover:text-slate-700 ml-1 transition-colors duration-150"
                    disabled={isRemoving !== null}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 border border-gray-200 rounded-2xl p-3 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all duration-200">
            {isFullPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateDialog(true)}
                className="flex items-center gap-1"
                aria-label="Open Templates"
              >
                <LayoutTemplate className="h-4 w-4" />
              </Button>
            )}
            <textarea
              ref={textareaRef}
              placeholder="Ask about the task or discuss implementation... (Ctrl+Enter or Enter to send)"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none border-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none min-h-[60px] max-h-[200px]"
              rows={3}
              style={{ lineHeight: "1.5" }}
            />
            <div className="flex items-center h-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUploadDialog(true)}
                className="flex items-center gap-1 transition-all duration-150"
                aria-label="Attach Files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <button
                onClick={onSendMessage}
                disabled={!newMessage.trim() && attachedFiles.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none flex-shrink-0"
                title="Send message (Ctrl+Enter or Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}

export default ChatInput
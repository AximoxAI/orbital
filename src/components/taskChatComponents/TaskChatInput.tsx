"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]
const availableUsers = ["@James Adams", "@Sam Acer", "@Erin Reyes", "@Holt Andrey"]

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

interface ChatInputProps {
  newMessage: string
  setNewMessage: (message: string) => void
  onSendMessage: () => void
  isFullPage?: boolean
}

const ChatInput = ({ newMessage, setNewMessage, onSendMessage, isFullPage = false }: ChatInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const [suggestionType, setSuggestionType] = useState<'bot' | 'user'>('bot')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNewMessage(value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'

    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        // Check for bot matches first
        const filteredBots = availableBots.filter((bot) => 
          bot.toLowerCase().includes(textAfterAt.toLowerCase())
        )
        
        // Check for user matches
        const filteredUsers = availableUsers.filter((user) => 
          user.toLowerCase().includes(textAfterAt.toLowerCase())
        )
        
        // Combine and prioritize bots first, then users
        const allFiltered = [...filteredBots, ...filteredUsers]
        
        if (allFiltered.length > 0) {
          setFilteredSuggestions(allFiltered)
          setShowSuggestions(true)
          setSelectedSuggestionIndex(0)
          setMentionStartPos(lastAtIndex)
          // Set suggestion type based on first match
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

    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const suggestionsLeftClass = isFullPage ? "left-1/2 transform -translate-x-1/2 w-[80%] max-w-6xl" : "left-6 right-6"

  const getSuggestionStyles = (suggestion: string, index: number) => {
    const isBot = availableBots.includes(suggestion)
    const styles = isBot ? getBotStyles(suggestion) : USER_STYLE
    const icon = isBot ? Bot : User
    
    return { styles, icon }
  }

  return (
    <div className={`${isFullPage ? 'flex justify-center w-full' : ''} border-t border-gray-200 bg-white relative`}>
      {showSuggestions && (
        <div className={`absolute bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden ${suggestionsLeftClass}`}>
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

      <div className={`${isFullPage ? 'w-[80%] max-w-6xl' : 'w-full'} p-4`}>
        <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all duration-200">
          <textarea
            ref={textareaRef}
            placeholder="Ask about the task or discuss implementation..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none min-h-[20px] max-h-[120px]"
            rows={1}
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInput